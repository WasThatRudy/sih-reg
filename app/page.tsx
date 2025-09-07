'use client';

import Hero from '@/components/Hero';
import Winners from '@/components/Winners';
import CallToAction from '@/components/CallToAction';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';
import Instructions from '@/components/Instructions';
import PPTGuidelines from '@/components/PPTGuidelines';
import ProfileStatusBanner from '@/components/ProfileStatusBanner';
import { useAuth } from '@/lib/context/AuthContext';

export default function Home() {
  const { user, userRole } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* Profile Status Banner */}
      <div className="container mx-auto px-4">
        <ProfileStatusBanner 
          isAuthenticated={!!user} 
          userRole={userRole || undefined} 
        />
      </div>
      <Hero />
      <Instructions />
      <PPTGuidelines />
      <Winners />
      <CallToAction />
      <BackToTop />
    </div>
  );
}
