import React from 'react';
import CelestialDivider from '../components/CelestialDivider';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Shield, Globe, Feather, Users } from 'lucide-react';

const values = [
  {
    icon: BookOpen,
    title: 'Open Knowledge',
    description:
      'We believe knowledge should be accessible to all. Every book on Prodigy is freely readable by anyone, anywhere, without barriers.',
  },
  {
    icon: Shield,
    title: 'Sovereign Preservation',
    description:
      'Built on the Internet Computer, Prodigy stores all metadata immutably on-chain. Your contributions are preserved beyond any single server or company.',
  },
  {
    icon: Feather,
    title: 'Author Empowerment',
    description:
      'Authors retain full ownership of their work. Upload, share, and reach readers globally without intermediaries or gatekeepers.',
  },
  {
    icon: Users,
    title: 'Community of Thinkers',
    description:
      'Prodigy is built for readers, writers, philosophers, scientists, and dreamers — anyone who believes ideas matter.',
  },
  {
    icon: Globe,
    title: 'Decentralized Architecture',
    description:
      'No single point of failure. The library catalog lives on-chain, ensuring permanence and resistance to censorship.',
  },
  {
    icon: Star,
    title: 'Curated Quality',
    description:
      'Every book is reviewed before publication, ensuring the library maintains a standard of quality and intellectual integrity.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-24 px-4 sm:px-6 text-center overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/30 via-navy-deep/10 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gold" />
            </div>
          </div>
          <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-4">About Prodigy</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            A Sovereign Archive for the{' '}
            <span className="gold-shimmer">Curious Mind</span>
          </h1>
          <p className="text-muted-foreground font-sans text-lg leading-relaxed">
            Prodigy is more than a digital library. It is a permanent, decentralized archive of human thought —
            built for thinkers, readers, and authors who believe that ideas deserve to outlast the platforms that host them.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-3">Our Mission</p>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-5">
                Preserving Knowledge for Future Generations
              </h2>
              <p className="text-muted-foreground font-sans leading-relaxed mb-4">
                In an age where platforms rise and fall, where servers go dark and content disappears overnight,
                Prodigy offers something different: permanence. Every book catalogued here is recorded on the
                Internet Computer blockchain — immutable, censorship-resistant, and accessible forever.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed">
                We draw inspiration from the great libraries of history — Alexandria, the House of Wisdom,
                the Library of Congress — and reimagine them for the digital age. Not as institutions that
                can burn, but as protocols that endure.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-navy-deep/40 to-navy-mid/20 border border-gold/10 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">📚</div>
                  <blockquote className="font-serif text-lg italic text-foreground/80 leading-relaxed">
                    "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
                  </blockquote>
                  <p className="text-sm text-gold font-sans">— Dr. Seuss</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CelestialDivider className="max-w-4xl mx-auto px-4" />

      {/* Values */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-3">What We Stand For</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(value => (
              <div
                key={value.title}
                className="p-6 bg-card border border-border/50 rounded-xl hover:border-gold/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CelestialDivider className="max-w-5xl mx-auto px-4" />

      {/* Vision */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold font-sans text-sm font-medium uppercase tracking-wider mb-3">Looking Forward</p>
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-6">Our Vision</h2>
          <p className="text-muted-foreground font-sans text-lg leading-relaxed mb-6">
            We envision a world where every great idea — every philosophical treatise, every scientific discovery,
            every poem that captures the human condition — is preserved permanently and accessible freely.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed mb-10">
            Prodigy is the beginning of that vision. A sovereign digital archive that belongs to no one and
            everyone simultaneously. A library that cannot be burned, cannot be censored, and cannot be forgotten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-light font-semibold">
              <Link to="/browse" search={{ genre: undefined }}>
                <BookOpen className="w-5 h-5 mr-2" />
                Explore the Library
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
              <Link to="/upload">Contribute a Book</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
