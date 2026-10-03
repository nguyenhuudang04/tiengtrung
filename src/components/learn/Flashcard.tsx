"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Eye, X, HelpCircle, Check } from "lucide-react";
import type { Vocabulary } from "@/types/vocabulary";
import SpeechButton from "./SpeechButton";

type Props = {
  vocabulary: Vocabulary;
  currentIndex: number;
  total: number;
  onNext: (action?: 'wrong' | 'review' | 'correct') => void;
  onPrev: () => void;
};

export default function Flashcard({ vocabulary, currentIndex, total, onNext, onPrev }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);

  // Reset reveal state when vocabulary changes
  useEffect(() => {
    setIsRevealed(false);
  }, [vocabulary.id]);

  // Keyboard shortcuts (Desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (just in case)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (!isRevealed) {
            setIsRevealed(true);
          }
          break;
        case "ArrowLeft":
          if (currentIndex > 0) onPrev();
          break;
        case "ArrowRight":
          if (isRevealed) onNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRevealed, currentIndex, onPrev, onNext]);

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in duration-300">
      <header className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="p-2 -ml-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full shadow-sm">
            {currentIndex + 1} / {total}
          </span>
          {/* Placeholder for symmetry */}
          <div className="w-10" />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </header>
      
      {/* Card Area */}
      <div 
        className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden flex flex-col min-h-[400px] md:min-h-[500px] w-full relative"
        onClick={() => !isRevealed && setIsRevealed(true)}
      >
        {/* Front (Always visible) */}
        <div className={`flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center relative transition-all duration-500 ${isRevealed ? "pb-4 md:pb-6" : ""}`}>
          <div className="absolute top-4 right-4 z-10">
            <SpeechButton text={vocabulary.hanzi} />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-[56px] md:text-[80px] font-tc font-bold text-gray-900 leading-none tracking-tight">
              {vocabulary.hanzi}
            </h2>
          </div>
        </div>
        
        {/* Back (Revealed) */}
        {!isRevealed ? (
          <div className="p-6 flex justify-center pb-safe md:pb-8">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
              className="px-6 min-h-[48px] bg-indigo-50 text-indigo-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-100 active:scale-95 transition-all"
            >
              <Eye className="w-5 h-5" />
              Xem nghĩa
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 p-5 md:p-8 border-t border-gray-100 flex flex-col animate-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{vocabulary.meaning_vi}</h3>
              <p className="text-lg md:text-xl text-gray-600 font-medium tracking-wide mt-2">
                {vocabulary.pinyin}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {vocabulary.part_of_speech && (
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                    {vocabulary.part_of_speech}
                  </span>
                )}
                {vocabulary.level && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium">
                    {vocabulary.level}
                  </span>
                )}
                {vocabulary.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    {vocabulary.category}
                  </span>
                )}
              </div>
            </div>

            {(vocabulary.example_cn || vocabulary.example_vi) && (
              <div className="mt-2 mb-6 max-w-lg mx-auto w-full p-4 md:p-5 bg-white rounded-2xl border border-gray-200 shadow-sm text-left">
                {vocabulary.example_cn && (
                  <p className="font-tc text-gray-900 text-lg md:text-xl mb-1 leading-relaxed">
                    {vocabulary.example_cn}
                  </p>
                )}
                {vocabulary.example_pinyin && (
                  <p className="text-sm text-gray-500 mb-2">
                    {vocabulary.example_pinyin}
                  </p>
                )}
                {vocabulary.example_vi && (
                  <p className="text-base text-gray-700 mt-2 pt-2 border-t border-gray-50">
                    <span className="text-gray-400 mr-2">→</span>
                    {vocabulary.example_vi}
                  </p>
                )}
              </div>
            )}

            {/* Assessment Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-auto pt-6 pb-safe md:pb-0">
              <button 
                onClick={() => onNext('wrong')}
                className="flex items-center justify-center gap-2 min-h-[56px] bg-white border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 active:bg-red-100 active:scale-95 transition-all p-3 shadow-sm"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                <span className="text-sm md:text-base">Chưa nhớ</span>
              </button>
              <button 
                onClick={() => onNext('review')}
                className="flex items-center justify-center gap-2 min-h-[56px] bg-white border-2 border-amber-100 text-amber-600 rounded-2xl font-bold hover:bg-amber-50 active:bg-amber-100 active:scale-95 transition-all p-3 shadow-sm"
              >
                <HelpCircle className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                <span className="text-sm md:text-base">Khó nhớ</span>
              </button>
              <button 
                onClick={() => onNext('correct')}
                className="flex items-center justify-center gap-2 min-h-[56px] bg-white border-2 border-green-100 text-green-600 rounded-2xl font-bold hover:bg-green-50 active:bg-green-100 active:scale-95 transition-all p-3 shadow-sm"
              >
                <Check className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                <span className="text-sm md:text-base">Đã nhớ</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Helper Text */}
      <div className="hidden md:flex justify-center mt-6 gap-6 text-sm font-medium text-gray-400">
        <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded-md">Space</kbd> Xem nghĩa</span>
        <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded-md">←</kbd> <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded-md">→</kbd> Điều hướng</span>
      </div>
    </div>
  );
}
