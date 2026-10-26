"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { 
  Newspaper, 
  Flame, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle, 
  Image as ImageIcon, 
  PlusCircle, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight 
} from 'lucide-react';

function AdminNewsContent() {
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchNews = () => {
    setIsLoading(true);
    const params = {
      page,
      limit,
      search: searchTerm.trim() || undefined,
      category: categoryFilter || undefined,
    };
    if (statusFilter && statusFilter !== 'all') {
      params.status = statusFilter;
    } else if (statusFilter === 'all') {
      params.status = 'all';
    }

    api.get('/news', { params })
      .then(({ data }) => { 
        setNews(data.data || []); 
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      })
      .catch(() => toast.error('समाचार लोड नहीं हो सका'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, [page, limit, statusFilter, searchTerm, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप इस समाचार को हटाना चाहते हैं?')) return;
    try {
      await api.delete(`/news/${id}`);
      toast.success('समाचार हटाया गया');
      fetchNews();
    } catch { toast.error('हटाने में समस्या हुई'); }
  };

  const toggleTrending = async (id) => {
    try {
      await api.patch(`/news/${id}/trending`);
      fetchNews();
    } catch { toast.error('अपडेट विफल'); }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Newspaper className="text-red-600" size={28} /> सभी समाचार <span className="text-sm font-medium text-slate-500">({total})</span>
        </h1>
        <Link href="/admin/news/create" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
          <PlusCircle size={18} /> नई खबर
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/news?status=all" className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${(!statusFilter || statusFilter === 'all') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            सभी (All)
          </Link>
          <Link href="/admin/news?status=published" className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${statusFilter === 'published' ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            प्रकाशित (Published)
          </Link>
          <Link href="/admin/news?status=draft" className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            ड्राफ्ट (Drafts)
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="शीर्षक खोजें..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500 w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </form>

          <select 
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500 bg-white text-slate-700 w-full sm:w-auto"
          >
            <option value="">सभी वर्ग (All Categories)</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug || cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/90 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-4">शीर्षक</th>
                  <th className="text-left px-5 py-4 hidden md:table-cell">वर्ग</th>
                  <th className="text-center px-5 py-4 hidden md:table-cell">स्थिति</th>
                  <th className="text-right px-5 py-4 hidden lg:table-cell">दृश्य</th>
                  <th className="text-right px-5 py-4 hidden lg:table-cell">तारीख</th>
                  <th className="text-right px-5 py-4">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {news.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          {item.images?.[0]?.url ? (
                            <img 
                              src={item.images[0].url} 
                              alt="Thumbnail" 
                              className="w-16 h-11 object-cover rounded-md border border-slate-200" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-16 h-11 bg-slate-100 rounded-md border border-slate-200 shrink-0 flex items-center justify-center text-slate-400" 
                            style={{ display: item.images?.[0]?.url ? 'none' : 'flex' }}
                          >
                            <ImageIcon size={18} />
                          </div>
                        </div>
                        
                        <div className="flex flex-col">
                          <p className="font-semibold text-slate-800 line-clamp-1 group-hover:text-red-600 transition-colors max-w-sm">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {item.isTrending && (
                              <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 flex items-center gap-1">
                                <Flame size={10} /> ट्रेंडिंग
                              </span>
                            )}
                            {item.isBreaking && (
                              <span className="text-[10px] uppercase tracking-wider font-bold text-red-600 flex items-center gap-1">
                                <AlertCircle size={10} /> ब्रेकिंग
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="bg-slate-100 text-slate-600 text-[11px] px-2 py-1 rounded-md font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-right text-slate-500 font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <Eye size={14} className="text-slate-400" /> {item.views || 0}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-right text-slate-400 text-xs whitespace-nowrap">
                      {dayjs(item.createdAt).format('DD/MM/YY')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/news/${item.slug || item._id}`} 
                          target="_blank" 
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" 
                          title="देखें (View Live)"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link href={`/admin/news/edit/${item._id}`} 
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors" 
                          title="संपादित करें (Edit)"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => toggleTrending(item._id)} 
                          className={`p-1.5 rounded-md transition-colors ${item.isTrending ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`} 
                          title="ट्रेंडिंग टॉगल (Toggle Trending)"
                        >
                          <Flame size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                          title="हटाएं (Delete)"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {news.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                <Newspaper size={48} className="opacity-20" />
                <p>कोई समाचार नहीं मिला</p>
              </div>
            )}

            {/* ── Pagination Footer ── */}
            {!isLoading && total > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: Summary and Per Page Selector */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div>
                    दिखाए जा रहे हैं{' '}
                    <span className="font-bold text-slate-900">
                      {Math.min((page - 1) * limit + 1, total)}
                    </span>{' '}
                    से{' '}
                    <span className="font-bold text-slate-900">
                      {Math.min(page * limit, total)}
                    </span>{' '}
                    (कुल <span className="font-bold text-slate-900">{total}</span> समाचार)
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="limit-select" className="text-slate-500 font-medium">
                      प्रति पेज:
                    </label>
                    <select
                      id="limit-select"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 outline-none focus:border-red-500 shadow-xs cursor-pointer font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={total > 100 ? total : 500}>सभी देखें ({total})</option>
                    </select>
                  </div>
                </div>

                {/* Right: Page navigation */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="पहला पेज (First)"
                    >
                      <ChevronsLeft size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                      title="पिछला पेज (Previous)"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">पिछला</span>
                    </button>

                    <div className="flex items-center gap-1 mx-1">
                      {getPageNumbers().map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-bold">
                              ...
                            </span>
                          );
                        }
                        const isActive = page === p;
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              setPage(p);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`min-w-8 h-8 px-2.5 rounded-lg text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/20'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setPage((prev) => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                      title="अगला पेज (Next)"
                    >
                      <span className="hidden sm:inline">अगला</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => {
                        setPage(totalPages);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="अंतिम पेज (Last)"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminNewsList() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
      </div>
    }>
      <AdminNewsContent />
    </React.Suspense>
  );
}
