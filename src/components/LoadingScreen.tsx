"use client";

import Lottie from "lottie-react";
import preloaderAnimation from "@/assets/lottieFiles/preloader.json";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden pointer-events-none">
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
