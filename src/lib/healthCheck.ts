/**
 * JANSETU SYSTEM HEALTH CHECK & LATENCY MONITOR
 * Monitors Supabase API availability, network latency, and service health status.
 */

import { supabase } from "@/integrations/supabase/client";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  databaseConnected: boolean;
  timestamp: string;
  errorMessage?: string;
}

/**
 * Executes a lightweight ping query to verify database health and latency
 */
export async function checkSystemHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase
      .from("reported_data")
      .select("id")
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        status: "degraded",
        latencyMs,
        databaseConnected: false,
        timestamp: new Date().toISOString(),
        errorMessage: error.message,
      };
    }

    return {
      status: latencyMs > 2000 ? "degraded" : "healthy",
      latencyMs,
      databaseConnected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - startTime,
      databaseConnected: false,
      timestamp: new Date().toISOString(),
      errorMessage: err.message || "Network offline",
    };
  }
}
