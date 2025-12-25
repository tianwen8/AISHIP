import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Detect if running in Cloudflare Workers environment
const isCloudflareWorker =
  typeof globalThis !== "undefined" && "Cloudflare" in globalThis;

// Database instance for Node.js environment
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function db() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // Supabase/Postgres over the internet typically requires TLS.
  // `postgres` (postgres-js) does not reliably honor `sslmode=require` from the URL in all environments,
  // so we enable SSL by default and allow opting out via env.
  const ssl =
    process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false };

  // In Cloudflare Workers, create new connection each time
  if (isCloudflareWorker) {
    // Workers environment uses minimal configuration
    const client = postgres(databaseUrl, {
      prepare: false,
      max: 1, // Limit to 1 connection in Workers
      idle_timeout: 10, // Shorter timeout for Workers
      connect_timeout: 5,
      ssl,
    });

    return drizzle(client);
  }

  // In Node.js environment, use singleton pattern
  if (dbInstance) {
    return dbInstance;
  }

  // Node.js environment with connection pool configuration
  const client = postgres(databaseUrl, {
    prepare: false,
    max: 10, // Maximum connections in pool
    idle_timeout: 30, // Idle connection timeout (seconds)
    connect_timeout: 10, // Connection timeout (seconds)
    ssl,
  });
  dbInstance = drizzle({ client });

  return dbInstance;
}
