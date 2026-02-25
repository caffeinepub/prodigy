import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Upload as UploadIcon, X, AlertCircle, CheckCircle,
  Loader2, FileText, Image, Info
} from 'lucide-react';
import { useUploadBook, useGetCallerUserProfile } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import AuthGuard from '../components/AuthGuard';
import { toast } from 'sonner';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance',
  'Science Fiction', 'Fantasy', 'Horror', 'Biography', 'History',
  'Self-Help', 'Poetry', 'Drama', 'Adventure', 'Children',
  'Young Adult', 'Graphic Novel', 'Philosophy', 'Science', 'Technology'
];

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB

function GenreSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (genres: string[]) => void;
}) {
  const [showWarning, setShowWarning] = useState(false);

  const toggleGenre = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
      setShowWarning(false);
    } else {
      if (selected.length >= 3) {
        setShowWarning(true);
        return;
      }
      onChange([...selected, genre]);
      setShowWarning(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          Genres <span className="text-muted-foreground">(select up to 3)</span>
        </label>
        <span className={`text-xs font-medium ${selected.length === 3 ? 'text-accent' : 'text-muted-foreground'}`}>
          {selected.length} / 3 selected
        </span>
      </div>
      {showWarning && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2 mb-2">
          <AlertCircle className="w-3 h-3 shrink-0" />
          Maximum 3 genres allowed. Deselect one to choose another.
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const isSelected = selected.includes(genre);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isSelected
                  ? 'bg-accent text-accent-foreground border-accent shadow-sm shadow-accent/30'
                  : isDisabled
                  ? 'bg-muted/30 text-muted-foreground/40 border-border/20 cursor-not-allowed'
                  : 'bg-muted text-muted-foreground border-border/40 hover:border-accent/50 hover:text-foreground'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Upload() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const uploadMutation = useUploadBook();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(userProfile?.displayName || '');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfError(null);
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are accepted. Please select a valid PDF file.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setPdfError('File exceeds 20MB limit. Please compress your PDF before uploading.');
      e.target.value = '';
      return;
    }
    setPdfFile(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCoverError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCoverError('Only image files are accepted for the cover.');
      e.target.value = '';
      return;
    }
    setCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a book title.');
      return;
    }
    if (!author.trim()) {
      toast.error('Please enter the author name.');
      return;
    }
    if (genres.length === 0) {
      toast.error('Please select at least one genre.');
      return;
    }

    try {
      let coverBlob: ExternalBlob | null = null;
      let pdfBlob: ExternalBlob | null = null;

      if (coverFile) {
        const coverBytes = new Uint8Array(await coverFile.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(coverBytes);
      }

      if (pdfFile) {
        const pdfBytes = new Uint8Array(await pdfFile.arrayBuffer());
        pdfBlob = ExternalBlob.fromBytes(pdfBytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
      }

      await uploadMutation.mutateAsync({
        title,
        author,
        description,
        genres,
        cover: coverBlob,
        pdf: pdfBlob,
      });

      toast.success('Book uploaded! It will appear in the library after review.');
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed. Please try again.');
    }
  };

  const isLoading = uploadMutation.isPending;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-cinzel text-3xl font-bold text-foreground mb-2">
              Upload a Book
            </h1>
            <p className="text-muted-foreground">
              Share your work with readers around the world.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Book Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Author Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter book description"
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none"
              />
            </div>

            {/* Genres */}
            <GenreSelector selected={genres} onChange={setGenres} />

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Cover Image <span className="text-muted-foreground">(optional)</span>
              </label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
              >
                {coverFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    {coverFile.name}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCoverFile(null); }}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click to upload cover image</p>
                    <p className="text-xs mt-1">PNG, JPG, WEBP supported</p>
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              {coverError && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {coverError}
                </p>
              )}
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                PDF File <span className="text-muted-foreground">(optional)</span>
              </label>
              {/* Required info message */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 border border-border/40 rounded-lg px-3 py-2 mb-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent/70" />
                <span>
                  Maximum file size is 20MB. Please compress your PDF before uploading.
                </span>
              </div>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
              >
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click to upload PDF</p>
                    <p className="text-xs mt-1">PDF only, max 20MB</p>
                  </div>
                )}
              </div>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              {pdfError && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {pdfError}
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {isLoading && uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate({ to: '/dashboard' })}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Upload Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
