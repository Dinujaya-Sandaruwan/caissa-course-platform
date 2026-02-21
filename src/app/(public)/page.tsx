import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
      </main>
    </>
  );
}
