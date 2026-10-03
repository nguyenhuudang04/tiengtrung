"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, Edit2, Trash2, X, AlertCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getVocabulary } from "@/lib/vocabulary";
import type { Vocabulary } from "@/types/vocabulary";
import VocabularyForm from "./VocabularyForm";
import DeleteDialog from "./DeleteDialog";
import DetailsDialog from "./DetailsDialog";
import ImportVocabularyDialog from "./import/ImportVocabularyDialog";
import { cn } from "@/components/Navigation";
import { withTimeout } from "@/utils/withTimeout";

export default function VocabularyList() {
  const [data, setData] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vocabulary | null>(null);
  const [deletingItem, setDeletingItem] = useState<Vocabulary | null>(null);
  const [detailsItem, setDetailsItem] = useState<Vocabulary | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search & Filter & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await withTimeout(getVocabulary(), 10000, "Kết nối quá hạn. Vui lòng kiểm tra kết nối mạng.");
      setData(fetched);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtering and Sorting logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.hanzi.toLowerCase().includes(q) || 
          item.pinyin.toLowerCase().includes(q) || 
          item.meaning_vi.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filterLevel) {
      result = result.filter(item => item.level === filterLevel);
    }
    if (filterType) {
      result = result.filter(item => item.part_of_speech === filterType);
    }
    if (filterCategory) {
      result = result.filter(item => item.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "pinyin") {
        return a.pinyin.localeCompare(b.pinyin);
      }
      return 0;
    });

    return result;
  }, [data, searchQuery, filterLevel, filterType, filterCategory, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLevel, filterType, filterCategory, sortBy]);

  // Get unique levels and types for filter dropdowns
  const uniqueLevels = useMemo(() => Array.from(new Set(data.map(d => d.level).filter(Boolean))), [data]);
  const uniqueTypes = useMemo(() => Array.from(new Set(data.map(d => d.part_of_speech).filter(Boolean))), [data]);
  const uniqueCategories = useMemo(() => Array.from(new Set(data.map(d => d.category).filter(Boolean))), [data]);

  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleAddClick = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleImportClick = () => {
    setIsImportOpen(true);
  };

  const handleEditClick = (item: Vocabulary) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: Vocabulary) => {
    setDeletingItem(item);
  };

  const handleDetailsClick = (item: Vocabulary) => {
    setDetailsItem(item);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadData(); // Reload to get fresh data, or manually update state
  };

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    loadData();
  };

  const handleDeleteSuccess = (id: string) => {
    setDeletingItem(null);
    setData(prev => prev.filter(item => item.id !== id));
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Quản lý từ vựng</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-500">
            {data.length > 0 ? `Bạn đang có ${data.length} từ vựng.` : "Danh sách toàn bộ từ vựng của bạn."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={handleImportClick}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 min-h-[44px] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-base shadow-sm"
          >
            Import từ vựng
          </button>
          <button 
            onClick={handleAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 min-h-[44px] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-base shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Thêm từ mới
          </button>
        </div>
      </header>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Lỗi kết nối</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200">
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 min-h-[44px] border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder="Tìm kiếm từ vựng..."
              />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex gap-3">
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="min-h-[44px] border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base min-w-[120px]"
              >
                <option value="">Tất cả Level</option>
                {uniqueLevels.map(level => <option key={level as string} value={level as string}>{level}</option>)}
              </select>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="min-h-[44px] border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base min-w-[120px]"
              >
                <option value="">Loại từ</option>
                {uniqueTypes.map(type => <option key={type as string} value={type as string}>{type}</option>)}
              </select>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="min-h-[44px] border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base min-w-[120px]"
              >
                <option value="">Chủ đề</option>
                {uniqueCategories.map(cat => <option key={cat as string} value={cat as string}>{cat}</option>)}
              </select>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-h-[44px] border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base min-w-[130px]"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="pinyin">Pinyin A-Z</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 font-medium text-gray-700 active:bg-gray-100"
            >
              <Filter className="w-5 h-5" />
              Bộ lọc
            </button>
          </div>

          {filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500 max-w-sm">Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Từ vựng</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pinyin</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nghĩa</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại từ</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleDetailsClick(item)}>
                        <td className="px-6 py-4 whitespace-nowrap text-xl font-tc font-bold text-gray-900">{item.hanzi}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.pinyin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.meaning_vi}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.part_of_speech || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.level ? (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {item.level}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleEditClick(item)} className="text-indigo-600 hover:text-indigo-900 mr-2 p-2 inline-flex items-center justify-center rounded-lg hover:bg-indigo-50" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900 p-2 inline-flex items-center justify-center rounded-lg hover:bg-red-50" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {paginatedData.map((item) => (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl font-tc font-bold text-gray-900 leading-none mb-1">{item.hanzi}</h3>
                        <p className="text-base text-gray-500">{item.pinyin}</p>
                      </div>
                      {item.level && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.level}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-lg text-gray-900 font-medium">{item.meaning_vi}</p>
                      {item.part_of_speech && <p className="text-sm text-gray-500 mt-1">{item.part_of_speech}</p>}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button onClick={() => handleDetailsClick(item)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl active:bg-indigo-100">
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>
                      <button onClick={() => handleEditClick(item)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl border border-gray-200 active:bg-gray-100">
                        <Edit2 className="w-4 h-4" /> Sửa
                      </button>
                      <button onClick={() => handleDeleteClick(item)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100 active:bg-red-100">
                        <Trash2 className="w-4 h-4" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-2xl shadow-sm sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> trong <span className="font-medium">{filteredData.length}</span> kết quả
                  </p>
                </div>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end gap-2 w-full">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-xl bg-white px-4 min-h-[44px] text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Trang trước
                </button>
                <div className="flex items-center justify-center px-4 sm:hidden text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-xl bg-white px-4 min-h-[44px] text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center"
                >
                  Trang sau <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Filter Sheet */}
      {isFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={() => setIsFilterOpen(false)} />
          <div className="relative bg-white rounded-t-2xl pb-safe animate-in slide-in-from-bottom max-h-[90dvh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Bộ lọc & Sắp xếp</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Level</label>
                <select 
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full min-h-[44px] border border-gray-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-indigo-500 text-base"
                >
                  <option value="">Tất cả Level</option>
                  {uniqueLevels.map(level => <option key={level as string} value={level as string}>{level}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Loại từ</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full min-h-[44px] border border-gray-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-indigo-500 text-base"
                >
                  <option value="">Tất cả loại từ</option>
                  {uniqueTypes.map(type => <option key={type as string} value={type as string}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Chủ đề</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full min-h-[44px] border border-gray-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-indigo-500 text-base"
                >
                  <option value="">Tất cả chủ đề</option>
                  {uniqueCategories.map(cat => <option key={cat as string} value={cat as string}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sắp xếp</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full min-h-[44px] border border-gray-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-indigo-500 text-base"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="pinyin">Pinyin A-Z</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3 shrink-0 pb-safe">
              <button 
                onClick={() => {
                  setFilterLevel("");
                  setFilterType("");
                  setFilterCategory("");
                  setSortBy("newest");
                }}
                className="flex-1 min-h-[44px] border border-gray-200 text-gray-700 rounded-xl font-medium text-base active:bg-gray-50"
              >
                Xóa lọc
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 min-h-[44px] bg-indigo-600 text-white rounded-xl font-medium text-base active:bg-indigo-700"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forms and Dialogs */}
      {isFormOpen && (
        <VocabularyForm 
          initialData={editingItem} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingItem && (
        <DeleteDialog 
          vocabulary={deletingItem}
          onClose={() => setDeletingItem(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {detailsItem && (
        <DetailsDialog 
          vocabulary={detailsItem}
          onClose={() => setDetailsItem(null)}
        />
      )}

      {isImportOpen && (
        <ImportVocabularyDialog 
          onClose={() => setIsImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
