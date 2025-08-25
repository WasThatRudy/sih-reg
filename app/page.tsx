import Hero from '@/components/Hero';
import Winners from '@/components/Winners';
import CallToAction from '@/components/CallToAction';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Winners />
      <CallToAction />
    </div>
  );
}
