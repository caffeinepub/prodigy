import React from 'react';
import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import CelestialDivider from './CelestialDivider';
import { PRODIGY_LOGO_FULL } from '../constants/brand';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'prodigy-library');

  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={PRODIGY_LOGO_FULL}
                alt="Prodigy — Digital Library For Intelligent Minds"
                className="w-32 h-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              A sovereign digital archive for thinkers, readers, and authors. Knowledge preserved, immutably.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-foreground text-sm uppercase tracking-wider">Navigate</h4>
            <nav className="flex flex-col gap-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/genres', label: 'Genres' },
                { to: '/browse', label: 'Browse' },
                { to: '/about', label: 'About' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Genres */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-foreground text-sm uppercase tracking-wider">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {['Philosophy', 'Fiction', 'Science', 'History', 'Poetry'].map(genre => (
                <Link
                  key={genre}
                  to="/browse"
                  search={{ genre }}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors font-sans border border-border/50 rounded px-2 py-0.5 hover:border-gold/30"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <CelestialDivider />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
          <p className="text-xs text-muted-foreground font-sans">
            © {year} Prodigy. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-gold fill-gold" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
