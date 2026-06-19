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
};

const NODES: NodeData[] = [
  { id: "core", label: "Affan", position: [0, 0, 0], color: "#2398f7", size: 1.2, synopsis: "The Apex Predator. The central gravity of the Affanverse.", link: "/" },
  { id: "books", label: "The Books", position: [-5, 3, -2], color: "#a855f7", size: 0.4, synopsis: "Chronicles and tales from the multiverse. Includes the main light novel.", link: "/novel" },
  { id: "games", label: "Minigames", position: [5, -2, 3], color: "#ef4444", size: 0.5, synopsis: "The Void Portal. Survive the anomalies and secure your sanity.", link: "/minigame" },
  { id: "music", label: "Music", position: [-3, -4, 4], color: "#10b981", size: 0.45, synopsis: "Immersive soundscapes and curated playlists.", link: "/music" },
  { id: "architect", label: "The Architect", position: [1, -8, -6], color: "#ff003c", size: 0.2, synopsis: "System Initialized. Identity: Jeka.", link: "https://github.com/MufidJK", isEasterEgg: true }
];

// Connection lines pairs
const CONNECTIONS = [
  ["core", "books"],
  ["core", "games"],
  ["core", "music"],
  ["core", "architect"]
];

export function IntercelestialScene() {
  const { scene, camera, invalidate } = useThree();
  const router = useRouter();
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);

  const orbitGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreAuraMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

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
  });

  // Handle zooming into a node
  const handleNodeClick = (node: NodeData) => {
    setActiveNode(node);
    invalidate(); // Re-render to show active state
  };

  const handleActionClick = (node: NodeData) => {
    if (node.isEasterEgg) {
      window.open(node.link, "_blank", "noopener,noreferrer");
    } else {
      router.push(node.link);
    }
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
                  <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-lg shadow-xl backdrop-blur-md min-w-[250px] pointer-events-auto transform-gpu">
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
          const startNode = NODES.find(n => n.id === startId)!;
          const endNode = NODES.find(n => n.id === endId)!;
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
                  <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-lg shadow-xl backdrop-blur-md min-w-[250px] pointer-events-auto transform-gpu">
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
        enablePan={false}
        minDistance={5}
        maxDistance={80}
        autoRotate={false}
      />
    </>
  );
}
