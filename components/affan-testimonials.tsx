import React from "react";
import { createClient } from "@supabase/supabase-js";
import { TestimonialsMarquee } from "./testimonials-marquee";

// ─── Local Testimonial Data ─────────────────────────────────────────
const LOCAL_TESTIMONIALS = [
  {
    name: "Jeka",
    role: "Teman",
    text: "Orangnya bahaya kalau dibiarin nganggur, mending suruh rebahan aja.",
    avatarUrl: "/images/pfps/jeka-pfp.png",
  },
  {
    name: "Mas Gilang",
    role: "Observer",
    text: "Saya tidak tahu ini web apa, tapi desainnya terlalu bagus untuk orang seperti dia.",
    avatarUrl: "/images/pfps/gilang-pfp.png",
  },
  {
    name: "Noval",
    role: "Survivor",
    text: "Semenjak kenal Affan, hidup saya jadi lebih... ya gitu deh pokoknya.",
    avatarUrl: "/images/pfps/noval-pfp.png",
  },
  {
    name: "Febry",
    role: "Critic",
    text: "Developer tier S, tapi S-nya Sempoyongan.",
    avatarUrl: "/images/pfps/febry-pfp.png",
  },
  {
    name: "Faiz",
    role: "Judge",
    text: "Kalau ada penghargaan orang ter-random, dia udah pasti menang piala platinum.",
    avatarUrl: "/images/pfps/faiz-pfp.png",
  },
  {
    name: "Fadhil",
    role: "Philosopher",
    text: "Website ini adalah bukti nyata bahwa gabut bisa menjadi karya seni tingkat tinggi.",
    avatarUrl: "/images/pfps/fadhil-pfp.png",
  },
  {
    name: "Anonim",
    role: "Netizen",
    text: "Tolong kembalikan waktu 5 menit saya setelah melihat website ini.",
    avatarUrl: "/images/pfps/anonim-pfp.png",
  },
  {
    name: "Mas Amba",
    role: "Ambativasi",
    text: "Lari ada wibu! Eh tapi orang ini rajin banget, rajin gabut maksudnya.",
    avatarUrl: "/images/pfps/amba-pfp.png",
  },
  {
    name: "My Bini",
    role: "My Bini Gwehj",
    text: "Cuman saya yang tahu penderitaannya ngerawat orang ini tiap hari.",
    avatarUrl: "/images/pfps/bini-pfp.png",
  },
  {
    name: "Yoichi Isagi",
    role: "Striker Egois",
    text: "Ego Affan ini... gila banget! Lebih parah dari Barou waktu di Blue Lock.",
    avatarUrl: "/images/pfps/isagi-pfp.png",
  },
];

// ─── Server-Side Supabase Fetch ─────────────────────────────────────
async function fetchTestimonialAvatars() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("gallery")
      .select("title, media_url")
      .contains("sections", ["testimonials"]);

    if (error) {
      console.error("Failed to fetch testimonial avatars:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Failed to fetch testimonial avatars:", e);
    return null;
  }
}

// ─── Async Server Component ─────────────────────────────────────────
export async function AffanTestimonials() {
  const dbAvatars = await fetchTestimonialAvatars();

  // Hybrid merge: DB avatars take priority over local fallbacks
  const mergedTestimonials = LOCAL_TESTIMONIALS.map((testimonial) => {
    const dbMatch = dbAvatars?.find(
      (dbItem) => dbItem.title === testimonial.name
    );

    return {
      ...testimonial,
      // Priority: 1. Supabase DB Image -> 2. Local Fallback -> 3. Default silhouette
      avatarSrc:
        dbMatch?.media_url ||
        testimonial.avatarUrl ||
        "/images/pfps/anonim-pfp.png",
    };
  });

  return <TestimonialsMarquee testimonials={mergedTestimonials} />;
}
