import React, { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import ProfileSetupModal from './ProfileSetupModal';
import LoadingScreen from './LoadingScreen';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const [showLoading, setShowLoading] = useState(true);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  return (
    <>
      {showLoading && (
        <LoadingScreen onDismiss={() => setShowLoading(false)} />
      )}
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ProfileSetupModal open={showProfileSetup} />
        <Toaster richColors position="top-right" />
      </div>
    </>
  );
}
