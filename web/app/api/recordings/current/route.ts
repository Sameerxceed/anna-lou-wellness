import { NextResponse } from 'next/server';
import { fetchCurrentRecording } from '@/lib/strapi-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const recording = await fetchCurrentRecording();
  if (!recording) {
    return NextResponse.json({ recording: null }, { status: 200 });
  }
  // Only expose what the public buy card needs — never the YouTube URL
  // (that's paywalled and delivered post-payment via email / library).
  return NextResponse.json({
    recording: {
      id: recording.id,
      title: recording.title,
      session_date: recording.session_date,
      price_gbp: recording.price_gbp,
      description: recording.description || null,
    },
  });
}
