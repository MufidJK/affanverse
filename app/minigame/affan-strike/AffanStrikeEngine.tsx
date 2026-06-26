"use client";
import React from "react";
import Link from "next/link";
import { useGameEngine } from "./useGameEngine";

export default function AffanStrikeEngine() {
  // Lock body scroll on mount
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }, []);
  }
  const e = useGameEngine();

  return (
    <div className="fixed inset-0 z-[100] w-[100dvw] h-[100dvh] max-w-none overflow-hidden flex flex-col bg-[#0a0a0f] selection:bg-cyan-400/30">
      {/* PORTRAIT MODE BLOCKER */}
      <div className="fixed inset-0 z-[99999] bg-zinc-950/95 backdrop-blur-md text-white flex-col items-center justify-center portrait:flex landscape:hidden">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-orange-500 rounded-xl transform rotate-90 flex items-center justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full absolute right-2"></div>
          </div>
          <svg className="absolute -bottom-4 -right-4 w-10 h-10 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M21 8l-5.5-5.5"></path><path d="M3 22v-6h6"></path><path d="M3 16l5.5 5.5"></path></svg>
        </div>
        <h1 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 uppercase tracking-widest mb-2 drop-shadow-md">Device Rotation Required</h1>
        <p className="text-center text-white/60 text-sm px-8 max-w-[300px]">Affan Strike requires Landscape mode for the best action combat experience.</p>
      </div>

      {/* Back */}
      <Link href="/minigame" className="fixed top-3 left-3 z-[100] flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white rounded-full text-xs font-semibold transition-colors will-change-transform transform-gpu border border-white/15">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </Link>

      {/* HP Bar */}
      <div className="fixed top-3 right-3 z-[90] w-64 md:w-80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xl font-black text-white uppercase tracking-wide drop-shadow-md">Affan HP</span>
        </div>
        <div className="h-8 bg-white/20 rounded-2xl overflow-hidden border-4 border-white/30 relative mb-2 shadow-lg">
          <div ref={e.hpBarRef} className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-[width] duration-150" style={{ width: "100%" }} />
          <div ref={e.hpTextRef} className="absolute inset-0 flex items-center justify-center text-3xl font-mono font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>
        </div>
        <div className="text-right bg-black/40 inline-block float-right px-4 py-1.5 rounded-xl border border-white/10">
          <span className="text-sm font-bold text-white/80 uppercase tracking-wider mr-2">Score:</span>
          <span ref={e.scoreTextRef} className="text-2xl font-black text-yellow-400 tabular-nums drop-shadow-md">0</span>
        </div>
      </div>

      {/* Boss HP (boss phases only) */}
      {(e.uiPhase === "boss_intro" || e.uiPhase === "boss_fight") && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[90] w-[90%] md:w-[600px] flex flex-col items-center">
          <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 uppercase tracking-[0.3em] mb-1 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">DIO</p>
          <div className="w-full relative p-1 bg-gradient-to-b from-yellow-600 via-yellow-400 to-yellow-700 rounded-sm drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] border-y-4 border-x-2 border-yellow-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
            <div className="h-6 md:h-8 w-full bg-zinc-950 border border-black/80 relative shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
              <div ref={e.bossHpBarRef} className="h-full bg-gradient-to-r from-red-700 via-yellow-500 to-red-700 transition-[width] duration-150 shadow-[inset_0_0_5px_rgba(255,255,255,0.3)]" style={{ width: "100%" }} />
              <div ref={e.bossHpTextRef} className="absolute inset-0 flex items-center justify-center text-lg md:text-xl font-mono font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:_0_0_4px_rgb(0_0_0_/_100%)] tracking-wider"></div>
            </div>
            {/* Corner Ornaments */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/60"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/60"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/60"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/60"></div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div ref={e.containerRef} className="relative flex-1 w-full overflow-hidden z-10">
        {/* DIO APPROACHES DOM OVERLAY */}
        <div ref={e.dioApproachesRef} className="absolute top-[15%] left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-full text-center" style={{ display: 'none' }}>
          <h1 className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_4px_8px_rgb(0_0_0_/_100%)] tracking-wider" style={{ WebkitTextStroke: '2px #b45309' }}>
            DIO APPROACHES!
          </h1>
        </div>

        <canvas ref={e.canvasRef} className="w-full h-full max-w-none object-contain" style={{ imageRendering: "auto", touchAction: "none" }} />

        {/* DIO BUBBLE */}
        <div ref={e.dioBubbleRef} className="absolute z-40 -translate-x-1/2 -translate-y-[calc(100%+16px)] pointer-events-none" style={{ display: 'none' }}>
          <div className="bg-white text-black border-2 border-black font-black text-sm md:text-base px-4 py-2 rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] max-w-xs text-center relative">
            <div ref={e.dioBubbleTextRef}></div>
            <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white drop-shadow-[0_2px_0_rgba(0,0,0,1)]"></div>
          </div>
        </div>

        {/* AFFAN BUBBLE */}
        <div ref={e.affanBubbleRef} className="absolute z-40 -translate-x-1/2 -translate-y-[calc(100%+16px)] pointer-events-none" style={{ display: 'none' }}>
          <div className="bg-orange-500 text-white border-2 border-white font-black text-sm md:text-base px-4 py-2 rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] max-w-xs text-center relative">
            <div ref={e.affanBubbleTextRef}></div>
            <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-orange-500 drop-shadow-[0_2px_0_rgba(255,255,255,1)]"></div>
          </div>
        </div>

        {/* REGISTER */}
        {e.uiPhase === "register" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tight">
              <span className="text-orange-400">AFFAN</span> STRIKE
            </h2>
            <p className="text-white/40 text-xs mb-6">Endless Runner × Boss Fight</p>
            <div className="w-64 space-y-3">
              <input type="text" placeholder="Your name..." value={e.nameInput} onChange={ev => e.setNameInput(ev.target.value)} maxLength={20} autoFocus
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 transition-colors"
                onKeyDown={ev => { if (ev.key === "Enter") e.handleRegister(); ev.stopPropagation(); }} />
              <button onClick={e.handleRegister} disabled={!e.nameInput.trim()}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95">
                Enter the Arena
              </button>
            </div>
          </div>
        )}

        {/* READY */}
        {e.uiPhase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 pointer-events-none">
            <p className="text-white/50 text-xs mb-1">Playing as <span className="text-orange-400">{e.playerName}</span></p>
            <div className="animate-bounce mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </div>
            <p className="text-white text-lg font-bold tracking-wide text-center px-6">Press Space / Tap Jump to Start</p>
            <div className="mt-1 text-white/40 text-xs space-y-0.5 text-center">
              <p>⬆ Jump · ⬇ Crouch · ◄► Move (Boss) · E Attack · Q Ultimate</p>
            </div>
            {e.highScore > 0 && <p className="text-white/30 text-xs mt-3">Best: {e.highScore}</p>}
            <LBBlock lb={e.leaderboard} />
          </div>
        )}

        {/* GAME OVER */}
        {e.uiPhase === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2"><span className="text-red-500">GAME</span> OVER</h2>
            <div className="bg-white/10 rounded-xl px-8 py-4 mb-3 border border-white/10 min-w-[180px]">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1 text-center">Score</p>
              <p className="text-3xl font-black text-orange-400 text-center tabular-nums">{e.displayScore}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-6 py-2 mb-4 border border-white/5">
              <p className="text-white/40 text-xs uppercase text-center">Best: <span className="text-amber-400 font-bold tabular-nums">{e.highScore}</span></p>
            </div>
            <button onClick={e.handleRestart} className="px-10 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95 mb-4">
              Play Again
            </button>
            <LBBlock lb={e.leaderboard} />
          </div>
        )}

        {/* VICTORY */}
        {e.uiPhase === "victory" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-1"><span className="text-yellow-400">VICTORY</span>!</h2>
            <p className="text-white/50 text-sm mb-3">DIO has been defeated!</p>
            <div className="bg-white/10 rounded-xl px-8 py-4 mb-3 border border-yellow-500/20 min-w-[180px]">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1 text-center">Final Score</p>
              <p className="text-3xl font-black text-yellow-400 text-center tabular-nums">{e.displayScore}</p>
            </div>
            <button onClick={e.handleRestart} className="px-10 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95 mb-4">
              Play Again
            </button>
            <LBBlock lb={e.leaderboard} />
          </div>
        )}

        {/* GENSHIN SKILL UI (DESKTOP) */}
        {!e.isTouchDevice && (e.uiPhase === "runner" || e.uiPhase === "boss_fight") && (
          <div className="absolute bottom-6 right-6 z-30 pointer-events-none flex gap-6 items-end">
            <div ref={e.skillBtnRef} className="w-16 h-16 rounded-full border-2 border-yellow-300/80 bg-zinc-900/90 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center relative backdrop-blur-md transition-all">
              <span className="text-yellow-100 font-bold text-2xl drop-shadow-md">E</span>
              <div className="absolute inset-0 rounded-full border border-yellow-100/30"></div>
              <div ref={e.skillCdRef} className="absolute inset-0 flex items-center justify-center text-white font-mono text-xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/60 rounded-full empty:hidden"></div>
            </div>
            <div ref={e.ultiBtnRef} className="w-20 h-20 rounded-full border-2 border-orange-400/80 bg-zinc-900/90 shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center relative backdrop-blur-md transition-all -translate-y-2">
              <span className="text-orange-100 font-black text-3xl drop-shadow-md">Q</span>
              <div className="absolute inset-0 rounded-full border border-orange-100/30"></div>
              <div ref={e.ultiCdRef} className="absolute inset-0 flex items-center justify-center text-white font-mono text-2xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/70 rounded-full empty:hidden"></div>
            </div>
          </div>
        )}

        {/* TUTORIAL MESSAGE OVERLAY */}
        {e.uiPhase === "runner" && (
          <div ref={e.welcomeMsgRef} className="absolute top-1/3 left-1/2 -translate-x-1/2 p-4 bg-black/60 rounded-xl border border-yellow-500/50 backdrop-blur-sm pointer-events-none transition-opacity duration-75" style={{ opacity: 0 }}>
            <p className="text-white font-bold text-lg md:text-xl drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] whitespace-nowrap text-center">
              Dio akan muncul jika score mencapai 100!
            </p>
          </div>
        )}

        {/* MOBILE TOUCH CONTROLS */}
        {e.isTouchDevice && (e.uiPhase === "ready" || e.uiPhase === "runner" || e.uiPhase === "boss_fight" || e.uiPhase === "boss_intro") && (
          <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none p-4 pb-2 flex justify-between items-end">
            
            {/* LEFT SIDE (Movement / Jump/Crouch) */}
            <div className="pointer-events-auto flex gap-2">
              {(e.uiPhase === "runner" || e.uiPhase === "ready") ? (
                <div className="flex gap-2">
                  <button onTouchStart={ev => { ev.preventDefault(); e.doJump(); }} className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-2xl font-bold active:bg-white/30 will-change-transform transform-gpu select-none backdrop-blur-sm">▲</button>
                  <button onTouchStart={ev => { ev.preventDefault(); e.doCrouch(true); }} onTouchEnd={ev => { ev.preventDefault(); e.doCrouch(false); }} className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-2xl font-bold active:bg-white/30 will-change-transform transform-gpu select-none backdrop-blur-sm">▼</button>
                </div>
              ) : (
                <div className="flex gap-2 items-end">
                  <button onTouchStart={ev => { ev.preventDefault(); e.doMove("left"); }} onTouchEnd={ev => { ev.preventDefault(); e.doMove("none"); }} className="w-16 h-16 rounded-2xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black active:bg-cyan-500/50 will-change-transform transform-gpu select-none backdrop-blur-sm">◄</button>
                  <button onTouchStart={ev => { ev.preventDefault(); e.doMove("right"); }} onTouchEnd={ev => { ev.preventDefault(); e.doMove("none"); }} className="w-16 h-16 rounded-2xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black active:bg-cyan-500/50 will-change-transform transform-gpu select-none backdrop-blur-sm">►</button>
                </div>
              )}
            </div>

            {/* RIGHT SIDE (Actions Cluster) */}
            <div className="pointer-events-auto">
              {(e.uiPhase === "runner" || e.uiPhase === "ready") ? (
                <div className="flex gap-4 items-end">
                  <button ref={e.skillBtnRef} onTouchStart={ev => { ev.preventDefault(); e.doAttack(); }} className="w-16 h-16 rounded-full border-2 border-yellow-300/80 bg-zinc-900/90 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center relative backdrop-blur-md active:scale-90 transition-transform">
                    <span className="text-yellow-100 font-bold text-2xl drop-shadow-md pointer-events-none">E</span>
                    <div className="absolute inset-0 rounded-full border border-yellow-100/30 pointer-events-none"></div>
                    <div ref={e.skillCdRef} className="absolute inset-0 flex items-center justify-center text-white font-mono text-xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/60 rounded-full empty:hidden pointer-events-none"></div>
                  </button>
                  <button ref={e.ultiBtnRef} onTouchStart={ev => { ev.preventDefault(); e.doUlti(); }} className="w-20 h-20 rounded-full border-2 border-orange-400/80 bg-zinc-900/90 shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center relative backdrop-blur-md active:scale-90 transition-transform">
                    <span className="text-orange-100 font-black text-3xl drop-shadow-md pointer-events-none">Q</span>
                    <div className="absolute inset-0 rounded-full border border-orange-100/30 pointer-events-none"></div>
                    <div ref={e.ultiCdRef} className="absolute inset-0 flex items-center justify-center text-white font-mono text-2xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/70 rounded-full empty:hidden pointer-events-none"></div>
                  </button>
                </div>
              ) : (
                <>
                  {/* Boss Phase: Skill & Burst Cluster (Shifted Left) */}
                  <div className="absolute bottom-6 right-28 flex gap-4 items-end z-20">
                    <button ref={e.skillBtnRef} onTouchStart={ev => { ev.preventDefault(); e.doAttack(); }} className="w-14 h-14 rounded-full border-2 border-yellow-300/80 bg-zinc-900/90 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center relative backdrop-blur-md active:scale-90 transition-transform">
                      <span className="text-yellow-100 font-bold text-xl drop-shadow-md pointer-events-none">E</span>
                      <div className="absolute inset-0 rounded-full border border-yellow-100/30 pointer-events-none"></div>
                      <div ref={e.skillCdRef} className="absolute inset-0 flex items-center justify-center text-white font-mono text-lg font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/60 rounded-full empty:hidden pointer-events-none"></div>
                    </button>
                    <button ref={e.ultiBtnRef} onTouchStart={ev => { ev.preventDefault(); e.doUlti(); }} className="w-16 h-16 rounded-full border-2 border-orange-400/80 bg-zinc-900/90 shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center relative backdrop-blur-md active:scale-90 transition-transform">
                      <span className="text-orange-100 font-black text-2xl drop-shadow-md pointer-events-none">Q</span>
                      <div className="absolute inset-0 rounded-full border border-orange-100/30 pointer-events-none"></div>
                      <div ref={e.ultiCdRef} className="absolute inset-0 flex items-center justify-center text-white font-mono text-xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/70 rounded-full empty:hidden pointer-events-none"></div>
                    </button>
                  </div>
                  
                  {/* Boss Phase: Jump & Crouch (Pinned Far Right) */}
                  <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-10">
                    <button onTouchStart={ev => { ev.preventDefault(); e.doJump(); }} className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-2xl font-bold active:bg-white/30 will-change-transform transform-gpu select-none backdrop-blur-sm">▲</button>
                    <button onTouchStart={ev => { ev.preventDefault(); e.doCrouch(true); }} onTouchEnd={ev => { ev.preventDefault(); e.doCrouch(false); }} className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-2xl font-bold active:bg-white/30 will-change-transform transform-gpu select-none backdrop-blur-sm">▼</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LBBlock({ lb }: { lb: { player_name: string; score: number }[] }) {
  return (
    <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-3 w-56">
      <h3 className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
        <span>Top Players</span>
        <svg className="w-3 h-3 text-orange-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      </h3>
      <div className="space-y-1.5">
        {lb.length > 0 ? lb.map((en, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-white/60 truncate mr-2"><span className="text-white/30 mr-1.5">{i + 1}.</span>{en.player_name}</span>
            <span className="text-orange-400 font-black tabular-nums">{en.score}</span>
          </div>
        )) : <div className="text-white/30 text-xs text-center py-1">Loading...</div>}
      </div>
    </div>
  );
}