import React from 'react';
import { GripVertical } from 'lucide-react';

export function SortableItem({ id, children, handle = false }) {
  const setNodeRef = (el: HTMLElement | null) => {};
  const attributes = {};
  const listeners = {};
  const style = {};

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center gap-2 group">
        {handle && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600">
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
