import React, { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars: { x: number; y: number; r: number; a: number; speed: number }[] = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.005 + 0.002,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.a += star.speed;
        const alpha = (Math.sin(star.a) + 1) / 2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.8})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="font-cinzel text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in">
          Prodigy
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-2 animate-fade-in">
          Knowledge Preserved Forever
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8 max-w-lg mx-auto animate-fade-in">
          Discover, read, and share the works that shape human thought. A library built for thinkers, readers, and authors of every era
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Link
            to="/browse"
            search={{ genre: undefined }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-md shadow-accent/20"
          >
            <BookOpen className="w-5 h-5" />
            Explore Library
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors border border-border/40"
          >
            Start Publishing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
