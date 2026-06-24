import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/* ═══════════════════════════════════════════════
   WHITELIST — valid game slugs only
   ═══════════════════════════════════════════════ */

const VALID_GAME_SLUGS = new Set([
  'flappy-affan',
  'affan-strike',
  'ambasuke-protocol',
  'affan-endless-runner',
  'affan_low_cortisol',
  'affan-card-protocol',
]);

/* ═══════════════════════════════════════════════
   POST /api/submit-score
   Universal minigame score upsert — bypasses RLS
   via supabaseAdmin (Service Role Key).
   ═══════════════════════════════════════════════ */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_name, game_slug, score } = body;

    // ── Validation Layer ──────────────────────────
    if (
      !player_name ||
      typeof player_name !== 'string' ||
      player_name.trim().length === 0 ||
      player_name.trim().length > 30
    ) {
      return NextResponse.json({ error: 'Invalid player name' }, { status: 400 });
    }

    if (!game_slug || !VALID_GAME_SLUGS.has(game_slug)) {
      return NextResponse.json({ error: 'Invalid game slug' }, { status: 400 });
    }

    if (
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0
    ) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    // ── Upsert via admin — nembus RLS ─────────────
    const { error } = await (supabaseAdmin.from('minigame_scores') as any).upsert(
      {
        player_name: player_name.trim(),
        game_slug,
        score: Math.floor(score),
      },
      { onConflict: 'player_name,game_slug' }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Skor berhasil diamankan!' });

  } catch (error) {
    console.error('[API /submit-score] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}