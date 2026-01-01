import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/old/config/api";

export type Note = {
  note_id: string;
  ticket_id: string;
  title?: string;
  content?: string;
  created_at?: string;
};

// Hook to fetch notes for a ticket
export function useTicketNotes(ticketId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/notes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [ticketId]);

  return { notes, loading, error, refetch: fetchNotes };
}

// Hook to fetch individual note content
export function useNote(noteId: string | null) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNote = async () => {
    if (!noteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch note: ${response.status}`);
      }
      const data = await response.json();
      setNote(data.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch note");
      setNote(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  return { note, loading, error, refetch: fetchNote };
}

// Hook to create a new note
export function useCreateNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = async (ticketId: string): Promise<Note | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.status}`);
      }

      const data = await response.json();
      return data.note;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createNote, loading, error };
}

// Hook to update note content
export function useUpdateNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNote = async (noteId: string, content: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.status}`);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateNote, loading, error };
}

// Hook to summarize notes
export function useSummarizeNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarizeNote = async (noteId: string, newNotes: string[]): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/summarise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_notes: newNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to summarize note: ${response.status}`);
      }

      const data = await response.json();
      return data.note;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize note");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { summarizeNote, loading, error };
}

// Hook to delete a note
export function useDeleteNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteNote = async (noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteNote, loading, error };
}

// Hook to create a journal note
export function useCreateJournalNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJournalNote = async (date: string): Promise<Note | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/journal/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create journal note: ${response.status}`);
      }

      const data = await response.json();
      return data.note;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create journal note");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createJournalNote, loading, error };
}
