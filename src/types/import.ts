import type { VocabularyInsert } from "./vocabulary";

export type ImportRow = {
  hanzi?: string;
  pinyin?: string;
  meaning_vi?: string;
  part_of_speech?: string;
  example_cn?: string;
  example_pinyin?: string;
  example_vi?: string;
  level?: string;
  category?: string;
  notes?: string;
  _rawRowIndex: number;
};

export type ImportValidationResult = {
  isValid: boolean;
  errors: string[];
  data: VocabularyInsert | null;
  isDuplicate: boolean;
  raw: ImportRow;
};

export type ImportSummary = {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  newValid: number;
  rows: ImportValidationResult[];
};
