import React from 'react';
import { Link } from '@tanstack/react-router';
import { GENRES, GENRE_ICONS } from '../lib/utils';

export default function GenreQuickLinks() {
  return (
    <section className="py-12 px-4 sm:px-6 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-gold font-sans text-sm font-medium uppercase tracking-wider mb-6">
          Explore by Genre
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {GENRES.map(genre => (
            <Link
              key={genre}
              to="/browse"
              search={{ genre }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-gold/50 bg-card hover:bg-gold/5 text-sm font-sans text-muted-foreground hover:text-gold transition-all duration-200"
            >
              <span>{GENRE_ICONS[genre]}</span>
              <span>{genre}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
