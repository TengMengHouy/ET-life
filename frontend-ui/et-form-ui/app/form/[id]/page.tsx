'use client';

import React, { use, useState, useEffect } from 'react';
import { ScreenshotShield } from '@/components/ScreenshotShield';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getFormById, FormItem, FormField, updateFormInStorage } from '@/lib/types';

export default function FormAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { logs } = useAntiCheat();
  const [form, setForm] = useState<FormItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loaded = getFormById(id);
    if (loaded) setForm(loaded);
  }, [id]);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <p className="text-[var(--text-primary)] text-lg font-bold">Form not found</p>
          <p className="text-[var(--text-muted)] text-sm mt-2">The form with ID "{id}" does not exist.</p>
          <Link href="/dashboard" className="text-[var(--accent-purple)] text-sm mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter((o: string) => o !== option) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          setError(`Please fill out the required field: ${field.label}`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    const submission = {
      _timestamp: Date.now(),
      _securityLogs: logs,
      ...answers
    };

    updateFormInStorage(id, {
      responses: [submission, ...form.responses]
    });

    router.push(`/form/${id}/success`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
      {/* Top Navbar */}
      <nav className="h-16 glass flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline">
            <Image src="/logo.png" alt="ET-form" width={28} height={28} className="rounded-md" />
            <span className="font-bold text-gradient">{form.name}</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Form Content */}
      <main className="flex-1 flex justify-center p-8 overflow-y-auto select-none">
        <div className="w-full max-w-3xl glass-strong p-8 rounded-2xl h-fit relative overflow-hidden">
          <ScreenshotShield />
          
          <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">{form.name}</h1>
          <p className="text-[var(--text-secondary)] mb-8 border-b border-[var(--border-glass)] pb-6">
            Please complete all questions below. Your responses are monitored for integrity.
          </p>
          
          {logs.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <p className="font-bold mb-2">Security Violations Logged:</p>
              <ul className="list-disc list-inside">
                {logs.map((log, idx) => (
                  <li key={idx}>[{log.timestamp.toLocaleTimeString()}] {log.type} - {log.details || 'Action blocked'}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {form.fields.map((field: FormField) => (
              <div key={field.id} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Text / Email / Number / URL / Paragraph */}
                {['text', 'email', 'number', 'url', 'paragraph'].includes(field.type) && (
                  field.type === 'paragraph' ? (
                    <textarea 
                      required={field.required}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] outline-none transition-colors min-h-[80px] resize-y" 
                      placeholder={field.placeholder} 
                    />
                  ) : (
                    <input 
                      type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'} 
                      required={field.required}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] outline-none transition-colors" 
                      placeholder={field.placeholder} 
                    />
                  )
                )}

                {/* Select Dropdown */}
                {field.type === 'select' && (
                  <select 
                    required={field.required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] outline-none transition-colors"
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* Radio */}
                {(field.type === 'radio' || field.type === 'radio_play') && (
                  <div className="flex flex-col gap-2">
                    {field.options?.map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                        <input 
                          type="radio" 
                          name={field.id} 
                          value={opt}
                          required={field.required}
                          checked={answers[field.id] === opt}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        /> {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {field.type === 'checkbox' && (
                  <div className="flex flex-col gap-2">
                    {field.options?.map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                        <input 
                          type="checkbox" 
                          value={opt}
                          checked={(answers[field.id] || []).includes(opt)}
                          onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                        /> {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* Date */}
                {field.type === 'date' && (
                  <input 
                    type="date" 
                    required={field.required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] outline-none transition-colors" 
                  />
                )}

                {/* Time */}
                {field.type === 'time' && (
                  <input 
                    type="time" 
                    required={field.required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] outline-none transition-colors" 
                  />
                )}

                {/* File Upload */}
                {field.type === 'file' && (
                  <div className="w-full border-2 border-dashed border-[var(--border-glass)] rounded-lg p-6 text-center text-sm text-[var(--text-muted)] bg-[var(--bg-card)]">
                    {field.placeholder || 'Drop files here or click to upload'}
                  </div>
                )}
              </div>
            ))}

            <button type="submit" disabled={isSubmitting} className="mt-8 py-3 px-6 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark))',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
              }}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
