import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedBooks from '../components/FeaturedBooks';
import GenreQuickLinks from '../components/GenreQuickLinks';
import CelestialDivider from '../components/CelestialDivider';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Star } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Home() {
  const { identity } = useInternetIdentity();

  return (
    <div>
      <HeroSection />
      <GenreQuickLinks />
      <FeaturedBooks />

      <CelestialDivider className="max-w-7xl mx-auto px-4" />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Star className="w-8 h-8 text-gold fill-gold/30" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4 text-foreground">
            {identity ? 'Share Your Knowledge' : 'Join the Archive'}
          </h2>
          <p className="text-muted-foreground font-sans text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            {identity
              ? 'Upload your works and contribute to a growing library of human thought. Your ideas deserve to be preserved.'
              : 'Create an account to upload books, track your reading, bookmark favorites, and become part of a community of thinkers.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {identity ? (
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-light font-semibold">
                <Link to="/upload">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload a Book
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-light font-semibold">
                <Link to="/browse" search={{ genre: undefined }}>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Reading
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
