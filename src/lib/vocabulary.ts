import { supabase, isSupabaseConfigured } from './supabase';
import type { Vocabulary, VocabularyInsert, VocabularyUpdate } from '@/types/vocabulary';

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

const checkSupabase = () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new DatabaseError("Supabase chưa được cấu hình. Vui lòng kiểm tra biến môi trường NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}

export async function getVocabulary(): Promise<Vocabulary[]> {
  try {
    checkSupabase();
    const { data, error } = await supabase!.from('vocabulary').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Vocabulary[];
  } catch (error: any) {
    console.error("Lỗi getVocabulary:", error.message);
    throw new DatabaseError(error.message || "Không thể lấy danh sách từ vựng.");
  }
}

export async function getVocabularyById(id: string): Promise<Vocabulary | null> {
  try {
    checkSupabase();
    const { data, error } = await supabase!.from('vocabulary').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found error code in PostgREST
      throw error;
    }
    return data as Vocabulary;
  } catch (error: any) {
    console.error("Lỗi getVocabularyById:", error.message);
    throw new DatabaseError(error.message || "Không thể lấy từ vựng.");
  }
}

export async function createVocabulary(vocabulary: VocabularyInsert): Promise<Vocabulary> {
  try {
    checkSupabase();
    const { data, error } = await supabase!.from('vocabulary').insert([vocabulary]).select().single();
    if (error) throw error;
    return data as Vocabulary;
  } catch (error: any) {
    console.error("Lỗi createVocabulary:", error.message);
    throw new DatabaseError(error.message || "Không thể tạo từ vựng.");
  }
}

export async function updateVocabulary(id: string, vocabulary: VocabularyUpdate): Promise<Vocabulary> {
  try {
    checkSupabase();
    const { data, error } = await supabase!.from('vocabulary').update(vocabulary).eq('id', id).select().single();
    if (error) throw error;
    return data as Vocabulary;
  } catch (error: any) {
    console.error("Lỗi updateVocabulary:", error.message);
    throw new DatabaseError(error.message || "Không thể cập nhật từ vựng.");
  }
}

export async function deleteVocabulary(id: string): Promise<void> {
  try {
    checkSupabase();
    const { error } = await supabase!.from('vocabulary').delete().eq('id', id);
    if (error) throw error;
  } catch (error: any) {
    console.error("Lỗi deleteVocabulary:", error.message);
    throw new DatabaseError(error.message || "Không thể xóa từ vựng.");
  }
}

export async function getExistingSignatures(): Promise<Set<string>> {
  try {
    checkSupabase();
    // Only fetch needed columns to avoid huge payload
    const { data, error } = await supabase!.from('vocabulary').select('hanzi, pinyin, meaning_vi');
    if (error) throw error;
    
    const signatures = new Set<string>();
    for (const item of (data || [])) {
      signatures.add(`${item.hanzi}|${item.pinyin}|${item.meaning_vi}`);
    }
    return signatures;
  } catch (error: any) {
    console.error("Lỗi getExistingSignatures:", error.message);
    throw new DatabaseError(error.message || "Không thể tải dữ liệu chống trùng lặp.");
  }
}

export async function batchUpsertVocabulary(
  items: VocabularyInsert[], 
  mode: 'skip' | 'update'
): Promise<{ successCount: number; errorCount: number }> {
  try {
    checkSupabase();
    
    // Supabase JS allows max 1000 rows per insert, we will chunk by 200 just to be safe
    const chunkSize = 200;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      const { error } = await supabase!.from('vocabulary').upsert(
        chunk,
        { 
          onConflict: 'hanzi, pinyin, meaning_vi',
          ignoreDuplicates: mode === 'skip'
        }
      );

      if (error) {
        console.error("Batch insert error:", error);
        errorCount += chunk.length;
      } else {
        successCount += chunk.length;
      }
    }

    return { successCount, errorCount };
  } catch (error: any) {
    console.error("Lỗi batchUpsertVocabulary:", error.message);
    throw new DatabaseError(error.message || "Lỗi import hàng loạt.");
  }
}
