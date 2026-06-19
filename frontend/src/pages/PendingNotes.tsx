import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import PendingDraftNotesSection from "../components/PendingDraftNotesSection";
import { useRequireAuth } from "../hooks/use-require-auth";
import { usePendingClinicalNote } from "../context/pending-clinical-note-context";

export default function PendingNotesPage() {
  const { authorized } = useRequireAuth({
    requiredRole: "doctor",
    wrongRoleRedirect: "/receptionist/intake",
  });
  const { noteId: pendingNoteId, openDraftNote, registerOnNoteSaved } = usePendingClinicalNote();
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    return registerOnNoteSaved(() => {
      setRefreshToken((current) => current + 1);
    });
  }, [registerOnNoteSaved]);

  if (!authorized) {
    return null;
  }

  return (
    <main className="pb-16 min-h-screen">
      <div className="px-4 md:px-8 max-w-5xl mx-auto pt-4 mb-2">
        <Typography variant="h4" className="font-bold text-slate-900">
          Pending Notes
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Finish incomplete clinical notes before starting new recordings.
        </Typography>
      </div>

      <PendingDraftNotesSection
        activeNoteId={pendingNoteId}
        refreshToken={refreshToken}
        onOpenNote={openDraftNote}
      />
    </main>
  );
}
