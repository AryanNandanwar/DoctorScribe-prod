/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { fetchExistingClinicalNote } from "./clinical-note-polling.ts";
import { mapClinicalNoteRecordToParsedNote } from "./clinical-note-record.ts";

test("fetchExistingClinicalNote polls by noteId and returns an existing database row", async () => {
  const calls: string[] = [];
  const existingNote = {
    id: "note-123",
    patient_details: "Name: Asha Rao, Age: 41 years, Gender: Female",
    medical_history: '["Diabetes\\nHypertension"]',
    problems_faced: "Headache, dizziness",
    findings: ["BP elevated"],
    diagnosis: "Hypertension",
    investigations_advised: "CBC, ECG",
    doctor_instructions: "Follow up in 1 week",
    medication_prescribed: "Amlodipine 5mg",
  };

  const fetched = await fetchExistingClinicalNote(
    "note-123",
    async (noteId) => {
      calls.push(noteId);
      return existingNote;
    },
    0,
  );

  assert.deepEqual(calls, ["note-123"]);
  assert.equal(fetched, existingNote);
});

test("database clinical note row maps to the parsed shape displayed by ClinicalNoteViewer", () => {
  const parsed = mapClinicalNoteRecordToParsedNote({
    patient_details: "Name: Asha Rao, Age: 41 years, Gender: Female",
    medical_history: '["Diabetes\\nHypertension"]',
    problems_faced: "Headache, dizziness",
    findings: "BP elevated",
    diagnosis: "Hypertension",
    investigations_advised: "CBC, ECG",
    doctor_instructions: "Follow up in 1 week",
    medication_prescribed: "Amlodipine 5mg",
  });

  assert.deepEqual(parsed.patientDetails, {
    name: "Asha Rao",
    age: "41 years",
    gender: "Female",
  });
  assert.deepEqual(parsed.medicalHistory, ["Diabetes", "Hypertension"]);
  assert.equal(parsed.problemFaced, "Headache, dizziness");
  assert.deepEqual(parsed.findings, ["BP elevated"]);
  assert.deepEqual(parsed.diagnosis, ["Hypertension"]);
  assert.deepEqual(parsed.investigationsAdvised, ["CBC", "ECG"]);
  assert.deepEqual(parsed.doctorInstructions, ["Follow up in 1 week"]);
  assert.deepEqual(parsed.medicationPrescribed, ["Amlodipine 5mg"]);
});
