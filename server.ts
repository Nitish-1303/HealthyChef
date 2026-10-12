import express from "express";
import path from "path";
import { createApp } from "./src/server/app.js";
import { ensureDB } from "./src/server/db.js";

const PORT = Number(process.env.PORT) || 3000;

// `npm start` runs the compiled server.js, `npm run dev` runs server.ts through tsx.
const isProduction = process.env.NODE_ENV === "production" || import.meta.url.endsWith(".js");

async function startServer() {
  await ensureDB();
  const app = createApp();

  // Frontend: Vite in development, the built files in production.
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
