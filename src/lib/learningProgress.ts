import { supabase } from "./supabase";
import type { LearningProgress, LearningStatus, VocabularyWithProgress, DashboardStats } from "@/types/learning";
import { DatabaseError } from "./vocabulary"; // reuse error class

const checkSupabase = () => {
  if (!supabase) {
    throw new DatabaseError("Cơ sở dữ liệu chưa được kết nối. Vui lòng thiết lập Supabase.");
  }
};

export async function upsertLearningProgress(
  vocabularyId: string, 
  status: LearningStatus,
  action: 'wrong' | 'review' | 'correct'
): Promise<void> {
  try {
    checkSupabase();
    
    // Using Supabase RPC is best for atomic increments, but since we don't want to enforce custom SQL RPCs for the user yet, 
    // we'll try to fetch first and update, or just upsert.
    // Given the constraints, let's fetch current progress
    const { data: current } = await supabase!.from('learning_progress').select('*').eq('vocabulary_id', vocabularyId).maybeSingle();
    
    const now = new Date().toISOString();
    
    if (current) {
      const updateData = {
        status,
        last_reviewed_at: now,
        wrong_count: action === 'wrong' ? current.wrong_count + 1 : current.wrong_count,
        correct_count: action === 'correct' ? current.correct_count + 1 : current.correct_count,
        review_count: (action === 'review' || action === 'wrong') ? current.review_count + 1 : current.review_count,
      };
      
      const { error } = await supabase!.from('learning_progress').update(updateData).eq('id', current.id);
      if (error) throw error;
    } else {
      const insertData = {
        vocabulary_id: vocabularyId,
        status,
        last_reviewed_at: now,
        wrong_count: action === 'wrong' ? 1 : 0,
        correct_count: action === 'correct' ? 1 : 0,
        review_count: (action === 'review' || action === 'wrong') ? 1 : 0,
      };
      
      const { error } = await supabase!.from('learning_progress').insert(insertData);
      if (error) throw error;
    }
  } catch (error: any) {
    console.error("Lỗi upsertLearningProgress:", error.message);
    throw new DatabaseError(error.message || "Không thể cập nhật tiến độ học.");
  }
}

export async function getReviewVocabulary(): Promise<VocabularyWithProgress[]> {
  try {
    checkSupabase();
    // Inner join to only get vocabularies that have a learning_progress with status = 'review'
    const { data, error } = await supabase!
      .from('vocabulary')
      .select(`
        *,
        learning_progress!inner(*)
      `)
      .eq('learning_progress.status', 'review')
      .order('last_reviewed_at', { foreignTable: 'learning_progress', ascending: true, nullsFirst: true });

    if (error) throw error;

    return (data || []).map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { learning_progress, ...rest } = item as any;
      return {
        ...rest,
        progress: Array.isArray(learning_progress) ? learning_progress[0] : learning_progress
      } as VocabularyWithProgress;
    });
  } catch (error: any) {
    console.error("Lỗi getReviewVocabulary:", error.message);
    throw new DatabaseError(error.message || "Không thể lấy danh sách cần ôn.");
  }
}

export async function markAsLearned(vocabularyId: string): Promise<void> {
  return upsertLearningProgress(vocabularyId, 'learned', 'correct');
}

export async function getVocabularyWithProgress(): Promise<VocabularyWithProgress[]> {
  try {
    checkSupabase();
    const { data, error } = await supabase!
      .from('vocabulary')
      .select(`
        *,
        learning_progress(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { learning_progress, ...rest } = item as any;
      return {
        ...rest,
        progress: (Array.isArray(learning_progress) && learning_progress.length > 0) ? learning_progress[0] : null
      } as VocabularyWithProgress;
    });
  } catch (error: any) {
    console.error("Lỗi getVocabularyWithProgress:", error.message);
    throw new DatabaseError(error.message || "Không thể tải danh sách từ vựng.");
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    checkSupabase();
    
    // We could use count queries, but fetching all progress items is fine for MVP scale.
    // To be efficient, we just query learning_progress status and count
    const { count: totalVocab } = await supabase!.from('vocabulary').select('*', { count: 'exact', head: true });
    
    const { data: progressList, error } = await supabase!.from('learning_progress').select('status');
    if (error) throw error;

    let learned = 0;
    let review = 0;
    
    (progressList || []).forEach(p => {
      if (p.status === 'learned') learned++;
      if (p.status === 'review') review++;
    });

    const total = totalVocab || 0;
    // New = Total minus all that have records, OR status = new or learning
    // progressList contains all records (learned, review, learning, new)
    const trackedCount = progressList?.length || 0;
    const untrackedCount = total - trackedCount;
    const explicitNewCount = (progressList || []).filter(p => p.status === 'new' || p.status === 'learning').length;
    
    const newCount = untrackedCount + explicitNewCount;

    return {
      total,
      learned,
      review,
      new: newCount
    };
  } catch (error: any) {
    console.error("Lỗi getDashboardStats:", error.message);
    // Return safe default if error
    return { total: 0, learned: 0, review: 0, new: 0 };
  }
}
