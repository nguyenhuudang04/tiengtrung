"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Vocabulary } from "@/types/vocabulary";
import toast from "react-hot-toast";
import { deleteVocabulary } from "@/lib/vocabulary";

type Props = {
  vocabulary: Vocabulary;
  onClose: () => void;
  onSuccess: (id: string) => void;
};

export default function DeleteDialog({ vocabulary, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteVocabulary(vocabulary.id);
      toast.success("Đã xóa từ vựng");
      onSuccess(vocabulary.id);
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa từ vựng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={!isLoading ? onClose : undefined} />
      <div className="relative bg-white w-full max-w-sm rounded-2xl flex flex-col animate-in zoom-in-95 p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Xóa từ vựng?</h2>
          <p className="text-gray-500 mb-6">
            Bạn có chắc muốn xóa từ <span className="font-bold text-gray-900 font-tc">{vocabulary.hanzi}</span> không? Hành động này không thể hoàn tác.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 min-h-[44px] border border-gray-200 text-gray-700 rounded-xl font-medium text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 min-h-[44px] bg-red-600 text-white rounded-xl font-medium text-base hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
