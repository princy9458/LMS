'use client';

import React from 'react';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickySaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export default function StickySaveBar({ isDirty, isSaving, onSave, onReset }: StickySaveBarProps) {
  if (!isDirty && !isSaving) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-56 bg-white border-t border-zinc-200 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">You have unsaved changes</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            disabled={isSaving}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors uppercase tracking-widest px-4 py-2"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded text-xs font-bold transition-all shadow-sm",
              isDirty 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
