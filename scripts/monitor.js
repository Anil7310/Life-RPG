/**
 * Continuous Live Health & Uptime Monitor for Life RPG
 * Pings the deployed backend every 30 seconds and reports latency and health status.
 */

const TARGET_URL = process.env.MONITOR_URL || 'https://life-rpg-f4ds.onrender.com/api/health';
const INTERVAL_MS = Number(process.env.MONITOR_INTERVAL_MS) || 30000;

console.log('📡 Starting Life RPG Continuous Uptime Monitor');
console.log(`🎯 Target: ${TARGET_URL}`);
console.log(`⏱️ Interval: ${INTERVAL_MS / 1000}s`);
console.log('--------------------------------------------------');

async function ping() {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  try {
    const res = await fetch(TARGET_URL);
    const duration = Date.now() - startTime;
    const data = await res.json();

    if (res.ok && data.status === 'ok') {
      console.log(`[${timestamp}] 🟢 UP (${res.status} OK) - Latency: ${duration}ms | Uptime: ${Math.round(data.uptime || 0)}s`);
    } else {
      console.log(`[${timestamp}] 🟡 WARN (${res.status}) - Latency: ${duration}ms | Message:`, data);
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[${timestamp}] 🔴 DOWN (${duration}ms) - Error: ${err.message}`);
  }
}

// Initial ping
ping();

// Continuous loop
setInterval(ping, INTERVAL_MS);
