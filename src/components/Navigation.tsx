"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  RotateCcw, 
  Library, 
  BarChart2,
  Menu,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const desktopNavItems = [
  { name: "Trang chủ", href: "/", icon: Home },
  { name: "Học từ vựng", href: "/learn", icon: BookOpen },
  { name: "Kiểm tra", href: "/quiz", icon: CheckSquare },
  { name: "Từ cần ôn", href: "/review", icon: RotateCcw },
  { name: "Quản lý từ vựng", href: "/vocabulary", icon: Library },
  { name: "Thống kê", href: "/statistics", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm z-40 shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">中文詞彙</h1>
        <p className="text-sm text-gray-500 mt-1">Học tiếng Trung Phồn Thể</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {desktopNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 min-h-[44px] rounded-xl transition-all duration-200 text-sm md:text-base",
                isActive 
                  ? "bg-indigo-50 text-indigo-600 font-medium" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-center p-3 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm min-h-[56px]">
      <div className="text-center flex flex-col items-center">
        <h1 className="text-lg font-bold text-indigo-600 leading-tight">中文詞彙</h1>
        <p className="text-[10px] text-gray-500 font-medium">Học tiếng Trung</p>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  const mobileNavItems = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Học", href: "/learn", icon: BookOpen },
    { name: "Kiểm tra", href: "/quiz", icon: CheckSquare },
    { name: "Từ vựng", href: "/vocabulary", icon: Library },
  ];

  const moreItems = [
    { name: "Từ cần ôn", href: "/review", icon: RotateCcw },
    { name: "Thống kê", href: "/statistics", icon: BarChart2 },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex items-center justify-around p-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] p-1 rounded-xl flex-1",
                  isActive ? "text-indigo-600" : "text-gray-500"
                )}
              >
                <div className={cn(
                  "p-1 rounded-full mb-0.5 transition-colors", 
                  isActive ? "bg-indigo-50" : "bg-transparent"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight text-center">
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] p-1 rounded-xl flex-1",
              isMoreOpen ? "text-indigo-600" : "text-gray-500"
            )}
          >
            <div className={cn(
              "p-1 rounded-full mb-0.5 transition-colors", 
              isMoreOpen ? "bg-indigo-50" : "bg-transparent"
            )}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight text-center">
              Thêm
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile More Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 animate-in fade-in" 
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl pb-safe animate-in slide-in-from-bottom max-h-[80dvh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Menu thêm</h2>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 min-h-[56px] rounded-xl transition-colors",
                    pathname === item.href 
                      ? "bg-indigo-50 text-indigo-600 font-medium" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-indigo-600" : "text-gray-500")} />
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
