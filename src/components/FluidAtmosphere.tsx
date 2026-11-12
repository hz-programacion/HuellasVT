import React, { useEffect, useState } from 'react';

interface FluidAtmosphereProps {
  currentTab: 'radar' | 'adoptions' | 'emergency' | 'directory';
}

/**
 * Context-Aware Interactive Fluid Mesh Atmosphere + Invisible Gooey SVG Filter
 * Changes chromatic temperature smoothly according to the active section in Venado Tuerto:
 * - radar: Warm Electric Coral & Amber
 * - adoptions: Sanctuary Violet & Rose
 * - emergency: Active Guard Emerald
 * - directory: Editorial Gold
 */
export const FluidAtmosphere: React.FC<FluidAtmosphereProps> = ({ currentTab }) => {
  const [pointer, setPointer] = useState({ x: 50, y: 25 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setPointer({ x, y });
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  const palette = {
    radar: {
      primary: 'rgba(255, 77, 56, 0.085)',
      secondary: 'rgba(245, 158, 11, 0.065)',
    },
    adoptions: {
      primary: 'rgba(124, 58, 237, 0.09)',
      secondary: 'rgba(236, 72, 153, 0.06)',
    },
    emergency: {
      primary: 'rgba(16, 185, 129, 0.095)',
      secondary: 'rgba(5, 150, 105, 0.06)',
    },
    directory: {
      primary: 'rgba(245, 158, 11, 0.09)',
      secondary: 'rgba(255, 77, 56, 0.055)',
    },
  }[currentTab];

  return (
    <>
      {/* Invisible SVG Gooey Filter for liquid metaball UI interactions */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="huella-gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Pointer-Reactive Ambient Mesh */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700"
        style={{
          background: `
            radial-gradient(680px circle at ${pointer.x}% ${pointer.y}%, ${palette.primary}, transparent 70%),
            radial-gradient(540px circle at ${100 - pointer.x}% ${Math.min(90, pointer.y + 20)}%, ${palette.secondary}, transparent 75%)
          `,
        }}
      />
    </>
  );
};
