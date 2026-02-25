import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import LoginButton from './LoginButton';
import ThemeToggle from './ThemeToggle';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODIGY_LOGO_FULL } from '../constants/brand';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/genres', label: 'Genres' },
  { to: '/browse', label: 'Browse' },
  { to: '/about', label: 'About' },
];

const NAVBAR_BG = '#0a0a0a';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const location = useLocation();

  const allLinks = [
    ...navLinks,
    ...(isAuthenticated ? [
      { to: '/upload', label: 'Upload' },
      { to: '/dashboard', label: 'Dashboard' },
    ] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: true }] : []),
  ];

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/10"
      style={{ backgroundColor: NAVBAR_BG, backgroundImage: 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0"
          >
            <img
              src={PRODIGY_LOGO_FULL}
              alt="Prodigy — Digital Library For Intelligent Minds"
              style={{
                height: '44px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
                maxWidth: '160px',
                borderRadius: '50%',
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  isActive(link.to)
                    ? 'text-gold bg-gold/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {'icon' in link && link.icon && <Shield className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LoginButton />
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9 text-white hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-white/10"
          style={{ backgroundColor: NAVBAR_BG, backgroundImage: 'none' }}
        >
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(link.to)
                    ? 'text-gold bg-gold/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {'icon' in link && link.icon && <Shield className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
