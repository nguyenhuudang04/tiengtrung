import type { VocabularyWithProgress } from "@/types/learning";
import type { QuizQuestion, QuizAnswer } from "@/types/quiz";

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createQuizQuestions(
  pool: VocabularyWithProgress[],
  allVocab: VocabularyWithProgress[],
  quantity: number
): QuizQuestion[] {
  if (pool.length === 0) return [];
  
  // Shuffle pool to pick questions randomly
  const shuffledPool = shuffleArray(pool);
  const selectedQuestions = shuffledPool.slice(0, quantity);
  
  const questions: QuizQuestion[] = selectedQuestions.map(vocab => {
    const correctAnswer: QuizAnswer = {
      id: vocab.id,
      meaning_vi: vocab.meaning_vi,
      isCorrect: true
    };

    // Filter out the correct vocabulary and any vocab with the same meaning
    const otherVocabs = allVocab.filter(v => v.id !== vocab.id && v.meaning_vi !== vocab.meaning_vi);
    
    // Score distractors to find similar items
    const scoredVocabs = otherVocabs.map(v => {
      let score = 0;
      if (vocab.part_of_speech && v.part_of_speech === vocab.part_of_speech) score += 10;
      if (vocab.category && v.category === vocab.category) score += 5;
      if (vocab.level && v.level === vocab.level) score += 3;
      
      // Try to match length loosely (e.g. 4-character idioms like 不但……而且……)
      const lenDiff = Math.abs((v.hanzi || '').length - (vocab.hanzi || '').length);
      if (lenDiff === 0) score += 2;
      
      // Random jitter so it's not always the exact same 3 distractors
      score += Math.random() * 2;
      
      return { vocab: v, score };
    });

    // Sort by score descending
    scoredVocabs.sort((a, b) => b.score - a.score);
    
    // Pick top 3 unique meanings
    const wrongAnswers: QuizAnswer[] = [];
    const usedMeanings = new Set<string>();
    usedMeanings.add(vocab.meaning_vi);

    for (const item of scoredVocabs) {
      if (wrongAnswers.length >= 3) break;
      if (!usedMeanings.has(item.vocab.meaning_vi)) {
        usedMeanings.add(item.vocab.meaning_vi);
        wrongAnswers.push({
          id: item.vocab.id,
          meaning_vi: item.vocab.meaning_vi,
          isCorrect: false
        });
      }
    }

    // Combine and shuffle answers
    const answers = shuffleArray([correctAnswer, ...wrongAnswers]);

    return {
      vocabulary: vocab,
      answers
    };
  });

  return questions;
}
