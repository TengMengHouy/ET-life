'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'motion/react';
import {
  Menu,
  X,
  ChevronDown,
  Type,
  CheckSquare,
  ChevronRight,
  Circle,
  Calendar,
  UploadCloud,
  Shield,
  Lock,
  Eye,
  Fingerprint,
  Globe,
  Zap,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLE BACKGROUND
   ═══════════════════════════════════════════════════════════════════════ */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const { lang, setLang, t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: t('nav.features') },
    { href: '#security', label: t('nav.security') },
    { href: '#scale', label: t('nav.scale') },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ padding: '12px 24px' }}
    >
      <div
        className={`max-w-6xl mx-auto rounded-2xl transition-all duration-500 ${
          scrolled
            ? 'glass-strong shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
        style={{ padding: '12px 24px' }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image
              src="/logo.png"
              alt="ET-form"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span
              className="text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ET-form
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm no-underline transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--text-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--text-secondary)')
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
              className="glass text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-glass)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Globe size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              {lang === 'en' ? 'ខ្មែរ' : 'EN'}
            </button>
            
            <ThemeToggle />

            {/* CTA */}
            <Link
              href="/login"
              className="text-sm font-semibold px-5 py-2 rounded-full no-underline transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 0 20px rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden cursor-pointer bg-transparent border-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--text-primary)' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm py-2 no-underline"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setLang(lang === 'en' ? 'km' : 'en');
                    setMobileOpen(false);
                  }}
                  className="text-sm py-2 text-left cursor-pointer bg-transparent border-none"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Globe size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  {lang === 'en' ? 'ភាសាខ្មែរ' : 'English'}
                </button>
                <div className="flex justify-center py-2">
                  <ThemeToggle />
                </div>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full no-underline text-center"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                    color: '#fff',
                  }}
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1: HERO — "THE ACADEMIC SHIFT"
   ═══════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), {
    stiffness: 150,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), {
    stiffness: 150,
    damping: 30,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const formScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const formRotateZ = useTransform(scrollYProgress, [0, 0.5], [0, 3]);
  const paperOpacity = useTransform(scrollYProgress, [0, 0.4], [0.7, 0]);
  const paperScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.2]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    },
    [mouseX, mouseY]
  );

  // Paper sheets data
  const papers = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${10 + Math.random() * 80}%`,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 6,
        rotation: Math.random() * 360,
        size: 40 + Math.random() * 30,
      })),
    []
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ padding: '120px 24px 80px' }}
    >
      {/* Falling Paper Sheets */}
      {papers.map((paper) => (
        <motion.div
          key={paper.id}
          style={{
            position: 'absolute',
            left: paper.left,
            top: '-10%',
            width: paper.size,
            height: paper.size * 1.3,
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: 4,
            opacity: paperOpacity,
            scale: paperScale,
            animation: `paper-fall ${paper.duration}s linear ${paper.delay}s infinite`,
          }}
        />
      ))}

      {/* Text Content */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        style={{ y: textY, opacity: textOpacity }}
      >
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 glass rounded-full mb-6"
          style={{
            padding: '6px 16px',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#a855f7',
              display: 'inline-block',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
          All-in-one Academic Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="text-gradient">{t('hero.headline')}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          {t('hero.sub')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-full no-underline transition-all duration-300"
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
              color: '#fff',
              boxShadow:
                '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(168, 85, 247, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(168, 85, 247, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(168, 85, 247, 0.15)';
            }}
          >
            {t('hero.cta')}
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-full no-underline glass transition-all duration-300"
            style={{
              padding: '14px 32px',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-glass)';
            }}
          >
            {t('hero.secondary')}
            <ChevronDown size={16} />
          </a>
        </motion.div>
      </motion.div>

      {/* 3D Glassmorphic Form */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="relative z-10 perspective-1000 mt-16 w-full flex justify-center"
      >
        <motion.div
          ref={formRef}
          className="preserve-3d"
          style={{
            rotateX,
            rotateY,
            rotateZ: formRotateZ,
            scale: formScale,
            maxWidth: 480,
            width: '100%',
          }}
        >
          <div
            className="glass-strong rounded-2xl"
            style={{
              padding: '32px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(168, 85, 247, 0.15)',
            }}
          >
            {/* Form Header */}
            <div className="flex items-center gap-2 mb-6">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#ef4444',
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#a855f7',
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#a855f7',
                }}
              />
              <span
                className="ml-3 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                ET-form Builder
              </span>
            </div>

            {/* Image instead of fake form fields */}
            <div className="relative w-full h-[300px] rounded-xl overflow-hidden shadow-lg mt-4">
              <Image 
                src="/form_preview.png" 
                alt="Form Preview" 
                fill 
                className="object-cover" 
                sizes="(max-width: 480px) 100vw, 480px"
              />
              {/* Overlay gradient for aesthetics */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#160a2b] to-transparent opacity-60"></div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2"
        style={{
          transform: 'translateX(-50%)',
          color: 'var(--text-muted)',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2: CREATOR'S CANVAS — DRAG & DROP
   ═══════════════════════════════════════════════════════════════════════ */
function CanvasSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const elements = useMemo(
    () => [
      {
        icon: Type,
        label: t('canvas.item.text'),
        color: '#a855f7',
        fromX: -300,
        fromY: -100,
      },
      {
        icon: CheckSquare,
        label: t('canvas.item.checkbox'),
        color: '#a855f7',
        fromX: 300,
        fromY: -150,
      },
      {
        icon: ChevronDown,
        label: t('canvas.item.dropdown'),
        color: '#8b5cf6',
        fromX: -250,
        fromY: 200,
      },
      {
        icon: Circle,
        label: t('canvas.item.radio'),
        color: '#a855f7',
        fromX: 350,
        fromY: 180,
      },
      {
        icon: Calendar,
        label: t('canvas.item.date'),
        color: '#c084fc',
        fromX: -400,
        fromY: 50,
      },
      {
        icon: UploadCloud,
        label: t('canvas.item.upload'),
        color: '#ef4444',
        fromX: 400,
        fromY: 0,
      },
    ],
    [t]
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ padding: '100px 24px' }}
    >
      {/* Section header */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-16 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div
          className="inline-flex items-center gap-2 glass rounded-full mb-5"
          style={{
            padding: '6px 16px',
            fontSize: 12,
            color: 'var(--accent-blue)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <Zap size={14} />
          {t('canvas.tag')}
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          {t('canvas.headline')}
        </h2>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          {t('canvas.sub')}
        </p>
      </motion.div>

      {/* Canvas Grid + Flying Elements */}
      <div
        className="relative w-full max-w-3xl mx-auto"
        style={{ minHeight: 420 }}
      >
        {/* Beautiful Image Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-40">
          <Image 
            src="/canvas_bg.png" 
            alt="Canvas Background" 
            fill 
            className="object-cover mix-blend-overlay"
          />
        </div>

        {/* Flying UI elements */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-5" style={{ padding: 40 }}>
          {elements.map((el, i) => {
            const Icon = el.icon;
            return (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: el.fromX,
                  y: el.fromY,
                  rotate: -15 + Math.random() * 30,
                  scale: 0.5,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.12,
                  type: 'spring',
                  stiffness: 150,
                  damping: 10,
                  mass: 0.8,
                }}
                whileHover={{
                  scale: 1.15,
                  y: -10,
                  rotate: -2 + Math.random() * 4,
                  transition: { type: 'spring', stiffness: 400, damping: 10 },
                }}
                className="glass-strong rounded-xl cursor-pointer"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: `0 0 20px ${el.color}15`,
                }}
              >
                <div
                  className="rounded-lg flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    background: `${el.color}15`,
                    color: el.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {el.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3: THE VAULT — SECURITY
   ═══════════════════════════════════════════════════════════════════════ */
function VaultSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const shieldScale = useTransform(scrollYProgress, [0.1, 0.4], [0.5, 1]);
  const shieldOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  const features = useMemo(
    () => [
      {
        icon: Lock,
        title: t('vault.feature1.title'),
        desc: t('vault.feature1.desc'),
        color: '#a855f7',
      },
      {
        icon: Eye,
        title: t('vault.feature2.title'),
        desc: t('vault.feature2.desc'),
        color: '#a855f7',
      },
      {
        icon: Fingerprint,
        title: t('vault.feature3.title'),
        desc: t('vault.feature3.desc'),
        color: '#8b5cf6',
      },
    ],
    [t]
  );

  return (
    <section
      ref={sectionRef}
      id="security"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        padding: '100px 24px',
        background:
          'linear-gradient(180deg, var(--bg-primary) 0%, #050510 40%, #050510 60%, var(--bg-primary) 100%)',
      }}
    >
      {/* Section header */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-16 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full mb-5"
          style={{
            padding: '6px 16px',
            fontSize: 12,
            color: '#a855f7',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          <Shield size={14} />
          {t('vault.tag')}
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          {t('vault.headline')}
        </h2>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          {t('vault.sub')}
        </p>
      </motion.div>

      {/* Features + Shield */}
      <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Feature Cards */}
        <div className="flex flex-col gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-strong rounded-xl"
                style={{
                  padding: '24px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  className="rounded-lg flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    background: `${feat.color}15`,
                    color: feat.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ fontSize: 15 }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Shield + Demo */}
        <div className="flex flex-col items-center gap-8">
          {/* Shield visual */}
          <motion.div
            className="perspective-1000"
            style={{
              scale: shieldScale,
              opacity: shieldOpacity,
            }}
          >
            <div
              className="relative rounded-2xl flex items-center justify-center"
              style={{
                width: 200,
                height: 200,
                background:
                  'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))',
                border: '2px solid rgba(168, 85, 247, 0.3)',
                animation: 'shield-pulse 3s ease-in-out infinite',
              }}
            >
              <Shield
                size={80}
                style={{
                  color: '#a855f7',
                  filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))',
                }}
              />
              {/* Hex fragments */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.3, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  style={{
                    width: 30,
                    height: 30,
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: 6,
                    top: `${20 + Math.sin(i * 1.05) * 60}%`,
                    left: `${20 + Math.cos(i * 1.05) * 60}%`,
                    transform: `rotate(${i * 60}deg)`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Hover Demo — "Access Denied" interaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-xs"
          >
            <div
              className="text-xs font-semibold uppercase mb-2"
              style={{
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              {t('vault.demo.label')}
            </div>
            <div
              className="relative rounded-xl overflow-hidden cursor-not-allowed select-none"
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Text that gets blurred */}
              <p
                className="text-sm transition-all duration-300"
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  filter: hovered ? 'blur(8px)' : 'blur(0)',
                  userSelect: 'none',
                }}
              >
                {t('vault.demo.text')}
              </p>

              {/* Access Denied Overlay */}
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                    style={{
                      background: 'rgba(5, 5, 16, 0.85)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <motion.div
                      animate={{
                        x: [0, -2, 2, -2, 2, 0],
                      }}
                      transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      <Lock
                        size={32}
                        style={{
                          color: '#ef4444',
                          filter:
                            'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))',
                          marginBottom: 8,
                        }}
                      />
                    </motion.div>
                    <span
                      className="font-bold text-sm"
                      style={{ color: '#ef4444', letterSpacing: '0.1em' }}
                    >
                      {t('vault.demo.denied')}
                    </span>
                    {/* Scan line */}
                    <div
                      className="absolute left-0 right-0"
                      style={{
                        height: 2,
                        background:
                          'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.6), transparent)',
                        animation: 'scan-line 2s linear infinite',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4: THE ECOSYSTEM — SCALABILITY
   ═══════════════════════════════════════════════════════════════════════ */
function EcosystemSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(
    () => [
      {
        value: t('eco.stat1.value'),
        label: t('eco.stat1.label'),
        color: '#a855f7',
      },
      {
        value: t('eco.stat2.value'),
        label: t('eco.stat2.label'),
        color: '#a855f7',
      },
      {
        value: t('eco.stat3.value'),
        label: t('eco.stat3.label'),
        color: '#8b5cf6',
      },
    ],
    [t]
  );

  // Network node positions
  const nodes = useMemo(
    () => [
      { x: 50, y: 50, r: 14, primary: true },
      { x: 20, y: 25, r: 8 },
      { x: 80, y: 20, r: 8 },
      { x: 15, y: 70, r: 8 },
      { x: 85, y: 75, r: 8 },
      { x: 35, y: 85, r: 6 },
      { x: 65, y: 15, r: 6 },
      { x: 40, y: 30, r: 6 },
      { x: 70, y: 65, r: 6 },
      { x: 25, y: 50, r: 5 },
      { x: 75, y: 40, r: 5 },
      { x: 55, y: 80, r: 5 },
    ],
    []
  );

  // Connections
  const connections = useMemo(
    () => [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 7], [0, 8],
      [1, 7], [2, 6], [3, 9], [4, 8], [5, 3],
      [6, 2], [7, 9], [8, 10], [9, 5], [10, 4], [11, 5], [11, 4],
    ],
    []
  );

  return (
    <section
      ref={sectionRef}
      id="scale"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ padding: '100px 24px' }}
    >
      {/* Header */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-16 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div
          className="inline-flex items-center gap-2 glass rounded-full mb-5"
          style={{
            padding: '6px 16px',
            fontSize: 12,
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <BarChart3 size={14} />
          {t('eco.tag')}
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          {t('eco.headline')}
        </h2>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          {t('eco.sub')}
        </p>
      </motion.div>

      {/* Network Visualization */}
      <motion.div
        className="relative w-full max-w-2xl mx-auto mb-16"
        style={{ height: 360 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Connections */}
          {connections.map(([from, to], i) => (
            <motion.line
              key={`line-${i}`}
              x1={nodes[from].x}
              y1={nodes[from].y}
              x2={nodes[to].x}
              y2={nodes[to].y}
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth={0.3}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
            />
          ))}

          {/* Data packets */}
          {connections.slice(0, 8).map(([from, to], i) => (
            <motion.circle
              key={`packet-${i}`}
              r={0.6}
              fill="#a855f7"
              filter="url(#glow)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 1, 1, 0] }}
              viewport={{ once: true }}
              transition={{
                duration: 2,
                delay: 1 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <animateMotion
                dur={`${2 + i * 0.2}s`}
                repeatCount="indefinite"
                begin={`${1 + i * 0.3}s`}
                path={`M${nodes[from].x},${nodes[from].y} L${nodes[to].x},${nodes[to].y}`}
              />
            </motion.circle>
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.g key={`node-${i}`}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={
                  node.primary
                    ? 'url(#nodeGradient)'
                    : 'rgba(59, 130, 246, 0.15)'
                }
                stroke={
                  node.primary
                    ? 'rgba(59, 130, 246, 0.6)'
                    : 'rgba(59, 130, 246, 0.3)'
                }
                strokeWidth={node.primary ? 0.5 : 0.3}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.08,
                  type: 'spring',
                }}
              />
              {node.primary && (
                <motion.text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={5}
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  ET
                </motion.text>
              )}
            </motion.g>
          ))}

          {/* SVG Defs */}
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mx-auto relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="glass-strong rounded-xl text-center"
            style={{ padding: '28px 20px' }}
          >
            <div
              className="text-3xl font-extrabold mb-2"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════════════════ */
function CTASection() {
  const { t } = useTranslation();

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ padding: '120px 24px' }}
    >
      {/* Background glow */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: '-0.02em',
            maxWidth: 600,
          }}
        >
          {t('cta.headline')}
        </h2>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 36,
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {t('cta.sub')}
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-semibold rounded-full no-underline transition-all duration-300"
          style={{
            padding: '16px 40px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
            color: '#fff',
            boxShadow:
              '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(168, 85, 247, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow =
              '0 0 50px rgba(59, 130, 246, 0.5), 0 0 100px rgba(168, 85, 247, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow =
              '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(168, 85, 247, 0.15)';
          }}
        >
          {t('cta.button')}
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="relative z-10"
      style={{
        padding: '40px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ET-form"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('footer.copyright')}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {['footer.about', 'footer.contact', 'footer.privacy'].map((key) => (
            <a
              key={key}
              href="#"
              className="text-sm no-underline transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--text-primary)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--text-muted)')
              }
            >
              {t(key)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className="relative dark-theme">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <CanvasSection />
      <VaultSection />
      <EcosystemSection />
      <CTASection />
      <Footer />
    </main>
  );
}
