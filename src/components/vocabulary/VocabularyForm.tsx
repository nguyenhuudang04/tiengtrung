"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { Vocabulary, VocabularyInsert, VocabularyUpdate } from "@/types/vocabulary";
import toast from "react-hot-toast";
import { createVocabulary, updateVocabulary } from "@/lib/vocabulary";

type Props = {
  initialData?: Vocabulary | null;
  onClose: () => void;
  onSuccess: (data: Vocabulary) => void;
};

export default function VocabularyForm({ initialData, onClose, onSuccess }: Props) {
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VocabularyUpdate>({
    hanzi: "",
    pinyin: "",
    meaning_vi: "",
    part_of_speech: "",
    level: "",
    category: "",
    example_cn: "",
    example_pinyin: "",
    example_vi: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        hanzi: initialData.hanzi || "",
        pinyin: initialData.pinyin || "",
        meaning_vi: initialData.meaning_vi || "",
        part_of_speech: initialData.part_of_speech || "",
        level: initialData.level || "",
        category: initialData.category || "",
        example_cn: initialData.example_cn || "",
        example_pinyin: initialData.example_pinyin || "",
        example_vi: initialData.example_vi || "",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.hanzi?.trim()) newErrors.hanzi = "Từ tiếng Trung không được để trống";
    if (!formData.pinyin?.trim()) newErrors.pinyin = "Pinyin không được để trống";
    if (!formData.meaning_vi?.trim()) newErrors.meaning_vi = "Nghĩa tiếng Việt không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const dataToSave = {
        hanzi: formData.hanzi!.trim(),
        pinyin: formData.pinyin!.trim(),
        meaning_vi: formData.meaning_vi!.trim(),
        part_of_speech: formData.part_of_speech || null,
        level: formData.level || null,
        category: formData.category || null,
        example_cn: formData.example_cn || null,
        example_pinyin: formData.example_pinyin || null,
        example_vi: formData.example_vi || null,
        notes: formData.notes || null,
      };

      let result;
      if (isEdit && initialData) {
        result = await updateVocabulary(initialData.id, dataToSave);
        toast.success("Đã cập nhật từ vựng thành công");
      } else {
        result = await createVocabulary(dataToSave as VocabularyInsert);
        toast.success("Đã thêm từ vựng thành công");
      }
      onSuccess(result);
    } catch (error: any) {
      // Check for duplicate constraint error
      if (error.code === '23505') {
        toast.error("Từ vựng này đã tồn tại.");
      } else {
        toast.error(error.message || "Đã có lỗi xảy ra");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[90dvh] md:max-w-2xl md:rounded-2xl flex flex-col animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-bottom-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 mt-safe md:mt-0">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Sửa từ vựng" : "Thêm từ vựng mới"}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full" disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Từ tiếng Trung *</label>
              <input 
                type="text" 
                value={formData.hanzi || ""}
                onChange={(e) => setFormData({...formData, hanzi: e.target.value})}
                className="w-full min-h-[44px] border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-tc" 
                placeholder="Ví dụ: 學習" 
              />
              {errors.hanzi && <p className="text-xs text-red-500">{errors.hanzi}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pinyin *</label>
              <input 
                type="text" 
                value={formData.pinyin || ""}
                onChange={(e) => setFormData({...formData, pinyin: e.target.value})}
                className="w-full min-h-[44px] border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base" 
                placeholder="Ví dụ: xuéxí" 
              />
              {errors.pinyin && <p className="text-xs text-red-500">{errors.pinyin}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Nghĩa tiếng Việt *</label>
              <input 
                type="text" 
                value={formData.meaning_vi || ""}
                onChange={(e) => setFormData({...formData, meaning_vi: e.target.value})}
                className="w-full min-h-[44px] border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base" 
                placeholder="Ví dụ: học tập" 
              />
              {errors.meaning_vi && <p className="text-xs text-red-500">{errors.meaning_vi}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại từ</label>
              <input 
                type="text" 
                value={formData.part_of_speech || ""}
                onChange={(e) => setFormData({...formData, part_of_speech: e.target.value})}
                className="w-full min-h-[44px] border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base" 
                placeholder="Ví dụ: Danh từ, Động từ..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Level</label>
              <input 
                type="text" 
                value={formData.level || ""}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full min-h-[44px] border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base" 
                placeholder="Ví dụ: A1, HSK 1..." 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <input 
                type="text" 
                value={formData.category || ""}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full min-h-[44px] border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base" 
                placeholder="Ví dụ: Gia đình, Công việc..." 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Câu ví dụ tiếng Trung</label>
              <textarea 
                rows={2} 
                value={formData.example_cn || ""}
                onChange={(e) => setFormData({...formData, example_cn: e.target.value})}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base resize-none font-tc" 
                placeholder="Ví dụ..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pinyin câu ví dụ</label>
              <textarea 
                rows={2} 
                value={formData.example_pinyin || ""}
                onChange={(e) => setFormData({...formData, example_pinyin: e.target.value})}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base resize-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dịch câu ví dụ</label>
              <textarea 
                rows={2} 
                value={formData.example_vi || ""}
                onChange={(e) => setFormData({...formData, example_vi: e.target.value})}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base resize-none" 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea 
                rows={2} 
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base resize-none" 
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3 shrink-0 pb-safe md:pb-4">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="w-full md:w-auto min-h-[44px] px-6 border border-gray-200 text-gray-700 rounded-xl font-medium text-base active:bg-gray-50 hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full md:w-auto min-h-[44px] px-6 bg-indigo-600 text-white rounded-xl font-medium text-base active:bg-indigo-700 hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Lưu từ vựng"}
          </button>
        </div>
      </div>
    </div>
  );
}
