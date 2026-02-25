import React from 'react';
import { Link } from '@tanstack/react-router';
import { type BookView } from '../backend';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Eye } from 'lucide-react';
import { truncate } from '../lib/utils';

interface BookCardProps {
  book: BookView;
  showStatus?: boolean;
}

export default function BookCard({ book, showStatus = false }: BookCardProps) {
  return (
    <Link
      to="/book/$id"
      params={{ id: book.id.toString() }}
      className="group block book-card-hover"
    >
      <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col">
        {/* Cover */}
        <div className="relative aspect-[2/3] bg-muted overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                target.parentElement!.innerHTML = `<div class="flex flex-col items-center gap-2 p-4 text-center"><div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center"><svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div><span class="text-xs text-muted-foreground font-sans">No Cover</span></div>`;
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gold" />
              </div>
              <span className="text-xs text-muted-foreground font-sans text-center">No Cover</span>
            </div>
          )}
          {showStatus && (
            <div className="absolute top-2 right-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                book.status === 'approved' ? 'status-approved' :
                book.status === 'pending' ? 'status-pending' : 'status-rejected'
              }`}>
                {book.status}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <h3 className="font-serif font-semibold text-sm leading-tight text-foreground group-hover:text-gold transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground font-sans">{book.author}</p>
          <div className="flex items-center justify-between mt-auto pt-1">
            <Badge variant="outline" className="text-xs border-gold/30 text-gold/80 px-1.5 py-0">
              {book.genre}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              {book.viewCount.toString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
