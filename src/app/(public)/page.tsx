import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import HowItWorks from "@/components/landing/HowItWorks";
import LMSBanner from "@/components/landing/LMSBanner";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
        <StatsBar />
        <FeaturedCourses />
        <HowItWorks />
        <LMSBanner />
      </main>
    </>
  );
}
