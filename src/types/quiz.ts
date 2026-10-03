import type { VocabularyWithProgress } from "./learning";

export type QuizAnswer = {
  id: string; // id of the vocabulary that provides this meaning, or just 'correct' / 'wrong_1'
  meaning_vi: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  vocabulary: VocabularyWithProgress;
  answers: QuizAnswer[];
};

export type WrongAnswerRecord = {
  question: QuizQuestion;
  selectedMeaning: string;
};

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export type QuizResultStats = {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  wrongRecords: WrongAnswerRecord[];
  difficulty: QuizDifficulty;
};
