import Hero from '@/components/Hero';
import Winners from '@/components/Winners';
import CallToAction from '@/components/CallToAction';
import Navbar from '@/components/Navbar';
import StatusBanner from '@/components/StatusBanner';
import FloatingActionButton from '@/components/FloatingActionButton';
import BackToTop from '@/components/BackToTop';
import QuickLinks from '@/components/QuickLinks';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Winners />
      <CallToAction />
      <BackToTop />
    </div>
  );
}
