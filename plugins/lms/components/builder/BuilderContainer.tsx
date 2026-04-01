'use client';

import React, { useState, useEffect, use } from 'react';
import { Plus, Save, Loader2, ArrowLeft, Layout } from 'lucide-react';
import { SectionItem } from './SectionItem';
import { SortableItem } from './SortableItem';
import Link from 'next/link';

export function BuilderContainer({ params }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.courseId;
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'section' | 'lesson' | 'topic' | 'quiz'
  const [parentId, setParentId] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    fetchStructure();
  }, [courseId]);

  const fetchStructure = async () => {
    try {
      const res = await fetch(`/api/admin/courses/builder/${courseId}/structure`);
      const json = await res.json();
      if (json.success) {
        setStructure(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch structure', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      // 1. Prepare section orders
      const sectionOrders = structure.modules.map((m, i) => ({ id: m._id, order: i }));
      await fetch('/api/admin/courses/builder/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'section', items: sectionOrders })
      });

      // 2. Prepare lesson orders for each section
      for (const section of structure.modules) {
        if (section.lessons?.length > 0) {
          const lessonOrders = section.lessons.map((l, i) => ({ id: l._id, order: i }));
          await fetch('/api/admin/courses/builder/items', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'lesson', items: lessonOrders })
          });
        }
      }

      alert('Structure saved successfully!');
    } catch (err) {
      console.error('Failed to save structure', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle) return;
    try {
      const data = {
        title: newItemTitle,
        courseId: structure._id,
        tenantId: structure.tenant,
        sectionId: activeModal === 'lesson' ? parentId : undefined,
        lessonId: (activeModal === 'topic' || activeModal === 'quiz') ? parentId : undefined,
      };

      const res = await fetch('/api/admin/courses/builder/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeModal, data })
      });
      const json = await res.json();
      if (json.success) {
        fetchStructure(); // Refresh structure
        setActiveModal(null);
        setNewItemTitle('');
      } else {
        alert(json.error || 'Failed to add item');
      }
    } catch (err) {
      console.error('Failed to add item', err);
      alert('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-zinc-500 font-medium tracking-tight">Initializing curriculum engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-5">
          <Link href="/admin/courses">
            <div className="p-2.5 rounded-xl hover:bg-zinc-100 border border-zinc-200 transition-all cursor-pointer bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-none mb-2">{structure?.title}</h1>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Curriculum Builder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 font-bold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-all rounded-xl text-sm bg-white shadow-sm">Preview</button>
          <button 
            disabled={saving}
            onClick={handleSaveOrder}
            className="group relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-7 py-2.5 rounded-xl shadow-xl shadow-zinc-200 transition-all flex items-center text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
            <span>{saving ? 'Saving...' : 'Publish Structure'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-3">
              <Layout className="w-6 h-6 text-indigo-500" />
              Course Map
            </h2>
            <p className="text-zinc-400 text-xs font-medium mt-1">Design the architecture of your learning experience.</p>
          </div>
          <button 
            onClick={() => setActiveModal('section')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Section</span>
          </button>
        </div>

        <div className="space-y-6">
          {structure?.modules?.map((section) => (
            <SortableItem key={section._id} id={section._id} handle={true}>
              <SectionItem 
                section={section} 
                onAddLesson={(id) => { setActiveModal('lesson'); setParentId(id); }} 
                onAddTopic={(id) => { setActiveModal('topic'); setParentId(id); }}
                onAddQuiz={(id) => { setActiveModal('quiz'); setParentId(id); }}
              />
            </SortableItem>
          ))}
        </div>

        {structure?.modules?.length === 0 && (
          <div className="text-center py-24 bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center">
            <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
              <Layout className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Empty Curriculum</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-10 font-medium">Your course doesn't have any content yet. Start by defining the first major section.</p>
            <button 
              onClick={() => setActiveModal('section')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-indigo-50 flex items-center transition-all hover:-translate-y-1 active:scale-95"
            >
              <Plus className="w-6 h-6 mr-2" />
              INITIALIZE SECTION
            </button>
          </div>
        )}
      </div>

      {/* Modern Modal Interface */}
      {activeModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 capitalize mb-2">New {activeModal}</h3>
              <p className="text-zinc-500 text-sm font-medium mb-8">Give your new {activeModal} a distinctive title.</p>
              
              <div className="relative mb-10">
                <input 
                  autoFocus
                  type="text"
                  placeholder={`e.g. ${activeModal === 'section' ? 'Introduction to Web Design' : 'Understanding Flexbox'}`}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 font-semibold placeholder:text-zinc-300 shadow-sm"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  className="flex-1 font-bold border border-zinc-200 text-zinc-500 bg-white h-14 rounded-2xl hover:bg-zinc-50 transition-colors"
                  onClick={() => setActiveModal(null)}
                >
                  Discard
                </button>
                <button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-14 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
                  onClick={handleAddItem}
                >
                  Create {activeModal}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
