import React from 'react';
import { Link } from '@tanstack/react-router';
import { GENRE_ICONS, GENRE_DESCRIPTIONS } from '../lib/utils';

interface GenreCardProps {
  genre: string;
}

export default function GenreCard({ genre }: GenreCardProps) {
  return (
    <Link
      to="/browse"
      search={{ genre }}
      className="group block genre-card-hover"
    >
      <div
        className="relative rounded-xl overflow-hidden border border-border/50 group-hover:border-gold/40 transition-colors"
        style={{ minHeight: '180px' }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ backgroundImage: 'url(/assets/generated/genre-card-bg.dim_600x400.png)' }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-deep/80 via-navy-mid/60 to-transparent dark:from-navy-deep/90 dark:via-navy-mid/70" />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col h-full min-h-[180px]">
          <div className="text-3xl mb-3">{GENRE_ICONS[genre]}</div>
          <h3 className="font-serif text-xl font-semibold text-white mb-2 group-hover:text-gold transition-colors">
            {genre}
          </h3>
          <p className="text-sm text-white/60 font-sans leading-relaxed line-clamp-2">
            {GENRE_DESCRIPTIONS[genre]}
          </p>
          <div className="mt-auto pt-4">
            <span className="text-xs text-gold/70 font-sans font-medium uppercase tracking-wider group-hover:text-gold transition-colors">
              Explore →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
