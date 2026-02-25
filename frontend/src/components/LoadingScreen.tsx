import React from 'react';
import { PRODIGY_LOGO_FULL } from '../constants/brand';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src={PRODIGY_LOGO_FULL}
          alt="Prodigy"
          className="w-20 h-20 object-contain animate-gold-glow-pulse"
          style={{ borderRadius: '50%' }}
        />
        <p className="font-cinzel text-lg font-semibold text-foreground animate-pulse">
          Prodigy
        </p>
      </div>
    </div>
  );
}
