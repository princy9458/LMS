'use client';

import React from 'react';
import Link from 'next/link';

export default function CertificateShortcodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Certificates</h1>
        </div>
        <Link
          href="/admin/certificates/create"
          className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
        >
          + Add New Certificate
        </Link>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/certificates" className="pb-2 hover:text-zinc-900">Certificates</Link>
          <Link href="/admin/certificates/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Shortcodes</span>
          <Link href="/admin/certificates/fonts" className="pb-2 hover:text-zinc-900">Fonts</Link>
        </nav>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900">Certificate Shortcodes</h2>
        <p className="text-sm text-zinc-600">
          The documentation for Certificate Shortcodes has moved online (only available in English).
        </p>
        <a
          href="https://www.learndash.com/support/docs/core/certificates/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#2271b1] hover:underline"
        >
          Click here
        </a>
      </div>
    </div>
  );
}
