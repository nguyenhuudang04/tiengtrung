"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { VocabularyWithProgress } from "@/types/learning";
import type { QuizQuestion as QuizQuestionType, QuizResultStats, WrongAnswerRecord, QuizAnswer, QuizDifficulty } from "@/types/quiz";
import { getVocabularyWithProgress, upsertLearningProgress } from "@/lib/learningProgress";
import { createQuizQuestions } from "@/lib/quiz";
import QuizSetup from "@/components/quiz/QuizSetup";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResult from "@/components/quiz/QuizResult";
import { useRouter } from "next/navigation";
import { withTimeout } from "@/utils/withTimeout";

type Phase = "setup" | "quiz" | "result";

export default function QuizPage() {
  const router = useRouter();
  const [data, setData] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongRecords, setWrongRecords] = useState<WrongAnswerRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedData = await withTimeout(getVocabularyWithProgress(), 10000, "Kết nối bị quá hạn. Vui lòng kiểm tra kết nối mạng.");
        setData(fetchedData);
      } catch (err: any) {
        setError(err.message || "Không thể tải từ vựng.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStart = (pool: VocabularyWithProgress[], quantity: number, selectedDifficulty: QuizDifficulty) => {
    const generatedQuestions = createQuizQuestions(pool, data, quantity);
    if (generatedQuestions.length === 0) return;

    setDifficulty(selectedDifficulty);
    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongRecords([]);
    setPhase("quiz");
  };

  const handleAnswer = (selected: QuizAnswer, isCorrect: boolean) => {
    const currentQuestion = questions[currentIndex];
    const vocabId = currentQuestion.vocabulary.id;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      upsertLearningProgress(vocabId, currentQuestion.vocabulary.progress?.status || 'learning', 'correct').catch(console.error);
    } else {
      setWrongRecords(prev => [...prev, { question: currentQuestion, selectedMeaning: selected.meaning_vi }]);
      upsertLearningProgress(vocabId, 'review', 'wrong').catch(console.error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPhase("result");
    }
  };

  const handleRetry = () => {
    setPhase("setup");
  };

  const handleReviewWrong = () => {
    const wrongIds = wrongRecords.map(r => r.question.vocabulary.id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("wrong_quiz_ids", JSON.stringify(wrongIds));
    }
    router.push("/learn?mode=wrong_quiz");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu bài kiểm tra...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md w-full shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Lỗi kết nối</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full min-h-[48px] bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const resultStats: QuizResultStats = {
    total: questions.length,
    correct: correctCount,
    wrong: wrongRecords.length,
    accuracy: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
    wrongRecords,
    difficulty
  };

  return (
    <div className="py-4 md:py-8 h-full flex flex-col">
      {phase === "setup" && (
        <QuizSetup data={data} onStart={handleStart} />
      )}
      
      {phase === "quiz" && questions.length > 0 && (
        <QuizQuestion 
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          total={questions.length}
          difficulty={difficulty}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}

      {phase === "result" && (
        <QuizResult 
          stats={resultStats}
          onRetry={handleRetry}
          onReviewWrong={handleReviewWrong}
        />
      )}
    </div>
  );
}
