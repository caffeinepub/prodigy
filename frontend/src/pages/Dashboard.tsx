import React, { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import BookCard from '../components/BookCard';
import CelestialDivider from '../components/CelestialDivider';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useGetMyUploadedBooks,
  useGetBookmarks,
  useGetBookById,
  useGetReadingProgress,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Bookmark,
  Upload,
  Edit3,
  User,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  BookMarked,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';
import { type BookView } from '../backend';

function BookmarkItem({ bookId }: { bookId: bigint }) {
  const { data: book } = useGetBookById(bookId);
  if (!book) return null;
  return <BookCard book={book} />;
}

function ReadingProgressItem({ bookId }: { bookId: bigint }) {
  const { data: book } = useGetBookById(bookId);
  const { data: progress } = useGetReadingProgress(bookId);

  if (!book || !progress) return null;

  return (
    <div className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-lg hover:border-gold/30 transition-colors">
      <div className="w-10 h-14 rounded bg-muted shrink-0 overflow-hidden">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to="/book/$id"
          params={{ id: book.id.toString() }}
          className="font-serif font-semibold text-sm text-foreground hover:text-gold transition-colors truncate block"
        >
          {book.title}
        </Link>
        <p className="text-xs text-muted-foreground font-sans">{book.author}</p>
        <p className="text-xs text-gold font-sans mt-0.5">
          Last read: page {progress.lastPage.toString()}
        </p>
      </div>
      <Button asChild size="sm" className="bg-gold text-navy-deep hover:bg-gold-light shrink-0">
        <Link to="/reader/$id" params={{ id: book.id.toString() }}>
          Continue
        </Link>
      </Button>
    </div>
  );
}

function DashboardContent() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: uploadedBooks, isLoading: booksLoading } = useGetMyUploadedBooks();
  const { data: bookmarks, isLoading: bookmarksLoading } = useGetBookmarks();
  const saveProfile = useSaveCallerUserProfile();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    try {
      await saveProfile.mutateAsync({
        displayName: newName.trim(),
        joinDate: profile?.joinDate ?? BigInt(Date.now()) * BigInt(1_000_000),
      });
      setEditingName(false);
      toast.success('Display name updated!');
    } catch {
      toast.error('Failed to update name');
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (status === 'pending') return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  };

  const principal = identity?.getPrincipal().toString() ?? '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Profile Section */}
      <section>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <Skeleton className="h-7 w-48 mb-2" />
            ) : editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 w-48 focus:border-gold"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                />
                <Button size="sm" onClick={handleSaveName} disabled={saveProfile.isPending} className="bg-gold text-navy-deep hover:bg-gold-light h-8">
                  {saveProfile.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)} className="h-8">Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-serif text-2xl font-semibold text-foreground">
                  {profile?.displayName ?? 'Anonymous Reader'}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-gold"
                  onClick={() => { setNewName(profile?.displayName ?? ''); setEditingName(true); }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            {profile?.joinDate && (
              <p className="text-sm text-muted-foreground font-sans">
                Member since {formatDate(profile.joinDate)}
              </p>
            )}
            <p className="text-xs text-muted-foreground/60 font-mono mt-1 truncate max-w-xs">
              {principal}
            </p>
          </div>
        </div>
      </section>

      <CelestialDivider />

      {/* Uploaded Books */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-xl font-semibold text-foreground">My Uploads</h2>
          </div>
          <Button asChild size="sm" className="bg-gold text-navy-deep hover:bg-gold-light">
            <Link to="/upload">Upload New</Link>
          </Button>
        </div>

        {booksLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : !uploadedBooks || uploadedBooks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-sans text-sm">You haven't uploaded any books yet.</p>
            <Button asChild size="sm" className="mt-3 bg-gold text-navy-deep hover:bg-gold-light">
              <Link to="/upload">Upload Your First Book</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedBooks.map((book: BookView) => (
              <div key={book.id.toString()} className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-lg">
                <div className="w-10 h-14 rounded bg-muted shrink-0 overflow-hidden">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/book/$id"
                    params={{ id: book.id.toString() }}
                    className="font-serif font-semibold text-sm text-foreground hover:text-gold transition-colors truncate block"
                  >
                    {book.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      book.status === 'approved' ? 'status-approved' :
                      book.status === 'pending' ? 'status-pending' : 'status-rejected'
                    }`}>
                      {statusIcon(book.status)}
                      {book.status}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">
                      {Number(book.editCount)} edit{Number(book.editCount) !== 1 ? 's' : ''} left
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  disabled={Number(book.editCount) === 0}
                  className="shrink-0 border-gold/30 text-gold hover:bg-gold/10 disabled:opacity-40"
                >
                  <Link to="/upload/$bookId" params={{ bookId: book.id.toString() }}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <CelestialDivider />

      {/* Bookmarked Books */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Bookmark className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl font-semibold text-foreground">Bookmarked</h2>
        </div>

        {bookmarksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
          </div>
        ) : !bookmarks || bookmarks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
            <BookMarked className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-sans text-sm">No bookmarks yet. Start exploring!</p>
            <Button asChild size="sm" variant="outline" className="mt-3 border-gold/30 text-gold hover:bg-gold/10">
              <Link to="/browse" search={{ genre: undefined }}>Browse Books</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bookmarks.map(b => (
              <BookmarkItem key={b.bookId.toString()} bookId={b.bookId} />
            ))}
          </div>
        )}
      </section>

      <CelestialDivider />

      {/* Reading Progress */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl font-semibold text-foreground">Reading Progress</h2>
        </div>

        {!bookmarks || bookmarks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-sans text-sm">Start reading to track your progress.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.slice(0, 10).map(b => (
              <ReadingProgressItem key={b.bookId.toString()} bookId={b.bookId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-navy-deep/20 to-transparent py-12 px-4 sm:px-6 border-b border-border/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-2">My Account</p>
          <h1 className="font-serif text-4xl font-bold text-foreground">Dashboard</h1>
        </div>
      </div>
      <AuthGuard>
        <DashboardContent />
      </AuthGuard>
    </div>
  );
}
