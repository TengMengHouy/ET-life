'use client';

import React, { use, useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { getFormById, FormItem, FormField } from '@/lib/types';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<FormItem | null>(null);

  useEffect(() => {
    const loaded = getFormById(id);
    if (loaded) setForm(loaded);
  }, [id]);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <p className="text-[var(--text-primary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
      {/* Top Navbar */}
      <nav className="h-16 glass flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline">
            <Image src="/logo.png" alt="ET-form" width={28} height={28} className="rounded-md" />
            <span className="font-bold text-gradient">{form.name} Results</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href={`/builder/${id}`}
            className="text-sm font-medium px-4 py-1.5 rounded-full no-underline transition-all duration-300 border border-[var(--border-glass)] cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            Back to Builder
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Responses ({form.responses?.length || 0})</h1>
          </div>
          
          {(!form.responses || form.responses.length === 0) ? (
            <div className="glass-strong p-12 rounded-2xl text-center text-[var(--text-muted)]">
              No responses yet.
            </div>
          ) : (
            <div className="glass-strong rounded-2xl overflow-hidden overflow-x-auto border border-[var(--border-glass)]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--bg-card)] border-b border-[var(--border-glass)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                    {form.fields.map((field: FormField) => (
                      <th key={field.id} className="px-6 py-4 font-semibold">{field.label}</th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-red-500">Security Violations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-glass)]">
                  {form.responses.map((res: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {new Date(res._timestamp).toLocaleString()}
                      </td>
                      {form.fields.map((field: FormField) => {
                        const val = res[field.id];
                        let displayVal = val;
                        if (Array.isArray(val)) displayVal = val.join(', ');
                        if (val === undefined || val === null) displayVal = '-';
                        return (
                          <td key={field.id} className="px-6 py-4 text-[var(--text-primary)]">
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4">
                        {res._securityLogs && res._securityLogs.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {res._securityLogs.length} issues
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
