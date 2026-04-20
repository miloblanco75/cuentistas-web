import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        console.log("--- CLIENT ERROR DETECTED ---");
        console.log("Message:", body.message);
        console.log("URL:", body.url);
        console.log("Line/Col:", body.line, body.col);
        console.log("Stack:", body.stack);
        console.log("UserAgent:", body.userAgent);
        console.log("----------------------------");

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
