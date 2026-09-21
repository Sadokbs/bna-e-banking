import React from 'react';

interface BnaLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'emerald' | 'white' | 'dark' | 'gradient';
  withContainer?: boolean;
}

/**
 * Official BNA (Banque Nationale Agricole) Emblem Vector Component
 * Mathematically precise reproduction of the BNA geometric leaf/monogram.
 */
export const BnaLogo: React.FC<BnaLogoProps> = ({
  className = 'w-8 h-8',
  variant = 'emerald',
  withContainer = false,
}) => {
  const getColor = () => {
    switch (variant) {
      case 'white':
        return '#FFFFFF';
      case 'dark':
        return '#064e3b';
      case 'gradient':
        return 'url(#bna-gradient)';
      case 'emerald':
      default:
        return '#009a66';
    }
  };

  const svgContent = (
    <svg
      viewBox="0 0 100 90"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo BNA - Banque Nationale Agricole"
    >
      <defs>
        <linearGradient id="bna-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Top Leaf / Ribbon Segment */}
      <path
        d="M 16,36 C 16,22 28,10 44,10 L 72,10 C 82,10 88,16 88,26 L 88,40 C 88,42 86,43.5 84,43.5 L 53,43.5 C 50.5,43.5 49,42 49,39.5 L 49,34 C 49,31.5 47.5,30 45,30 L 32,30 C 23,30 16,33 16,36 Z"
        fill={getColor()}
      />

      {/* Bottom Leaf / Ribbon Segment (Rotational Symmetrical Partner) */}
      <path
        d="M 84,54 C 84,68 72,80 56,80 L 28,80 C 18,80 12,74 12,64 L 12,50 C 12,48 14,46.5 16,46.5 L 47,46.5 C 49.5,46.5 51,48 51,50.5 L 51,56 C 51,58.5 52.5,60 55,60 L 68,60 C 77,60 84,57 84,54 Z"
        fill={getColor()}
      />
    </svg>
  );

  if (withContainer) {
    return (
      <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-center justify-center shadow-md shrink-0">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};

export default BnaLogo;
