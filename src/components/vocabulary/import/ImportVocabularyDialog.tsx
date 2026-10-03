"use client";

import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { parseVocabularyFile } from "@/utils/parseVocabularyFile";
import type { ImportSummary } from "@/types/import";
import { batchUpsertVocabulary } from "@/lib/vocabulary";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ImportVocabularyDialog({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'update'>('skip');
  
  // Progress state
  const [importProgress, setImportProgress] = useState<{ total: number; current: number } | null>(null);
  
  // Result state
  const [importResult, setImportResult] = useState<{ success: number; error: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const parsedSummary = await parseVocabularyFile(file);
      setSummary(parsedSummary);
      setStep(2); // Move to preview step
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xử lý file");
    } finally {
      setIsProcessing(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Từ vựng,Pinyin,Nghĩa,Loại từ,Ví dụ tiếng Trung,Pinyin ví dụ,Dịch ví dụ,Level,Category,Ghi chú\n吧,ba,\"nhé, nhá\",Trợ từ,吃飯吧。,Chīfàn ba.,Hãy ăn cơm đi.,A1,Giao tiếp,\n爸爸,bàba,bố,Danh từ,我的爸爸很高。,Wǒ de bàba hěn gāo.,Ba của tôi rất cao.,A1,Gia đình,";
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vocabulary_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!summary) return;
    
    // Collect valid items to insert based on duplicateMode
    const itemsToInsert = summary.rows
      .filter(row => row.isValid)
      .filter(row => {
        if (row.isDuplicate && duplicateMode === 'skip') return false;
        return true;
      })
      .map(row => row.data!);

    if (itemsToInsert.length === 0) {
      toast.error("Không có dữ liệu hợp lệ để import.");
      return;
    }

    try {
      setIsProcessing(true);
      setImportProgress({ total: itemsToInsert.length, current: 0 });
      
      // The batch function currently doesn't callback on progress for every chunk,
      // but we can fake progress or modify batchUpsert to accept a callback if needed.
      // For simplicity, we just show "Đang import..." with a spinner.
      
      const result = await batchUpsertVocabulary(itemsToInsert, duplicateMode);
      setImportResult({ success: result.successCount, error: result.errorCount });
      setStep(3); // Result step
    } catch (error: any) {
      toast.error(error.message || "Lỗi import dữ liệu.");
    } finally {
      setIsProcessing(false);
      setImportProgress(null);
    }
  };

  const handleClose = () => {
    if (step === 3) {
      onSuccess();
    } else {
      onClose();
    }
  };

  // Safe wrapper for clicking background overlay
  const handleOverlayClick = () => {
    if (!isProcessing) handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={handleOverlayClick} />
      
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[90dvh] md:max-w-3xl md:rounded-2xl flex flex-col animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-bottom-0 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 mt-safe md:mt-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 1 && "Import từ vựng"}
            {step === 2 && "Xác nhận dữ liệu"}
            {step === 3 && "Hoàn tất Import"}
          </h2>
          <button 
            onClick={handleClose} 
            disabled={isProcessing}
            className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[400px] h-full space-y-6">
              <div className="text-center space-y-2 max-w-sm">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tải lên file dữ liệu</h3>
                <p className="text-gray-500 text-sm">Hỗ trợ file Excel (.xlsx, .xls) hoặc CSV. File cần có các cột: Từ vựng, Pinyin, Nghĩa.</p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full min-h-[56px] bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isProcessing ? "Đang đọc file..." : "Chọn file Upload"}
                </button>
                
                <button 
                  onClick={handleDownloadTemplate}
                  disabled={isProcessing}
                  className="w-full min-h-[44px] bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-base hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Tải file mẫu (CSV)
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION */}
          {step === 2 && summary && (
            <div className="p-4 md:p-6 space-y-6">
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase mt-1">Dòng dữ liệu</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                  <p className="text-2xl font-bold text-green-700">{summary.newValid}</p>
                  <p className="text-xs font-medium text-green-600 uppercase mt-1">Từ mới hợp lệ</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                  <p className="text-2xl font-bold text-amber-700">{summary.duplicates}</p>
                  <p className="text-xs font-medium text-amber-600 uppercase mt-1">Từ đã tồn tại</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  <p className="text-2xl font-bold text-red-700">{summary.invalid}</p>
                  <p className="text-xs font-medium text-red-600 uppercase mt-1">Dòng lỗi</p>
                </div>
              </div>

              {/* Duplicate Handling Option */}
              {summary.duplicates > 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Xử lý từ vựng đã tồn tại ({summary.duplicates} từ)</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input 
                        type="radio" 
                        name="duplicateMode" 
                        value="skip"
                        checked={duplicateMode === 'skip'}
                        onChange={() => setDuplicateMode('skip')}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Bỏ qua từ trùng (Khuyên dùng)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input 
                        type="radio" 
                        name="duplicateMode" 
                        value="update"
                        checked={duplicateMode === 'update'}
                        onChange={() => setDuplicateMode('update')}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Cập nhật bằng dữ liệu mới</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Preview List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Xem trước dữ liệu (hiển thị tối đa 50 dòng)</h3>
                
                {/* Desktop Table Preview */}
                <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500">Từ vựng</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500">Pinyin</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500">Nghĩa</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {summary.rows.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className={row.isValid ? (row.isDuplicate ? "bg-amber-50/30" : "bg-white") : "bg-red-50/50"}>
                            <td className="px-4 py-2 font-tc font-bold">{row.raw.hanzi || "-"}</td>
                            <td className="px-4 py-2 text-sm">{row.raw.pinyin || "-"}</td>
                            <td className="px-4 py-2 text-sm">{row.raw.meaning_vi || "-"}</td>
                            <td className="px-4 py-2 text-sm">
                              {!row.isValid ? (
                                <span className="text-red-600 font-medium text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {row.errors[0]}</span>
                              ) : row.isDuplicate ? (
                                <span className="text-amber-600 font-medium text-xs flex items-center gap-1">Đã tồn tại</span>
                              ) : (
                                <span className="text-green-600 font-medium text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Hợp lệ</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards Preview */}
                <div className="md:hidden space-y-3">
                  {summary.rows.slice(0, 50).map((row, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${!row.isValid ? 'bg-red-50 border-red-100' : row.isDuplicate ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-tc font-bold text-xl">{row.raw.hanzi || "-"}</div>
                        <div className="text-xs font-medium px-2 py-1 rounded-md bg-white/50 border border-black/5">
                          {!row.isValid ? (
                            <span className="text-red-600 flex items-center gap-1">Lỗi</span>
                          ) : row.isDuplicate ? (
                            <span className="text-amber-600 flex items-center gap-1">Đã tồn tại</span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1">Hợp lệ</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{row.raw.pinyin || "-"}</div>
                      <div className="text-sm font-medium text-gray-900">{row.raw.meaning_vi || "-"}</div>
                      {!row.isValid && <div className="text-xs text-red-600 mt-2 bg-red-100/50 p-2 rounded-lg">{row.errors.join(", ")}</div>}
                    </div>
                  ))}
                  {summary.rows.length > 50 && (
                    <p className="text-center text-sm text-gray-500 pt-2">... và {summary.rows.length - 50} dòng khác</p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: RESULT */}
          {step === 3 && importResult && (
            <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[400px] h-full space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Import hoàn tất</h3>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm inline-block min-w-[250px] text-left space-y-3 mt-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium">Thành công</span>
                    <span className="text-xl font-bold text-green-600">{importResult.success}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium">Lỗi chèn DB</span>
                    <span className="text-xl font-bold text-red-600">{importResult.error}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-600 font-medium">Từ lỗi/bị bỏ qua</span>
                    <span className="text-xl font-bold text-gray-500">
                      {summary!.total - importResult.success - importResult.error}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 2 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 shrink-0 pb-safe md:pb-4 bg-white z-10">
            <button 
              onClick={() => setStep(1)}
              disabled={isProcessing}
              className="flex-1 min-h-[44px] bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
            >
              Chọn file khác
            </button>
            <button 
              onClick={handleImport}
              disabled={isProcessing}
              className="flex-[2] min-h-[44px] bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang import...
                </>
              ) : (
                `Import ${summary?.newValid! + (duplicateMode === 'update' ? summary?.duplicates! : 0)} từ vựng`
              )}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 border-t border-gray-100 flex pb-safe md:pb-4 bg-white z-10">
            <button 
              onClick={handleClose}
              className="w-full min-h-[56px] bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 active:bg-indigo-800 flex items-center justify-center shadow-sm"
            >
              Đóng và cập nhật danh sách
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
