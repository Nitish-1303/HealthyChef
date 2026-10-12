// Vercel runs this file as a serverless function. It serves the same Express
// API as `npm start`, built into dist-server by `npm run build`.
import { createApp } from "../dist-server/src/server/app.js";

export default createApp();
