# AI Remotion Studio

Standalone AI-assisted stock motion graphics generator.

## MVP
- Next.js + TypeScript
- Remotion browser preview
- Gemini storyboard generation with local demo fallback
- Local server-side MP4 export through Remotion renderer
- 1920x1080, 30 FPS, 15/30/60-second projects

## Windows CMD setup
```bat
npm install
copy .env.example .env.local
npm run dev
```
Add GEMINI_API_KEY to .env.local to enable Gemini. Open http://localhost:3000 and use Export MP4. Keep the terminal running while rendering.

## Important limitations
MP4 export currently targets local development. It bundles and renders on the same machine as the Next.js server. It is not yet configured for Vercel/serverless production rendering or a background render queue. Review Remotion's current license before offering public automated rendering. Never expose Gemini keys through client-side variables.
