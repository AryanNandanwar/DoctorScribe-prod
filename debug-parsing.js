// Debug script to test parsing logic
const HEADINGS = [
    { key: "patientDetails", labelRegex: /patient details[:\n]/i },
    { key: "medicalHistory", labelRegex: /medical history[:\n]/i },
    { key: "problemFaced", labelRegex: /(problem faced|chief complaint|chief complaint:)[:\n]?/i },
    { key: "findings", labelRegex: /findings[:\n]/i },
    { key: "diagnosis", labelRegex: /diagnosis[:\n]/i },
    { key: "investigationsAdvised", labelRegex: /(investigations advised|investigations|tests advised|labs advised)[:\n]/i },
    { key: "doctorInstructions", labelRegex: /(doctor instructions|doctor's instructions|instructions)[:\n]/i },
    { key: "medicationPrescribed", labelRegex: /(medication prescribed|medications prescribed|medication:)[:\n]?/i },
  ];

const parseBulletList = (s) => {
  const lines = s.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return lines.map((l) => l.replace(/^[-*•\s]*\d*\.*\)?\s*/, "").trim()).filter(Boolean);
};

const parseClinicalNote = (raw) => {
  console.log('=== RAW TEXT ===');
  console.log(raw);
  console.log('\n=== PARSING SECTIONS ===');
  
  const out = { raw };
  const text = raw.replace(/\r\n/g, "\n");
  const sections = [];
  
  HEADINGS.forEach((h) => {
    const re = h.labelRegex;
    re.lastIndex = 0;
    const m = re.exec(text);
    console.log(`${h.key}: match = ${m ? 'YES' : 'NO'}, index = ${m ? m.index : -1}`);
    if (m) {
      console.log(`  Matched text: "${m[0]}"`);
    }
    sections.push({ key: h.key, start: m ? m.index : -1, match: m });
  });

  const present = sections.filter((s) => s.start >= 0).sort((a, b) => a.start - b.start);
  console.log('\n=== FOUND SECTIONS (sorted) ===');
  present.forEach((s, i) => {
    console.log(`${i + 1}. ${s.key} at position ${s.start}`);
  });

  if (present.length === 0) {
    out.raw = text;
    return out;
  }

  for (let i = 0; i < present.length; i++) {
    const sec = present[i];
    const next = present[i + 1];
    const startIdx = sec.match ? sec.match.index + sec.match[0].length : sec.start;
    const endIdx = next ? next.start : text.length;
    const content = text.slice(startIdx, endIdx).trim();

    console.log(`\n=== PROCESSING ${sec.key} ===`);
    console.log(`Content: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
    console.log(`Parsed as:`, parseBulletList(content));

    switch (sec.key) {
      case "patientDetails":
        out.patientDetails = parseKeyValueSection(content);
        break;
      case "medicalHistory":
        out.medicalHistory = parseBulletList(content);
        break;
      case "problemFaced":
        out.problemFaced = parseBulletList(content);
        break;
      case "findings":
        out.findings = parseBulletList(content);
        break;
      case "diagnosis":
        out.diagnosis = parseBulletList(content);
        break;
      case "investigationsAdvised":
        out.investigationsAdvised = parseBulletList(content);
        break;
      case "doctorInstructions":
        out.doctorInstructions = parseBulletList(content);
        break;
      case "medicationPrescribed":
        out.medicationPrescribed = parseBulletList(content);
        break;
    }
  }

  console.log('\n=== FINAL PARSED RESULT ===');
  console.log(JSON.stringify(out, null, 2));
  
  return out;
};

const parseKeyValueSection = (s) => {
  const lines = s.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const result = {};
  for (const line of lines) {
    const kvMatch = line.match(/^\-?\s*([^:–—-]{1,80}?)\s*[:\-–—]\s*(.+)$/);
    if (kvMatch) {
      const k = kvMatch[1].trim();
      const v = kvMatch[2].trim();
      result[k] = v;
    }
  }
  return result;
};

// Test with sample text that matches the issue
const sampleText = `Problem Faced:
Emotional instability
Hot flashes
Feeling suffocated without air movement
Excessive sweating
Menstrual issues
Itching with contraceptive protection
Sleep position discomfort

Findings:
Weight: 95 kg
BP: 130/86
BMI: High
Currently on Fabilon

Diagnosis:
Possible perimenopause/menopausal symptoms
Obesity
PMS (Pre-menstrual syndrome)

Investigations Advised:
Sonography
CBC
Thyroid profile
Blood sugar
HbA1c
Lipid profile
Liver profile
Creatinine
AMH
Prolactin
Urindotine`;

console.log('Testing parsing with sample clinical note...\n');
const result = parseClinicalNote(sampleText);
