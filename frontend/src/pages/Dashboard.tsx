import React, { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetMyUploadedBooks,
  useGetBookmarks,
  useGetReadingProgress,
  useEditBook,
  useDeleteBook,
} from '../hooks/useQueries';
import { BookView, ExternalBlob } from '../backend';
import AuthGuard from '../components/AuthGuard';
import DashboardBookCard from '../components/DashboardBookCard';
import AnalyticsOverview from '../components/AnalyticsOverview';
import NotificationBell from '../components/NotificationBell';
import PDFUploadZone from '../components/PDFUploadZone';
import HelpTooltip from '../components/HelpTooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Bookmark,
  Upload,
  User,
  BarChart2,
  Trash2,
  Loader2,
  CheckSquare,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Upload / Edit Form ──────────────────────────────────────────────────────

const GENRES = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
  'Thriller', 'Romance', 'Horror', 'Biography', 'History',
  'Science', 'Technology', 'Philosophy', 'Poetry', 'Children',
  'Young Adult', 'Self-Help', 'Business', 'Travel', 'Art',
];

interface UploadFormProps {
  editingBook: BookView | null;
  onCancel: () => void;
  onSuccess: () => void;
}

function UploadForm({ editingBook, onCancel, onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState(editingBook?.title || '');
  const [author, setAuthor] = useState(editingBook?.author || '');
  const [description, setDescription] = useState(editingBook?.description || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(editingBook?.genres || []);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const editBook = useEditBook();

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      if (prev.length >= 3) {
        toast.error('Maximum 3 genres allowed');
        return prev;
      }
      return [...prev, genre];
    });
  };

  const compressCover = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSizeError('');

    if (!editingBook) {
      toast.error('No book selected for editing');
      return;
    }

    let coverBlob: ExternalBlob | null = editingBook.cover || null;
    let pdfBlob: ExternalBlob | null = editingBook.pdf || null;

    if (coverFile) {
      const compressed = await compressCover(coverFile);
      const base64 = compressed.split(',')[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      coverBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
    }

    if (pdfFile) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const totalMB = bytes.byteLength / (1024 * 1024);
      if (totalMB > 20) {
        setSizeError('PDF exceeds 20 MB limit.');
        return;
      }
      pdfBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
    }

    try {
      await editBook.mutateAsync({
        bookId: editingBook.id,
        title,
        author,
        description,
        genres: selectedGenres,
        cover: coverBlob,
        pdf: pdfBlob,
      });
      toast.success('Book updated successfully! It will be reviewed before going live.');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-foreground">Title *</label>
            <HelpTooltip content="The full title of your book as it will appear in the library." />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter book title"
          />
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-foreground">Author *</label>
            <HelpTooltip content="The author's name as it should appear on the book listing." />
          </div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Author name"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">Description *</label>
          <HelpTooltip content="A compelling summary of your book. This is what readers will see before deciding to read it." />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Write a compelling description..."
        />
      </div>

      {/* Genres */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Genres <span className="text-muted-foreground text-xs">(up to 3)</span>
          </label>
          <HelpTooltip content="Select up to 3 genres that best describe your book. This helps readers find it." />
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${selectedGenres.includes(genre)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">Cover Image</label>
          <HelpTooltip content="Upload a cover image for your book. Recommended size: 800×1200px. JPEG or PNG." />
        </div>
        <div className="flex items-start gap-4">
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-20 h-28 object-cover rounded-lg border border-border shrink-0"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          />
        </div>
      </div>

      {/* PDF Upload */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">PDF / eBook File</label>
          <HelpTooltip content="Upload your book as a PDF. Maximum file size is 20 MB. Drag and drop or click to browse." />
        </div>
        <PDFUploadZone
          onFileSelect={(file) => setPdfFile(file)}
          selectedFile={pdfFile}
        />
        {sizeError && <p className="text-xs text-destructive">{sizeError}</p>}
      </div>

      {editBook.isPending && uploadProgress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={editBook.isPending} className="flex-1 gap-2">
          {editBook.isPending && <Loader2 size={14} className="animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// ─── Bookmark Card ───────────────────────────────────────────────────────────

function BookmarkCard({ bookId }: { bookId: bigint }) {
  const { data: book, isLoading } = useGetReadingProgress(bookId);

  if (isLoading) return <Skeleton className="h-16 rounded-lg" />;

  return (
    <Link
      to="/book/$bookId"
      params={{ bookId: bookId.toString() }}
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-colors"
    >
      <BookOpen size={18} className="text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">Book #{bookId.toString()}</p>
        {book && (
          <p className="text-xs text-muted-foreground">Last read: page {Number(book.lastPage)}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: myBooks = [], isLoading: booksLoading } = useGetMyUploadedBooks();
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useGetBookmarks();
  const deleteBook = useDeleteBook();

  const [activeTab, setActiveTab] = useState('books');
  const [editingBook, setEditingBook] = useState<BookView | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<BookView | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const principal = identity?.getPrincipal().toString() || '';

  // Sorted books (local state for drag-and-drop order)
  const [sortedBooks, setSortedBooks] = useState<BookView[]>([]);
  const displayBooks = useMemo(() => {
    if (sortedBooks.length > 0) return sortedBooks;
    return myBooks;
  }, [myBooks, sortedBooks]);

  // Sync when myBooks changes
  React.useEffect(() => {
    setSortedBooks(myBooks);
  }, [myBooks]);

  const handleEdit = (book: BookView) => {
    setEditingBook(book);
    setShowEditForm(true);
    setActiveTab('upload');
  };

  const handleDelete = (book: BookView) => {
    setDeleteTarget(book);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBook.mutateAsync(deleteTarget.id);
      toast.success('Book deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete book');
    }
    setDeleteTarget(null);
  };

  const handleSelectChange = (bookId: string, selected: boolean) => {
    setSelectedBookIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(bookId);
      else next.delete(bookId);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedBookIds.size === 0) return;
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedBookIds);
    let failed = 0;
    for (const id of ids) {
      try {
        await deleteBook.mutateAsync(BigInt(id));
      } catch {
        failed++;
      }
    }
    if (failed > 0) {
      toast.error(`${failed} book(s) could not be deleted`);
    } else {
      toast.success(`${ids.length} book(s) deleted`);
    }
    setSelectedBookIds(new Set());
    setBulkDeleteOpen(false);
  };

  const selectedBooksForBulk = displayBooks.filter((b) =>
    selectedBookIds.has(b.id.toString())
  );

  // Simple drag-and-drop reorder (mouse events)
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newBooks = [...displayBooks];
    const [removed] = newBooks.splice(dragIndex, 1);
    newBooks.splice(index, 0, removed);
    setSortedBooks(newBooks);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-cinzel">Author Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your books and track performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell books={myBooks} />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <User size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {principal.slice(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          {!booksLoading && myBooks.length > 0 && (
            <div className="mb-8">
              <AnalyticsOverview books={myBooks} />
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="books" className="gap-2">
                <BookOpen size={14} />
                My Books
                {myBooks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {myBooks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload size={14} />
                {showEditForm ? 'Edit Book' : 'Upload Book'}
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-2">
                <Bookmark size={14} />
                Bookmarks
                {bookmarks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {bookmarks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart2 size={14} />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* My Books Tab */}
            <TabsContent value="books">
              {/* Bulk Actions Toolbar */}
              {selectedBookIds.size > 0 && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                  <CheckSquare size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {selectedBookIds.size} book{selectedBookIds.size > 1 ? 's' : ''} selected
                  </span>
                  <HelpTooltip content="Use bulk actions to delete multiple books at once. Select books using the checkboxes on each card." />
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Trash2 size={12} />
                      Delete Selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBookIds(new Set())}
                      className="h-8 w-8 p-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {booksLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-72 rounded-xl" />
                  ))}
                </div>
              ) : displayBooks.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No books yet</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Upload your first book to get started
                  </p>
                  <Button onClick={() => setActiveTab('upload')} className="gap-2">
                    <Upload size={14} />
                    Upload a Book
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayBooks.map((book, index) => (
                    <div
                      key={book.id.toString()}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <DashboardBookCard
                        book={book}
                        isSelected={selectedBookIds.has(book.id.toString())}
                        onSelectChange={(selected) =>
                          handleSelectChange(book.id.toString(), selected)
                        }
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDragging={dragIndex === index}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Upload / Edit Tab */}
            <TabsContent value="upload">
              <div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground font-cinzel">
                        {showEditForm ? 'Edit Book' : 'Upload New Book'}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {showEditForm
                          ? `Editing: "${editingBook?.title}" — ${Number(editingBook?.editCount)} edit(s) remaining`
                          : 'Share your work with the Prodigy community'}
                      </p>
                    </div>
                    {showEditForm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowEditForm(false);
                          setEditingBook(null);
                          setActiveTab('books');
                        }}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>

                  {showEditForm && editingBook ? (
                    <UploadForm
                      editingBook={editingBook}
                      onCancel={() => {
                        setShowEditForm(false);
                        setEditingBook(null);
                        setActiveTab('books');
                      }}
                      onSuccess={() => {
                        setShowEditForm(false);
                        setEditingBook(null);
                        setActiveTab('books');
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Upload size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground text-sm mb-4">
                        To upload a new book, use the{' '}
                        <Link to="/upload" className="text-primary underline">
                          Upload page
                        </Link>
                        .
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To edit an existing book, click the Edit button on any book card.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks">
              {bookmarksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No bookmarks yet</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Bookmark books to save them for later
                  </p>
                  <Link to="/browse" search={{ genre: undefined }}>
                    <Button className="gap-2">
                      <BookOpen size={14} />
                      Browse Books
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bookmarks.map((bookmark) => (
                    <BookmarkCard key={bookmark.bookId.toString()} bookId={bookmark.bookId} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              {booksLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                  </div>
                </div>
              ) : (
                <AnalyticsOverview books={myBooks} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Single Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>"{deleteTarget?.title}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBook.isPending ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedBookIds.size} Books</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-2">The following books will be permanently deleted:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedBooksForBulk.map((b) => (
                    <li key={b.id.toString()} className="text-foreground font-medium">
                      {b.title}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
}
