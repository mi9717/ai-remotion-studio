# AI Remotion Studio

Standalone AI-assisted stock motion graphics generator. Describe an idea; the app creates a storyboard and previews it with Remotion.

## MVP foundation
- Next.js App Router + TypeScript
- Remotion composition and browser preview via @remotion/player
- Gemini storyboard generation via server-side API route
- Zod validation for AI output and exact scene-duration totals
- Clearly labelled local demo mode when GEMINI_API_KEY is absent
- 1920×1080, 30 FPS, 15/30/60-second project options

## Requirements
Node.js 20+ and npm. A Gemini API key is optional for demo mode.

## Local setup
```bash
npm install
cp .env.example .env.local
```
Add GEMINI_API_KEY to .env.local, then run:
```bash
npm run dev
```
Open http://localhost:3000. Without a key, the app uses a local deterministic demo generator and does not claim Gemini was called.

## Remotion
```bash
npm run remotion:studio
npm run render:sample
```

## Not yet implemented
- MP4 export from web UI
- Background render worker / queue
- Supabase authentication and project persistence
- Video object storage, quotas, and billing

Never expose Gemini keys with NEXT_PUBLIC_. Review Remotion's current license before offering public automated rendering. Marketplace acceptance is not guaranteed; creators remain responsible for originality, releases, technical quality, and marketplace policies.