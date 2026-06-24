import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/* ═══════════════════════════════════════════════
   POST /api/submit-guestbook
   Secure guestbook insert — bypasses RLS
   via supabaseAdmin (Service Role Key).
   ═══════════════════════════════════════════════ */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message, page_id } = body;

    // ── Validation Layer ──────────────────────────
    if (
      !name ||
      typeof name !== 'string' ||
      name.trim().length < 2
    ) {
      return NextResponse.json({ error: 'Nama minimal 2 karakter bro!' }, { status: 400 });
    }

    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length < 5 ||
      message.trim().length > 200
    ) {
      return NextResponse.json({ error: 'Pesan harus antara 5-200 karakter.' }, { status: 400 });
    }

    if (!page_id || typeof page_id !== 'string') {
      return NextResponse.json({ error: 'Invalid page_id' }, { status: 400 });
    }

    // ── Insert via admin — nembus RLS ─────────────
    const { error } = await (supabaseAdmin as any)
      .from('guestbook')
      .insert([{
        name: name.trim(),
        message: message.trim(),
        page_id,
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Jejak berhasil ditinggalkan!' });

  } catch (error) {
    console.error('[API /submit-guestbook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
