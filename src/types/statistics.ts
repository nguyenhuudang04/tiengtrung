import type { VocabularyWithProgress } from "./learning";

export interface ExtendedDashboardStats {
  total: number;
  learned: number;
  review: number;
  new: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
}

export interface LevelStatistic {
  level: string;
  count: number;
}

export interface DetailedStatistics {
  overview: ExtendedDashboardStats;
  byLevel: LevelStatistic[];
  mostWrong: VocabularyWithProgress[];
  mostReviewed: VocabularyWithProgress[];
}
