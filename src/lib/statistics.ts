import { supabase } from "./supabase";
import type { ExtendedDashboardStats, DetailedStatistics, LevelStatistic } from "@/types/statistics";
import type { VocabularyWithProgress } from "@/types/learning";
import { DatabaseError } from "./vocabulary";

const checkSupabase = () => {
  if (!supabase) {
    throw new DatabaseError("Cơ sở dữ liệu chưa được kết nối.");
  }
};

export async function getExtendedDashboardStats(): Promise<ExtendedDashboardStats> {
  try {
    checkSupabase();
    
    // Fetch all progress data
    const { data: progressList, error: progError } = await supabase!.from('learning_progress').select('status, correct_count, wrong_count');
    if (progError) throw progError;

    // Fetch total vocabulary count
    const { count: totalVocab, error: vocabError } = await supabase!.from('vocabulary').select('*', { count: 'exact', head: true });
    if (vocabError) throw vocabError;

    let learned = 0;
    let review = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    
    (progressList || []).forEach(p => {
      if (p.status === 'learned') learned++;
      if (p.status === 'review') review++;
      totalCorrect += (p.correct_count || 0);
      totalWrong += (p.wrong_count || 0);
    });

    const total = totalVocab || 0;
    const trackedCount = progressList?.length || 0;
    const untrackedCount = total - trackedCount;
    // New counts includes explicit 'new' and 'learning' status
    const explicitNewCount = (progressList || []).filter(p => p.status === 'new' || p.status === 'learning').length;
    
    const newCount = untrackedCount + explicitNewCount;

    const totalAnswers = totalCorrect + totalWrong;
    const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    return {
      total,
      learned,
      review,
      new: newCount,
      totalCorrect,
      totalWrong,
      accuracy
    };
  } catch (error: any) {
    console.error("Lỗi getExtendedDashboardStats:", error.message);
    throw new DatabaseError(error.message || "Không thể tải số liệu Dashboard.");
  }
}

export async function getDetailedStatistics(): Promise<DetailedStatistics> {
  try {
    checkSupabase();

    // 1. Overview stats
    const overview = await getExtendedDashboardStats();

    // 2. Vocabulary by Level
    // We can fetch level distribution by grouped query or just fetch all vocab levels since payload is small.
    // For scale, grouped query using RPC is better, but since no RPC, we'll fetch 'level' from vocabulary
    const { data: levelData, error: levelError } = await supabase!.from('vocabulary').select('level');
    if (levelError) throw levelError;

    const levelMap: Record<string, number> = {};
    (levelData || []).forEach(item => {
      const lvl = item.level || 'Chưa phân loại';
      levelMap[lvl] = (levelMap[lvl] || 0) + 1;
    });

    const byLevel: LevelStatistic[] = Object.entries(levelMap)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Most wrong
    const { data: wrongData, error: wrongError } = await supabase!
      .from('vocabulary')
      .select('*, learning_progress!inner(*)')
      .gt('learning_progress.wrong_count', 0)
      .order('wrong_count', { foreignTable: 'learning_progress', ascending: false })
      .limit(10);
    if (wrongError) throw wrongError;

    const mostWrong = (wrongData || []).map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { learning_progress, ...rest } = item as any;
      return {
        ...rest,
        progress: Array.isArray(learning_progress) ? learning_progress[0] : learning_progress
      } as VocabularyWithProgress;
    });

    // 4. Most reviewed
    const { data: reviewData, error: reviewError } = await supabase!
      .from('vocabulary')
      .select('*, learning_progress!inner(*)')
      .gt('learning_progress.review_count', 0)
      .order('review_count', { foreignTable: 'learning_progress', ascending: false })
      .limit(10);
    if (reviewError) throw reviewError;

    const mostReviewed = (reviewData || []).map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { learning_progress, ...rest } = item as any;
      return {
        ...rest,
        progress: Array.isArray(learning_progress) ? learning_progress[0] : learning_progress
      } as VocabularyWithProgress;
    });

    return {
      overview,
      byLevel,
      mostWrong,
      mostReviewed
    };

  } catch (error: any) {
    console.error("Lỗi getDetailedStatistics:", error.message);
    throw new DatabaseError(error.message || "Không thể tải số liệu thống kê chi tiết.");
  }
}
