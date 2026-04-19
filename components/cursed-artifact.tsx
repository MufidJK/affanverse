"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Html, Bounds } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Box, Sparkles } from "lucide-react";

function CursedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function CursedArtifact() {
  const [modelType, setModelType] = useState<"cursed-1" | "cursed-2">("cursed-1");

  const toggleDimension = () => {
    setModelType((prev) => (prev === "cursed-1" ? "cursed-2" : "cursed-1"));
  };

  const currentModelUrl = `/models/${modelType}.glb`;

  return (
    <section className="w-full py-24 bg-zinc-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2398f7]/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2398f7]/30 bg-[#2398f7]/10 text-[#2398f7] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            Classified: Level 67
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            The Affan Artifact: <span className="text-[#2398f7]">A Cursed Entity</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto italic">
            "We found this in a deep-nested folder labeled 'DO NOT OPEN'. It shouldn't exist, yet it takes up 0TB on disk."
          </p>
        </div>

        <div className="relative group">
          {/* Canvas Container */}
          <div className="h-[500px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden relative">
            <Canvas camera={{ position: [0, 0, 1.8] }}>
              <ambientLight intensity={4.0} />
              <directionalLight position={[10, 15, 10]} intensity={3.0} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={2.0} color="white" />
              
              <Suspense fallback={
                <Html center>
                  <div className="text-[#2398f7] font-mono text-sm tracking-widest uppercase animate-pulse shrink-0 whitespace-nowrap">
                    Loading artifact...
                  </div>
                </Html>
              }>
                <Bounds fit clip observe>
                  <Center>
                    <CursedModel url={currentModelUrl} />
                  </Center>
                </Bounds>
              </Suspense>
              
              <OrbitControls enableZoom={true} autoRotate />
            </Canvas>

            {/* UI Overlays */}
            <div className="absolute top-4 right-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 pointer-events-none">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter mb-1">Current Coordinates</p>
              <p className="text-xs font-mono text-[#2398f7] tabular-nums">LOC: 0xAFF4N_VOID_{modelType.toUpperCase()}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={toggleDimension}
              size="lg"
              className="bg-[#2398f7] hover:bg-[#1a7cd4] text-white rounded-full px-8 py-6 h-auto text-lg font-bold shadow-xl shadow-[#2398f7]/20 transition-all active:scale-95 group"
            >
              <Box className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Switch to Alternate Dimension
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
