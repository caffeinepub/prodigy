import React from 'react';

interface CelestialDividerProps {
  className?: string;
}

export default function CelestialDivider({ className = '' }: CelestialDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-4 py-2 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex items-center gap-2 text-gold/60">
        <span className="text-xs">✦</span>
        <span className="text-sm">✦</span>
        <span className="text-xs">✦</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
