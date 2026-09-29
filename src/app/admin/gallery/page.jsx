"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Image as ImageIcon, Copy, Trash2, Folder, ExternalLink, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredImages = filter === 'all' ? images : images.filter(img => img.folder === filter);
  
  // Get unique folders
  const folders = [...new Set(images.map(img => img.folder))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon size={28} /> मीडिया गैलरी
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="flex p-2 gap-2 overflow-x-auto bg-gray-50 border-b">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            सभी इमेजेज ({images.length})
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
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img 
                  src={img.url} 
                  alt={img.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => copyToClipboard(img.url)}
                    className="p-2 bg-white text-gray-900 rounded-full hover:bg-red-50 transition-colors tooltip"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                  <a 
                    href={img.url} target="_blank" rel="noreferrer"
                    className="p-2 bg-white text-gray-900 rounded-full hover:bg-red-50 transition-colors tooltip"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 truncate" title={img.name}>{img.name}</p>
                <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1 capitalize"><Folder size={10} /> {img.folder}</span>
                  <span>{formatSize(img.size)}</span>
                </div>
                <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
                   <Calendar size={10} /> {new Date(img.createdAt).toLocaleDateString('hi-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
