import prisma from "@/lib/db";

export async function GET() {
  const start = Date.now();
  let dbStatus = "ok";
  
  try {
    // Deep check: verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error("Healthcheck DB Error:", e);
    dbStatus = "error";
  }

  const latency = Date.now() - start;
  
  let statusText = "ok";
  let httpStatus = 200;

  if (dbStatus === "error") {
    statusText = "error";
    httpStatus = 500;
  } else if (latency > 2000) {
    statusText = "slow";
  }

  return new Response(JSON.stringify({ 
    status: statusText, 
    db: dbStatus,
    latency: `${latency}ms`,
    timestamp: new Date().toISOString() 
  }), {
    status: httpStatus,
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    },
  });
}
