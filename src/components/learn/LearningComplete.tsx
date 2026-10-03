"use client";

import { CheckCircle2, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

type Props = {
  total: number;
  onRetry: () => void;
};

export default function LearningComplete({ total, onRetry }: Props) {
  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm max-w-lg mx-auto w-full text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành buổi học</h2>
      <p className="text-gray-500 text-lg mb-8">Bạn đã xuất sắc ôn tập <strong className="text-gray-900">{total}</strong> từ vựng.</p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={onRetry}
          className="min-h-[56px] px-8 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          Học lại
        </button>
        <Link 
          href="/"
          className="min-h-[56px] px-8 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
