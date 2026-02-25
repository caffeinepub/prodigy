import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { useGetBookById, useGetReadingProgress, useSaveReadingProgress } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Reader() {
  const { bookId } = useParams({ from: '/reader/$bookId' });
  const { identity } = useInternetIdentity();
  const bookIdBigInt = BigInt(bookId);

  const { data: book, isLoading: bookLoading } = useGetBookById(bookIdBigInt);
  const { data: progress } = useGetReadingProgress(identity ? bookIdBigInt : null);
  const saveProgress = useSaveReadingProgress();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (book?.pdf) {
      setLoadingPdf(true);
      book.pdf.getBytes().then((bytes) => {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setLoadingPdf(false);
      }).catch(() => {
        setLoadingPdf(false);
      });
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [book?.pdf]);

  // Save progress periodically
  useEffect(() => {
    if (!identity || !book) return;
    const interval = setInterval(() => {
      saveProgress.mutate({ bookId: bookIdBigInt, lastPage: BigInt(1) });
    }, 30000);
    return () => clearInterval(interval);
  }, [identity, book?.id.toString()]);

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-cinzel text-xl font-semibold text-foreground mb-2">Book Not Found</h2>
          <Link to="/browse" search={{ genre: undefined }} className="text-accent hover:underline text-sm">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Reader Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm px-4 py-3 flex items-center gap-4 shrink-0">
        <Link
          to="/book/$bookId"
          params={{ bookId }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-cinzel text-sm font-semibold text-foreground truncate">
            {book.title}
          </h1>
          <p className="text-xs text-muted-foreground">by {book.author}</p>
        </div>
        {progress && (
          <span className="text-xs text-muted-foreground shrink-0">
            Last read: {new Date(Number(progress.lastRead) / 1_000_000).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative">
        {loadingPdf ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full min-h-[calc(100vh-4rem)]"
            title={book.title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No PDF available for this book.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
