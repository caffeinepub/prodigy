import React, { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [displayName, setDisplayName] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        displayName: displayName.trim(),
        joinDate: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success(`Welcome to Prodigy, ${displayName.trim()}!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile.');
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <User className="w-7 h-7 text-accent" />
          </div>
        </div>
        <h2 className="font-cinzel text-xl font-bold text-foreground text-center mb-1">
          Welcome to Prodigy
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choose a display name to get started.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={saveProfile.isPending || !displayName.trim()}
            className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
