import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import {
  BookOpen, Search, Trash2, CheckCircle, XCircle, Star, StarOff,
  Edit, Filter, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { BookView } from '../../backend';
import { BookStatus } from '../../backend';

const GENRES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Philosophy', 'Biography', 'Self-Help', 'Other'];
const ITEMS_PER_PAGE = 10;

function StatusBadge({ status }: { status: BookStatus }) {
  if (status === BookStatus.approved) return <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">Approved</Badge>;
  if (status === BookStatus.pending) return <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-xs">Pending</Badge>;
  return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs">Rejected</Badge>;
}

interface EditBookForm {
  title: string;
  author: string;
  description: string;
  genre: string;
  coverUrl: string;
  pdfUrl: string;
}

export default function BookManagementSection() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [editBook, setEditBook] = useState<BookView | null>(null);
  const [editForm, setEditForm] = useState<EditBookForm>({ title: '', author: '', description: '', genre: '', coverUrl: '', pdfUrl: '' });

  const { data: approvedBooks, isLoading: approvedLoading } = useQuery<BookView[]>({
    queryKey: ['approvedBooks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getApprovedBooks();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: pendingBooks, isLoading: pendingLoading } = useQuery<BookView[]>({
    queryKey: ['pendingBooks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingBooks();
    },
    enabled: !!actor && !actorFetching,
  });

  const allBooks: BookView[] = [...(approvedBooks || []), ...(pendingBooks || [])];
  const isLoading = approvedLoading || pendingLoading || actorFetching;

  const approveMutation = useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['pendingBooks'] });
      toast.success('Book approved successfully');
    },
    onError: (err: Error) => toast.error(`Failed to approve: ${err.message}`),
  });

  const rejectMutation = useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['pendingBooks'] });
      toast.success('Book rejected');
    },
    onError: (err: Error) => toast.error(`Failed to reject: ${err.message}`),
  });

  const editMutation = useMutation({
    mutationFn: async ({ bookId, form }: { bookId: bigint; form: EditBookForm }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editBook(bookId, form.title, form.author, form.description, form.genre, form.coverUrl, form.pdfUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['pendingBooks'] });
      setEditBook(null);
      toast.success('Book updated successfully');
    },
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
  });

  const openEdit = (book: BookView) => {
    setEditBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      coverUrl: book.coverUrl,
      pdfUrl: book.pdfUrl,
    });
  };

  const filtered = allBooks.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchGenre = genreFilter === 'all' || b.genre === genreFilter;
    return matchSearch && matchStatus && matchGenre;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const formatDate = (time: bigint) => new Date(Number(time) / 1_000_000).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-gold">Book Management</h1>
        <p className="text-admin-muted text-sm mt-1">Manage all books on the platform</p>
      </div>

      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-admin-gold" />
              All Books ({allBooks.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted" />
                <Input
                  placeholder="Search by title or author..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  className="pl-9 bg-admin-bg border-admin-border text-admin-text placeholder:text-admin-muted"
                />
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-36 bg-admin-bg border-admin-border text-admin-text">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  <SelectItem value="all" className="text-admin-text">All Status</SelectItem>
                  <SelectItem value="approved" className="text-admin-text">Approved</SelectItem>
                  <SelectItem value="pending" className="text-admin-text">Pending</SelectItem>
                  <SelectItem value="rejected" className="text-admin-text">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genreFilter} onValueChange={v => { setGenreFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-36 bg-admin-bg border-admin-border text-admin-text">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  <SelectItem value="all" className="text-admin-text">All Genres</SelectItem>
                  {GENRES.map(g => (
                    <SelectItem key={g} value={g} className="text-admin-text">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-admin-border" />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-admin-muted mx-auto mb-3 opacity-50" />
              <p className="text-admin-muted text-sm">No books found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-admin-border">
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider">Book</th>
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Genre</th>
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Views</th>
                      <th className="text-right py-3 px-2 text-admin-muted font-medium text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/50">
                    {paginated.map((book) => (
                      <tr key={Number(book.id)} className="hover:bg-admin-border/20 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {book.coverUrl && book.coverUrl.startsWith('data:') ? (
                              <img src={book.coverUrl} alt={book.title} className="h-10 w-8 object-cover rounded shrink-0" />
                            ) : (
                              <div className="h-10 w-8 bg-admin-gold/10 rounded flex items-center justify-center shrink-0">
                                <BookOpen className="h-4 w-4 text-admin-gold" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-admin-text font-medium text-sm truncate max-w-[140px]">{book.title}</p>
                              <p className="text-admin-muted text-xs truncate">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <span className="text-admin-muted text-xs">{book.genre}</span>
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={book.status} />
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className="text-admin-muted text-xs">{Number(book.viewCount)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(book)}
                              className="h-7 w-7 text-admin-muted hover:text-admin-text hover:bg-admin-border"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            {book.status !== BookStatus.approved && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => approveMutation.mutate(book.id)}
                                disabled={approveMutation.isPending}
                                className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                                title="Approve"
                              >
                                {approveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                            {book.status !== BookStatus.rejected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => rejectMutation.mutate(book.id)}
                                disabled={rejectMutation.isPending}
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                title="Reject"
                              >
                                {rejectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                              </Button>
                            )}
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

      {/* Edit Dialog */}
      <Dialog open={!!editBook} onOpenChange={(open) => !open && setEditBook(null)}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-admin-gold">Edit Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-admin-muted text-xs">Title</Label>
              <Input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                className="bg-admin-bg border-admin-border text-admin-text"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-admin-muted text-xs">Author</Label>
              <Input
                value={editForm.author}
                onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))}
                className="bg-admin-bg border-admin-border text-admin-text"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-admin-muted text-xs">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                className="bg-admin-bg border-admin-border text-admin-text resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-admin-muted text-xs">Genre</Label>
              <Select value={editForm.genre} onValueChange={v => setEditForm(f => ({ ...f, genre: v }))}>
                <SelectTrigger className="bg-admin-bg border-admin-border text-admin-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  {GENRES.map(g => (
                    <SelectItem key={g} value={g} className="text-admin-text">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditBook(null)}
              className="border-admin-border text-admin-muted hover:bg-admin-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => editBook && editMutation.mutate({ bookId: editBook.id, form: editForm })}
              disabled={editMutation.isPending}
              className="bg-admin-gold text-admin-sidebar hover:bg-admin-gold/90"
            >
              {editMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
