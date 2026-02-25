import { useState, useEffect } from 'react';
import { useGetPendingBooks, useApproveBook, useRejectBook } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { BookView } from '../backend';

function BookCover({ book }: { book: BookView }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (book.cover) {
      book.cover.getBytes().then((bytes) => {
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        setCoverUrl(objectUrl);
      }).catch(() => setCoverUrl(null));
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [book.cover]);

  if (coverUrl) {
    return <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <BookOpen className="w-5 h-5 text-muted-foreground" />
    </div>
  );
}

export default function PendingBooksQueue() {
  const { data: pendingBooks, isLoading } = useGetPendingBooks();
  const approveBook = useApproveBook();
  const rejectBook = useRejectBook();

  const handleApprove = async (bookId: bigint, title: string) => {
    try {
      await approveBook.mutateAsync(bookId);
      toast.success(`"${title}" has been approved.`);
    } catch {
      toast.error('Failed to approve book.');
    }
  };

  const handleReject = async (bookId: bigint, title: string) => {
    try {
      await rejectBook.mutateAsync(bookId);
      toast.success(`"${title}" has been rejected.`);
    } catch {
      toast.error('Failed to reject book.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!pendingBooks || pendingBooks.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="text-muted-foreground">No pending books. All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingBooks.map((book) => (
        <div
          key={book.id.toString()}
          className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50"
        >
          {/* Cover thumbnail */}
          <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-muted">
            <BookCover book={book} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm line-clamp-1">{book.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
            <div className="flex items-center gap-2 mt-1">
              {book.genres.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {book.genres[0]}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(Number(book.uploadDate) / 1_000_000).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600/30 hover:bg-green-600/10 h-8 px-2"
              onClick={() => handleApprove(book.id, book.title)}
              disabled={approveBook.isPending || rejectBook.isPending}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 px-2"
              onClick={() => handleReject(book.id, book.title)}
              disabled={approveBook.isPending || rejectBook.isPending}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
