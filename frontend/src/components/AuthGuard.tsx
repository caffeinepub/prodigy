import React from 'react';
import { Link } from '@tanstack/react-router';
import { LogIn, BookOpen } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-foreground mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access this page.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {}}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <Link
              to="/browse"
              search={{ genre: undefined }}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Browse as Guest
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
