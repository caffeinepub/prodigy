import React from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetUserProfile, useGetBooksByAuthor } from '../hooks/useQueries';
import BookCard from '../components/BookCard';
import CelestialDivider from '../components/CelestialDivider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { User, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function AuthorProfile() {
  const { principal } = useParams({ from: '/author/$principal' });

  const { data: user, isLoading: userLoading } = useGetUserProfile(principal);
  const { data: books, isLoading: booksLoading } = useGetBooksByAuthor(user?.displayName);

  if (userLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl font-semibold mb-2">Author Not Found</h2>
          <p className="text-muted-foreground font-sans mb-6">This author profile doesn't exist.</p>
          <Button asChild variant="outline">
            <Link to="/browse" search={{ genre: undefined }}>Browse Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground -ml-2">
          <Link to="/browse" search={{ genre: undefined }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Link>
        </Button>
      </div>

      {/* Author header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <User className="w-10 h-10 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{user.displayName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
              <Calendar className="w-4 h-4" />
              <span>Member since {formatDate(user.joinDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <CelestialDivider className="max-w-5xl mx-auto px-4" />

      {/* Books */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Published Works
          </h2>
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
          </div>
        ) : !books || books.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-sans">No published books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map(book => (
              <BookCard key={book.id.toString()} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
