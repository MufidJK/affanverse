import { Metadata } from "next";
import IntercelestialClient from "./IntercelestialClient"; 

export const metadata: Metadata = {
   title: "Intercelestial 🌌 | Affanverse",
   // Tambahin deskripsi metadata lu di sini kalo ada
};

export default function IntercelestialPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      <IntercelestialClient />
    </main>
  );
}
