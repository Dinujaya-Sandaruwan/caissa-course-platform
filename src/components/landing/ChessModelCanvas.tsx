"use client";

import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function Model() {
  const { scene } = useGLTF("/models/chess_set.glb");
  return (
    <primitive
      object={scene}
      scale={1.5}
      position={[0, 1.6, 0]}
      rotation={[0, -Math.PI / 5, Math.PI / -10]}
    />
  );
}

export default function ChessModelCanvas() {
  return (
    <div className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [4, 3, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={1} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 8, 5]} intensity={0.6} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.6} />
          <Model />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.4}
            target={[0, 1.5, 0]}
          />
        </Suspense>
      </Canvas>
      {/* Subtle interactive hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs text-gray-400 pointer-events-none flex items-center gap-1.5 opacity-60">
        <span className="text-sm">↻</span> Drag to explore
      </div>
    </div>
  );
}

// Preload the model
useGLTF.preload("/models/chess_set.glb");
