> 🏆 **Built for the Kiro × ElevenLabs Hackathon**

# TeachKit

A hackathon demo app that lets teachers generate AI-powered, multi-page lessons and share them with students via a clean read-only link — with voice narration on every page.

## What it does

1. **Set up your profile** — grade level, subject, teaching tone
2. **Create a lesson** — give it a title, topic, objectives, and any specific inclusions
3. **Review pages** — the AI generates 5–8 structured pages; approve, edit, or regenerate each one
4. **Narration** — approving a page generates audio via ElevenLabs (your voice or a default AI voice)
5. **Publish** — once all pages are approved, publish to get a shareable link
6. **Student view** — students open the link and read through the lesson page by page with audio playback

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Firebase (Firestore + Storage)
- OpenAI (lesson generation)
- ElevenLabs (TTS + voice cloning)

## Running locally

**1. Install dependencies**
```bash
cd app
npm install
```

**2. Set up environment variables**
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase console → Project settings |
| `FIREBASE_CLIENT_EMAIL` | Firebase console → Service accounts → Generate key |
| `FIREBASE_PRIVATE_KEY` | Same JSON file as above |
| `OPENAI_API_KEY` | platform.openai.com/api-keys |
| `ELEVENLABS_API_KEY` | elevenlabs.io → Settings → API Keys |
| `ELEVENLABS_DEFAULT_VOICE_ID` | elevenlabs.io → Voice Library (e.g. `21m00Tcm4TlvDq8ikWAM` for Rachel) |

**3. Firebase setup**
- Enable **Firestore** in your Firebase project (Native mode)
- Enable **Storage** and set the bucket to allow public reads, or update the CORS rules

**4. Run the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  app/              # Next.js pages and API routes
  components/       # UI components (lesson, teacher, viewer)
  lib/              # Firebase, types, validation, AI prompts, logic
```
