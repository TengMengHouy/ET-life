'use client';

import { useEffect, useState } from 'react';

interface AntiCheatLog {
  type: 'blur' | 'visibilitychange' | 'copy' | 'paste' | 'contextmenu';
  timestamp: Date;
  details?: string;
}

export function useAntiCheat() {
  const [logs, setLogs] = useState<AntiCheatLog[]>([]);

  const addLog = (type: AntiCheatLog['type'], details?: string) => {
    setLogs((prev) => [...prev, { type, timestamp: new Date(), details }]);
  };

  useEffect(() => {
    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addLog(e.type as AntiCheatLog['type']);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addLog('contextmenu');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addLog('visibilitychange', 'User switched tabs or minimized window');
      }
    };

    const handleBlur = () => {
      addLog('blur', 'Window lost focus');
    };

    // Attach listeners
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      // Cleanup
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { logs };
}
