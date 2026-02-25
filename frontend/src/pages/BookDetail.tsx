import React, { useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetBookById, useGetBookmarks, useAddBookmark, useRemoveBookmark, useIncrementBookView } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Bookmark, BookmarkCheck, Eye, Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function BookDetail() {
  const { id } = useParams({ from: '/book/$id' });
  const bookId = BigInt(id);

  const { data: book, isLoading } = useGetBookById(bookId);
  const { data: bookmarks } = useGetBookmarks();
  const { identity } = useInternetIdentity();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const incrementView = useIncrementBookView();

  const isBookmarked = bookmarks?.some(b => b.bookId === bookId) ?? false;

  useEffect(() => {
    if (book && identity) {
      incrementView.mutate(bookId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id.toString()]);

  const handleBookmark = async () => {
    if (!identity) {
      toast.error('Please log in to bookmark books');
      return;
    }
    try {
      if (isBookmarked) {
        await removeBookmark.mutateAsync(bookId);
        toast.success('Bookmark removed');
      } else {
        await addBookmark.mutateAsync(bookId);
        toast.success('Book bookmarked!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-64 aspect-[2/3] rounded-xl shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl font-semibold mb-2">Book Not Found</h2>
          <p className="text-muted-foreground font-sans mb-6">This book doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to="/browse" search={{ genre: undefined }}>Browse Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground -ml-2">
          <Link to="/browse" search={{ genre: undefined }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Link>
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Cover */}
          <div className="shrink-0 w-full md:w-56 lg:w-64">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-xl border border-border/50">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <BookOpen className="w-16 h-16 text-gold/40" />
                  <span className="text-xs text-muted-foreground font-sans">No Cover</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="border-gold/40 text-gold text-xs">
                {book.genre}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                <Eye className="w-3 h-3" />
                {book.viewCount.toString()} views
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
              {book.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground font-sans">
              <Link
                to="/author/$principal"
                params={{ principal: book.uploadedBy.toString() }}
                className="flex items-center gap-1.5 hover:text-gold transition-colors"
              >
                <User className="w-4 h-4" />
                {book.author}
              </Link>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(book.uploadDate)}
              </span>
            </div>

            <p className="text-foreground/80 font-sans leading-relaxed mb-8 text-base">
              {book.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {book.pdfUrl && (
                <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-light font-semibold">
                  <Link to="/reader/$id" params={{ id: book.id.toString() }}>
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read Now
                  </Link>
                </Button>
              )}

              {identity && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBookmark}
                  disabled={addBookmark.isPending || removeBookmark.isPending}
                  className={isBookmarked
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-border hover:border-gold/50 hover:text-gold'
                  }
                >
                  {addBookmark.isPending || removeBookmark.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 mr-2" />
                  ) : (
                    <Bookmark className="w-5 h-5 mr-2" />
                  )}
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              )}
            </div>

            {!book.pdfUrl && (
              <p className="mt-4 text-sm text-muted-foreground font-sans italic">
                No PDF available for this book.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
