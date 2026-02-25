import { useParams, Link } from '@tanstack/react-router';
import { useGetBooksByAuthor } from '../hooks/useQueries';
import BookCard from '../components/BookCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, BookOpen, ArrowLeft } from 'lucide-react';

export default function AuthorProfile() {
  const { authorName } = useParams({ from: '/author/$authorName' });
  const decodedAuthor = decodeURIComponent(authorName);

  const { data: books, isLoading } = useGetBooksByAuthor(decodedAuthor);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link to="/browse" search={{ genre: undefined }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </Button>

        {/* Author Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-foreground">
              {decodedAuthor}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading ? 'Loading...' : `${books?.length ?? 0} published book${books?.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : !books || books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No published books found for this author.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/browse" search={{ genre: undefined }}>Browse All Books</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book.id.toString()} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
