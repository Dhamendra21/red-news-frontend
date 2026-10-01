"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Image as ImageIcon, Copy, Trash2, Folder, ExternalLink, Calendar, X, ZoomIn, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewImg, setPreviewImg] = useState(null);   // { url, name, folder, size, createdAt }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // image object to confirm delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/media');
      setImages(res.data.data);
    } catch (err) {
      toast.error('इमेजेज लोड करने में समस्या');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL कॉपी किया गया!');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete('/media', {
        data: { filename: deleteConfirm.name, folder: deleteConfirm.folder }
      });
      toast.success('Image deleted!');
      setImages(prev => prev.filter(img => img.url !== deleteConfirm.url));
      setDeleteConfirm(null);
      if (previewImg?.url === deleteConfirm.url) setPreviewImg(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredImages = filter === 'all' ? images : images.filter(img => img.folder === filter);
  const folders = [...new Set(images.map(img => img.folder))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon size={28} /> मीडिया गैलरी
        </h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredImages.length} files</span>
      </div>

      {/* Folder Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="flex p-2 gap-2 overflow-x-auto bg-gray-50 border-b">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            सभी ({images.length})
          </button>
          {folders.map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize ${filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <span className="flex items-center gap-1"><Folder size={14}/> {f}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">कोई इमेज नहीं मिली</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((img, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm border group relative">
              {/* Image thumbnail */}
              <div className="aspect-square relative overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setPreviewImg(img)}>
                <img 
                  src={img.url} 
                  alt={img.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewImg(img); }}
                    className="p-2 bg-white text-gray-900 rounded-full hover:bg-blue-50 transition-colors"
                    title="Preview"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(img.url); }}
                    className="p-2 bg-white text-gray-900 rounded-full hover:bg-green-50 transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(img); }}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card info */}
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 truncate" title={img.name}>{img.name}</p>
                <div className="flex justify-between items-center mt-1 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1 capitalize"><Folder size={10} /> {img.folder}</span>
                  <span>{formatSize(img.size)}</span>
                </div>
                <div className="mt-1 text-[10px] text-gray-400 flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(img.createdAt).toLocaleDateString('hi-IN')}</span>
                  <button 
                    onClick={() => setDeleteConfirm(img)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PREVIEW MODAL ─────────────────────────────────── */}
      {previewImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImg(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800 text-sm truncate max-w-xs">{previewImg.name}</p>
                <p className="text-xs text-gray-500 capitalize">{previewImg.folder} · {formatSize(previewImg.size)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(previewImg.url)}
                  className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-1 font-medium"
                >
                  <Copy size={13} /> Copy URL
                </button>
                <a
                  href={previewImg.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1 font-medium"
                >
                  <ExternalLink size={13} /> Open
                </a>
                <button
                  onClick={() => { setDeleteConfirm(previewImg); setPreviewImg(null); }}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center gap-1 font-medium"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <button
                  onClick={() => setPreviewImg(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center bg-gray-100 min-h-[300px] max-h-[70vh] overflow-hidden">
              <img
                src={previewImg.url}
                alt={previewImg.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* URL bar */}
            <div className="px-5 py-3 border-t bg-gray-50 flex gap-2 items-center">
              <input
                type="text"
                value={previewImg.url}
                readOnly
                className="flex-1 text-xs bg-white border rounded px-3 py-2 text-gray-600 font-mono outline-none"
              />
              <button
                onClick={() => copyToClipboard(previewImg.url)}
                className="px-3 py-2 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 flex items-center gap-1"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ──────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Image?</h3>
            <p className="text-sm text-gray-500 mb-2">यह action permanent है और undo नहीं हो सकती।</p>
            <div className="bg-gray-100 rounded-lg p-3 mb-5">
              <img src={deleteConfirm.url} alt={deleteConfirm.name} className="w-full h-32 object-contain rounded mb-2" />
              <p className="text-xs text-gray-600 font-mono truncate">{deleteConfirm.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Trash2 size={15} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
