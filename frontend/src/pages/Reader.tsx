import React, { useCallback, useRef } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetBookById, useGetReadingProgress, useSaveReadingProgress } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PDFViewer from '../components/PDFViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function Reader() {
  const { id } = useParams({ from: '/reader/$id' });
  const bookId = BigInt(id);

  const { data: book, isLoading: bookLoading } = useGetBookById(bookId);
  const { data: progress, isLoading: progressLoading } = useGetReadingProgress(bookId);
  const { identity } = useInternetIdentity();
  const saveProgress = useSaveReadingProgress();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePageChange = useCallback((page: number) => {
    if (!identity) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress.mutate({ bookId, lastPage: BigInt(page) });
    }, 800);
  }, [identity, bookId, saveProgress]);

  if (bookLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          <p className="text-muted-foreground font-sans">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl font-semibold mb-2">Book Not Found</h2>
          <Button asChild variant="outline">
            <Link to="/browse" search={{ genre: undefined }}>Browse Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!book.pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl font-semibold mb-2">No PDF Available</h2>
          <p className="text-muted-foreground font-sans mb-6">This book doesn't have a PDF file.</p>
          <Button asChild variant="outline">
            <Link to="/book/$id" params={{ id: id }}>Back to Book</Link>
          </Button>
        </div>
      </div>
    );
  }

  const initialPage = progress ? Number(progress.lastPage) : 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Reader header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild className="shrink-0 w-8 h-8">
              <Link to="/book/$id" params={{ id: id }}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-sm text-foreground truncate">{book.title}</p>
              <p className="text-xs text-muted-foreground font-sans truncate">{book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {progress && identity && (
              <span className="text-xs text-muted-foreground font-sans hidden sm:block">
                Resumed from page {progress.lastPage.toString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6">
        <PDFViewer
          pdfUrl={book.pdfUrl}
          initialPage={initialPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
