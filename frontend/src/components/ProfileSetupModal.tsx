import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterUser, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, BookOpen } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const registerUser = useRegisterUser();
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError('Please enter your display name');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    try {
      await registerUser.mutateAsync(name);
      await saveProfile.mutateAsync({
        displayName: name,
        joinDate: BigInt(Date.now()) * BigInt(1_000_000),
      });
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  const isLoading = registerUser.isPending || saveProfile.isPending;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md border-gold/20 bg-card" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gold" />
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl text-center">Welcome to Prodigy</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose a display name to begin your journey as a reader and author.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground font-medium">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Marcus Aurelius"
              className="border-border focus:border-gold focus:ring-gold/20"
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !displayName.trim()}
            className="w-full bg-gold text-navy-deep hover:bg-gold-light font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Enter the Library'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
