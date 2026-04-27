import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ClinicalNoteSubscription {
  noteId: string;
  onNoteGenerated: (note: any) => void;
  onError?: (error: Error) => void;
}

export class SupabaseService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  subscribeToClinicalNote(subscription: ClinicalNoteSubscription): () => void {
    const { noteId, onNoteGenerated, onError } = subscription;
    
    console.log(`🔔 Subscribing to clinical note: ${noteId}`);

    const channel = supabase
      .channel(`clinical_note_${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clinical_notes',
          filter: `id=eq.${noteId}`
        },
        (payload) => {
          console.log('📨 Clinical note received:', payload);
          if (payload.new) {
            onNoteGenerated(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clinical_notes',
          filter: `id=eq.${noteId}`
        },
        (payload) => {
          console.log('📝 Clinical note updated:', payload);
          if (payload.new) {
            onNoteGenerated(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to clinical note: ${noteId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to clinical note: ${noteId}`);
          onError?.(new Error('Failed to subscribe to clinical note'));
        }
      });

    this.subscriptions.set(noteId, channel);

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromClinicalNote(noteId);
    };
  }

  unsubscribeFromClinicalNote(noteId: string): void {
    const channel = this.subscriptions.get(noteId);
    if (channel) {
      console.log(`🔕 Unsubscribing from clinical note: ${noteId}`);
      supabase.removeChannel(channel);
      this.subscriptions.delete(noteId);
    }
  }

  async fetchClinicalNote(noteId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error fetching clinical note ${noteId}:`, error);
      throw error;
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    console.log('🧹 Cleaning up all Supabase subscriptions');
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}

export const supabaseService = new SupabaseService();
