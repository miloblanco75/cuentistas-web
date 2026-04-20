import fs from "fs";

const METRICS_PATH = "/root/cuentistas-web/infra_metrics.json";

export async function GET() {
  let metrics = {
    total_restarts: 0,
    total_slow_events: 0,
    avg_latency: 0,
    check_count: 0,
    uptime_start: "unknown"
  };

  try {
    if (fs.existsSync(METRICS_PATH)) {
      metrics = JSON.parse(fs.readFileSync(METRICS_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Metrics API Error:", err);
  }

  return new Response(JSON.stringify({ 
    ...metrics,
    system_time: new Date().toISOString()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
