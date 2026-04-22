import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ ok: false, error: "Conexión con el Oráculo denegada (No Auth)" }, { status: 401 });
        }

        const { text, voice = "onyx" } = await req.json();

        if (!text || text.length < 5) {
            return NextResponse.json({ ok: false, error: "El manuscrito es demasiado breve para ser declamado." }, { status: 400 });
        }

        // V11.5: Alquimia de Voz via OpenAI TTS
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: voice, // onyx, fable, alloy, shimmer, echo, nova
                input: text.slice(0, 4000), // Límite de seguridad
                speed: 1.0
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fallo en la Alquimia de Voz");
        }

        const audioBuffer = await response.arrayBuffer();

        // Devolvemos el audio como stream para que el frontend lo procese o lo guarde
        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString()
            }
        });

    } catch (error) {
        console.error("❌ Error en Voiceover API:", error.message);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
