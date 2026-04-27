import { useEffect, useCallback, useRef } from 'react';
import { supabaseService } from '../services/supabase-service';

export interface UseClinicalNoteSubscriptionProps {
  noteId?: string;
  onNoteGenerated?: (note: any) => void;
  onError?: (error: Error) => void;
}

export function useClinicalNoteSubscription({
  noteId,
  onNoteGenerated,
  onError,
}: UseClinicalNoteSubscriptionProps) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const subscribe = useCallback(() => {
    if (!noteId) {
      console.warn('Cannot subscribe: noteId is required');
      return;
    }

    // Clean up any existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = supabaseService.subscribeToClinicalNote({
      noteId,
      onNoteGenerated: (note) => {
        console.log(`📋 Clinical note generated/updated: ${note.id}`);
        onNoteGenerated?.(note);
      },
      onError: (error) => {
        console.error(`❌ Error in clinical note subscription: ${error.message}`);
        onError?.(error);
      },
    });
  }, [noteId, onNoteGenerated, onError]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  const fetchNote = useCallback(async (id: string) => {
    try {
      return await supabaseService.fetchClinicalNote(id);
    } catch (error) {
      console.error(`❌ Error fetching clinical note: ${error}`);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  useEffect(() => {
    if (noteId) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [noteId, subscribe, unsubscribe]);

  return {
    subscribe,
    unsubscribe,
    fetchNote,
  };
}
