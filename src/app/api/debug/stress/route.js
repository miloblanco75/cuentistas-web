import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * STRATEGY: Advanced Stress Testing Endpoint
 * Allows simulation of anomalous behavior (delays, errors, corrupt data).
 * PROTECTED: Only accessible by ARCHITECT and when STRESS_TEST_ENABLED=true.
 */
export async function GET(req) {
    const session = await getServerSession(authOptions);
    const adminEmail = process.env.ADMIN_EMAIL || "ermiloblanco75@gmail.com";
    const isStressEnabled = process.env.STRESS_TEST_ENABLED === "true";

    // 1. Security Gate
    if (!isStressEnabled) {
        console.warn(`[STRESS] Attempted access but STRESS_TEST_ENABLED is not true.`);
        return NextResponse.json({ error: "Stress testing is disabled in this environment" }, { status: 403 });
    }

    if (!session || (session.user.rol !== "ARCHITECT" && session.user.email.toLowerCase() !== adminEmail.toLowerCase())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const delay = parseInt(searchParams.get("delay") || "0");
    const status = parseInt(searchParams.get("status") || "200");
    const type = searchParams.get("type") || "json"; // json, text, corrupt, empty
    const chaos = searchParams.get("chaos") === "true";

    // 2. Logging for Traceability
    console.log(`[STRESS_TEST] Hit by ${session.user.email} | Params: delay=${delay}, status=${status}, type=${type}, chaos=${chaos} | TS: ${new Date().toISOString()}`);

    // 3. Chaos Mode (10% chance of random failure if enabled)
    if (chaos && Math.random() < 0.1) {
        console.warn("[STRESS] Chaos mode triggered a random 500 error.");
        return NextResponse.json({ error: "Chaos Mode Triggered" }, { status: 500 });
    }

    // 4. Simulation of Latency/Delay
    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 5. Simulation of Response Types
    if (type === "text") {
        return new Response("This is not JSON, it is raw text to trigger INVALID_JSON error.", {
            status: status,
            headers: { "Content-Type": "text/plain" }
        });
    }

    if (type === "corrupt") {
        return new Response('{"error": "This JSON is incomplete and corrupt...', {
            status: status,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (type === "empty") {
        return new Response(null, { status: status });
    }

    // 6. Standard JSON Response with dynamic Status
    return NextResponse.json({
        ok: status < 400,
        message: `Stress test response with status ${status} and delay ${delay}ms`,
        timestamp: new Date().toISOString(),
        meta: { delay, status, type, chaos }
    }, { status });
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    const adminEmail = process.env.ADMIN_EMAIL || "ermiloblanco75@gmail.com";
    const isStressEnabled = process.env.STRESS_TEST_ENABLED === "true";

    if (!isStressEnabled || !session || (session.user.rol !== "ARCHITECT" && session.user.email.toLowerCase() !== adminEmail.toLowerCase())) {
        return NextResponse.json({ error: "Unauthorized or Service Disabled" }, { status: 401 });
    }

    let body = {};
    try { body = await req.json(); } catch (e) { /* ignore */ }

    const delay = body.delay || 0;
    const status = body.status || 200;

    console.log(`[STRESS_TEST_POST] Hit by ${session.user.email} | Status: ${status} | TS: ${new Date().toISOString()}`);

    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return NextResponse.json({
        ok: status < 400,
        receivedBody: body,
        message: "POST stress test successful"
    }, { status });
}
