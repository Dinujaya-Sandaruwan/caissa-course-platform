"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import preloaderAnimation from "@/assets/lottieFiles/preloader.json";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Read optional delay from env. e.g. "3" means 3 seconds. Default to 0.
    const artificialDelayStr = process.env.NEXT_PUBLIC_PRELOADER_DELAY || "0";
    const artificialDelayMs = parseInt(artificialDelayStr, 10) * 1000;

    let delayTimeout: NodeJS.Timeout;

    const finishLoading = () => {
      setFade(true);
      setTimeout(() => setLoading(false), 500);
    };

    const handleLoad = () => {
      if (artificialDelayMs > 0) {
        // If developer wants an artificial delay, wait that long before fading out
        delayTimeout = setTimeout(finishLoading, artificialDelayMs);
      } else {
        finishLoading();
      }
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback timeout just in case it takes too long naturally
      const fallbackTimeout = setTimeout(handleLoad, 5000 + artificialDelayMs);

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(delayTimeout);
        clearTimeout(fallbackTimeout);
      };
    }
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 overflow-hidden ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Decorative background elements for premium feel - matching light theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-red/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Wrapping the content so they sit together tightly */}
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-[0_15px_25px_rgba(239,35,60,0.15)]">
          <Lottie
            animationData={preloaderAnimation}
            loop={true}
            className="w-full h-full"
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Brand Name appearing below the animation */}
          <div className="font-heading text-3xl sm:text-4xl font-extrabold tracking-widest text-gray-900 animate-pulse">
            CAISSA <span className="text-primary-red">CHESS</span>
          </div>

          {/* Loading progress bar simulation placed directly below text */}
          <div className="w-64 sm:w-80 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary-red animate-[loading-bar_2s_ease-in-out_infinite] rounded-full w-1/3 shadow-[0_0_10px_rgba(239,35,60,0.8)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
