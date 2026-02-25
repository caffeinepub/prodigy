import React, { useState, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useGetApprovedBooks } from '../hooks/useQueries';
import BookCard from '../components/BookCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, BookOpen } from 'lucide-react';
import { GENRES } from '../lib/utils';

export default function Browse() {
  const search = useSearch({ from: '/browse' });
  const initialGenre = (search as { genre?: string }).genre || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);

  const { data: books, isLoading } = useGetApprovedBooks();

  const filtered = useMemo(() => {
    if (!books) return [];
    return books.filter(book => {
      const matchesGenre = !selectedGenre || book.genre === selectedGenre;
      const matchesSearch = !searchTerm ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [books, selectedGenre, searchTerm]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-deep/20 to-transparent py-12 px-4 sm:px-6 border-b border-border/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-2">Library</p>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-6">Browse Books</h1>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..."
              className="pl-10 border-border focus:border-gold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Genre filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={!selectedGenre ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGenre('')}
            className={!selectedGenre ? 'bg-gold text-navy-deep hover:bg-gold-light' : 'border-border hover:border-gold/50 hover:text-gold'}
          >
            All Genres
          </Button>
          {GENRES.map(genre => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
              className={selectedGenre === genre
                ? 'bg-gold text-navy-deep hover:bg-gold-light'
                : 'border-border hover:border-gold/50 hover:text-gold'
              }
            >
              {genre}
            </Button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground font-sans">
            {isLoading ? 'Loading...' : `${filtered.length} book${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {(selectedGenre || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedGenre(''); setSearchTerm(''); }}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Books grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">No books found</h3>
            <p className="text-muted-foreground font-sans">
              {searchTerm || selectedGenre
                ? 'Try adjusting your search or filters'
                : 'No books have been approved yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(book => (
              <BookCard key={book.id.toString()} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
