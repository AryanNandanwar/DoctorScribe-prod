export type FetchClinicalNote = (noteId: string) => Promise<unknown>;

export const DEFAULT_EXISTING_NOTE_FETCH_DELAY_MS = 7000;

export async function fetchExistingClinicalNote(
  noteId: string,
  fetchClinicalNote: FetchClinicalNote,
  delayMs = DEFAULT_EXISTING_NOTE_FETCH_DELAY_MS,
): Promise<unknown> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return fetchClinicalNote(noteId);
}
