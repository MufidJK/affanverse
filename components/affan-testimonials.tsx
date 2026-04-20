import React from "react";
import { Quote, User } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export async function AffanTestimonials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // fetch the data based on the 'testimonials' section.
  // change 'gallery' to your actual table name if needed
  const { data: dbData } = await supabase
    .from("gallery")
    .select("*")
    .contains("sections", ["testimonials"]);

  const baseRow1 = [
    { name: "Jeka", role: "Teman", text: "Orangnya bahaya kalau dibiarin nganggur, mending suruh rebahan aja.", avatarUrl: "/images/pfps/jeka-pfp.png" },
    { name: "Mas Gilang", role: "Observer", text: "Saya tidak tahu ini web apa, tapi desainnya terlalu bagus untuk orang seperti dia.", avatarUrl: "/images/pfps/gilang-pfp.png" },
    { name: "Noval", role: "Survivor", text: "Semenjak kenal Affan, hidup saya jadi lebih... ya gitu deh pokoknya.", avatarUrl: "/images/pfps/noval-pfp.png" },
    { name: "Febry", role: "Critic", text: "Developer tier S, tapi S-nya Sempoyongan.", avatarUrl: "/images/pfps/febry-pfp.png" },
    { name: "Faiz", role: "Judge", text: "Kalau ada penghargaan orang ter-random, dia udah pasti menang piala platinum.", avatarUrl: "/images/pfps/faiz-pfp.png" },
    { name: "Fadhil", role: "Philosopher", text: "Website ini adalah bukti nyata bahwa gabut bisa menjadi karya seni tingkat tinggi.", avatarUrl: "/images/pfps/fadhil-pfp.png" },
    { name: "Anonim", role: "Netizen", text: "Tolong kembalikan waktu 5 menit saya setelah melihat website ini.", avatarUrl: null },
    { name: "Mas Amba", role: "Ambativasi", text: "Lari ada wibu! Eh tapi orang ini rajin banget, rajin gabut maksudnya.", avatarUrl: "/images/pfps/amba-pfp.png" },
    { name: "My Bini", role: "My Bini Gwehj", text: "Cuman saya yang tahu penderitaannya ngerawat orang ini tiap hari.", avatarUrl: "/images/pfps/bini-pfp.png" },
    { name: "Yoichi Isagi", role: "Striker Egois", text: "Ego Affan ini... gila banget! Lebih parah dari Barou waktu di Blue Lock.", avatarUrl: "/images/pfps/isagi-pfp.png" }
  ];

  const baseRow2 = [
    { name: "Affan Old", role: "Masa Lalu", text: "Dulu gw retard banget, kenapa sekarang lu jadi begini dah? Tapi GG sih.", avatarUrl: null },
    { name: "Castorice", role: "Pengamat Angsa", text: "Kalo Affan ini angsa, dia pasti angsa yang paling berisik di danau. Keren tapi bikin pusing.", avatarUrl: null },
    { name: "Pak Rahmat", role: "Dosen Pembimbing Gaib", text: "Tugas telat mulu, tapi webnya cakep juga. Nilai C+ lah buat effort.", avatarUrl: null },
    { name: "Mas Rusdi", role: "Barber Ngawi", text: "Cukuran rambutnya masih mending gw yang pegang, tapi asik lah orangnya, gasss.", avatarUrl: null },
    { name: "Kak Zani", role: "Sepuh", text: "Gak nyangka anak kemaren sore bisa bikin web ginian. Sungkem dulu sini.", avatarUrl: null },
    { name: "Pak Slamat", role: "Satpam Komplek", text: "Ini anak sering banget nongkrong di depan, sekarang malah ada webnya. Mantap mas.", avatarUrl: null },
    { name: "Eugene Elizabeth D Mpruyy", role: "Tsundere", text: "B-bukan berarti gw suka web lu ya! Cuman... ya lumayan lah buat ukuran orang kayak lu.", avatarUrl: null },
    { name: "Ronaldo", role: "G.O.A.T", text: "SIUUUUU! Web lu bagus, tapi masih bagusan tendangan salto gw.", avatarUrl: null },
    { name: "King Ambatron", role: "Penguasa Ngawi", text: "Masbuloh... webnya bikin gw pengen meledak! Terlalu epik buat warga biasa.", avatarUrl: null },
    { name: "Claudio Pizarro", role: "Striker Veteran", text: "Gak paham ini web apaan, tapi finishing-nya lumayan tajam kayak gw pas di Bayern.", avatarUrl: null }
  ];

  const mergedRow1 = baseRow1.map(item => {
    const dbMatch = dbData?.find(db => db.title === item.name);
    return {
      ...item,
      avatarUrl: dbMatch?.media_url || item.avatarUrl
    };
  });

  const mergedRow2 = baseRow2.map(item => {
    const dbMatch = dbData?.find(db => db.title === item.name);
    return {
      ...item,
      avatarUrl: dbMatch?.media_url || item.avatarUrl
    };
  });

  const renderCard = (item: any, index: number) => (
    <div
      key={index}
      className="w-[280px] md:w-[450px] shrink-0 rounded-3xl border border-[#2398f7]/30 bg-background/50 backdrop-blur-md p-5 md:p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Subtle Glow Effect */}
      <div className="absolute -inset-10 bg-[#2398f7]/10 blur-2xl rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Profile Section */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-full border-2 border-[#2398f7]/50 overflow-hidden bg-background/80 flex items-center justify-center p-0">
            {item.avatarUrl ? (
              <img 
                src={item.avatarUrl} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-300 scale-[110%]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 transition-transform duration-300 scale-[110%]">
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm md:text-lg text-[#2398f7] leading-tight">{item.name}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
              {item.role}
            </span>
          </div>
        </div>

        {/* Testimonial Quote and Text */}
        <Quote className="w-5 h-5 md:w-10 md:h-10 text-[#2398f7]/40 mb-2" />
        <p className="text-muted-foreground text-xs md:text-base leading-relaxed min-h-[60px] italic">
          "{item.text}"
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full relative flex flex-col items-center">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 40s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="text-center mb-12 space-y-3 px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-[#2398f7]">
          Testimonials from the Multiverse
        </p>
        <h2 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          What they say about <span className="text-[#2398f7]">Affan</span>
        </h2>
      </div>

      <div className="w-full overflow-hidden flex flex-col relative py-4">
        {/* Left & Right gradient masks for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Top Row */}
        <div className="w-max flex gap-4 md:gap-8 mb-4 md:mb-6 animate-marquee-left pause-on-hover px-4 md:px-6">
          {[...mergedRow1, ...mergedRow1].map((item, index) => renderCard(item, index))}
        </div>

        {/* Bottom Row */}
        <div className="w-max flex gap-4 md:gap-8 animate-marquee-right pause-on-hover px-4 md:px-6">
          {[...mergedRow2, ...mergedRow2].map((item, index) => renderCard(item, index))}
        </div>
      </div>
    </div>
  );
}
