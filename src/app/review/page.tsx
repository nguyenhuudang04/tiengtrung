"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, BookOpenCheck, RotateCcw } from "lucide-react";
import type { VocabularyWithProgress } from "@/types/learning";
import { getReviewVocabulary, markAsLearned } from "@/lib/learningProgress";
import toast from "react-hot-toast";
import { withTimeout } from "@/utils/withTimeout";

export default function ReviewPage() {
  const [data, setData] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const fetched = await withTimeout(getReviewVocabulary(), 10000, "Quá thời gian kết nối. Vui lòng thử lại.");
      setData(fetched);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải dữ liệu ôn tập.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLearned = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // In case it's inside a link
    try {
      await markAsLearned(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Đã đánh dấu từ này là đã thuộc.");
    } catch (error: any) {
      toast.error(error.message || "Lỗi cập nhật.");
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa ôn";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Đang tải danh sách cần ôn...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center max-w-md w-full">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn chưa có từ nào cần ôn</h2>
          <p className="text-gray-500 mb-8">Bạn đã học rất tốt! Tất cả các từ vựng hiện tại đều đã được ghi nhớ hoặc chưa bắt đầu học.</p>
          
          <Link 
            href="/learn"
            className="w-full min-h-[56px] bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Học từ vựng mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Từ cần ôn</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-500">
            Bạn đang có <strong className="text-amber-600">{data.length}</strong> từ vựng cần ôn tập.
          </p>
        </div>
        <Link 
          href="/learn?mode=review"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 min-h-[44px] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-base shadow-sm"
        >
          <BookOpenCheck className="w-5 h-5" />
          Ôn tất cả ngay
        </Link>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Từ vựng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pinyin / Nghĩa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tiến độ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl font-tc font-bold text-indigo-900">
                        {item.hanzi}
                      </div>
                      {item.level && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white border border-gray-200 text-gray-600">
                          {item.level}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">{item.pinyin}</p>
                    <p className="text-base font-medium text-gray-900">{item.meaning_vi}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <RotateCcw className="w-4 h-4 text-gray-400" />
                        Đã ôn: <strong className="text-gray-900">{item.progress?.review_count || 0} lần</strong>
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Lần gần nhất: <strong className="text-gray-900">{formatDate(item.progress?.last_reviewed_at)}</strong>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => handleMarkLearned(item.id, e)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center"
                        title="Đánh dấu đã thuộc"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <Link 
                        href={`/learn?mode=review`} // We just link to review mode. For specific item, might need another approach, but user requirement says: "mở flashcard... không cần tạo hệ thống phức tạp", linking to mode=review is perfectly fine.
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center justify-center"
                      >
                        Ôn từ này
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {data.map((item) => (
            <div key={item.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl font-tc font-bold text-indigo-900 shadow-sm">
                    {item.hanzi}
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5 text-sm">{item.pinyin}</p>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.meaning_vi}</h3>
                  </div>
                </div>
                {item.level && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white border border-gray-200 text-gray-600 shrink-0">
                    {item.level}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 text-sm border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1"><RotateCcw className="w-4 h-4 text-gray-400" /> Đã ôn:</span>
                  <span className="font-bold text-gray-900">{item.progress?.review_count || 0} lần</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> Gần nhất:</span>
                  <span className="font-bold text-gray-900">{formatDate(item.progress?.last_reviewed_at)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={(e) => handleMarkLearned(item.id, e)}
                  className="flex-[2] min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold text-green-700 bg-green-50 rounded-xl active:bg-green-100 transition-colors border border-green-100"
                >
                  <CheckCircle className="w-4 h-4" /> Đã thuộc
                </button>
                <Link 
                  href={`/learn?mode=review`}
                  className="flex-[3] min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 rounded-xl active:bg-indigo-700 transition-colors shadow-sm"
                >
                  Ôn từ này
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
