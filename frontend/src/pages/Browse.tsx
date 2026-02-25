import React, { useState } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Search, Filter, BookOpen, Loader2 } from 'lucide-react';
import { useGetApprovedBooks } from '../hooks/useQueries';
import BookCard from '../components/BookCard';
import { Skeleton } from '@/components/ui/skeleton';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance',
  'Science Fiction', 'Fantasy', 'Horror', 'Biography', 'History',
  'Self-Help', 'Poetry', 'Drama', 'Adventure', 'Children',
  'Young Adult', 'Graphic Novel', 'Philosophy', 'Science', 'Technology'
];

export default function Browse() {
  const search = useSearch({ from: '/browse' });
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const selectedGenre = (search as any).genre as string | undefined;

  const { data: books = [], isLoading } = useGetApprovedBooks();

  const filteredBooks = books.filter((book) => {
    const matchesGenre = !selectedGenre || book.genres.includes(selectedGenre);
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleGenreSelect = (genre: string | undefined) => {
    navigate({
      to: '/browse',
      search: { genre },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-cinzel text-3xl font-bold text-foreground mb-2">
            Library Catalog
          </h1>
          <p className="text-muted-foreground">
            Discover books from authors around the world
          </p>

          {/* Search */}
          <div className="mt-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Genre Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by Genre</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenreSelect(undefined)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                !selectedGenre
                  ? 'bg-accent text-accent-foreground shadow-sm shadow-accent/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              All
            </button>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-accent text-accent-foreground shadow-sm shadow-accent/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading books...
              </span>
            ) : (
              `${filteredBooks.length} book${filteredBooks.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-cinzel text-xl font-semibold text-foreground mb-2">
              No Books Found
            </h3>
            <p className="text-muted-foreground">
              {selectedGenre
                ? `No books in the "${selectedGenre}" genre yet.`
                : searchQuery
                ? `No books match "${searchQuery}".`
                : 'No books have been published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id.toString()} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
