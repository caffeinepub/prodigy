import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (params: { url: string; withCredentials?: boolean }) => {
        promise: Promise<PDFDocumentProxy>;
      };
      GlobalWorkerOptions: { workerSrc: string };
    };
  }
}

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNum: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
}

export default function PDFViewer({ pdfUrl, initialPage = 1, onPageChange }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  // Load PDF.js from CDN
  useEffect(() => {
    if (window.pdfjsLib) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setScriptLoaded(true);
    };
    script.onerror = () => setError('Failed to load PDF viewer library');
    document.head.appendChild(script);
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!scriptLoaded || !pdfUrl) return;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const loadingTask = window.pdfjsLib.getDocument({ url: pdfUrl });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        setError('Failed to load PDF. Please check the URL and try again.');
        setLoading(false);
      }
    };

    loadPdf();
  }, [scriptLoaded, pdfUrl]);

  // Render page
  const renderPage = useCallback(async (doc: PDFDocumentProxy, pageNum: number, pageScale: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !doc) return;

    // Cancel any ongoing render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    setPageLoading(true);
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: pageScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask as unknown as { cancel: () => void };
      await renderTask.promise;
    } catch (err: unknown) {
      const e = err as { name?: string };
      if (e?.name !== 'RenderingCancelledException') {
        setError('Failed to render page');
      }
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage, scale);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, numPages));
    setCurrentPage(p);
    setPageInput(String(p));
    onPageChange?.(p);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) goToPage(p);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-muted-foreground font-sans">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive font-sans text-center">{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setError(null);
            setLoading(true);
            setScriptLoaded(false);
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls */}
      <div className="sticky top-16 z-20 flex items-center gap-2 flex-wrap justify-center bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || pageLoading}
          className="w-8 h-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
          <Input
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-14 h-8 text-center text-sm"
            type="number"
            min={1}
            max={numPages}
          />
          <span className="text-sm text-muted-foreground font-sans whitespace-nowrap">
            / {numPages}
          </span>
        </form>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= numPages || pageLoading}
          className="w-8 h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
          disabled={scale <= 0.5}
          className="w-8 h-8"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground font-sans w-10 text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScale(s => Math.min(3, s + 0.2))}
          disabled={scale >= 3}
          className="w-8 h-8"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="relative w-full overflow-auto">
        {pageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        )}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full shadow-xl rounded border border-border/30"
            style={{ display: 'block' }}
          />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || pageLoading}
          className="border-gold/30 text-gold hover:bg-gold/10"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground font-sans">
          Page {currentPage} of {numPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= numPages || pageLoading}
          className="border-gold/30 text-gold hover:bg-gold/10"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
