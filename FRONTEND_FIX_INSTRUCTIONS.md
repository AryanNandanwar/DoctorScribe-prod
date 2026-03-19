# Frontend Section Display Issue - Fix Instructions

## 🐛 Problem Identified
The "Findings", "Diagnosis", and "Investigations Advised" sections are being displayed under "Problem Faced" instead of as separate sections.

## 🔍 Root Cause Analysis
Based on the image and code analysis, this is likely caused by one of these issues:

1. **Parsing Failure**: The lambda output format doesn't match our regex patterns
2. **Empty Parsed Fields**: The sections are being parsed but are empty/null
3. **Fallback to Raw Text**: The parsing fails and falls back to displaying raw text

## 🛠️ Fixes Applied

### 1. Updated Regex Patterns
Made regex patterns more flexible:
- `findings?[:\n]` instead of `findings[:\n]`
- `diagnosis?[:\n]` instead of `diagnosis[:\n]`
- Made colon optional with `[:\n]?`

### 2. Added Debug Information
Added debugging to show what's actually in the parsed object:
- Shows JSON content of `findings`, `diagnosis`, `investigationsAdvised`
- Shows "No data available" message when sections are empty
- Displays debug info in red text

## 🚀 Immediate Actions Required

### 1. Test the Frontend
1. **Fix Node.js Version** (required for testing):
   ```bash
   # Option A: Use nvm
   nvm install 22
   nvm use 22
   cd /home/aryan/doctorscribe/frontend && npm run dev
   
   # Option B: Use Docker
   docker run -it --rm -v $(pwd):/app -w /app -p 5173:5173 node:22 npm run dev
   ```

2. **Check Debug Output**:
   - Look for red debug text under each section
   - Check browser console for parsing logs
   - Verify what the debug shows

### 2. Check Lambda Output Format
The issue might be that your lambda function output doesn't match expected format. Check:

1. **Lambda Function**: Ensure it's updated with the new code
2. **Output Format**: Should include clear section headers:
   ```
   Findings:
   Weight: 95 kg
   BP: 130/86
   
   Diagnosis:
   Possible perimenopause symptoms
   
   Investigations Advised:
   Sonography
   CBC
   ```

### 3. If Sections Still Don't Show

#### Option A: Manual Regex Update
If the lambda uses different headers, update the regex patterns:

```typescript
// In ClinicalNoteViewer.tsx, update HEADINGS array:
{ key: "findings", labelRegex: /examination findings|physical exam|findings[:\n]/i },
{ key: "diagnosis", labelRegex: /assessment|diagnosis|diagnoses[:\n]/i },
{ key: "investigationsAdvised", labelRegex: /tests ordered|lab work|investigations[:\n]/i },
```

#### Option B: Fallback Parsing
Add fallback logic to handle different formats:

```typescript
// Add after parseClinicalNote function
const fallbackParse = (text: string) => {
  // Try alternative parsing if main parsing fails
  const lines = text.split('\n');
  const sections = { findings: [], diagnosis: [], investigationsAdvised: [] };
  
  let currentSection = null;
  lines.forEach(line => {
    if (line.includes('Findings:')) currentSection = 'findings';
    else if (line.includes('Diagnosis:')) currentSection = 'diagnosis';
    else if (line.includes('Investigations')) currentSection = 'investigationsAdvised';
    else if (currentSection && line.trim()) {
      sections[currentSection].push(line.trim());
    }
  });
  
  return sections;
};
```

## 🔧 Testing Checklist

### After Fixing Node.js:
- [ ] Frontend starts successfully
- [ ] Debug information appears under sections
- [ ] Sections show parsed data correctly
- [ ] No red debug text visible (means data is present)

### Browser Console Check:
- [ ] Look for "Parsing successful:" log
- [ ] Check for any parsing errors
- [ ] Verify parsed object structure

## 🎯 Expected Result

After fixes, you should see:
- **Separate sections** with proper headers
- **Findings section** showing examination results
- **Diagnosis section** showing medical conditions
- **Investigations Advised** showing tests/labs
- **No debug text** (red text should disappear)

## 🆘 If Still Not Working

### Check Lambda Output:
1. Go to AWS Lambda Console
2. Check recent invocations
3. View the actual output being generated
4. Verify section headers match expected format

### Manual Verification:
1. Create a test note with known format
2. Check if parsing works on test data
3. Compare with actual lambda output

The core issue is likely a **format mismatch** between lambda output and frontend parsing. The debug information will help identify exactly what's happening.
