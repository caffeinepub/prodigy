import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { BookOpen, Clock, Star } from 'lucide-react';
import { BookView } from '../backend';

interface BookCardProps {
  book: BookView;
  showStatus?: boolean;
}

export default function BookCard({ book, showStatus = false }: BookCardProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (book.cover) {
      book.cover.getBytes().then((bytes) => {
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        setCoverUrl(objectUrl);
      }).catch(() => {
        setCoverUrl(null);
      });
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [book.cover]);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-300 border border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border border-red-500/30',
  };

  const genres = book.genres || [];

  return (
    <Link
      to="/book/$bookId"
      params={{ bookId: book.id.toString() }}
      className="group block"
    >
      <div className="book-card rounded-lg overflow-hidden border border-border/40 bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] bg-muted overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-4">
              <BookOpen className="w-12 h-12 text-accent/40 mb-2" />
              <p className="text-xs text-muted-foreground text-center font-cinzel line-clamp-3">
                {book.title}
              </p>
            </div>
          )}
          {showStatus && (
            <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${statusColors[book.status] || ''}`}>
              {book.status}
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-xs text-accent font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Read Now
            </span>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-3">
          <h3 className="font-cinzel font-semibold text-sm text-foreground line-clamp-2 mb-1 group-hover:text-accent transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            by {book.author}
          </p>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {genre}
                </span>
              ))}
              {genres.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{genres.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {Number(book.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(Number(book.uploadDate) / 1_000_000).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
