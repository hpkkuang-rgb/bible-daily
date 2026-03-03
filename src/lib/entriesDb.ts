/**
 * Server-only data access layer for public.entries.
 * Uses Supabase client with cookie session (RLS: user_id = auth.uid()).
 */
import { createClient } from "@/src/lib/supabase/server";
import type { ReadingRef } from "./plan";

export type DbEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  book: string;
  chapter: number;
  response_text: string | null;
  completed: boolean;
  updated_at: string;
};

export async function upsertEntry(params: {
  entry_date: string;
  book: string;
  chapter: number;
  response_text?: string | null;
  completed?: boolean;
}): Promise<{ data: DbEntry | null; error: Error | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Unauthorized") };

  const responseText = params.response_text?.trim() || null;
  const completed = params.completed ?? false;

  if (!responseText && !completed) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("entries")
    .upsert(
      {
        user_id: user.id,
        entry_date: params.entry_date,
        book: params.book,
        chapter: params.chapter,
        response_text: responseText,
        completed,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,entry_date,book,chapter"
      }
    )
    .select()
    .single();

  if (error) return { data: null, error };
  return { data: data as DbEntry, error: null };
}

export async function setCompletedForDateChapters(params: {
  entry_date: string;
  items: ReadingRef[];
  completed: boolean;
}): Promise<{ error: Error | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Unauthorized") };

  const { data: existing } = await supabase
    .from("entries")
    .select("book, chapter, response_text")
    .eq("user_id", user.id)
    .eq("entry_date", params.entry_date);

  const existingMap = new Map<string, string | null>();
  for (const row of existing ?? []) {
    existingMap.set(`${row.book}-${row.chapter}`, row.response_text);
  }

  for (const ref of params.items) {
    const existingText = existingMap.get(`${ref.book}-${ref.chapter}`) ?? null;
    const { error } = await supabase
      .from("entries")
      .upsert(
        {
          user_id: user.id,
          entry_date: params.entry_date,
          book: ref.book,
          chapter: ref.chapter,
          response_text: existingText,
          completed: params.completed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,entry_date,book,chapter" }
      )
      .select()
      .single();

    if (error) return { error };
  }
  return { error: null };
}

export async function listMyEntries(params?: {
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): Promise<{ data: DbEntry[]; error: Error | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error("Unauthorized") };

  let query = supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .order("chapter", { ascending: true });

  if (params?.fromDate) {
    query = query.gte("entry_date", params.fromDate);
  }
  if (params?.toDate) {
    query = query.lte("entry_date", params.toDate);
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) return { data: [], error };
  return { data: (data ?? []) as DbEntry[], error: null };
}
