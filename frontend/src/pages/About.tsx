import React from 'react';
import { Link } from '@tanstack/react-router';
import { BookOpen, Users, Globe, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VALUES = [
  {
    icon: BookOpen,
    title: 'Open Access',
    description:
      'We believe knowledge should be freely accessible to everyone, regardless of background or location.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    title: 'Community First',
    description:
      'Our platform is built by and for readers and authors who share a passion for literature.',
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'Connecting authors and readers across the world through the power of decentralized technology.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: Heart,
    title: 'Author Empowerment',
    description:
      'We give authors the tools and visibility they need to share their work and grow their audience.',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-card border-b border-border">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl font-bold text-foreground font-cinzel">About Prodigy</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Prodigy is a decentralized digital library built on the Internet Computer, empowering
            authors to publish and readers to discover great books — freely and openly.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-cinzel">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                We're on a mission to democratize access to literature. By leveraging blockchain
                technology, we ensure that books remain accessible, censorship-resistant, and
                permanently available to anyone with an internet connection.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're an aspiring author looking to share your first novel or a reader
                searching for your next favorite book, Prodigy is your home.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Books Published', value: '1,000+' },
                { label: 'Active Authors', value: '200+' },
                { label: 'Monthly Readers', value: '5,000+' },
                { label: 'Genres', value: '20+' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-card border border-border rounded-xl p-4 text-center"
                >
                  <p className="text-2xl font-bold text-primary font-cinzel">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground font-cinzel text-center mb-10">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-background border border-border rounded-xl p-6 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground font-cinzel">
            Ready to Join Prodigy?
          </h2>
          <p className="text-muted-foreground">
            Start reading or publishing today. It's free, open, and built for the community.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link to="/browse" search={{ genre: undefined }}>
              <Button className="gap-2">
                <BookOpen size={16} />
                Start Reading
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" className="gap-2">
                Publish a Book
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
