export interface Vocabulary {
  id: string; // UUID
  hanzi: string;
  pinyin: string;
  meaning_vi: string;
  part_of_speech?: string | null;
  example_cn?: string | null;
  example_pinyin?: string | null;
  example_vi?: string | null;
  level?: string | null;
  category?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type VocabularyInsert = Omit<Vocabulary, 'id' | 'created_at' | 'updated_at'>;
export type VocabularyUpdate = Partial<VocabularyInsert>;
