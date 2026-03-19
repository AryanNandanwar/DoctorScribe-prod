import boto3
import json
import os
from datetime import datetime
from urllib.parse import unquote_plus

# Initialize AWS clients
s3 = boto3.client('s3')
bedrock = boto3.client('bedrock-runtime', region_name='ap-south-1')

# Configuration
OUTPUT_BUCKET = os.environ.get('OUTPUT_BUCKET', 'pre-processed-audio-stored-bucket')
FRONTEND_API_URL = os.environ.get('FRONTEND_API_URL', None)  # Optional: for frontend notifications

def lambda_handler(event, context):
    try:
       

        # 1. Extract S3 event details
        record = event['Records'][0]['s3']
        bucket = record['bucket']['name']
        key = unquote_plus(record["object"]["key"])
        
        print(f"Processing file: {key} from bucket: {bucket}")
        
        # 2. Get Sarvam ASR JSON from S3
        response = s3.get_object(Bucket=bucket, Key=key)
        asr_data = json.loads(response['Body'].read().decode('utf-8'))
        
        # 3. Build transcript text from Sarvam JSON structure
        transcript_text = extract_transcript_from_sarvam(asr_data)
        
        if not transcript_text:
            raise ValueError("No transcript text found in ASR output")
        
        print(f"Transcript extracted: {len(transcript_text)} characters")
        
        # 4. Generate clinical note using Claude on Bedrock
        clinical_note = generate_clinical_note_with_claude(transcript_text)
        
        print(f"Clinical note generated: {len(clinical_note)} characters")
        
        # 5. Save clinical note to S3
        note_key = save_clinical_note_to_s3(key, clinical_note)
        
        # 6. (Optional) Send to frontend
        if FRONTEND_API_URL:
            send_to_frontend(clinical_note, note_key)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Clinical note generated successfully',
                'input_file': key,
                'output_file': note_key,
                'note_length': len(clinical_note)
            })
        }
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'input_file': key if 'key' in locals() else 'unknown'
            })
        }


def extract_transcript_from_sarvam(asr_data):
    """
    Extract transcript text from Sarvam ASR JSON output.
    Adjust this function based on your actual Sarvam JSON structure.
    """
    transcript_text = ""
    
    # Option 1: If Sarvam provides 'utterances' with speaker info
    if 'utterances' in asr_data:
        for turn in asr_data['utterances']:
            speaker = turn.get('speaker', 'Unknown')
            text = turn.get('text', '')
            transcript_text += f"{speaker}: {text}\n"
    
    # Option 2: If Sarvam provides 'segments' or 'words'
    elif 'segments' in asr_data:
        for segment in asr_data['segments']:
            text = segment.get('text', '')
            transcript_text += f"{text}\n"
    
    # Option 3: If there's a single 'transcript' field
    elif 'transcript' in asr_data:
        transcript_text = asr_data['transcript']
    
    # Option 4: If there's a 'text' field at root level
    elif 'text' in asr_data:
        transcript_text = asr_data['text']
    
    return transcript_text.strip()


def generate_clinical_note_with_claude(transcript_text):
    """
    Call Claude 3.5 Sonnet on Amazon Bedrock to generate clinical note.
    """
    
    # Construct the UPDATED prompt with new sections
    prompt = f"""You are an expert medical scribe AI assistant. Your task is to analyze the following doctor-patient conversation transcript and generate a structured clinical note.

The transcript may contain speech recognition errors. Please:
1. Correct any obvious ASR (Automatic Speech Recognition) errors based on medical context
2. Extract and organize information into the following sections:
   - Patient Details (name, age, gender, contact information if mentioned)
   - Medical History (past conditions, surgeries, family history)
   - Problem Faced (chief complaint, symptoms, duration)
   - Findings (what the doctor finds during examination - physical exam results, observations, vitals)
   - Diagnosis (what the doctor diagnoses the patient with)
   - Investigations Advised (tests, labs, imaging studies the patient needs to get done)
   - Doctor Instructions (general advice, follow-up instructions, lifestyle recommendations - NOT test orders)
   - Medication Prescribed (drug name, dosage, frequency, duration)

IMPORTANT DISTINCTIONS:
- "Findings" should include physical examination results, vitals, observations made during examination
- "Investigations Advised" should include specific tests, labs, imaging studies that need to be done
- "Doctor Instructions" should only contain general advice, lifestyle recommendations, follow-up instructions - NOT test orders

If any section has no information available, write "Not mentioned" for that section.
Do not provide any disclaimer.

Conversation Transcript:
{transcript_text}

Please provide the clinical note in a clear, structured format with proper headings."""

    # Prepare Bedrock API payload (Claude 3.5 Sonnet format)
    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "temperature": 0.3,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    # Invoke Claude model
    model_id = "apac.anthropic.claude-3-5-sonnet-20241022-v2:0"
    
    response = bedrock.invoke_model(
        modelId=model_id,
        body=json.dumps(payload),
        contentType="application/json",
        accept="application/json"
    )
    
    # Parse response
    response_body = json.loads(response['body'].read().decode('utf-8'))
    
    # Extract the generated text
    clinical_note = response_body['content'][0]['text']
    
    return clinical_note


def save_clinical_note_to_s3(original_key, clinical_note):
    """
    Save the generated clinical note to S3.
    """
    # Generate output key (replace 'transcripts/' with 'clinical_notes/')
    output_key = original_key.replace('transcripts/', 'clinical_notes/')
    
    # If the original key doesn't have 'transcripts/' prefix, add clinical_notes prefix
    if not output_key.startswith('clinical_notes/'):
        output_key = f"clinical_notes/{output_key}"
    
    # Change extension to .txt or keep as .json
    if output_key.endswith('.json'):
        output_key = output_key.replace('.json', '.txt')
    

    
    # Prepare note data
    note_data = {
        "clinical_note": clinical_note,
        "generated_at": datetime.utcnow().isoformat(),
        "source_file": original_key
    }
    
    # Save to S3
    s3.put_object(
        Bucket=OUTPUT_BUCKET,
        Key=output_key,
        Body=json.dumps(note_data, indent=2),
        ContentType='application/json'
    )
    
    print(f"Clinical note saved to: s3://{OUTPUT_BUCKET}/{output_key}")
    
    return output_key


def send_to_frontend(clinical_note, note_key):
    """
    Optional: Send clinical note to frontend via HTTP POST.
    Set FRONTEND_API_URL environment variable to enable this.
    """
    try:
        import requests
        
        payload = {
            'clinical_note': clinical_note,
            'note_key': note_key,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            FRONTEND_API_URL,
            json=payload,
            headers=headers,
            timeout=5
        )
        
        print(f"Frontend notification sent: {response.status_code}")
        
    except Exception as e:
        print(f"Failed to send to frontend: {str(e)}")
        # Don't fail the entire Lambda if frontend notification fails
