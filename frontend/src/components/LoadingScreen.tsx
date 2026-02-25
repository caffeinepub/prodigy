import React, { useEffect, useState } from 'react';
import { PRODIGY_LOGO_FULL } from '../constants/brand';

interface LoadingScreenProps {
  onDismiss: () => void;
}

export default function LoadingScreen({ onDismiss }: LoadingScreenProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out after 1.5s, fully dismiss at 2s
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1500);

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src={PRODIGY_LOGO_FULL}
          alt="Prodigy — Digital Library For Intelligent Minds"
          className="w-[240px] sm:w-[300px] md:w-[360px] h-auto animate-gold-glow-pulse"
          style={{ filter: 'drop-shadow(0 0 20px rgba(201, 168, 76, 0.5))' }}
        />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
