"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, PieChart, TrendingUp, AlertTriangle, RefreshCw, BarChart } from "lucide-react";
import { getDetailedStatistics } from "@/lib/statistics";
import type { DetailedStatistics } from "@/types/statistics";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { withTimeout } from "@/utils/withTimeout";

export default function StatisticsPage() {
  const [data, setData] = useState<DetailedStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await withTimeout(getDetailedStatistics(), 10000, "Kết nối quá hạn. Vui lòng kiểm tra kết nối.");
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tổng hợp số liệu học tập...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md w-full shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Lỗi kết nối</h2>
          <p className="text-red-700 mb-6">{error || "Dữ liệu trống"}</p>
          <button 
            onClick={loadStats}
            className="w-full min-h-[48px] bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { overview, byLevel, mostWrong, mostReviewed } = data;

  const chartData = [
    { name: "Đã thuộc", value: overview.learned, color: "#22c55e" },
    { name: "Cần ôn", value: overview.review, color: "#f59e0b" },
    { name: "Chưa học", value: overview.new, color: "#3b82f6" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Thống kê học tập</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-500">
            Theo dõi chi tiết tiến trình làm chủ từ vựng của bạn.
          </p>
        </div>
        <button 
          onClick={loadStats}
          className="bg-white border border-gray-200 text-gray-700 px-4 min-h-[44px] rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          Cập nhật
        </button>
      </header>

      {/* Main Stats and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Chart Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Trạng thái từ vựng
          </h3>
          
          <div className="flex-1 min-h-[250px] w-full relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${value} từ`, 'Số lượng']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Level Breakdown Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-500" />
            Phân bố theo Level
          </h3>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {byLevel.length > 0 ? byLevel.map(item => {
              const percentage = overview.total > 0 ? Math.round((item.count / overview.total) * 100) : 0;
              return (
                <div key={item.level} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-900">{item.level}</span>
                    <span className="text-sm text-gray-500"><strong className="text-gray-900">{item.count}</strong> từ ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: `${percentage}%`}}></div>
                  </div>
                </div>
              )
            }) : (
              <div className="h-full flex items-center justify-center text-gray-400 pb-10">
                Chưa có từ vựng nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Most Wrong / Most Reviewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Most Wrong */}
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm shadow-red-50">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Từ cần chú ý (Sai nhiều nhất)
          </h3>
          <p className="text-sm text-gray-500 mb-6">Các từ vựng bạn trả lời sai nhiều lần trong Quiz.</p>
          
          {mostWrong.length > 0 ? (
            <div className="space-y-3">
              {mostWrong.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-red-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl font-tc font-bold text-gray-900 shadow-sm">
                      {item.hanzi}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1">{item.meaning_vi}</p>
                      <p className="text-xs text-gray-500">{item.pinyin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-red-500 uppercase">Sai</p>
                      <p className="font-bold text-red-700">{item.progress?.wrong_count} lần</p>
                    </div>
                    <Link 
                      href={`/learn?mode=review`} // Assuming we want them to just go to review. Could also pass specific ID if setup allowed.
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                      title="Ôn tập"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Chưa có dữ liệu. Hãy làm bài kiểm tra!
            </div>
          )}
        </div>

        {/* Most Reviewed */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm shadow-amber-50">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-500" />
            Ôn nhiều nhất
          </h3>
          <p className="text-sm text-gray-500 mb-6">Các từ vựng bạn đã xem nghĩa hoặc gặp khó khăn nhiều nhất.</p>
          
          {mostReviewed.length > 0 ? (
            <div className="space-y-3">
              {mostReviewed.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-amber-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl font-tc font-bold text-gray-900 shadow-sm">
                      {item.hanzi}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1">{item.meaning_vi}</p>
                      <p className="text-xs text-gray-500">{item.pinyin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-amber-600 uppercase">Ôn</p>
                      <p className="font-bold text-amber-800">{item.progress?.review_count} lần</p>
                    </div>
                    <Link 
                      href={`/learn?mode=review`}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Chưa có dữ liệu ôn tập.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
