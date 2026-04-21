import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
    const { username } = params;
    
    // Validar que el username sea razonable (opcional)
    if (!username || username.length > 50) {
        return NextResponse.redirect(new URL("/hub", request.url));
    }

    const cookieStore = cookies();
    
    // Cookie de referido persistente por 30 días
    cookieStore.set("referrer", username, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        httpOnly: true,
        sameSite: "lax"
    });

    // Redirigir al Hub para iniciar la experiencia de espectador
    return NextResponse.redirect(new URL("/hub", request.url));
}
