import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

const HISTORY_PATH = "/root/cuentistas-web/infra_history.json";

export async function GET() {
  const start = Date.now();
  let dbStatus = "ok";
  
  try {
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

  const currentCheck = {
    status: statusText,
    latency: `${latency}ms`,
    timestamp: new Date().toISOString()
  };

  // Persistent History Buffer (Last 50)
  let history = [];
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
    }
    history.unshift(currentCheck);
    history = history.slice(0, 50);
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history), "utf8");
  } catch (err) {
    console.error("History Buffer Error:", err);
  }

  return new Response(JSON.stringify({ 
    ...currentCheck,
    db: dbStatus,
    history
  }), {
    status: httpStatus,
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    },
  });
}
