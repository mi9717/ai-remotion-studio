# AI Remotion Studio

Standalone AI-assisted stock motion graphics generator.

## MVP
- Next.js + TypeScript, Remotion preview
- Gemini storyboard generation with local demo fallback
- MP4 export with Draft, Standard, and High quality presets
- Live render progress and download when complete

## Windows CMD
```bat
npm install
copy .env.example .env.local
npm run dev
```
Open http://localhost:3000. Add GEMINI_API_KEY to .env.local to enable Gemini.

## Rendering notes
The local render job and progress store live in the Next.js server process. Restarting the server interrupts active jobs; this is a local MVP, not a durable multi-server queue. Production deployment requires a persistent job queue and shared file storage. Review Remotion's current license before public automated rendering.
