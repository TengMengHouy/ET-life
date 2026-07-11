'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
      <nav className="h-16 glass flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image src="/logo.png" alt="ET-form" width={28} height={28} className="rounded-md" />
            <span className="font-bold text-gradient">ET-Form</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md glass-strong p-10 rounded-3xl text-center shadow-xl">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">Response Submitted</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Your assessment has been successfully recorded. Thank you for your time!
          </p>
          <Link 
            href="/dashboard"
            className="inline-block w-full py-3 px-6 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] no-underline"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark))',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
