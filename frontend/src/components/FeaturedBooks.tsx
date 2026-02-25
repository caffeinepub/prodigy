import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useGetApprovedBooks } from '../hooks/useQueries';
import BookCard from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedBooks() {
  const { data: books = [], isLoading } = useGetApprovedBooks();

  const featuredBooks = books.slice(0, 6);

  return (
    <section className="py-16 bg-card/10 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-cinzel text-2xl font-bold text-foreground">
            Recently Added
          </h2>
          <Link
            to="/browse"
            search={{ genre: undefined }}
            className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No books published yet. Be the first!</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Upload a Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id.toString()} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
