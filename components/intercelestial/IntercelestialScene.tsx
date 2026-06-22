"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Box } from "@react-three/drei";
import { useRouter } from "next/navigation";
// --- Types & Data ---
type NodeData = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  size: number;
  synopsis: string;
  link: string;
  isEasterEgg?: boolean;
  hideOnMobile?: boolean;
};

const NODES: NodeData[] = [
  // CORE (0)
  { id: "core", label: "Affan", position: [0, 0, 0], color: "#2398f7", size: 2, synopsis: "The Apex Predator. The central gravity of the Affanverse.", link: "/" },

  // LARGE (Major Routes)
  { id: "apex-exchange", label: "Apex Exchange", position: [0, 10, -12], color: "#2398f7", size: 1.0, synopsis: "Live market capitalization and dynamic volatility engine.", link: "/apex-exchange" },
  { id: "archives", label: "Archives", position: [10, 6, -8], color: "#f59e0b", size: 0.9, synopsis: "The Vault of ancient records and sealed files.", link: "/archives" },
  { id: "nexus", label: "Nexus", position: [-12, -5, 10], color: "#ec4899", size: 0.9, synopsis: "The interconnecting hub for dimensions.", link: "/nexus" },
  { id: "projects", label: "Projects", position: [8, -10, 6], color: "#14b8a6", size: 1.1, synopsis: "Showcase of architectural endeavors and experiments.", link: "/projects" },
  { id: "blog", label: "Chronicle", position: [-8, 8, 8], color: "#3b82f6", size: 0.8, synopsis: "Written thoughts, engineering logs, and updates.", link: "/blog" },

  // MEDIUM (Sub-pages)
  { id: "aki", label: "AKI", position: [-10, -8, -6], color: "#eab308", size: 0.6, synopsis: "Affanverse Knowledge Interface and core integrations.", link: "/aki" },
  { id: "about", label: "About Us", position: [6, 12, 4], color: "#8b5cf6", size: 0.6, synopsis: "The entity behind the universe. Lore and biography.", link: "/about" },
  { id: "contact", label: "Contact", position: [-14, 2, -5], color: "#10b981", size: 0.55, synopsis: "Establish a direct communication link.", link: "/contact" },
  { id: "behind-the-scenes", label: "Behind The Scenes", position: [14, 0, 5], color: "#64748b", size: 0.5, synopsis: "Unveil the backstage mechanics.", link: "/behind-the-scenes" },
  { id: "ambasuke", label: "Ambasuke", position: [4, -14, -6], color: "#f43f5e", size: 0.5, synopsis: "A unique sector with classified origins.", link: "/ambasuke" },
  
  // ORIGINAL NODES
  { id: "books", label: "The Books", position: [-5, 3, -2], color: "#a855f7", size: 1, synopsis: "Chronicles and tales from the multiverse. Includes the main light novel.", link: "/novel" },
  { id: "games", label: "Minigames", position: [5, -2, 3], color: "#ef4444", size: 0.85, synopsis: "The Void Portal. Survive the anomalies and secure your sanity.", link: "/minigame" },
  { id: "music", label: "Music", position: [-3, -4, 4], color: "#10b981", size: 0.45, synopsis: "Immersive soundscapes and curated playlists.", link: "/music" },
  { id: "architect", label: "The Architect", position: [1, -8, -6], color: "#ff003c", size: 0.25, synopsis: "System Initialized. Identity: Jeka.", link: "https://github.com/MufidJK", isEasterEgg: true },

  // SMALL (Homepage Components)
  { id: "stories", label: "Affan Stories", position: [3, 2, 7], color: "#eab308", size: 0.35, synopsis: "Highlights of notable tales from the homepage.", link: "/#affan-stories", hideOnMobile: true },
  { id: "testimonials", label: "Testimonials", position: [-6, -2, -6], color: "#84cc16", size: 0.3, synopsis: "Records from those who survived the encounter.", link: "/#testimonials", hideOnMobile: true },
  { id: "skill-tree", label: "Skill Tree", position: [7, 4, -4], color: "#06b6d4", size: 0.35, synopsis: "Visual representation of capabilities.", link: "/#skill-tree", hideOnMobile: true },
  { id: "faq", label: "FAQ", position: [-2, 7, -5], color: "#d946ef", size: 0.3, synopsis: "Frequently Asked Questions. Knowledge base.", link: "/#faq", hideOnMobile: true },
  { id: "gallery", label: "Gallery Dump", position: [-4, -7, -2], color: "#f97316", size: 0.35, synopsis: "A visual archive of memories and artifacts.", link: "/#gallery", hideOnMobile: true },
  { id: "cursed-artifact", label: "Cursed Artifact", position: [2, 6, 4], color: "#dc2626", size: 0.25, synopsis: "Warning: Entity containment unstable.", link: "/#cursed-artifact", hideOnMobile: true },
  // { id: "guestbook", label: "Guestbook", position: [-9, -4, 3], color: "#0ea5e9", size: 0.3, synopsis: "Leave your mark in the multiverse.", link: "/#guestbook", hideOnMobile: true },
  { id: "ai-chat", label: "Affan AI", position: [9, -2, -3], color: "#6366f1", size: 0.35, synopsis: "Interactive projection of the Architect's consciousness.", link: "/#affan-ai-chat", hideOnMobile: true },
  { id: "memory-leak", label: "Memory Leak", position: [5, -7, 8], color: "#22c55e", size: 0.4, synopsis: "System Error. Entry to the Memory Leak Terminal.", link: "/memory-leak", hideOnMobile: true },
  { id: "cookie", label: "Cookie Protocol", position: [-10, 2, 6], color: "#a8a29e", size: 0.2, synopsis: "Data consumption directives.", link: "/cookie-protocol", hideOnMobile: true },
  { id: "privacy", label: "Privacy Policy", position: [11, 3, 2], color: "#78716c", size: 0.2, synopsis: "Observation limits and regulations.", link: "/privacy-policy", hideOnMobile: true },
  { id: "terms", label: "Terms of Chaos", position: [-3, -10, 5], color: "#57534e", size: 0.2, synopsis: "The absolute laws governing interaction.", link: "/terms-of-chaos", hideOnMobile: true },
  
  // NEW MISSING NODES
  { id: "system-briefing", label: "System Briefing", position: [1, 8, -7], color: "#ef4444", size: 0.35, synopsis: "System Demo and Lore Overview.", link: "/#system-briefing" },
  { id: "abyss-term-doc", label: "Abyss Term Docs", position: [-15, -6, 12], color: "#b91c1c", size: 0.3, synopsis: "Classified protocol guidelines for the Abyss Layer.", link: "/abyss-term" },
  { id: "card-protocol", label: "Card Protocol", position: [8, -4, 2], color: "#10b981", size: 0.3, synopsis: "Strategic card encounters.", link: "/minigame/affan-card-protocol" },
  { id: "endless-runner", label: "Endless Runner", position: [10, -1, 3], color: "#f59e0b", size: 0.3, synopsis: "Survive the eternal chase.", link: "/minigame/affan-endless-runner" },
  { id: "low-cortisol", label: "Low Cortisol", position: [9, -5, 5], color: "#3b82f6", size: 0.3, synopsis: "Calming mini-experience.", link: "/minigame/affan-low-cortisol" },
  { id: "affan-strike", label: "Affan Strike", position: [7, -3, 8], color: "#ec4899", size: 0.3, synopsis: "Tactical strike operations.", link: "/minigame/affan-strike" },
  { id: "ambasuke-protocol-game", label: "Ambasuke Protocol", position: [11, -2, 1], color: "#8b5cf6", size: 0.3, synopsis: "Classified protocol engagement.", link: "/minigame/ambasuke-protocol" },
  { id: "flappy-affan", label: "Flappy Affan", position: [6, 1, 6], color: "#14b8a6", size: 0.3, synopsis: "Avoid the obstacles.", link: "/minigame/flappy-affan" }
];

// Connection lines pairs
const CONNECTIONS = [
  // Core to large
  ["core", "archives"],
  ["core", "nexus"],
  ["core", "projects"],
  ["core", "blog"],
  
  // Original
  ["core", "books"],
  ["core", "games"],
  ["core", "music"],
  ["core", "architect"],

  // Mediums
  ["archives", "about"],
  ["nexus", "contact"],
  ["projects", "behind-the-scenes"],
  ["blog", "ambasuke"],

  // Smalls
  ["core", "stories"],
  ["core", "testimonials"],
  ["core", "skill-tree"],
  ["core", "faq"],
  ["core", "gallery"],
  ["nexus", "cursed-artifact"],
  ["contact", "guestbook"],
  ["projects", "ai-chat"],
  ["archives", "memory-leak"],
  ["blog", "cookie"],
  ["about", "privacy"],
  ["behind-the-scenes", "terms"],
  
  // New Connections
  ["core", "system-briefing"],
  ["nexus", "abyss-term-doc"],
  ["games", "card-protocol"],
  ["games", "endless-runner"],
  ["games", "low-cortisol"],
  ["games", "affan-strike"],
  ["games", "ambasuke-protocol-game"],
  ["games", "flappy-affan"],
  ["core", "apex-exchange"],
  ["core", "aki"]
];

export function IntercelestialScene({ isLowCores = false }: { isLowCores?: boolean }) {
  const { scene, camera, invalidate } = useThree();
  const router = useRouter();
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);

  const orbitGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreAuraMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const frameCounterRef = useRef(0);

  // --- Strict Memory Disposal (Rule 3) ---
  useEffect(() => {
    return () => {
      // Traverse scene on unmount to prevent VRAM memory leaks
      scene.traverse((object: any) => {
        if (!object.isMesh) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat: any) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  // --- InstancedMesh Stars (Draw Call Minimization) ---
  const starCount = 3000;
  const starMeshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!starMeshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < starCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      dummy.scale.setScalar(Math.random() * 0.5 + 0.5);
      dummy.updateMatrix();
      starMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    starMeshRef.current.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [invalidate, starCount]);

  // --- Animation Loop ---
  useFrame((state) => {
    frameCounterRef.current++;
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y += 0.001;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= 0.002;
    }
    // --- Core Node AGGRESSIVE Smooth RGB Breathing Effect ---
    if (coreMaterialRef.current && coreAuraMaterialRef.current) {
      const t = state.clock.elapsedTime * 3.0; // Aggressive speed
      // Base blue hue is around 0.6.
      // Oscillate the hue smoothly between Cyan (0.5), Blue (0.6), and Pink/Purple (0.85)
      const dynamicHue = 0.65 + 0.2 * Math.sin(t);
      coreMaterialRef.current.color.setHSL(dynamicHue, 0.9, 0.55);
      coreMaterialRef.current.emissive.copy(coreMaterialRef.current.color);
      coreMaterialRef.current.emissiveIntensity = 0.5;
      coreAuraMaterialRef.current.color.copy(coreMaterialRef.current.color);
    }
    
    // Subtle star rotation, throttled on low-core devices
    if (starMeshRef.current) {
      if (!isLowCores || frameCounterRef.current % 2 === 0) {
        starMeshRef.current.rotation.y += 0.0002;
        starMeshRef.current.rotation.x += 0.0001;
      }
    }
  });

  // Handle zooming into a node
  const handleNodeClick = (node: NodeData) => {
    setActiveNode(node);
    invalidate(); // Re-render to show active state
  };

  const handleActionClick = (node: NodeData) => {
    if (node.isEasterEgg) {
      window.open(node.link, "_blank", "noopener,noreferrer");
      return;
    }

    if (node.link.startsWith("/#")) {
      window.location.href = node.link;
      return;
    }

    router.push(node.link);
  };

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      
      {/* Background Cosmos */}
      <instancedMesh ref={starMeshRef} args={[undefined, undefined, starCount]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </instancedMesh>

      {/* Core Node */}
      <group position={[0, 0, 0]}>
        {(() => {
          const coreNode = NODES.find(n => n.id === "core")!;
          const isActive = activeNode?.id === coreNode.id;
          return (
            <group>
              <mesh
                ref={coreRef}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(coreNode);
                }}
                onPointerOver={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <sphereGeometry args={[coreNode.size, 64, 64]} />
                <meshStandardMaterial
                  ref={coreMaterialRef}
                  color={coreNode.color}
                  emissive={coreNode.color}
                  emissiveIntensity={0.5}
                  transparent={false}
                  opacity={1.0}
                  depthWrite={true}
                  depthTest={true}
                />
              </mesh>

              {/* Glowing Aura */}
              <mesh scale={[1.4, 1.4, 1.4]}>
                <sphereGeometry args={[coreNode.size, 16, 16]} />
                <meshBasicMaterial
                  ref={coreAuraMaterialRef}
                  color={coreNode.color}
                  transparent
                  opacity={isActive ? 0.3 : 0.05}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              {/* Core Node HUD Overlay */}
              <Html
                position={[0, coreNode.size + 0.5, 0]}
                center
                className={`transition-opacity duration-300 pointer-events-none ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                zIndexRange={[100, 0]}
              >
                {isActive && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg min-w-[250px] pointer-events-auto transform-gpu will-change-transform">
                    <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: coreNode.color }} />
                      {coreNode.label}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-2">{coreNode.synopsis}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(coreNode);
                      }}
                      className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors text-sm border border-white/10"
                    >
                      Enter Realm
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNode(null);
                        invalidate();
                      }}
                      className="mt-2 w-full py-2 text-zinc-500 hover:text-white transition-colors text-xs"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Html>
            </group>
          );
        })()}
      </group>

      {/* Orbiting Nodes & Connections */}
      <group ref={orbitGroupRef}>
        {/* Connections */}
        {CONNECTIONS.map(([startId, endId], idx) => {
          const startNode = NODES.find(n => n.id === startId);
          const endNode = NODES.find(n => n.id === endId);
          if (!startNode || !endNode) return null;
          return (
            <Line
              key={`line-${idx}`}
              points={[startNode.position, endNode.position]}
              color="#ffffff"
              lineWidth={0.5}
              transparent
              opacity={0.15}
            />
          );
        })}

        {/* Orbiting Nodes */}
        {NODES.filter(n => n.id !== "core").map((node) => {
          const isActive = activeNode?.id === node.id;
          
          return (
            <group key={node.id} position={node.position}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node);
                }}
                onPointerOver={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <sphereGeometry args={[node.size, 32, 32]} />
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={0.4}
                  wireframe={node.isEasterEgg}
                  transparent={false}
                  opacity={1.0}
                  depthWrite={true}
                  depthTest={true}
                />
              </mesh>

              {/* Glowing Aura */}
              <mesh scale={[1.4, 1.4, 1.4]}>
                <sphereGeometry args={[node.size, 16, 16]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent
                  opacity={isActive ? 0.3 : 0.05}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              {/* Node HUD Overlay */}
              <Html
                position={[0, node.size + 0.5, 0]}
                center
                className={`transition-opacity duration-300 pointer-events-none ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                zIndexRange={[100, 0]}
              >
                {isActive && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg min-w-[250px] pointer-events-auto transform-gpu will-change-transform">
                    <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                      {node.label}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-2">{node.synopsis}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(node);
                      }}
                      className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors text-sm border border-white/10"
                    >
                      {node.isEasterEgg ? "[ ACCESS ARCHITECT LOGS ]" : "Enter Realm"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNode(null);
                        invalidate();
                      }}
                      className="mt-2 w-full py-2 text-zinc-500 hover:text-white transition-colors text-xs"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Html>
            </group>
          );
        })}
      </group>

      <OrbitControls
        makeDefault
        enablePan={true}
        minDistance={5}
        maxDistance={80}
        autoRotate={false}
      />
    </>
  );
}
