'use client';

import React, { useEffect, useRef } from 'react';
import {
  Bold,
  Code2,
  Film,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  Underline,
} from 'lucide-react';

type RichTopicEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
};

function toolbarButtonClass() {
  return [
    'inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors',
    'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
  ].join(' ');
}

export default function RichTopicEditor({
  value,
  onChange,
  placeholder = 'Write rich topic content here...',
  label,
  helperText,
}: RichTopicEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (editor.innerHTML !== (value || '')) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const sync = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    sync();
  };

  const insertHtml = (html: string) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    sync();
  };

  const insertLink = () => {
    const url = window.prompt('Paste the link URL');
    if (!url) return;
    const labelText = window.prompt('Link label', url) || url;
    insertHtml(`<a href="${url}" target="_blank" rel="noreferrer">${labelText}</a>`);
  };

  const insertImage = () => {
    const src = window.prompt('Paste the image URL');
    if (!src) return;
    const alt = window.prompt('Image alt text', 'Topic image') || 'Topic image';
    insertHtml(`
      <figure style="margin:1.25rem 0;">
        <img src="${src}" alt="${alt}" style="width:100%;border-radius:1rem;display:block;object-fit:cover;" />
      </figure>
    `);
  };

  const insertVideo = () => {
    const src = window.prompt('Paste the video embed URL or iframe src');
    if (!src) return;
    insertHtml(`
      <div style="margin:1.25rem 0;border-radius:1.25rem;overflow:hidden;border:1px solid #dbeafe;background:#0f172a;">
        <iframe src="${src}" title="Embedded video" style="width:100%;min-height:320px;border:0;" allowFullScreen></iframe>
      </div>
    `);
  };

  const insertNote = () => {
    insertHtml(`
      <aside style="margin:1.25rem 0;border-left:4px solid #2563eb;background:#eff6ff;padding:1rem 1.1rem;border-radius:1rem;">
        <p style="margin:0 0 0.35rem;font-weight:700;color:#1d4ed8;">Note</p>
        <p style="margin:0;color:#1e293b;">Add an important reminder or takeaway here.</p>
      </aside>
    `);
  };

  const insertCode = () => {
    insertHtml(`
      <pre style="margin:1.25rem 0;overflow:auto;border-radius:1rem;background:#0f172a;color:#e2e8f0;padding:1rem 1.1rem;"><code>// add code example here</code></pre>
    `);
  };

  const insertChecklist = () => {
    insertHtml(`
      <ul style="margin:1.25rem 0;padding-left:1.25rem;">
        <li>First learning point</li>
        <li>Second learning point</li>
        <li>Third learning point</li>
      </ul>
    `);
  };

  const insertResourceCard = () => {
    insertHtml(`
      <div style="margin:1.25rem 0;border:1px solid #e2e8f0;border-radius:1.25rem;padding:1rem 1.1rem;background:#ffffff;box-shadow:0 10px 35px rgba(15,23,42,0.04);">
        <p style="margin:0 0 0.5rem;font-weight:800;color:#0f172a;">Resources</p>
        <ul style="margin:0;padding-left:1.1rem;color:#334155;">
          <li><a href="https://example.com" target="_blank" rel="noreferrer">Reference link</a></li>
          <li><a href="https://example.com" target="_blank" rel="noreferrer">Downloadable handout</a></li>
        </ul>
      </div>
    `);
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-semibold text-slate-900">{label}</label>}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-3 py-3">
          <button type="button" onClick={() => runCommand('bold')} className={toolbarButtonClass()}>
            <Bold size={14} />
            Bold
          </button>
          <button type="button" onClick={() => runCommand('italic')} className={toolbarButtonClass()}>
            <Italic size={14} />
            Italic
          </button>
          <button type="button" onClick={() => runCommand('underline')} className={toolbarButtonClass()}>
            <Underline size={14} />
            Underline
          </button>
          <button type="button" onClick={() => runCommand('formatBlock', '<h2>')} className={toolbarButtonClass()}>
            <Heading2 size={14} />
            H2
          </button>
          <button type="button" onClick={() => runCommand('formatBlock', '<h3>')} className={toolbarButtonClass()}>
            <Heading3 size={14} />
            H3
          </button>
          <button type="button" onClick={() => runCommand('insertUnorderedList')} className={toolbarButtonClass()}>
            <List size={14} />
            List
          </button>
          <button type="button" onClick={() => runCommand('insertOrderedList')} className={toolbarButtonClass()}>
            <ListOrdered size={14} />
            Steps
          </button>
          <button type="button" onClick={() => runCommand('formatBlock', '<blockquote>')} className={toolbarButtonClass()}>
            <Quote size={14} />
            Note
          </button>
          <button type="button" onClick={insertCode} className={toolbarButtonClass()}>
            <Code2 size={14} />
            Code
          </button>
          <button type="button" onClick={insertImage} className={toolbarButtonClass()}>
            <ImageIcon size={14} />
            Image
          </button>
          <button type="button" onClick={insertVideo} className={toolbarButtonClass()}>
            <Film size={14} />
            Video
          </button>
          <button type="button" onClick={insertLink} className={toolbarButtonClass()}>
            <Link2 size={14} />
            Link
          </button>
          <button type="button" onClick={insertChecklist} className={toolbarButtonClass()}>
            <Sparkles size={14} />
            Key points
          </button>
          <button type="button" onClick={insertNote} className={toolbarButtonClass()}>
            Note card
          </button>
          <button type="button" onClick={insertResourceCard} className={toolbarButtonClass()}>
            Resources
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          className="min-h-[360px] px-5 py-5 text-[15px] leading-8 text-slate-800 outline-none"
          data-placeholder={placeholder}
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>
      <p className="text-xs text-slate-500">
        {helperText || 'Use the toolbar to add headings, lists, notes, code blocks, images, videos, and resources.'}
      </p>
      <style jsx global>{`
        [contenteditable='true'][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
