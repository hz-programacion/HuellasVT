import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

/**
 * Custom Contextual Follower Cursor (Desktop pointer:fine only)
 * Displays dynamic editorial labels ("VER FICHA", "ZOOM", "AFICHE", "VERIFICAR")
 * when hovering interactive elements with [data-cursor="..."].
 */
export const CustomCursor: React.FC = () => {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const springConfig = { damping: 28, stiffness: 380, mass: 0.4 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: fine)');
    setIsFinePointer(media.matches);

    if (!media.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      const cursorEl = target?.closest('[data-cursor]') as HTMLElement | null;
      if (cursorEl) {
        setLabel(cursorEl.getAttribute('data-cursor'));
      } else {
        setLabel(null);
      }
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, visible]);

  if (!isFinePointer || !visible) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      className="fixed top-0 left-0 z-[9998] pointer-events-none hidden lg:flex items-center justify-center"
    >
      <motion.div
        animate={{
          scale: label ? 1 : 0.35,
          opacity: label ? 0.96 : 0.45,
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className={
          label
            ? 'px-3 py-1.5 rounded-full bg-[#111315] dark:bg-white text-white dark:text-[#111315] font-mono font-bold text-[10px] tracking-wider uppercase shadow-xl border border-[#FF4D38]/50 whitespace-nowrap'
            : 'w-5 h-5 rounded-full border-2 border-[#FF4D38]'
        }
      >
        {label || ''}
      </motion.div>
    </motion.div>
  );
};
