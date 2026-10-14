"use client";

import { CheckCircle2, RotateCcw, Home, Target, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { QuizResultStats } from "@/types/quiz";

type Props = {
  stats: QuizResultStats;
  onRetry: () => void;
  onReviewWrong: () => void;
};

export default function QuizResult({ stats, onRetry, onReviewWrong }: Props) {
  const isPerfect = stats.wrong === 0;

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in zoom-in-95 duration-500 pb-10">
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm text-center mb-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-10 h-10" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành bài kiểm tra</h2>
        
        {isPerfect ? (
          <p className="text-green-600 font-medium text-lg mb-8 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6" /> Xuất sắc! Bạn trả lời đúng tất cả 🎉
          </p>
        ) : (
          <p className="text-gray-500 text-lg mb-8">Dưới đây là kết quả của bạn.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Điểm</p>
            <p className="text-2xl font-bold text-gray-900">{stats.correct} <span className="text-gray-400 text-lg">/ {stats.total}</span></p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <p className="text-sm font-medium text-indigo-600 mb-1">Chế độ</p>
            <p className="text-xl font-bold text-indigo-900 capitalize pt-1">{stats.difficulty === 'easy' ? 'Dễ' : stats.difficulty === 'medium' ? 'TB' : 'Khó'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
            <p className="text-sm font-medium text-green-600 mb-1">Đúng</p>
            <p className="text-2xl font-bold text-green-900">{stats.correct}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <p className="text-sm font-medium text-red-600 mb-1">Sai</p>
            <p className="text-2xl font-bold text-red-900">{stats.wrong}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isPerfect && (
            <button 
              onClick={onReviewWrong}
              className="min-h-[56px] px-6 bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <AlertCircle className="w-5 h-5" />
              Ôn lại từ sai
            </button>
          )}
          <button 
            onClick={onRetry}
            className="min-h-[56px] px-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            Làm lại
          </button>
          <Link 
            href="/"
            className="min-h-[56px] px-6 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </div>

      {!isPerfect && stats.wrongRecords.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Danh sách câu sai
          </h3>
          
          <div className="space-y-4">
            {stats.wrongRecords.map((record, idx) => {
              const correctAnswer = record.question.answers.find(a => a.isCorrect)?.meaning_vi;
              return (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="shrink-0 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-3xl font-tc font-normal text-gray-900">
                      {record.question.vocabulary.hanzi}
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <p className="text-xs font-bold text-red-600 uppercase mb-1 tracking-wider">Bạn chọn</p>
                      <p className="text-gray-900 font-medium line-through decoration-red-300">{record.selectedMeaning}</p>
                    </div>
                    <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1 tracking-wider">Đáp án đúng</p>
                      <p className="text-green-800 font-bold">{correctAnswer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
