import React, { useState, useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Navbar from './Navbar';
import Footer from './Footer';
import ProfileSetupModal from './ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import LoadingScreen from './LoadingScreen';

export default function Layout() {
  const [showLoading, setShowLoading] = useState(() => {
    return !sessionStorage.getItem('prodigy_loaded');
  });

  useEffect(() => {
    if (showLoading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
        sessionStorage.setItem('prodigy_loaded', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showLoading]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {showLoading && <LoadingScreen />}
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ProfileSetupModal />
        <Toaster richColors position="top-right" />
      </div>
    </ThemeProvider>
  );
}
