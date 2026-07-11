'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ScreenshotShield() {
  const [isBlackout, setIsBlackout] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        setIsBlackout(true);
        // Remove blackout after 3 seconds
        setTimeout(() => setIsBlackout(false), 3000);
      }
    };

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibilityChange = () => {
      if (document.hidden) setIsBlurred(true);
      else setIsBlurred(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isBlackout || isBlurred) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[50] flex flex-col items-center justify-center p-8 rounded-2xl"
          style={{
            backdropFilter: 'blur(16px)',
            background: isBlackout ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.6)',
          }}
        >
          <div className="glass-strong p-8 rounded-2xl flex flex-col items-center max-w-sm text-center shadow-2xl border border-[var(--accent-purple)] border-opacity-30">
            <ShieldAlert size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-white">Security Warning</h2>
            <p className="text-sm text-gray-300">
              {isBlackout 
                ? 'Screenshot detected. This action has been logged.'
                : 'Window lost focus. Content is hidden to protect integrity.'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
