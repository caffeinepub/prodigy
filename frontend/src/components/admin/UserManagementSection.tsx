import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Users, Search, Trash2, ShieldOff, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { User } from '../../backend';
import { UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';

const ITEMS_PER_PAGE = 10;

export default function UserManagementSection() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // We fetch all users by getting their profiles via the available API
      // Since there's no getAllUsers endpoint, we note this as a gap
      // For now return empty array - backend gap
      return [];
    },
    enabled: !!actor && !actorFetching,
  });

  const banMutation = useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignCallerUserRole(Principal.fromText(principal), UserRole.guest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User access restricted successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to restrict user: ${err.message}`);
    },
  });

  const filtered = (users || []).filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.principal.toString().toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const formatDate = (time: bigint) => {
    return new Date(Number(time) / 1_000_000).toLocaleDateString();
  };

  const truncatePrincipal = (p: Principal) => {
    const s = p.toString();
    return s.length > 20 ? `${s.slice(0, 10)}...${s.slice(-6)}` : s;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-gold">User Management</h1>
        <p className="text-admin-muted text-sm mt-1">View and manage platform users</p>
      </div>

      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-admin-gold" />
              All Users
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 bg-admin-bg border-admin-border text-admin-text placeholder:text-admin-muted"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-admin-border" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-admin-muted mx-auto mb-3 opacity-50" />
              <p className="text-admin-muted text-sm">
                {search ? 'No users match your search' : 'No registered users yet'}
              </p>
              <p className="text-admin-muted text-xs mt-1 opacity-70">
                Note: Full user listing requires a backend getAllUsers endpoint
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-admin-border">
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Principal</th>
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Joined</th>
                      <th className="text-right py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/50">
                    {paginated.map((user) => (
                      <tr key={user.principal.toString()} className="hover:bg-admin-border/20 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-admin-gold/20 flex items-center justify-center shrink-0">
                              <span className="text-admin-gold text-xs font-bold">
                                {user.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-admin-text font-medium">{user.displayName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <code className="text-admin-muted text-xs bg-admin-bg px-2 py-1 rounded">
                            {truncatePrincipal(user.principal)}
                          </code>
                        </td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <span className="text-admin-muted text-xs">{formatDate(user.joinDate)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => banMutation.mutate(user.principal.toString())}
                              disabled={banMutation.isPending}
                              className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 h-8 px-2"
                            >
                              <ShieldOff className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Restrict</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-admin-border">
                  <p className="text-admin-muted text-xs">
                    Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="border-admin-border text-admin-text hover:bg-admin-border h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="border-admin-border text-admin-text hover:bg-admin-border h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
