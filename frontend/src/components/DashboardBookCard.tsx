import React from 'react';
import { Edit2, Trash2, GripVertical, Eye, BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';
import { BookView } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SharePopover from './SharePopover';

interface DashboardBookCardProps {
  book: BookView;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onEdit: (book: BookView) => void;
  onDelete: (book: BookView) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

function CoverImage({ book }: { book: BookView }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (book.cover) {
      book.cover.getBytes().then((bytes) => {
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      });
    }
  }, [book.cover]);

  if (!url) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <BookOpen size={28} className="text-muted-foreground/40" />
      </div>
    );
  }

  return <img src={url} alt={book.title} className="w-full h-full object-cover" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <Badge className="text-[10px] px-1.5 py-0 bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 gap-1">
        <CheckCircle size={9} /> Approved
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge className="text-[10px] px-1.5 py-0 bg-destructive/15 text-destructive border-destructive/30 gap-1">
        <XCircle size={9} /> Rejected
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 gap-1">
      <Clock size={9} /> Pending
    </Badge>
  );
}

export default function DashboardBookCard({
  book,
  isSelected,
  onSelectChange,
  onEdit,
  onDelete,
  dragHandleProps,
  isDragging,
}: DashboardBookCardProps) {
  const editsLeft = Number(book.editCount);

  return (
    <div
      className={`bg-card border rounded-xl overflow-hidden flex flex-col transition-all duration-200
        ${isDragging ? 'shadow-2xl scale-[1.02] border-primary/50' : 'border-border hover:border-primary/30 hover:shadow-md'}
        ${isSelected ? 'ring-2 ring-primary/50' : ''}
      `}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/2] bg-muted overflow-hidden">
        <CoverImage book={book} />

        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="absolute top-2 left-2 p-1 rounded bg-black/40 text-white cursor-grab active:cursor-grabbing hover:bg-black/60 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        {/* Checkbox */}
        <div className="absolute top-2 right-2">
          <div className="bg-white/90 dark:bg-black/60 rounded p-0.5">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectChange(!!checked)}
              className="w-4 h-4"
            />
          </div>
        </div>

        {/* Status */}
        <div className="absolute bottom-2 left-2">
          <StatusBadge status={book.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 font-cinzel">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">by {book.author}</p>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {book.description}
        </p>

        {/* Genre badges */}
        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <Eye size={12} className="text-primary" />
            {Number(book.viewCount).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} className="text-accent-foreground" />
            {editsLeft} edits left
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(book)}
            className="flex-1 h-8 text-xs gap-1"
            disabled={editsLeft === 0}
            title={editsLeft === 0 ? 'No edits remaining' : 'Edit book'}
          >
            <Edit2 size={12} />
            Edit
          </Button>

          <SharePopover
            bookId={book.id}
            bookTitle={book.title}
            trigger={
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Share</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </Button>
            }
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(book)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
