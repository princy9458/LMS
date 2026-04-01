'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Copy, 
  RefreshCw, 
  Check, 
  AlertCircle,
  ChevronRight,
  Code,
  Edit3,
  Trash2,
  Download,
  X,
  Save,
  TriangleAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

type CollectionName = 'courses' | 'lessons' | 'topics' | 'quizzes' | 'questions' | 'certificates' | 'users';

export default function DBViewerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionName>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editJson, setEditJson] = useState('');
  
  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/debug/db');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to fetch database data');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCopy = () => {
    if (!data || !data[selectedCollection]) return;
    const filtered = getFilteredData();
    navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
    setCopied(true);
    toast.success('JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const filtered = getFilteredData();
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lms_${selectedCollection}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Collection exported successfully');
  };

  const handleSaveEdit = async () => {
    try {
      const parsed = JSON.parse(editJson);
      const res = await fetch(`/api/debug/db/${selectedCollection}/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Record updated successfully');
        setEditingItem(null);
        handleRefresh();
      } else {
        toast.error(json.error || 'Failed to update record');
      }
    } catch (err) {
      toast.error('Invalid JSON format');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/debug/db/${selectedCollection}/${deletingId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Record deleted from database');
        setDeletingId(null);
        handleRefresh();
      } else {
        toast.error(json.error || 'Failed to delete record');
      }
    } catch (err) {
      toast.error('Error connecting to database');
    }
  };

  const getFilteredData = () => {
    if (!data || !data[selectedCollection]) return [];
    if (!searchQuery) return data[selectedCollection];
    
    return data[selectedCollection].filter((item: any) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        (item.title && item.title.toLowerCase().includes(searchStr)) ||
        (item.name && item.name.toLowerCase().includes(searchStr)) ||
        (item.email && item.email.toLowerCase().includes(searchStr)) ||
        (item._id && item._id.toLowerCase().includes(searchStr))
      );
    });
  };

  const collections: { id: CollectionName; label: string }[] = [
    { id: 'courses', label: 'Courses' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'topics', label: 'Topics' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'questions', label: 'Questions' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'users', label: 'Users' },
  ];

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Initializing Management Tool...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            DB Management Tool
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Directly manage raw collections for debugging and maintenance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy JSON
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Error Accessing Database</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collection Selector */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Collections</p>
              </div>
              <div className="p-2 space-y-1">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCollection === col.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{col.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedCollection === col.id ? 'bg-indigo-100' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {data?.[col.id]?.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">ID/Title Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Filter data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Main List and JSON Review */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[600px]">
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-zinc-900 capitalize">{selectedCollection}</span>
                  <ChevronRight size={14} className="text-zinc-400" />
                  <span className="text-zinc-500 text-sm">Interactive JSON Data</span>
                </div>
                <p className="text-xs text-zinc-400">Showing {getFilteredData().length} results</p>
              </div>
              
              <div className="flex-1 overflow-auto bg-[#0d1117] p-2 space-y-2">
                {getFilteredData().length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
                    <Search className="w-12 h-12 mb-4 opacity-10" />
                    <p>No results found</p>
                  </div>
                ) : (
                  getFilteredData().map((item: any) => (
                    <div key={item._id} className="group border border-zinc-800 rounded-lg overflow-hidden bg-[#21262d]/30 hover:bg-[#21262d]/50 transition-all">
                      <div className="px-4 py-2 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-mono">{item._id}</span>
                          <span className="text-sm font-bold text-zinc-200 truncate max-w-xs">{item.title || item.name || item.email || 'Untitled'}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingItem(item); setEditJson(JSON.stringify(item, null, 2)); }}
                            className="p-1.5 text-zinc-400 hover:text-indigo-400 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingId(item._id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 text-indigo-300 text-xs overflow-x-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 leading-none">Edit Record</h3>
                  <p className="text-xs text-zinc-500 mt-1">{selectedCollection} / {editingItem._id}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <textarea 
                value={editJson}
                onChange={(e) => setEditJson(e.target.value)}
                className="w-full h-[400px] p-4 bg-[#0d1117] text-indigo-300 font-mono text-xs rounded-2xl focus:outline-none ring-1 ring-zinc-800"
                spellCheck={false}
              />
              <p className="text-[10px] text-zinc-500 mt-2 italic">* Ensure valid JSON format. Sensitive fields like passwords will be stripped on save.</p>
            </div>

            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
              <button 
                onClick={() => setEditingItem(null)}
                className="px-6 py-2 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-700 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-150">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TriangleAlert size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Are you absolutely sure?</h3>
              <p className="text-zinc-500 mb-8 leading-relaxed">
                This action cannot be undone. This will permanently delete the record 
                <span className="font-mono text-xs font-bold block mt-2 text-red-600 px-2 py-1 bg-red-50 rounded">
                  {deletingId}
                </span> 
                from the <span className="font-bold underline">{selectedCollection}</span> collection.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
