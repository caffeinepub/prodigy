import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-foreground mb-3">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in with your admin credentials to access the admin panel.
          </p>
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="gap-2"
          >
            <Shield className="w-4 h-4" />
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-foreground mb-3">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You do not have admin privileges to access this page.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
