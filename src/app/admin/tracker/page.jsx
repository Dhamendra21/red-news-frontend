"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { PlaySquare, FileText, CheckCircle2, Clock, Trash2, RefreshCw, Plus, Calendar as CalendarIcon, ExternalLink, Image as ImageIcon, MessageSquare, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkTrackerPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: '',
    category: 'youtube_long',
    status: 'completed',
    platformUrl: '',
    durationMinutes: '',
    notes: ''
  });

  const categories = [
    { id: 'youtube_long', label: 'YouTube Long', icon: <PlaySquare size={16} /> },
    { id: 'youtube_short', label: 'YouTube Short', icon: <PlaySquare size={16} /> },
    { id: 'news_article', label: 'News Article', icon: <FileText size={16} /> },
    { id: 'thumbnail_design', label: 'Thumbnail', icon: <ImageIcon size={16} /> },
    { id: 'social_post', label: 'Social Media', icon: <MessageSquare size={16} /> },
    { id: 'other', label: 'Other', icon: <Briefcase size={16} /> }
  ];

  useEffect(() => {
    fetchLogs();
  }, [date]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/work-logs?date=${date}`);
      setLogs(res.data.data);
      setMetrics(res.data.metrics);
    } catch (err) {
      toast.error('डेटा लोड करने में समस्या');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    
    try {
      const payload = { ...form, date, durationMinutes: Number(form.durationMinutes) || 0 };
      await api.post('/work-logs', payload);
      toast.success('Work log added!');
      setForm({ ...form, title: '', platformUrl: '', durationMinutes: '', notes: '' });
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add log');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/work-logs/${id}`);
      toast.success('Deleted');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSync = async (id) => {
    try {
      toast.loading('Syncing YouTube stats...', { id: 'sync' });
      await api.post(`/work-logs/${id}/sync-youtube`);
      toast.success('Synced successfully!', { id: 'sync' });
      fetchLogs();
    } catch (err) {
      toast.error('Failed to sync. Check URL or API quota.', { id: 'sync' });
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.patch(`/work-logs/${id}`, { status: newStatus });
      fetchLogs();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const changeDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon size={28} /> Daily Work Tracker
        </h1>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <button onClick={() => changeDate(-1)} className="px-3 py-1 hover:bg-gray-100 rounded">&larr;</button>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="outline-none font-medium text-gray-700 bg-transparent"
          />
          <button onClick={() => changeDate(1)} className="px-3 py-1 hover:bg-gray-100 rounded">&rarr;</button>
          <button onClick={() => setDate(new Date().toISOString().split('T')[0])} className="ml-2 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium">Today</button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
            <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-red-600">{metrics.completedTasks} <span className="text-sm font-normal text-gray-400">/ {metrics.totalTasks}</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
            <p className="text-sm text-gray-500 mb-1">Time Logged</p>
            <p className="text-2xl font-bold text-gray-800">{Math.floor(metrics.totalMinutes / 60)}h {metrics.totalMinutes % 60}m</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
            <p className="text-sm text-gray-500 mb-1">YT Long</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.youtubeLongCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
            <p className="text-sm text-gray-500 mb-1">YT Shorts</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.youtubeShortsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
            <p className="text-sm text-gray-500 mb-1">Articles</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.articlesWritten}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-5 sticky top-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18} /> Quick Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => (
                    <button
                      key={c.id} type="button"
                      onClick={() => setForm({...form, category: c.id})}
                      className={`flex items-center gap-1.5 p-2 rounded-lg text-xs border transition-colors ${form.category === c.id ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Task Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" placeholder="E.g. Recorded episode 4..." />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration (mins)</label>
                  <input type="number" min="0" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" placeholder="45" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white">
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Platform URL (YouTube Link)</label>
                <input type="url" value={form.platformUrl} onChange={e => setForm({...form, platformUrl: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" placeholder="https://youtube.com/watch?v=..." />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes (Optional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="2" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none" placeholder="Any specific details..." />
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> Add Work Log
              </button>
            </form>
          </div>
        </div>

        {/* Logs Feed */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div></div>
          ) : logs.length === 0 ? (
            <div className="bg-white border rounded-xl p-12 text-center text-gray-500 shadow-sm">
              <CalendarIcon size={48} className="mx-auto text-gray-300 mb-3" />
              <p>No work logged for this date.</p>
            </div>
          ) : (
            logs.map(log => {
              const catObj = categories.find(c => c.id === log.category) || categories[categories.length-1];
              return (
                <div key={log._id} className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${log.status === 'completed' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-400'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-start">
                      <button onClick={() => toggleStatus(log._id, log.status)} className={`mt-0.5 ${log.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}>
                        <CheckCircle2 size={20} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                            {catObj.icon} {catObj.label}
                          </span>
                          {log.durationMinutes > 0 && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {log.durationMinutes}m</span>}
                        </div>
                        <h3 className={`font-semibold text-gray-900 ${log.status === 'completed' ? '' : ''}`}>{log.title}</h3>
                        {log.notes && <p className="text-sm text-gray-600 mt-1">{log.notes}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(log._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>

                  {/* YouTube Card */}
                  {log.youtubeMetadata?.videoId && (
                    <div className="mt-4 bg-gray-50 border rounded-lg p-3 flex flex-col sm:flex-row gap-4 items-center">
                      <img src={log.youtubeMetadata.thumbnailUrl} alt="Thumbnail" className="w-32 rounded-md object-cover aspect-video bg-black" />
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">YouTube Stats</span>
                          <div className="flex gap-2">
                            <a href={log.platformUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-white border rounded hover:bg-gray-50 text-gray-600 tooltip" title="Open Video"><ExternalLink size={14}/></a>
                            <button onClick={() => handleSync(log._id)} className="p-1.5 bg-white border rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1 tooltip" title="Sync Latest Data">
                              <RefreshCw size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Views</p>
                            <p className="font-bold text-gray-800">{log.youtubeMetadata.viewCount?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Likes</p>
                            <p className="font-bold text-gray-800">{log.youtubeMetadata.likeCount?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Last synced: {new Date(log.youtubeMetadata.lastSyncedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {log.platformUrl && !log.youtubeMetadata?.videoId && (
                     <div className="mt-3">
                       <a href={log.platformUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><ExternalLink size={12}/> {log.platformUrl}</a>
                     </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
