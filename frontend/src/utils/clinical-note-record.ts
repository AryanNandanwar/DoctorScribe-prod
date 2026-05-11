import { type ParsedNote } from "../types/clinical-note.ts";

export type ClinicalNoteRecord = {
  patient_details?: unknown;
  medical_history?: unknown;
  problems_faced?: unknown;
  findings?: unknown;
  diagnosis?: unknown;
  investigations_advised?: unknown;
  doctor_instructions?: unknown;
  medication_prescribed?: unknown;
};

export function parsePatientDetails(patientDetails: unknown): Record<string, string> {
  if (typeof patientDetails === "object" && patientDetails !== null && !Array.isArray(patientDetails)) {
    return patientDetails as Record<string, string>;
  }

  if (typeof patientDetails === "string") {
    const details: Record<string, string> = {};
    const parts = patientDetails.split(",").map((part) => part.trim());

    parts.forEach((part) => {
      const match = part.match(/^(Name|Age|Gender|Contact):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        details[key.toLowerCase()] = value.trim();
      }
    });

    return details;
  }

  return {};
}

export function parseStringContent(content: unknown): string[] {
  if (Array.isArray(content)) {
    return content;
  }

  if (typeof content === "string" && content.trim()) {
    let processedContent = content.trim();

    if (processedContent.startsWith("[") && processedContent.endsWith("]")) {
      try {
        const parsed = JSON.parse(processedContent);
        if (Array.isArray(parsed)) {
          processedContent = parsed.join("\n");
        }
      } catch {
        processedContent = processedContent
          .slice(1, -1)
          .replace(/^"|"$/g, "")
          .replace(/"/g, "")
          .replace(/^\[|\]$/g, "")
          .replace(/^\[|\]$/g, "");
      }
    }

    processedContent = processedContent
      .replace(/^\[|\]$/g, "")
      .replace(/^"|"$/g, "")
      .replace(/"/g, "");

    return processedContent
      .split(/(?:\\n|\n|,\s*|\.\s*|\r\n)/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item !== "Not mentioned" && item !== '""');
  }

  return [];
}

export function mapClinicalNoteRecordToParsedNote(note: ClinicalNoteRecord): ParsedNote {
  return {
    patientDetails: parsePatientDetails(note.patient_details),
    medicalHistory: parseStringContent(note.medical_history),
    problemFaced: parseStringContent(note.problems_faced).join(", "),
    findings: parseStringContent(note.findings),
    diagnosis: parseStringContent(note.diagnosis),
    investigationsAdvised: parseStringContent(note.investigations_advised),
    doctorInstructions: parseStringContent(note.doctor_instructions),
    medicationPrescribed: parseStringContent(note.medication_prescribed),
  };
}
