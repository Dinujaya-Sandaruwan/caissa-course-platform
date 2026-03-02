import NavbarClient from "@/components/landing/NavbarClient";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import HowItWorks from "@/components/landing/HowItWorks";
import LMSBanner from "@/components/landing/LMSBanner";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen">
        <HeroSection />
        <StatsBar />
        <FeaturedCourses />
        <HowItWorks />
        <LMSBanner />
      </main>
      <Footer />
    </>
  );
}
