import React from 'react';
import { Link } from '@tanstack/react-router';
import { useGetApprovedBooks } from '../hooks/useQueries';
import BookCard from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeaturedBooks() {
  const { data: books, isLoading } = useGetApprovedBooks();

  const featured = books
    ? [...books]
        .sort((a, b) => Number(b.uploadDate - a.uploadDate))
        .slice(0, 6)
    : [];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-2">Recently Added</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
            Featured Works
          </h2>
        </div>
        <Button variant="ghost" asChild className="text-gold hover:text-gold-light hidden sm:flex">
          <Link to="/browse" search={{ genre: undefined }}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : featured.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-sans">No books available yet. Be the first to upload!</p>
          <Button asChild className="mt-4 bg-gold text-navy-deep hover:bg-gold-light">
            <Link to="/upload">Upload a Book</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map(book => (
            <BookCard key={book.id.toString()} book={book} />
          ))}
        </div>
      )}

      <div className="mt-6 sm:hidden text-center">
        <Button variant="ghost" asChild className="text-gold hover:text-gold-light">
          <Link to="/browse" search={{ genre: undefined }}>
            View All Books <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
