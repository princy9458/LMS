'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Directly redirect to dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        <p className="text-zinc-500 font-medium">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
