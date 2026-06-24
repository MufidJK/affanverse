'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface ScorePayload {
  player_name: string
  game_slug: 'affan_low_cortisol'
  score: number
}

interface ScoreResult {
  success: boolean
  error?: string
}

/* ═══════════════════════════════════════════════
   SERVER ACTION — Secure Score Submission
   ═══════════════════════════════════════════════ */

/**
 * Upserts a score into the minigame_scores table.
 * Uses the UNIQUE(player_name, game_slug) constraint
 * to overwrite only if the new score is higher.
 *
 * Runs server-side — the Supabase client is never
 * exposed to the browser bundle.
 */
export async function submitLowCortisolScore(
  payload: ScorePayload
): Promise<ScoreResult> {
  // ── Input Validation ──────────────────────────
  const name = payload.player_name?.trim()
  if (!name || name.length === 0 || name.length > 30) {
    return { success: false, error: 'Invalid player name' }
  }
  if (payload.game_slug !== 'affan_low_cortisol') {
    return { success: false, error: 'Invalid game slug' }
  }
  if (
    typeof payload.score !== 'number' ||
    !Number.isFinite(payload.score) ||
    payload.score < 0
  ) {
    return { success: false, error: 'Invalid score' }
  }

  try {
    // Check existing score to prevent overwriting with a lower score
    const { data: existing } = await (supabaseAdmin.from('minigame_scores') as any)
      .select('score')
      .eq('player_name', name)
      .eq('game_slug', 'affan_low_cortisol')
      .single()

    if (existing && existing.score >= payload.score) {
      // Do not overwrite if the existing score is higher or equal
      return { success: true }
    }

    const { error } = await (supabaseAdmin.from('minigame_scores') as any).upsert(
      {
        player_name: name,
        game_slug: 'affan_low_cortisol' as const,
        score: Math.floor(payload.score),
      },
      { onConflict: 'player_name,game_slug' }
    )

    if (error) {
      console.error('[LowCortisol] Supabase upsert error:', error)
      return { success: false, error: 'Database error' }
    }

    return { success: true }
  } catch (err) {
    console.error('[LowCortisol] Unexpected error:', err)
    return { success: false, error: 'Server error' }
  }
}
