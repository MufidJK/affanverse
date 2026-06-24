'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface ScorePayload {
  player_name: string
  game_slug: 'affan-card-protocol'
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
export async function submitCardProtocolScore(
  payload: ScorePayload
): Promise<ScoreResult> {
  // ── Input Validation ──────────────────────────
  const name = payload.player_name?.trim()
  if (!name || name.length === 0 || name.length > 30) {
    return { success: false, error: 'Invalid player name' }
  }
  if (payload.game_slug !== 'affan-card-protocol') {
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
    const { error } = await (supabaseAdmin.from('minigame_scores') as any).upsert(
      {
        player_name: name,
        game_slug: 'affan-card-protocol' as const,
        score: Math.floor(payload.score),
      },
      { onConflict: 'player_name,game_slug' }
    )

    if (error) {
      console.error('[AffanCardProtocol] Supabase upsert error:', error)
      return { success: false, error: 'Database error' }
    }

    return { success: true }
  } catch (err) {
    console.error('[AffanCardProtocol] Unexpected error:', err)
    return { success: false, error: 'Server error' }
  }
}
