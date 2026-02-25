import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import AuthGuard from '../components/AuthGuard';
import { useUploadBook, useEditBook, useGetBookById } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Upload as UploadIcon,
  Loader2,
  CheckCircle,
  Edit3,
  AlertCircle,
  FileText,
  ImageIcon,
  X,
  CheckCircle2,
} from 'lucide-react';
import { GENRES } from '../lib/utils';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const MAX_COMBINED_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB combined limit
const MAX_IMAGE_DIMENSION = 1200;
const TARGET_COVER_SIZE_BYTES = 500 * 1024; // 500 KB target for compression iterations

interface FormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  coverUrl: string;
  pdfUrl: string;
}

interface FormErrors {
  title?: string;
  author?: string;
  description?: string;
  genre?: string;
  coverUrl?: string;
  pdfUrl?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compress an image File using Canvas API.
 * Resizes to max 1200×1200 preserving aspect ratio, exports as JPEG.
 * Iterates quality from 0.8 → 0.7 → 0.6 until under TARGET_COVER_SIZE_BYTES.
 * Returns { dataUrl, compressedSize }.
 */
async function compressImage(file: File): Promise<{ dataUrl: string; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const qualities = [0.8, 0.7, 0.6];
      let dataUrl = '';
      for (const quality of qualities) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        // base64 string length * 0.75 ≈ byte size
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        if (approxBytes <= TARGET_COVER_SIZE_BYTES) break;
      }

      const approxBytes = Math.round((dataUrl.length * 3) / 4);
      resolve({ dataUrl, compressedSize: approxBytes });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

function UploadForm() {
  const params = useParams({ strict: false }) as { bookId?: string };
  const bookId = params.bookId ? BigInt(params.bookId) : undefined;
  const isEditMode = bookId !== undefined;

  const navigate = useNavigate();
  const uploadBook = useUploadBook();
  const editBook = useEditBook();
  const { data: existingBook, isLoading: bookLoading } = useGetBookById(bookId);

  const [form, setForm] = useState<FormData>({
    title: '',
    author: '',
    description: '',
    genre: '',
    coverUrl: '',
    pdfUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [newBookId, setNewBookId] = useState<bigint | null>(null);

  // File state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isReadingCover, setIsReadingCover] = useState(false);
  const [isReadingPdf, setIsReadingPdf] = useState(false);

  // Size tracking
  const [coverOriginalSize, setCoverOriginalSize] = useState<number | null>(null);
  const [coverCompressedSize, setCoverCompressedSize] = useState<number | null>(null);
  const [pdfSize, setPdfSize] = useState<number | null>(null);

  // Combined size error (replaces individual size checks)
  const [combinedSizeError, setCombinedSizeError] = useState<string>('');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingBook && isEditMode) {
      setForm({
        title: existingBook.title,
        author: existingBook.author,
        description: existingBook.description,
        genre: existingBook.genre,
        coverUrl: existingBook.coverUrl,
        pdfUrl: existingBook.pdfUrl,
      });
      if (existingBook.coverUrl) {
        setCoverPreview(existingBook.coverUrl);
      }
    }
  }, [existingBook, isEditMode]);

  /**
   * Evaluate combined size of pdfBase64 + coverBase64 and update error state.
   */
  const checkCombinedSize = (pdfBase64: string, coverBase64: string) => {
    const pdfBytes = Math.round((pdfBase64.length * 3) / 4);
    const coverBytes = Math.round((coverBase64.length * 3) / 4);
    const total = pdfBytes + coverBytes;
    if (total > MAX_COMBINED_SIZE_BYTES) {
      setCombinedSizeError(
        `Total upload size exceeds 4 MB (${formatBytes(total)}). Please use a smaller PDF or cover image.`
      );
    } else {
      setCombinedSizeError('');
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverOriginalSize(file.size);
    setCoverCompressedSize(null);
    setIsReadingCover(true);
    try {
      const { dataUrl, compressedSize } = await compressImage(file);
      setForm(f => {
        const updated = { ...f, coverUrl: dataUrl };
        checkCombinedSize(updated.pdfUrl, dataUrl);
        return updated;
      });
      setCoverPreview(dataUrl);
      setCoverCompressedSize(compressedSize);
      setErrors(prev => ({ ...prev, coverUrl: undefined }));
    } catch {
      toast.error('Failed to process cover image file');
    } finally {
      setIsReadingCover(false);
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setPdfSize(file.size);
    // Clear any previous combined error while reading
    setCombinedSizeError('');

    setIsReadingPdf(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      setForm(f => {
        const updated = { ...f, pdfUrl: dataUrl };
        checkCombinedSize(dataUrl, updated.coverUrl);
        return updated;
      });
      setErrors(prev => ({ ...prev, pdfUrl: undefined }));
    } catch {
      toast.error('Failed to read PDF file');
    } finally {
      setIsReadingPdf(false);
    }
  };

  const clearCoverFile = () => {
    setCoverFile(null);
    setCoverPreview('');
    setCoverOriginalSize(null);
    setCoverCompressedSize(null);
    setForm(f => {
      const updated = { ...f, coverUrl: '' };
      checkCombinedSize(updated.pdfUrl, '');
      return updated;
    });
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const clearPdfFile = () => {
    setPdfFile(null);
    setPdfSize(null);
    setForm(f => {
      const updated = { ...f, pdfUrl: '' };
      checkCombinedSize('', updated.coverUrl);
      return updated;
    });
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.author.trim()) newErrors.author = 'Author name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.genre) newErrors.genre = 'Please select a genre';
    if (!form.coverUrl) newErrors.coverUrl = 'Cover image is required';
    if (!form.pdfUrl) newErrors.pdfUrl = 'PDF file is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (combinedSizeError) return;
    if (!validate()) return;

    try {
      if (isEditMode && bookId !== undefined) {
        await editBook.mutateAsync({
          bookId,
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim(),
          genre: form.genre,
          coverUrl: form.coverUrl,
          pdfUrl: form.pdfUrl,
        });
        toast.success('Book updated successfully! It will be reviewed before publishing.');
        navigate({ to: '/dashboard' });
      } else {
        const id = await uploadBook.mutateAsync({
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim(),
          genre: form.genre,
          coverUrl: form.coverUrl,
          pdfUrl: form.pdfUrl,
        });
        setNewBookId(id);
        setSubmitted(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message.includes('Unauthorized') ? 'You must be logged in to upload books' : message);
    }
  };

  const isLoading = uploadBook.isPending || editBook.isPending;
  const isProcessingFiles = isReadingCover || isReadingPdf;
  const editsRemaining = existingBook ? Number(existingBook.editCount) : null;
  const hasCombinedError = !!combinedSizeError;
  const isDisabled = isLoading || isProcessingFiles || (isEditMode && editsRemaining === 0) || hasCombinedError;

  if (isEditMode && bookLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (submitted && newBookId !== null) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-serif text-3xl font-semibold mb-3 text-foreground">Book Submitted!</h2>
        <p className="text-muted-foreground font-sans mb-2 max-w-md mx-auto">
          Your book has been submitted for review. An admin will approve it before it becomes publicly visible.
        </p>
        <p className="text-sm text-muted-foreground font-sans mb-8">
          You have <strong className="text-gold">3 edits</strong> remaining for this book.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gold text-navy-deep hover:bg-gold-light font-semibold">
            <Link to="/dashboard">View My Books</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setNewBookId(null);
              setForm({ title: '', author: '', description: '', genre: '', coverUrl: '', pdfUrl: '' });
              setCoverFile(null);
              setPdfFile(null);
              setCoverPreview('');
              setCoverOriginalSize(null);
              setCoverCompressedSize(null);
              setPdfSize(null);
              setCombinedSizeError('');
            }}
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            Upload Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {isEditMode ? (
              <Edit3 className="w-6 h-6 text-gold" />
            ) : (
              <UploadIcon className="w-6 h-6 text-gold" />
            )}
            <CardTitle className="font-serif text-2xl">
              {isEditMode ? 'Edit Book' : 'Upload a Book'}
            </CardTitle>
          </div>
          <CardDescription className="font-sans">
            {isEditMode
              ? `Update your book's information. ${editsRemaining !== null ? `You have ${editsRemaining} edit${editsRemaining !== 1 ? 's' : ''} remaining.` : ''}`
              : 'Share your work with the Prodigy community. All submissions are reviewed before publishing.'}
          </CardDescription>
          {isEditMode && editsRemaining !== null && (
            <div className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-sm font-sans ${
              editsRemaining === 0
                ? 'bg-destructive/10 text-destructive'
                : editsRemaining === 1
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-gold/10 text-gold'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {editsRemaining === 0
                ? 'No edits remaining. This book cannot be edited further.'
                : `${editsRemaining} edit${editsRemaining !== 1 ? 's' : ''} remaining`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="font-medium">
                Book Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter the book title"
                className={errors.title ? 'border-destructive' : 'focus:border-gold'}
                disabled={isLoading || isProcessingFiles || (isEditMode && editsRemaining === 0)}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <Label htmlFor="author" className="font-medium">
                Author Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Author's full name"
                className={errors.author ? 'border-destructive' : 'focus:border-gold'}
                disabled={isLoading || isProcessingFiles || (isEditMode && editsRemaining === 0)}
              />
              {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Write a compelling description of your book..."
                rows={4}
                className={errors.description ? 'border-destructive' : 'focus:border-gold'}
                disabled={isLoading || isProcessingFiles || (isEditMode && editsRemaining === 0)}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {/* Genre */}
            <div className="space-y-1.5">
              <Label className="font-medium">
                Genre <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.genre}
                onValueChange={(val) => setForm(f => ({ ...f, genre: val }))}
                disabled={isLoading || isProcessingFiles || (isEditMode && editsRemaining === 0)}
              >
                <SelectTrigger className={errors.genre ? 'border-destructive' : 'focus:border-gold'}>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genre && <p className="text-xs text-destructive">{errors.genre}</p>}
            </div>

            {/* Cover Image File Upload */}
            <div className="space-y-1.5">
              <Label className="font-medium">
                Cover Image <span className="text-destructive">*</span>
              </Label>
              {!coverFile && !coverPreview ? (
                <label
                  htmlFor="coverFile"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    errors.coverUrl
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border/60 hover:border-gold/50 hover:bg-gold/5'
                  } ${isLoading || isProcessingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {isReadingCover ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gold" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                    <span className="text-sm font-sans">
                      {isReadingCover ? 'Compressing image...' : 'Click to upload cover image'}
                    </span>
                    <span className="text-xs text-muted-foreground/70">JPG, JPEG, PNG — auto-compressed</span>
                  </div>
                  <input
                    ref={coverInputRef}
                    id="coverFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={handleCoverFileChange}
                    disabled={isLoading || isProcessingFiles}
                  />
                </label>
              ) : (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-16 h-20 object-cover rounded border border-border/30 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-sans truncate text-foreground">
                      {coverFile?.name ?? 'Existing cover'}
                    </p>
                    {coverOriginalSize !== null && (
                      <p className="text-xs text-muted-foreground font-sans mt-0.5">
                        Original: {formatBytes(coverOriginalSize)}
                        {coverCompressedSize !== null && (
                          <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                            → Compressed: {formatBytes(coverCompressedSize)}
                          </span>
                        )}
                        {isReadingCover && (
                          <span className="ml-2 text-gold">
                            <Loader2 className="inline w-3 h-3 animate-spin" /> Compressing…
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearCoverFile}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    disabled={isLoading || isProcessingFiles}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {errors.coverUrl && <p className="text-xs text-destructive">{errors.coverUrl}</p>}
            </div>

            {/* PDF File Upload */}
            <div className="space-y-1.5">
              <Label className="font-medium">
                PDF File <span className="text-destructive">*</span>
              </Label>
              {!pdfFile ? (
                <label
                  htmlFor="pdfFile"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    errors.pdfUrl
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border/60 hover:border-gold/50 hover:bg-gold/5'
                  } ${isLoading || isProcessingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {isReadingPdf ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gold" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                    <span className="text-sm font-sans">
                      {isReadingPdf ? 'Reading PDF...' : 'Click to upload PDF'}
                    </span>
                    <span className="text-xs text-muted-foreground/70">PDF files only</span>
                  </div>
                  <input
                    ref={pdfInputRef}
                    id="pdfFile"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfFileChange}
                    disabled={isLoading || isProcessingFiles}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                  <FileText className="w-8 h-8 text-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-sans truncate text-foreground">{pdfFile.name}</p>
                    {pdfSize !== null && (
                      <p className="text-xs font-sans mt-0.5 flex items-center gap-1.5">
                        <span className="text-muted-foreground">{formatBytes(pdfSize)}</span>
                        {isReadingPdf ? (
                          <span className="text-gold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Reading…
                          </span>
                        ) : form.pdfUrl ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearPdfFile}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    disabled={isLoading || isProcessingFiles}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {errors.pdfUrl && <p className="text-xs text-destructive">{errors.pdfUrl}</p>}
            </div>

            {/* Combined size error */}
            {combinedSizeError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{combinedSizeError}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full bg-gold text-navy-deep hover:bg-gold-light font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? 'Saving Changes...' : 'Uploading...'}
                </>
              ) : isProcessingFiles ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing files...
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Submit for Review'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Upload() {
  return (
    <AuthGuard>
      <main className="container mx-auto px-4 py-10">
        <UploadForm />
      </main>
    </AuthGuard>
  );
}
