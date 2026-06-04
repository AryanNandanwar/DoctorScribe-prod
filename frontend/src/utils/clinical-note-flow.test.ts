/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { fetchExistingClinicalNote } from "./clinical-note-polling.ts";
import {
  mapClinicalNoteRecordToParsedNote,
  mergePatientDetails,
  parsePatientDetails,
} from "./clinical-note-record.ts";
import {
  getNoteGenerationErrorMessage,
  noteSkipReasonToMessage,
  parseRecordingStatusMessage,
} from "./recording-status.ts";

test("parseRecordingStatusMessage reads note_skipped websocket payloads", () => {
  const parsed = parseRecordingStatusMessage({
    type: "recording_status",
    data: {
      data: {
        status: "note_skipped",
        sessionId: "session-1",
        noteId: "note-1",
        reason: "empty_transcript",
      },
    },
  });

  assert.deepEqual(parsed, {
    status: "note_skipped",
    sessionId: "session-1",
    noteId: "note-1",
    reason: "empty_transcript",
  });
});

test("note skip reasons map to doctor-friendly messages", () => {
  assert.equal(
    noteSkipReasonToMessage("empty_transcript"),
    "No speech was detected. Please record again.",
  );
  assert.equal(
    getNoteGenerationErrorMessage("NOTE_NOT_CREATED"),
    "No speech was detected. Please record again.",
  );
});

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

test("parsePatientDetails reads JSON stored in patient_details column", () => {
  const parsed = parsePatientDetails(
    JSON.stringify({ name: "Asha Rao", age: "41", gender: "Female", contact: "9876543210" }),
  );

  assert.deepEqual(parsed, {
    name: "Asha Rao",
    age: "41",
    gender: "Female",
    contact: "9876543210",
  });
});

test("mergePatientDetails prefers patient card values when provided", () => {
  const merged = mergePatientDetails(
    { name: "Unknown" },
    {
      name: "Asha Rao",
      age: "41",
      gender: "Female",
      weight: "68 kg",
      contact: "9876543210",
    },
  );

  assert.deepEqual(merged, {
    name: "Asha Rao",
    age: "41",
    gender: "Female",
    weight: "68 kg",
    contact: "9876543210",
  });
});

test("mergePatientDetails excludes note-extracted identity when receptionist details exist", () => {
  const merged = mergePatientDetails(
    {
      Name: "Supriya",
      Age: "Not specified",
      Gender: "Female",
      name: "From conversation",
    },
    { name: "Test Matter", gender: "male", age: "22", contact: "1234567899" },
  );

  assert.deepEqual(merged, {
    name: "Test Matter",
    gender: "male",
    age: "22",
    contact: "1234567899",
  });
});
