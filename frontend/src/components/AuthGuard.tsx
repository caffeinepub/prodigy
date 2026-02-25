import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import LoginButton from './LoginButton';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          <p className="text-muted-foreground font-sans">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">Authentication Required</h2>
          <p className="text-muted-foreground font-sans mb-6">
            You need to be logged in to access this page. Please log in with your Internet Identity to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <LoginButton />
            <Button variant="outline" asChild>
              <Link to="/browse" search={{ genre: undefined }}>Browse Books</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
