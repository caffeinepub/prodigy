import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Shield, UserX, Search, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';

export default function SecuritySection() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [blockPrincipal, setBlockPrincipal] = useState('');
  const [principalError, setPrincipalError] = useState('');

  const { data: pendingBooks, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingBooks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingBooks();
    },
    enabled: !!actor && !actorFetching,
  });

  const blockMutation = useMutation({
    mutationFn: async (principalStr: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalStr);
      await actor.assignCallerUserRole(principal, UserRole.guest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setBlockPrincipal('');
      setPrincipalError('');
      toast.success('Account access restricted successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to restrict account: ${err.message}`);
    },
  });

  const validateAndBlock = () => {
    setPrincipalError('');
    if (!blockPrincipal.trim()) {
      setPrincipalError('Please enter a principal ID');
      return;
    }
    try {
      Principal.fromText(blockPrincipal.trim());
      blockMutation.mutate(blockPrincipal.trim());
    } catch {
      setPrincipalError('Invalid principal ID format');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-gold">Security Control</h1>
        <p className="text-admin-muted text-sm mt-1">Monitor and secure the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Account */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <UserX className="h-4 w-4 text-red-400" />
              Block Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-admin-muted text-sm">
              Restrict a user's access by their principal ID. This downgrades their role to guest, preventing uploads and interactions.
            </p>
            <div className="space-y-2">
              <Label className="text-admin-muted text-xs">Principal ID</Label>
              <Input
                placeholder="e.g. aaaaa-aa or full principal..."
                value={blockPrincipal}
                onChange={e => { setBlockPrincipal(e.target.value); setPrincipalError(''); }}
                className="bg-admin-bg border-admin-border text-admin-text placeholder:text-admin-muted font-mono text-sm"
              />
              {principalError && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {principalError}
                </p>
              )}
            </div>
            <Button
              onClick={validateAndBlock}
              disabled={blockMutation.isPending || !blockPrincipal.trim()}
              className="w-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
              variant="outline"
            >
              {blockMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              Restrict Account
            </Button>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-green-400" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-admin-bg border border-admin-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-admin-text text-sm">Admin Authentication</span>
                </div>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-admin-bg border border-admin-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-admin-text text-sm">Role-Based Access Control</span>
                </div>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-admin-bg border border-admin-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-admin-text text-sm">Internet Identity</span>
                </div>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">Secured</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-admin-bg border border-admin-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-admin-text text-sm">On-Chain Storage</span>
                </div>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">ICP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Books Requiring Review */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-admin-text flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            Content Awaiting Review
            {pendingBooks && pendingBooks.length > 0 && (
              <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-xs ml-1">
                {pendingBooks.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-admin-border" />)}
            </div>
          ) : pendingBooks && pendingBooks.length > 0 ? (
            <div className="space-y-2">
              {pendingBooks.slice(0, 10).map(book => (
                <div key={Number(book.id)} className="flex items-center gap-3 p-3 rounded-lg bg-admin-bg border border-orange-500/20">
                  <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-admin-text text-sm font-medium truncate">{book.title}</p>
                    <p className="text-admin-muted text-xs">by {book.author} · {book.genre}</p>
                  </div>
                  <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-xs shrink-0">
                    Pending
                  </Badge>
                </div>
              ))}
              {pendingBooks.length > 10 && (
                <p className="text-admin-muted text-xs text-center pt-2">
                  +{pendingBooks.length - 10} more — review in Book Management
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2 opacity-70" />
              <p className="text-admin-muted text-sm">All content has been reviewed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
