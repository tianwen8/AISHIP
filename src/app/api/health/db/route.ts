import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    // Execute a simple query
    const result = await db().execute(sql`SELECT NOW() as time`);
    const duration = Date.now() - start;

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Database connected successfully',
      time: result[0].time,
      latency: `${duration}ms`
    });
  } catch (error: any) {
    console.error('Database Connection Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
