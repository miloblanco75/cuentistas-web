import { NextResponse } from 'next/server';

export async function GET() {
  // Las notificaciones en vivo las mudaremos a Pusher más adelante (Paso 4)
  return NextResponse.json({ events: [] });
}
