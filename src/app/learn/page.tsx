"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import type { VocabularyWithProgress } from "@/types/learning";
import { getVocabularyWithProgress, upsertLearningProgress } from "@/lib/learningProgress";
import LearnSetup from "@/components/learn/LearnSetup";
import Flashcard from "@/components/learn/Flashcard";
import LearningComplete from "@/components/learn/LearningComplete";
import toast from "react-hot-toast";
import { withTimeout } from "@/utils/withTimeout";

type Phase = "setup" | "learning" | "complete";

function LearnPageContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as any) || "all";

  const [data, setData] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("setup");
  const [sessionList, setSessionList] = useState<VocabularyWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Add 10-second timeout to prevent infinite loading on mobile when Supabase fetch hangs
        const fetchedData = await withTimeout(getVocabularyWithProgress(), 10000, "Kết nối tới máy chủ bị quá hạn. Vui lòng kiểm tra lại mạng hoặc Supabase URL.");
        setData(fetchedData);
        
        // Handle auto-start for wrong_quiz
        if (initialMode === "wrong_quiz" && typeof window !== "undefined") {
          const storedIds = sessionStorage.getItem("wrong_quiz_ids");
          if (storedIds) {
            try {
              const ids: string[] = JSON.parse(storedIds);
              const filtered = fetchedData.filter(v => ids.includes(v.id));
              if (filtered.length > 0) {
                setSessionList(filtered);
                setCurrentIndex(0);
                setPhase("learning");
              }
            } catch (e) {
              console.error("Failed to parse wrong_quiz_ids", e);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải từ vựng.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialMode]);

  const handleStart = (list: VocabularyWithProgress[]) => {
    if (list.length === 0) {
      toast.error("Không tìm thấy từ vựng nào phù hợp với bộ lọc.");
      return;
    }
    setSessionList(list);
    setCurrentIndex(0);
    setPhase("learning");
  };

  const handleFeedback = async (action: 'wrong' | 'review' | 'correct') => {
    const currentVocab = sessionList[currentIndex];
    
    let status: 'review' | 'learned' = 'review';
    if (action === 'correct') status = 'learned';
    
    try {
      // Bắt buộc chờ update Supabase thành công trước khi chuyển card
      await upsertLearningProgress(currentVocab.id, status, action);
      
      // Update local state in case we need it
      setSessionList(prev => {
        const newList = [...prev];
        const updatedVocab = { ...newList[currentIndex] };
        
        const currentProgress = updatedVocab.progress || {
          id: 'temp-' + Date.now(),
          vocabulary_id: updatedVocab.id,
          status: 'new' as const,
          wrong_count: 0,
          correct_count: 0,
          review_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        updatedVocab.progress = {
          ...currentProgress,
          status,
          wrong_count: action === 'wrong' ? currentProgress.wrong_count + 1 : currentProgress.wrong_count,
          correct_count: action === 'correct' ? currentProgress.correct_count + 1 : currentProgress.correct_count,
          review_count: (action === 'review' || action === 'wrong') ? currentProgress.review_count + 1 : currentProgress.review_count,
          last_reviewed_at: new Date().toISOString()
        };
        
        newList[currentIndex] = updatedVocab;
        return newList;
      });

      // Nếu update thành công thì mới chuyển card
      if (currentIndex < sessionList.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setPhase("complete");
      }
    } catch (err) {
      console.error("Failed to update progress", err);
      toast.error("Không thể cập nhật tiến độ học.");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRetry = () => {
    setPhase("setup");
    setSessionList([]);
    setCurrentIndex(0);
    // Might want to refresh data here to get latest progress
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu học tập...</p>
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

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center max-w-md w-full">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Chưa có từ vựng để học.</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Hãy thêm một vài từ vựng hoặc import dữ liệu trước khi bắt đầu bài học đầu tiên của bạn.</p>
          
          <Link 
            href="/vocabulary"
            className="w-full min-h-[56px] bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm từ vựng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 h-full flex flex-col">
      {phase === "setup" && (
        <LearnSetup data={data} onStart={handleStart} initialMode={initialMode} />
      )}
      
      {phase === "learning" && sessionList.length > 0 && (
        <Flashcard 
          vocabulary={sessionList[currentIndex]}
          currentIndex={currentIndex}
          total={sessionList.length}
          onNext={(action) => handleFeedback(action || 'review')}
          onPrev={handlePrev}
        />
      )}

      {phase === "complete" && (
        <LearningComplete 
          total={sessionList.length} 
          onRetry={handleRetry} 
        />
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải...</div>}>
      <LearnPageContent />
    </Suspense>
  );
}
