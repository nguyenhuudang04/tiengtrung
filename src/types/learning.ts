import type { Vocabulary } from "./vocabulary";

export type LearningStatus = 'new' | 'learning' | 'learned' | 'review';

export interface LearningProgress {
  id: string;
  vocabulary_id: string;
  status: LearningStatus;
  wrong_count: number;
  correct_count: number;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Joined payload from DB
export interface VocabularyWithProgress extends Vocabulary {
  learning_progress?: LearningProgress[]; // Supabase join syntax returns array usually unless `.single()`
  progress?: LearningProgress | null; // Our mapped property for ease of use
}

export interface DashboardStats {
  total: number;
  learned: number;
  review: number;
  new: number;
}
