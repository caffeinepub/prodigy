import React from 'react';
import GenreCard from '../components/GenreCard';
import CelestialDivider from '../components/CelestialDivider';
import { GENRES } from '../lib/utils';

export default function Genres() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-deep/20 to-transparent py-16 px-4 sm:px-6 text-center border-b border-border/30">
        <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-3">Explore</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Browse by Genre
        </h1>
        <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto">
          Navigate the breadth of human knowledge. Each genre is a doorway into a different dimension of thought.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {GENRES.map(genre => (
            <GenreCard key={genre} genre={genre} />
          ))}
        </div>

        <CelestialDivider className="mt-16 mb-8" />

        <div className="text-center text-muted-foreground font-sans text-sm">
          <p>Can't find what you're looking for? Browse all books in our{' '}
            <a href="/browse" className="text-gold hover:text-gold-light transition-colors">complete library</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
