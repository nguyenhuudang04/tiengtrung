"use client";

import { useState } from "react";
import { BookOpen, Settings } from "lucide-react";
import type { VocabularyWithProgress } from "@/types/learning";

type Props = {
  data: VocabularyWithProgress[];
  onStart: (sessionList: VocabularyWithProgress[]) => void;
  initialMode?: "all" | "new" | "review" | "learned" | "wrong_quiz";
};

export default function LearnSetup({ data, onStart, initialMode = "all" }: Props) {
  const [level, setLevel] = useState<string>("all");
  const [quantity, setQuantity] = useState<number>(20);
  const [order, setOrder] = useState<"sequence" | "random">("random");
  const [learningMode, setLearningMode] = useState<"all" | "new" | "review" | "learned">(
    initialMode === "wrong_quiz" ? "all" : initialMode
  );

  // Extract unique levels
  const uniqueLevels = Array.from(new Set(data.map(d => d.level).filter(Boolean))) as string[];

  const handleStart = () => {
    let filtered = [...data];
    
    // Filter by learning mode
    if (learningMode === "new") {
      filtered = filtered.filter(item => !item.progress || item.progress.status === "new");
    } else if (learningMode === "review") {
      filtered = filtered.filter(item => item.progress?.status === "review");
    } else if (learningMode === "learned") {
      filtered = filtered.filter(item => item.progress?.status === "learned");
    }

    // Filter by level
    if (level !== "all") {
      filtered = filtered.filter(item => item.level === level);
    }

    // Sort order
    if (order === "random") {
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
    } else {
      filtered.reverse(); 
    }

    if (quantity > 0 && filtered.length > quantity) {
      filtered = filtered.slice(0, quantity);
    }

    onStart(filtered);
  };

  const quantityOptions = [10, 20, 30, 50, 0];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-lg mx-auto w-full animate-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Thiết lập bài học</h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Tùy chỉnh phiên học từ vựng của bạn.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">Loại từ muốn học</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "all", label: "Tất cả" },
              { id: "new", label: "Chưa học" },
              { id: "review", label: "Cần ôn" },
              { id: "learned", label: "Đã thuộc" }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setLearningMode(mode.id as any)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${learningMode === mode.id ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
              >
                {mode.label}
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
          <label className="text-sm font-bold text-gray-900 block">Số lượng từ</label>
          <div className="flex flex-wrap gap-2">
            {quantityOptions.map(qty => (
              <button
                key={qty}
                onClick={() => setQuantity(qty)}
                className={`flex-1 min-w-[3rem] px-2 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${quantity === qty ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
              >
                {qty === 0 ? "Tất cả" : qty}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">Thứ tự</label>
          <div className="flex gap-2">
            <button
              onClick={() => setOrder("sequence")}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${order === "sequence" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
            >
              Theo thứ tự
            </button>
            <button
              onClick={() => setOrder("random")}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${order === "random" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
            >
              Ngẫu nhiên
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleStart}
          className="w-full min-h-[56px] bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <BookOpen className="w-6 h-6" />
          Bắt đầu học
        </button>
      </div>
    </div>
  );
}
