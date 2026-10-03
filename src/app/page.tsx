import Link from "next/link";
import { BookOpen, RefreshCw, BarChart2, Library, Plus, Target, CheckCircle2, XCircle } from "lucide-react";
import { getExtendedDashboardStats } from "@/lib/statistics";

export default async function DashboardPage() {
  const stats = await getExtendedDashboardStats().catch(() => ({
    total: 0,
    learned: 0,
    review: 0,
    new: 0,
    totalCorrect: 0,
    totalWrong: 0,
    accuracy: 0
  }));

  const progressPercent = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Chào mừng quay lại!</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-500">Hôm nay bạn muốn học gì?</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link 
            href="/vocabulary"
            className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-4 min-h-[44px] rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Thêm từ</span>
          </Link>
          <Link 
            href="/learn"
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 min-h-[44px] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
          >
            <BookOpen className="w-5 h-5" />
            Học ngay
          </Link>
        </div>
      </header>

      {stats.total === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center w-full">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Library className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Bạn chưa có từ vựng nào.</h2>
          <p className="text-gray-500 mb-8 max-w-md">Hãy bắt đầu hành trình học tập của bạn bằng cách thêm từ vựng mới hoặc import từ file Excel/CSV.</p>
          <Link 
            href="/vocabulary"
            className="min-h-[56px] px-8 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Thêm từ vựng ngay
          </Link>
        </div>
      ) : (
        <>
          {/* Progress Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Tiến độ học từ vựng
                </h3>
                <p className="text-gray-500 text-sm mt-1">Đã thuộc <strong className="text-gray-900">{stats.learned} / {stats.total}</strong> từ</p>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {progressPercent}%
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 md:h-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors">
              <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center mb-3">
                <Library className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Tổng từ vựng</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</h3>
            </div>

            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-green-100 transition-colors">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Đã thuộc</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.learned}</h3>
            </div>

            <Link href="/review" className={`bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group transition-colors block ${stats.review > 0 ? 'hover:border-amber-200 cursor-pointer' : 'opacity-75 cursor-default'}`}>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Từ cần ôn</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.review}</h3>
                {stats.review > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>}
              </div>
            </Link>

            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-100 transition-colors">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Chưa học</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.new}</h3>
            </div>
          </div>

          {/* Quick Actions & Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-2">Sẵn sàng kiểm tra?</h3>
                <p className="text-indigo-100 text-sm md:text-base mb-6 max-w-sm">
                  Làm bài kiểm tra trắc nghiệm giúp bạn ghi nhớ từ vựng lâu hơn và đánh giá chính xác năng lực.
                </p>
              </div>
              <Link 
                href="/quiz"
                className="w-full bg-white text-indigo-700 font-bold px-6 min-h-[56px] rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all shadow-sm"
              >
                <Target className="w-5 h-5" />
                Làm bài kiểm tra
              </Link>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BrainCircuitIcon className="w-5 h-5 text-gray-500" />
                Hiệu suất làm bài (Quiz)
              </h3>
              
              <div className="flex items-center gap-6 md:gap-8">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full border-8 border-gray-100">
                  <div className="absolute inset-0 rounded-full border-8 border-indigo-500 border-l-transparent border-b-transparent transform rotate-45 opacity-20"></div>
                  <span className="text-2xl font-bold text-indigo-700">{stats.accuracy}%</span>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Trả lời đúng</span>
                      <span className="font-bold text-gray-900">{stats.totalCorrect}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width: `${stats.accuracy}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" /> Trả lời sai</span>
                      <span className="font-bold text-gray-900">{stats.totalWrong}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{width: `${stats.totalWrong > 0 ? 100 - stats.accuracy : 0}%`}}></div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

function BrainCircuitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/><path d="M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/><circle cx="20" cy="8" r=".5"/></svg>
  )
}
