"use client";

import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  url: string;
}

const Model = ({ url }: ModelViewerProps) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!scene) return;

    // Apply corrupted wireframe aesthetic
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: "#ff003c",
        });
      }
    });

    // STRICT MEMORY DISPOSAL (SOP RULE 7)
    return () => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    };
  }, [scene]);

  return <primitive object={scene} />;
};

export const TerminalModelViewer = ({ url }: ModelViewerProps) => {
  return (
    <div className="w-full h-full relative border border-[#ff003c]/30 bg-black/90">
      <Canvas dpr={[1, 1.5]} frameloop="always">
        <ambientLight intensity={0.5} />
        <OrbitControls autoRotate autoRotateSpeed={2} />
        <Model url={url} />
      </Canvas>
    </div>
  );
};
