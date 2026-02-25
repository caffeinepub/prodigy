import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import {
  useGetBookById,
  useGetBookmarks,
  useAddBookmark,
  useRemoveBookmark,
  useIncrementBookView,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BookOpen, Bookmark, BookmarkCheck, ArrowLeft, Eye, Tag, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SharePopover from '../components/SharePopover';

function CoverImage({ book }: { book: any }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (book?.cover) {
      book.cover.getBytes().then((bytes: Uint8Array<ArrayBuffer>) => {
        const blob = new Blob([bytes as unknown as BlobPart], { type: 'image/jpeg' });
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      });
    }
  }, [book?.cover]);

  if (!url) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
        <BookOpen size={48} className="text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={book.title}
      className="w-full h-full object-cover rounded-xl shadow-lg"
    />
  );
}

export default function BookDetail() {
  const { bookId } = useParams({ from: '/book/$bookId' });
  const bookIdBigInt = BigInt(bookId);

  const { data: book, isLoading } = useGetBookById(bookIdBigInt);
  const { data: bookmarks = [] } = useGetBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const incrementView = useIncrementBookView();
  const { identity } = useInternetIdentity();

  const isBookmarked = bookmarks.some((b) => b.bookId === bookIdBigInt);
  const isAuthenticated = !!identity;

  useEffect(() => {
    if (book && isAuthenticated) {
      incrementView.mutate(bookIdBigInt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id?.toString()]);

  const handleBookmark = () => {
    if (!isAuthenticated) return;
    if (isBookmarked) {
      removeBookmark.mutate(bookIdBigInt);
    } else {
      addBookmark.mutate(bookIdBigInt);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="aspect-[2/3] rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <BookOpen size={64} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Book not found</h2>
        <p className="text-muted-foreground mb-6">
          This book may have been removed or doesn't exist.
        </p>
        <Link to="/browse" search={{ genre: undefined }}>
          <Button>Browse Books</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          to="/browse"
          search={{ genre: undefined }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Cover */}
          <div className="md:col-span-1">
            <div className="aspect-[2/3] w-full max-w-xs mx-auto md:max-w-none">
              <CoverImage book={book} />
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <Eye size={16} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{Number(book.viewCount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <Bookmark size={16} className="mx-auto text-accent-foreground mb-1" />
                <p className="text-lg font-bold text-foreground">—</p>
                <p className="text-xs text-muted-foreground">Bookmarks</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-cinzel leading-tight">
                {book.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <User size={14} className="text-muted-foreground" />
                <p className="text-muted-foreground">
                  by <span className="text-foreground font-medium">{book.author}</span>
                </p>
              </div>
            </div>

            {/* Genres */}
            {book.genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-muted-foreground" />
                {book.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Upload date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>Published {formatDate(book.uploadDate)}</span>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                About this book
              </h2>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {book.pdf && isAuthenticated && (
                <Link to="/reader/$bookId" params={{ bookId: bookId }}>
                  <Button className="gap-2">
                    <BookOpen size={16} />
                    Read Now
                  </Button>
                </Link>
              )}

              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  disabled={addBookmark.isPending || removeBookmark.isPending}
                  className={`gap-2 ${isBookmarked ? 'border-accent text-accent-foreground' : ''}`}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck size={16} className="text-accent-foreground" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      Bookmark
                    </>
                  )}
                </Button>
              )}

              <SharePopover bookId={book.id} bookTitle={book.title} />
            </div>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                <Link to="/" className="text-primary underline">
                  Log in
                </Link>{' '}
                to read and bookmark this book.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
