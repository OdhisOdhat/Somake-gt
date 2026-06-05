let handler: any = null;

export default async function (req: any, res: any) {
  const method = req.method;
  const url = req.url;
  console.log(`[Somake Vercel Proxy] Incoming request: ${method} ${url}`);
  
  try {
    if (!handler) {
      console.log("[Somake Vercel Proxy] Initializing server module...");
      const serverModule = await import('../server');
      handler = serverModule.default;
      console.log("[Somake Vercel Proxy] Server module initialized successfully!");
    }
    return handler(req, res);
  } catch (err: any) {
    console.error("[Somake Vercel Proxy] CRITICAL: Failed to load or run server:", err);
    
    // Set response headers to JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: "Vercel Serverless Function Startup Error",
      message: err.message || "Unknown error",
      stack: err.stack || "",
      env: {
        DATABASE_URL_DEFINED: !!process.env.DATABASE_URL,
        VERCEL: process.env.VERCEL || "undefined"
      }
    });
  }
}
