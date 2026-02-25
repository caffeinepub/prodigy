import React, { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { BookOpen, Search } from 'lucide-react';
import { PRODIGY_LOGO_FULL } from '../constants/brand';

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { identity } = useInternetIdentity();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      brightness: Math.random() * 0.5 + 0.5,
    }));

    const swirls = Array.from({ length: 6 }, (_, i) => ({
      cx: 0.2 + (i % 3) * 0.3,
      cy: 0.2 + Math.floor(i / 3) * 0.6,
      radius: 60 + Math.random() * 80,
      speed: (Math.random() * 0.3 + 0.1) * (i % 2 === 0 ? 1 : -1),
      phase: (i / 6) * Math.PI * 2,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      time += 0.008;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0a0e1a');
      bg.addColorStop(0.3, '#0d1528');
      bg.addColorStop(0.6, '#111e35');
      bg.addColorStop(1, '#080c18');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      swirls.forEach((swirl) => {
        const x = swirl.cx * w + Math.cos(time * swirl.speed + swirl.phase) * swirl.radius;
        const y = swirl.cy * h + Math.sin(time * swirl.speed * 0.7 + swirl.phase) * swirl.radius * 0.5;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, swirl.radius * 1.5);
        grad.addColorStop(0, 'rgba(30, 58, 138, 0.15)');
        grad.addColorStop(0.5, 'rgba(20, 40, 100, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, swirl.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      const goldX = w * 0.7 + Math.cos(time * 0.3) * 100;
      const goldY = h * 0.3 + Math.sin(time * 0.2) * 60;
      const goldGrad = ctx.createRadialGradient(goldX, goldY, 0, goldX, goldY, 150);
      goldGrad.addColorStop(0, 'rgba(201, 168, 76, 0.08)');
      goldGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(goldX, goldY, 150, 0, Math.PI * 2);
      ctx.fill();

      stars.forEach((star) => {
        const x = star.x * w;
        const y = star.y * h;
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.4 + 0.6;
        const alpha = star.brightness * twinkle;
        const size = star.size * (0.8 + twinkle * 0.4);

        const isGold = star.brightness > 0.85;
        ctx.fillStyle = isGold
          ? `rgba(201, 168, 76, ${alpha})`
          : `rgba(220, 230, 255, ${alpha * 0.8})`;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (star.brightness > 0.8) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
          glow.addColorStop(0, isGold ? `rgba(201, 168, 76, ${alpha * 0.3})` : `rgba(180, 200, 255, ${alpha * 0.2})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/assets/generated/hero-starry-night.dim_1920x1080.png)' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Hero Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <img
            src={PRODIGY_LOGO_FULL}
            alt="Prodigy — Digital Library For Intelligent Minds"
            className="w-[200px] sm:w-[260px] md:w-[320px] h-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 24px rgba(201, 168, 76, 0.4))' }}
          />
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <span className="gold-shimmer">Knowledge</span>
          <br />
          <span className="text-white/90">Preserved Forever</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/70 font-sans font-light mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          Discover, read, and share the works that shape human thought.
          A library built for thinkers, readers, and authors of every era.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <Button
            asChild
            size="lg"
            className="bg-gold text-navy-deep hover:bg-gold-light font-semibold px-8 shadow-gold"
          >
            <Link to="/browse" search={{ genre: undefined }}>
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Library
            </Link>
          </Button>
          {!identity && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
            >
              <Link to="/genres">
                <Search className="w-5 h-5 mr-2" />
                Browse Genres
              </Link>
            </Button>
          )}
          {identity && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
            >
              <Link to="/upload">
                Upload a Book
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs font-sans tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
