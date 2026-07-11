'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const { lang, setLang, t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No actual auth — redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      {/* Background effects */}
      <div
        className="absolute"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          top: '20%',
          left: '20%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="absolute"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          bottom: '10%',
          right: '15%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-sm no-underline transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {t('login.backHome')}
          </Link>
          <button
            onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
            className="glass text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-glass)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-glass)';
            }}
          >
            <Globe size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            {lang === 'en' ? 'ខ្មែរ' : 'EN'}
          </button>
        </div>

        {/* Glass card */}
        <div
          className="glass-strong rounded-2xl"
          style={{
            padding: '40px 32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139, 92, 246, 0.08)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="ET-form"
              width={56}
              height={56}
              className="rounded-xl"
              style={{
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
              }}
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {mode === 'signin' ? t('login.welcome') : t('login.joinUs')}
            </h1>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              {mode === 'signin' ? t('login.welcomeSub') : t('login.joinSub')}
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex rounded-xl mb-8 relative"
            style={{
              background: 'var(--bg-glass)',
              padding: 4,
            }}
          >
            <button
              onClick={() => setMode('signin')}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-all duration-300 border-none relative z-10"
              style={{
                background: mode === 'signin' ? 'var(--bg-glass)' : 'transparent',
                color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'signin' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {t('login.signin')}
            </button>
            <button
              onClick={() => setMode('signup')}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-all duration-300 border-none relative z-10"
              style={{
                background: mode === 'signup' ? 'var(--bg-glass)' : 'transparent',
                color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'signup' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {t('login.signup')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t('login.name')}
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2"
                      style={{
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg text-sm outline-none transition-all duration-300"
                      style={{
                        padding: '12px 12px 12px 36px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2"
                  style={{
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg text-sm outline-none transition-all duration-300"
                  style={{
                    padding: '12px 12px 12px 36px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2"
                  style={{
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg text-sm outline-none transition-all duration-300"
                  style={{
                    padding: '12px 40px 12px 36px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 cursor-pointer bg-transparent border-none"
                  style={{
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t('login.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2"
                      style={{
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg text-sm outline-none transition-all duration-300"
                      style={{
                        padding: '12px 12px 12px 36px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        e.target.style.boxShadow =
                          '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password (signin only) */}
            {mode === 'signin' && (
              <div className="text-right">
                <a
                  href="#"
                  className="text-xs no-underline transition-colors duration-200"
                  style={{ color: 'var(--accent-purple)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'var(--accent-purple-light)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'var(--accent-purple)')
                  }
                >
                  {t('login.forgot')}
                </a>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl cursor-pointer border-none transition-all duration-300"
              style={{
                padding: '14px',
                background: 'linear-gradient(135deg, #a855f7, #6d28d9)',
                color: '#fff',
                marginTop: 8,
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 0 20px rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {mode === 'signin' ? t('login.signinBtn') : t('login.signupBtn')}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Bottom text */}
        <div
          className="text-center mt-6 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="bg-transparent border-none cursor-pointer font-semibold"
                style={{ color: 'var(--accent-purple)' }}
              >
                {t('login.signup')}
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="bg-transparent border-none cursor-pointer font-semibold"
                style={{ color: 'var(--accent-purple)' }}
              >
                {t('login.signin')}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
