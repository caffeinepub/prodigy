import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Shield, UserX, AlertTriangle, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { UserRole } from '../../backend';
import type { BookView } from '../../backend';

export default function SecuritySection() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [blockPrincipal, setBlockPrincipal] = useState('');
  const [principalError, setPrincipalError] = useState('');

  const { data: pendingBooks, isLoading: pendingLoading } = useQuery<BookView[]>({
    queryKey: ['pendingBooks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingBooks();
    },
    enabled: !!actor && !actorFetching,
  });

  const blockUserMutation = useMutation({
    mutationFn: async (principalStr: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalStr);
      await actor.assignCallerUserRole(principal, UserRole.guest);
    },
    onSuccess: () => {
      toast.success('User has been restricted successfully.');
      setBlockPrincipal('');
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to restrict user: ${err.message}`);
    },
  });

  const validatePrincipal = (value: string) => {
    if (!value) {
      setPrincipalError('');
      return;
    }
    try {
      Principal.fromText(value);
      setPrincipalError('');
    } catch {
      setPrincipalError('Invalid principal format');
    }
  };

  const handleBlock = () => {
    if (!blockPrincipal || principalError) return;
    blockUserMutation.mutate(blockPrincipal);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-gold">Security</h1>
        <p className="text-admin-muted text-sm mt-1">Manage platform security and user access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block User */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader>
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <UserX className="h-4 w-4 text-admin-gold" />
              Restrict User Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-admin-muted text-sm">
              Restrict a user's access by downgrading their role to guest. Enter their principal ID below.
            </p>
            <div className="space-y-2">
              <Label className="text-admin-text text-sm">Principal ID</Label>
              <Input
                value={blockPrincipal}
                onChange={e => {
                  setBlockPrincipal(e.target.value);
                  validatePrincipal(e.target.value);
                }}
                placeholder="aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
                className="bg-admin-bg border-admin-border text-admin-text placeholder:text-admin-muted font-mono text-xs"
              />
              {principalError && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {principalError}
                </p>
              )}
            </div>
            <Button
              onClick={handleBlock}
              disabled={!blockPrincipal || !!principalError || blockUserMutation.isPending}
              className="w-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              variant="outline"
            >
              {blockUserMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Restricting...</>
              ) : (
                <><UserX className="h-4 w-4 mr-2" />Restrict User</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader>
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-admin-gold" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Content Moderation', status: 'Active', ok: true },
              { label: 'User Authentication', status: 'Internet Identity', ok: true },
              { label: 'Admin Access Control', status: 'Enabled', ok: true },
              { label: 'Decentralized Storage', status: 'On-Chain', ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-admin-border/50 last:border-0">
                <span className="text-admin-text text-sm">{item.label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${item.ok ? 'text-green-400' : 'text-red-400'}`}>
                  <CheckCircle className="h-3.5 w-3.5" />
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending Content Review */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-text flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-admin-gold" />
            Pending Content Review ({pendingBooks?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-admin-border" />)}
            </div>
          ) : !pendingBooks || pendingBooks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="text-admin-muted text-sm">No content pending review</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingBooks.map((book) => (
                <div
                  key={book.id.toString()}
                  className="flex items-center gap-3 p-3 rounded-lg bg-admin-bg border border-admin-border/50"
                >
                  <div className="w-8 h-10 bg-admin-gold/10 rounded flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-admin-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-admin-text text-sm font-medium truncate">{book.title}</p>
                    <p className="text-admin-muted text-xs">
                      by {book.author}
                      {book.genres.length > 0 && ` · ${book.genres[0]}`}
                    </p>
                  </div>
                  <span className="text-admin-muted text-xs shrink-0">
                    {new Date(Number(book.uploadDate) / 1_000_000).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
