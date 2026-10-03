"use client";

import { X } from "lucide-react";
import type { Vocabulary } from "@/types/vocabulary";

type Props = {
  vocabulary: Vocabulary;
  onClose: () => void;
};

export default function DetailsDialog({ vocabulary, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[90dvh] md:max-w-xl md:rounded-2xl flex flex-col animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-bottom-0 shadow-xl">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 mt-safe md:mt-0">
          <h2 className="text-lg font-bold text-gray-900">Chi tiết từ vựng</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto flex-1 pb-safe">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-500 font-medium mb-2">{vocabulary.pinyin}</p>
            <h1 className="text-6xl font-bold font-tc text-gray-900 mb-4">{vocabulary.hanzi}</h1>
            <p className="text-xl font-medium text-indigo-600">{vocabulary.meaning_vi}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {vocabulary.part_of_speech && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  {vocabulary.part_of_speech}
                </span>
              )}
              {vocabulary.level && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium">
                  {vocabulary.level}
                </span>
              )}
              {vocabulary.category && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium">
                  {vocabulary.category}
                </span>
              )}
            </div>

            {(vocabulary.example_cn || vocabulary.example_pinyin || vocabulary.example_vi) && (
              <div className="bg-gray-50 rounded-xl p-4 md:p-5 mt-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Ví dụ</h3>
                {vocabulary.example_cn && (
                  <p className="font-tc text-lg text-gray-900 mb-2">{vocabulary.example_cn}</p>
                )}
                {vocabulary.example_pinyin && (
                  <p className="text-gray-500 text-sm mb-1">{vocabulary.example_pinyin}</p>
                )}
                {vocabulary.example_vi && (
                  <p className="text-gray-700 text-base">{vocabulary.example_vi}</p>
                )}
              </div>
            )}

            {vocabulary.notes && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 mt-4">
                <h3 className="text-sm font-bold text-amber-900 mb-2">Ghi chú</h3>
                <p className="text-amber-800 text-sm whitespace-pre-wrap">{vocabulary.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
