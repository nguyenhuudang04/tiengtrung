"use client";

import { useState } from "react";
import { BrainCircuit, Play } from "lucide-react";
import type { VocabularyWithProgress } from "@/types/learning";
import toast from "react-hot-toast";

import type { QuizDifficulty } from "@/types/quiz";

type Props = {
  data: VocabularyWithProgress[];
  onStart: (pool: VocabularyWithProgress[], quantity: number, difficulty: QuizDifficulty) => void;
};

export default function QuizSetup({ data, onStart }: Props) {
  const [level, setLevel] = useState<string>("all");
  const [quantity, setQuantity] = useState<number>(20);
  const [source, setSource] = useState<"all" | "learned" | "review" | "new">("all");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");

  const uniqueLevels = Array.from(new Set(data.map(d => d.level).filter(Boolean))) as string[];

  const handleStart = () => {
    let pool = [...data];

    // Filter by source
    if (source === "new") {
      pool = pool.filter(item => !item.progress || item.progress.status === "new");
    } else if (source === "review") {
      pool = pool.filter(item => item.progress?.status === "review");
    } else if (source === "learned") {
      pool = pool.filter(item => item.progress?.status === "learned");
    }

    // Filter by level
    if (level !== "all") {
      pool = pool.filter(item => item.level === level);
    }

    if (pool.length === 0) {
      toast.error("Không có từ vựng nào phù hợp với bộ lọc này.");
      return;
    }
    
    // Check if we have enough distinct meanings in the DB to make a quiz (at least 2)
    const distinctMeanings = new Set(data.map(v => v.meaning_vi));
    if (distinctMeanings.size < 2) {
      toast.error("Bạn cần thêm nhiều từ vựng (với nghĩa khác nhau) hơn để làm bài kiểm tra.");
      return;
    }

    onStart(pool, quantity, difficulty);
  };

  const quantityOptions = [10, 20, 30, 50];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-lg mx-auto w-full animate-in zoom-in-95 duration-500 mb-8 mt-2">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Kiểm tra từ vựng</h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Thiết lập bài kiểm tra trắc nghiệm của bạn.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">Mức độ kiểm tra</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "easy", label: "Dễ", sub: "Trắc nghiệm" },
              { id: "medium", label: "TB", sub: "Tự nhớ trước" },
              { id: "hard", label: "Khó", sub: "Tự nhập" }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id as QuizDifficulty)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors border-2 min-h-[64px] ${difficulty === d.id ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-gray-100 text-gray-500 hover:border-indigo-200"}`}
              >
                <span className="font-bold text-sm">{d.label}</span>
                <span className="text-xs mt-0.5">{d.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">Nguồn từ</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "all", label: "Tất cả từ" },
              { id: "new", label: "Từ chưa học" },
              { id: "review", label: "Từ cần ôn" },
              { id: "learned", label: "Từ đã học" }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSource(s.id as any)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${source === s.id ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">Chọn Level</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLevel("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${level === "all" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
            >
              Tất cả
            </button>
            {uniqueLevels.map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${level === lvl ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">Số câu hỏi</label>
          <div className="flex gap-2">
            {quantityOptions.map(qty => (
              <button
                key={qty}
                onClick={() => setQuantity(qty)}
                className={`flex-1 min-w-[3rem] px-2 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${quantity === qty ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleStart}
          className="w-full min-h-[56px] bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          Bắt đầu kiểm tra
        </button>
      </div>
    </div>
  );
}
