"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Html, Bounds } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Box, Sparkles } from "lucide-react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────
// DEEP DISPOSE UTILITY
// Recursively traverses a Three.js object and disposes ALL GPU
// resources: geometries, materials (including arrays), and every
// texture property found on each material.
// ─────────────────────────────────────────────────────────────────────
function deepDispose(obj: THREE.Object3D) {
  obj.traverse((child) => {
    // Dispose geometry
    if ((child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }

    // Dispose material(s)
    const mesh = child as THREE.Mesh;
    if (mesh.material) {
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      for (const mat of materials) {
        // Dispose every texture on the material
        for (const value of Object.values(mat)) {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        }
        mat.dispose();
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────
// MODEL PATHS
// ─────────────────────────────────────────────────────────────────────
const MODEL_PATHS = [
  "/models/cursed-1.glb",
  "/models/cursed-2.glb",
  "/models/cursed-3.glb",
] as const;

// NOTE: useGLTF.preload() calls have been INTENTIONALLY REMOVED.
// They are module-scope side-effects that re-execute on every
// Turbopack HMR cycle, creating new loader instances that accumulate
// in the Node.js heap and contribute to the OOM crash.

// ─────────────────────────────────────────────────────────────────────
// CursedModel
//
// Loads ONLY the current model. Uses scene.clone(true) to create an
// independent copy, so that disposal doesn't corrupt useGLTF's cache.
//
// On unmount or when modelPath changes:
//   1. Removes the clone from the group
//   2. Calls deepDispose() on the clone to free all GPU resources
// ─────────────────────────────────────────────────────────────────────
function CursedModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const cloneRef = useRef<THREE.Object3D | null>(null);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Step 1: Remove and dispose the PREVIOUS clone (prevents stacking)
    if (cloneRef.current) {
      group.remove(cloneRef.current);
      deepDispose(cloneRef.current);
      cloneRef.current = null;
    }

    // Step 1b: Evict the PREVIOUS model from drei's useGLTF cache
    // This frees the raw parsed GLTF data that useGLTF holds internally.
    // Safe because we always clone on load — the cache copy is redundant.
    if (prevPathRef.current && prevPathRef.current !== modelPath) {
      useGLTF.clear(prevPathRef.current);
    }
    prevPathRef.current = modelPath;

    // Step 2: Clone the new scene and add it
    const clone = scene.clone(true);
    cloneRef.current = clone;
    group.add(clone);

    // Step 3: Cleanup on unmount OR on next modelPath change
    return () => {
      if (cloneRef.current && group) {
        group.remove(cloneRef.current);
        deepDispose(cloneRef.current);
        cloneRef.current = null;
      }
      // On full unmount, also evict current model from cache
      if (prevPathRef.current) {
        useGLTF.clear(prevPathRef.current);
        prevPathRef.current = null;
      }
    };
  }, [scene, modelPath]);

  return <group ref={groupRef} />;
}

// ─────────────────────────────────────────────────────────────────────
// RendererCleanup
//
// Captures the WebGL renderer via useThree() and on unmount:
//   1. Calls renderer.dispose() to free WebGL state
//   2. Calls renderer.forceContextLoss() to release the GPU context
//
// Without this, navigating away from the page leaves a zombie WebGL
// context consuming GPU memory that V8 GC cannot reclaim.
// ─────────────────────────────────────────────────────────────────────
function RendererCleanup() {
  const { gl } = useThree();

  useEffect(() => {
    return () => {
      gl.dispose();
      gl.forceContextLoss();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────
export function CursedArtifact() {
  const [modelIndex, setModelIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // ── IntersectionObserver: pause render loop when off-screen ──
  // Switches frameloop to "demand" (no frames) when the section is
  // not visible, freeing GPU for Hero CSS animations at the top.
  // rootMargin of 200px wakes the canvas slightly before it scrolls
  // into view to prevent pop-in.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "200px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleDimension = useCallback(() => {
    setModelIndex((prev) => (prev + 1) % 3);
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-24 bg-zinc-950 text-white overflow-hidden relative">
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
            "Scientists have studied this artifact for 67 years. They found nothing. They found everything. One researcher quit and opened a goat farm. When asked why, he simply said: 'Affan.' No further questions were taken.
            What you are currently seeing is our best attempt at reconstructing his physical form using technology. We are sorry. The original 3D artist has not spoken since the render finished. He just stares at the file. The file stares back.
            Our analysts confirm this model is 0% accurate and 100% cursed. And yet — somehow — it feels more real than reality itself.
            Do not zoom in. We cannot stress this enough. Do not. Zoom. In."
          </p>
        </div>

        <div className="relative group">
          {/* Canvas Container */}
          <div className="h-[500px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/80 overflow-hidden relative">
            <Canvas dpr={[1, 1.5]} frameloop={isInView ? "always" : "demand"} camera={{ position: [0, 0, 1.8] }}>
              {/* Cleanup: disposes WebGL renderer on unmount */}
              <RendererCleanup />

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
                    {/* KEY: modelPath changes trigger the useEffect cleanup cycle */}
                    <CursedModel modelPath={MODEL_PATHS[modelIndex]} />
                  </Center>
                </Bounds>
              </Suspense>
              
              <OrbitControls enableZoom={true} autoRotate />
            </Canvas>

            {/* UI Overlays */}
            <div className="absolute top-4 right-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 pointer-events-none">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter mb-1">Current Coordinates</p>
              <p className="text-xs font-mono text-[#2398f7] tabular-nums">LOC: 0xAFF4N_VOID_{modelIndex + 1}</p>
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
