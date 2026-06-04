export type NoteSkipReason =
  | "empty_transcript"
  | "transcript_too_short"
  | "no_doctor_id"
  | "unknown";

export type RecordingStatusPayload = {
  status?: string;
  noteId?: string;
  reason?: string;
  sessionId?: string;
};

export function parseRecordingStatusMessage(message: {
  type?: string;
  data?: unknown;
}): RecordingStatusPayload | null {
  if (message.type !== "recording_status") {
    return null;
  }

  const envelope = message.data as { data?: RecordingStatusPayload } | undefined;
  return envelope?.data ?? null;
}

export function noteSkipReasonToMessage(reason?: string): string {
  switch (reason) {
    case "empty_transcript":
      return "No speech was detected. Please record again.";
    case "transcript_too_short":
      return "Recording was too short to generate a note. Please record again.";
    case "no_doctor_id":
      return "Unable to verify your account. Please log in and try again.";
    default:
      return "Could not generate a clinical note from this recording. Please record again.";
  }
}

export function isNoteNotFoundError(message: string): boolean {
  return (
    message.includes("not found") ||
    message.includes("NOTE_NOT_CREATED") ||
    message.includes("NOTE_GENERATION_FAILED")
  );
}

export function getNoteGenerationErrorMessage(message: string): string {
  if (isNoteNotFoundError(message)) {
    return noteSkipReasonToMessage("empty_transcript");
  }
  return message;
}
