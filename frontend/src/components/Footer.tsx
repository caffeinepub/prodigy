import React from 'react';
import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { PRODIGY_LOGO_FULL } from '../constants/brand';

const GENRES = ['Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography'];

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'prodigy-library');

  return (
    <footer className="border-t border-border/40 bg-card/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img
                src={PRODIGY_LOGO_FULL}
                alt="Prodigy"
                className="h-8 w-8 object-contain"
                style={{ borderRadius: '50%', background: '#f3f4f6' }}
              />
              <span className="font-cinzel font-bold text-lg text-foreground">Prodigy</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A decentralized library platform where authors share their work and readers discover new worlds.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-cinzel font-semibold text-foreground mb-3">Navigate</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/browse', label: 'Browse Library' },
                { to: '/dashboard', label: 'Author Dashboard' },
                { to: '/about', label: 'About' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    search={link.to === '/browse' ? { genre: undefined } : undefined}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="font-cinzel font-semibold text-foreground mb-3">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Link
                  key={genre}
                  to="/browse"
                  search={{ genre }}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent border border-border/40 hover:border-accent/30 transition-all"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} Prodigy. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-accent fill-accent" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
