// Simple health check API route for ALB
export async function GET() {
  try {
    // Basic health check that doesn't rely on external dependencies
    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    // If anything goes wrong, return a 500 error
    console.error("Health check failed:", error);
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}