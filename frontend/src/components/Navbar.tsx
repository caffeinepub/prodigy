import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, BookOpen } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { PRODIGY_LOGO_FULL } from '../constants/brand';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/about', label: 'About' },
  ];

  const authLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/upload', label: 'Upload' },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={PRODIGY_LOGO_FULL}
              alt="Prodigy"
              className="h-10 w-10 rounded-full object-cover"
              style={{ background: 'oklch(0.93 0.02 240)' }}
            />
            <span className="font-cinzel font-bold text-lg text-foreground hidden sm:block">
              Prodigy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[...navLinks, ...authLinks].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                {...(link.to === '/browse' ? { search: { genre: undefined } } : {})}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: 'px-3 py-2 rounded-md text-sm font-medium text-primary bg-primary/10' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Button */}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="hidden md:flex"
            >
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-3 space-y-1">
          {[...navLinks, ...authLinks].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              {...(link.to === '/browse' ? { search: { genre: undefined } } : {})}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            <Button
              onClick={() => { handleAuth(); setMobileOpen(false); }}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="w-full"
            >
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
