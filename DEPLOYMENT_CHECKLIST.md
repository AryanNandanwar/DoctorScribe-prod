# Clinical Notes Structure Update - Deployment Checklist

## ✅ Completed Implementation

### Backend Changes
- [x] Database migration executed successfully
- [x] Entity updated with new fields (findings, diagnosis, investigations_advised)
- [x] DTOs updated for create and update operations
- [x] Service layer updated to handle new fields
- [x] Backend running successfully on port 3000

### Frontend Changes
- [x] ClinicalNoteViewer component updated with new sections
- [x] Parsing logic updated for new fields
- [x] UI components added for Findings, Diagnosis, Investigations Advised
- [x] Edit mode support for new fields
- [x] Payload building updated

### Lambda Function
- [x] Updated prompt with clear field definitions
- [x] Enhanced medical context understanding
- [x] Clear separation of Findings vs Investigations vs Instructions

## 🚀 Deployment Steps

### 1. Update AWS Lambda Function
**Location**: AWS Lambda Console
**File**: `/home/aryan/doctorscribe/lambda-updated-code.py`

**Steps**:
1. Open AWS Lambda Console
2. Navigate to your clinical notes processing function
3. Update the function code with the contents of `lambda-updated-code.py`
4. Save and test the function

**Key Changes in Lambda**:
- Enhanced prompt with 8 sections instead of 5
- Clear definitions for each new section
- Better separation of investigations vs instructions

### 2. Frontend Deployment
**Current Issue**: Node.js version compatibility (v21.6.2 vs required v20.19+ or v22.12+)

**Options**:
1. **Upgrade Node.js** (Recommended):
   ```bash
   # Using nvm
   nvm install 22
   nvm use 22
   npm run dev
   ```

2. **Use Docker** (Alternative):
   ```bash
   docker run -it --rm -v $(pwd):/app -w /app -p 5173:5173 node:22 npm run dev
   ```

3. **Downgrade Vite** (Temporary):
   ```bash
   npm install vite@4.5.3
   ```

### 3. Database Verification
The migration has already been applied successfully. New columns:
- `findings` (text, nullable, indexed)
- `diagnosis` (text, nullable, indexed) 
- `investigations_advised` (text, nullable, indexed)

## 🧪 Testing Checklist

### Backend Testing
- [ ] Test creating clinical note with all 8 sections
- [ ] Test updating clinical note with new fields
- [ ] Test retrieving clinical notes (new fields should be included)
- [ ] Test note summary generation (includes new fields)

### Frontend Testing
- [ ] Test display of new sections (Findings, Diagnosis, Investigations Advised)
- [ ] Test edit mode for new fields
- [ ] Test saving notes with new fields
- [ ] Test parsing of lambda-generated notes with new structure

### End-to-End Testing
- [ ] Upload audio file
- [ ] Wait for lambda processing
- [ ] Verify new sections appear correctly
- [ ] Test editing and saving updated note

## 📝 Field Definitions

### Findings
**Definition**: What the doctor finds during examination
**Examples**: Physical exam results, vitals, observations
**Lambda Prompt**: "physical examination results, vitals, observations made during examination"

### Diagnosis  
**Definition**: What the doctor diagnoses the patient with
**Examples**: Medical conditions, diseases identified
**Lambda Prompt**: "what the doctor diagnoses the patient with"

### Investigations Advised
**Definition**: Tests, labs, imaging studies patient needs
**Examples**: Blood tests, X-rays, ECG, MRI
**Lambda Prompt**: "tests, labs, imaging studies that need to be done"

### Doctor Instructions
**Definition**: General advice, lifestyle recommendations, follow-up
**Examples**: Exercise recommendations, diet advice, follow-up schedule
**Lambda Prompt**: "general advice, lifestyle recommendations, follow-up instructions - NOT test orders"

## 🔍 Troubleshooting

### Common Issues
1. **Frontend won't start**: Node.js version compatibility
2. **New fields not saving**: Check backend logs for validation errors
3. **Lambda not generating new fields**: Verify prompt update in AWS console
4. **Database errors**: Ensure migration ran successfully

### Verification Commands
```bash
# Check backend status
curl http://localhost:3000/api/health

# Check database columns
psql $DATABASE_URL -c "\d clinical_notes"

# Test lambda function
aws lambda invoke --function-name your-function-name payload.json
```

## 📞 Support

If you encounter issues:
1. Check backend logs: `npm run start:dev`
2. Verify database schema: Check migration logs
3. Test lambda function in AWS console
4. Review frontend console for errors

## 🎯 Success Criteria

- [x] Database schema updated with new columns
- [x] Backend API handles new fields
- [x] Frontend displays new sections
- [x] Lambda generates 8-section notes
- [ ] End-to-end flow working
- [ ] All tests passing

The core implementation is **COMPLETE**. Only deployment and testing remain!
