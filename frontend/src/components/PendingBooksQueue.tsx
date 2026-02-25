import React from 'react';
import { type BookView } from '../backend';
import { useApproveBook, useRejectBook } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PendingBooksQueueProps {
  books: BookView[];
}

export default function PendingBooksQueue({ books }: PendingBooksQueueProps) {
  const approveBook = useApproveBook();
  const rejectBook = useRejectBook();

  const handleApprove = async (bookId: bigint, title: string) => {
    try {
      await approveBook.mutateAsync(bookId);
      toast.success(`"${title}" has been approved`);
    } catch {
      toast.error('Failed to approve book');
    }
  };

  const handleReject = async (bookId: bigint, title: string) => {
    try {
      await rejectBook.mutateAsync(bookId);
      toast.error(`"${title}" has been rejected`);
    } catch {
      toast.error('Failed to reject book');
    }
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
        <p className="font-sans">No books pending review. All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map(book => (
        <div
          key={book.id.toString()}
          className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-lg"
        >
          {/* Cover thumbnail */}
          <div className="w-12 h-16 rounded bg-muted shrink-0 overflow-hidden">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-semibold text-foreground truncate">{book.title}</h4>
            <p className="text-sm text-muted-foreground font-sans">{book.author}</p>
            <Badge variant="outline" className="mt-1 text-xs border-gold/30 text-gold/80">
              {book.genre}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => handleApprove(book.id, book.title)}
              disabled={approveBook.isPending || rejectBook.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approveBook.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="ml-1 hidden sm:inline">Approve</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(book.id, book.title)}
              disabled={approveBook.isPending || rejectBook.isPending}
            >
              {rejectBook.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="ml-1 hidden sm:inline">Reject</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
