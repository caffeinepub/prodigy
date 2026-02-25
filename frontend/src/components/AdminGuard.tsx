import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ADMIN_PRINCIPAL = 'zhpm4-xby3w-hy7nv-ziwxz-heeqw-f2qf4-p2o5a-qradb';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;
  const isLoading = actorFetching || adminCheckLoading;

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-admin-gold/10 border border-admin-gold/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-admin-gold" />
          </div>
          <h1 className="text-xl font-bold text-admin-gold mb-2">Admin Access Required</h1>
          <p className="text-admin-muted text-sm mb-6">
            You must log in with the authorized admin identity to access this dashboard.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-admin-gold text-admin-sidebar hover:bg-admin-gold/90 font-semibold px-8"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Loading admin check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-admin-gold animate-spin mx-auto mb-3" />
          <p className="text-admin-muted text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-admin-muted text-sm mb-2">
            Your account does not have admin privileges.
          </p>
          <p className="text-admin-muted text-xs mb-6 font-mono bg-admin-card border border-admin-border rounded px-3 py-2">
            {identity?.getPrincipal().toString()}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-admin-border text-admin-muted hover:bg-admin-border"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
