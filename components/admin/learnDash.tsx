"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";

type ActionItem = {
  label: string;
  href: string;
};

type ActionsDropdownProps = {
  items: ActionItem[];
  label?: string;
};

export function ActionsDropdown({ items, label = "Actions" }: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
    return undefined;
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="border border-zinc-300 text-zinc-700 px-3 py-2 rounded-md text-sm flex items-center gap-2 bg-white"
      >
        {label} <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-zinc-200 rounded-md shadow-lg z-10">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm hover:bg-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full border transition ${
        checked ? "bg-[#2271b1] border-[#2271b1]" : "bg-zinc-200 border-zinc-300"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
};

export function SectionCard({ title, description, children, id }: SectionCardProps) {
  return (
    <div id={id} className="bg-white border border-zinc-200 rounded-md">
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </div>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

type RowProps = {
  label: string;
  helper?: string;
  control: React.ReactNode;
};

export function SettingRow({ label, helper, control }: RowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {helper && <p className="text-xs text-zinc-500 mt-1">{helper}</p>}
      </div>
      <div className="md:min-w-[220px] flex justify-end">{control}</div>
    </div>
  );
}

type SidebarProps = {
  saving: boolean;
  onSave: () => void;
  quickLinks: { label: string; href: string }[];
};

export function SettingsSidebar({ saving, onSave, quickLinks }: SidebarProps) {
  return (
    <aside className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-md">
        <div className="px-4 py-3 border-b border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900">Save Options</h3>
        </div>
        <div className="p-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md">
        <div className="px-4 py-3 border-b border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900">Quick Links</h3>
        </div>
        <div className="p-4 space-y-2 text-sm text-blue-600">
          {quickLinks.map((link) => (
            <a key={link.href} href={link.href} className="block hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
