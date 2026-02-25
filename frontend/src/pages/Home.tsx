import React from 'react';
import { Link } from '@tanstack/react-router';
import HeroSection from '../components/HeroSection';
import FeaturedBooks from '../components/FeaturedBooks';
import { BookOpen, Users, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetTotalBooks,
  useGetTotalActiveReaders,
  useGetTotalAuthors,
} from '../hooks/useQueries';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy',
  'Mystery', 'Thriller', 'Romance', 'Biography',
];

function StatValue({ isLoading, value }: { isLoading: boolean; value: bigint | undefined }) {
  if (isLoading) {
    return <Skeleton className="h-8 w-16 mx-auto rounded" />;
  }
  return (
    <p className="text-2xl font-bold text-foreground font-cinzel">
      {value !== undefined ? value.toString() : '—'}
    </p>
  );
}

export default function Home() {
  const { data: totalBooks, isLoading: loadingBooks } = useGetTotalBooks();
  const { data: totalReaders, isLoading: loadingReaders } = useGetTotalActiveReaders();
  const { data: totalAuthors, isLoading: loadingAuthors } = useGetTotalAuthors();

  const stats = [
    {
      icon: BookOpen,
      label: 'Books',
      value: totalBooks,
      isLoading: loadingBooks,
      color: 'text-primary',
    },
    {
      icon: Users,
      label: 'Active Readers',
      value: totalReaders,
      isLoading: loadingReaders,
      color: 'text-accent-foreground',
    },
    {
      icon: Star,
      label: 'Authors',
      value: totalAuthors,
      isLoading: loadingAuthors,
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {stats.map(({ icon: Icon, label, value, isLoading, color }) => (
            <div key={label} className="space-y-1">
              <Icon size={24} className={`mx-auto ${color}`} />
              <StatValue isLoading={isLoading} value={value} />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genre Browsing */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground font-cinzel">Browse by Genre</h2>
            <Link to="/browse" search={{ genre: undefined }}>
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Link
                key={genre}
                to="/browse"
                search={{ genre }}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-6 px-4 pb-14">
        <div className="max-w-5xl mx-auto">
          <FeaturedBooks />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5 border-t border-border">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground font-cinzel">
            Share Your Story with the World
          </h2>
          <p className="text-muted-foreground">
            Join thousands of authors publishing their work on Prodigy. Upload your book today and
            reach readers everywhere.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link to="/upload">
              <Button className="gap-2">
                <BookOpen size={16} />
                Upload a Book
              </Button>
            </Link>
            <Link to="/browse" search={{ genre: undefined }}>
              <Button variant="outline" className="gap-2">
                Browse Library
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
