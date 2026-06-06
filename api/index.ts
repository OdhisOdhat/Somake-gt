let handler: any = null;

export default async function (req: any, res: any) {
  const method = req.method;
  const url = req.url;
  console.log(`[Somake Vercel Proxy] Incoming request: ${method} ${url}`);
  
  try {
    if (!handler) {
      console.log("[Somake Vercel Proxy] Initializing server module...");
      try {
        // Attempt to import the compiled production server bundle
        console.log("[Somake Vercel Proxy] Trying to load compiled server...");
        // @ts-ignore
        const serverModule = await import('../dist/server.cjs');
        handler = serverModule.default || serverModule;
        console.log("[Somake Vercel Proxy] Compiled server loaded successfully!");
      } catch (err: any) {
        console.warn("[Somake Vercel Proxy] Failed to load compiled server, falling back to server.ts:", err.message);
        const serverModule = await import('../server');
        handler = serverModule.default || serverModule;
        console.log("[Somake Vercel Proxy] Fallback server loaded successfully!");
      }
    }
    
    // Express handler call
    const expressApp = handler.default || handler;
    return expressApp(req, res);
  } catch (err: any) {
    console.error("[Somake Vercel Proxy] CRITICAL: Failed to load or run server:", err);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: "Vercel Serverless Function Startup Error",
      message: err.message || "Unknown error",
      stack: err.stack || "",
      env: {
        DATABASE_URL_DEFINED: !!process.env.DATABASE_URL,
        VERCEL: process.env.VERCEL || "undefined",
        NODE_ENV: process.env.NODE_ENV || "undefined"
      }
    });
  }
}
