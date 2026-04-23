# Implementation Plan: AI Lesson Planner

## Overview

Build the app in four phases ordered for the fastest path to a working demo: foundation (Firebase + env wiring), core teacher flow (profile → brief → generate → review → publish), student viewer, then narration and voice features layered on top.

## Tasks

- [x] 1. Project foundation — Firebase Admin, env config, and shared types
  - [x] 1.1 Create `lib/firebase-admin.ts` with Admin SDK initialization
    - Initialize `firebase-admin` using `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` env vars
    - Export `db` (Firestore) and `storage` (Firebase Storage) singletons
    - Guard with `getApps().length` check to prevent re-initialization in dev hot-reload
    - _Requirements: 1.4, 8.3_

  - [x] 1.2 Define shared TypeScript interfaces in `lib/types.ts`
    - Define `TeacherProfile`, `VoiceProfile`, `Page`, and `Lesson` interfaces exactly as specified in the design
    - Export all types for use across API routes and components
    - _Requirements: 1.1, 1.2, 1.3, 3.4_

  - [x] 1.3 Create `.env.local.example` documenting all required environment variables
    - Include `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_DEFAULT_VOICE_ID`
    - _Requirements: 10.1_

- [x] 2. Validation and pure logic utilities
  - [x] 2.1 Implement `lib/validation.ts` — profile and brief validation functions
    - `validateTeacherProfile(profile)`: returns `{ valid: boolean; missingFields: string[] }` — rejects any profile missing gradeLevel, subject, or teachingTone
    - `validateLessonBrief(brief)`: returns `{ valid: boolean; missingFields: string[] }` — rejects empty, null, or whitespace-only title, topic, or objectives
    - _Requirements: 1.5, 2.6_

  - [ ]* 2.2 Write property test for `validateTeacherProfile` (Property 1)
    - **Property 1: Incomplete teacher profile blocks lesson creation**
    - **Validates: Requirements 1.5**
    - Use `fast-check`; generate `TeacherProfile` objects with at least one required field removed or set to empty string; assert `valid === false` and missing field is identified

  - [ ]* 2.3 Write property test for `validateLessonBrief` (Property 2)
    - **Property 2: Whitespace-only or empty brief fields are rejected**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.6**
    - Generate briefs with empty/whitespace title, topic, or objectives; assert rejection with correct field identified

  - [x] 2.4 Implement `lib/prompts.ts` — AI prompt construction functions
    - `buildGenerationPrompt(profile, brief)`: returns the full lesson generation prompt string
    - `buildRegenerationPrompt(profile, brief, pageOrder, totalPages)`: returns the single-page regeneration prompt string
    - _Requirements: 3.2, 3.3_

  - [ ]* 2.5 Write property test for `buildGenerationPrompt` (Property 3)
    - **Property 3: Prompt construction includes all profile and brief fields**
    - **Validates: Requirements 3.2, 3.3**
    - Generate valid profiles and briefs; assert prompt contains gradeLevel, teachingTone, title, topic, and every objective as substrings

  - [x] 2.6 Implement `lib/lesson-logic.ts` — page and lesson state transition functions
    - `applyPageContentChange(page, changes)`: merges changes, sets `status: "pending"`, clears `narrationUrl`
    - `approveAllPages(lesson)`: returns lesson with every page set to `status: "approved"`
    - `canPublish(lesson)`: returns `true` iff every page has `status: "approved"`
    - `buildTtsText(page)`: concatenates title, body, example, activity with natural connectors
    - `parseGeneratedPages(raw, lessonId)`: validates and maps raw AI JSON to `Page[]` with UUIDs, `status: "pending"`, `narrationUrl: null`
    - _Requirements: 3.4, 3.5, 5.3, 6.3, 7.2, 8.1, 8.2, 10.2_

  - [ ]* 2.7 Write property test for `applyPageContentChange` (Property 5)
    - **Property 5: Any page content change resets status to pending and clears narration**
    - **Validates: Requirements 5.3, 6.3, 8.5**
    - Generate pages with any status and any non-empty content change; assert result has `status: "pending"` and `narrationUrl: null`

  - [ ]* 2.8 Write property test for `approveAllPages` (Property 6)
    - **Property 6: Approve All sets every page to approved**
    - **Validates: Requirements 7.2**
    - Generate lessons with mixed page statuses; assert every page is `approved` after operation

  - [ ]* 2.9 Write property test for `canPublish` (Property 7)
    - **Property 7: Publish blocked while any page pending; enabled when all approved**
    - **Validates: Requirements 8.1, 8.2, 4.4**
    - Generate lessons with any mix of statuses; assert `canPublish` returns false iff any page is pending

  - [ ]* 2.10 Write property test for `buildTtsText` (Property 8)
    - **Property 8: Page TTS text contains all four page sections**
    - **Validates: Requirements 10.2**
    - Generate pages with non-empty fields; assert TTS string contains title, body, example, and activity as substrings

  - [ ]* 2.11 Write property test for `parseGeneratedPages` (Property 4)
    - **Property 4: Generated pages are well-formed and start as pending**
    - **Validates: Requirements 3.4, 3.5**
    - Generate valid AI response arrays of 5–8 pages; assert every page has non-empty fields, `status: "pending"`, `narrationUrl: null`

- [x] 3. Checkpoint — Validate logic layer
  - Ensure all non-optional tests pass. Run `npx vitest --run`. Ask the user if questions arise.

- [x] 4. Teacher Profile API and setup page
  - [x] 4.1 Implement `app/api/teacher/route.ts` — GET and PUT teacher profile
    - `GET`: reads `teacher/default` from Firestore; returns `{ profile, voiceProfile }` or nulls if not set
    - `PUT`: validates body with `validateTeacherProfile`; writes `profile` field to `teacher/default`; returns 200
    - Return 400 with field errors if validation fails
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 4.2 Build `app/setup/page.tsx` — Teacher profile setup form
    - Render `ProfileForm` component with grade level select (K–12), subject text input, and teaching tone select (Fun / Structured / Simple / Engaging)
    - On submit: `PUT /api/teacher`; on success redirect to `/`
    - Show inline validation errors for missing fields
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 4.3 Build `components/teacher/ProfileForm.tsx`
    - Controlled form with grade level, subject, and teaching tone fields
    - Accepts `onSubmit` callback and `initialValues` prop
    - Displays per-field error messages
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.4 Build `app/page.tsx` — Teacher home with profile guard
    - On load: `GET /api/teacher`; if profile is null redirect to `/setup`
    - Otherwise show lesson list (empty state for now) and a "Create New Lesson" button linking to `/lessons/new`
    - _Requirements: 1.4, 1.5_

- [x] 5. Lesson creation — brief input and AI generation
  - [x] 5.1 Implement `app/api/lessons/route.ts` — POST create lesson and trigger generation
    - Validate request body with `validateLessonBrief`; return 400 on failure
    - Read `TeacherProfile` from `teacher/default`; return 400 if not set
    - Build prompt with `buildGenerationPrompt`; call OpenAI `gpt-4o` with `response_format: { type: "json_object" }`
    - Parse response with `parseGeneratedPages`; assign UUIDs to lesson and pages
    - Write lesson document to `lessons/{lessonId}` in Firestore
    - Return `201` with full `Lesson` object
    - _Requirements: 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 5.2 Implement `app/api/lessons/route.ts` — GET list lessons
    - Query all documents in `lessons` collection ordered by `createdAt` descending
    - Return array of `Lesson` objects
    - _Requirements: (supports home page lesson list)_

  - [x] 5.3 Build `app/lessons/new/page.tsx` — Lesson brief input form
    - Render `BriefForm` component
    - On submit: `POST /api/lessons`; show loading spinner during generation (Requirement 3.6)
    - On success: redirect to `/lessons/[lessonId]`
    - On error: show error toast with retry option (Requirement 3.7)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.6, 3.7_

  - [x] 5.4 Build `components/lesson/BriefForm.tsx`
    - Fields: title (text), topic (text), objectives (textarea, one per line), inclusions (optional textarea)
    - Client-side validation using `validateLessonBrief`; show per-field errors
    - Submit button disabled while loading
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

- [x] 6. Lesson review — page list, approve, regenerate, edit
  - [x] 6.1 Implement `app/api/lessons/[lessonId]/route.ts` — GET single lesson
    - Fetch lesson document from Firestore by ID; return 404 if not found
    - Return full `Lesson` object
    - _Requirements: 4.1, 5.1, 6.1_

  - [x] 6.2 Implement `app/api/lessons/[lessonId]/pages/[pageId]/route.ts` — PATCH manual edit
    - Merge provided fields (title, body, example, activity) onto the page using `applyPageContentChange`
    - Update the pages array in the lesson document in Firestore
    - Return updated `Page`
    - _Requirements: 6.2, 6.3_

  - [x] 6.3 Implement `app/api/lessons/[lessonId]/pages/[pageId]/regenerate/route.ts` — POST regenerate page
    - Load lesson from Firestore; build regeneration prompt with `buildRegenerationPrompt`
    - Call OpenAI; parse single page response; apply with `applyPageContentChange`
    - Update Firestore; return updated `Page`
    - On OpenAI failure: return 500 (client restores previous content)
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 6.4 Build `app/lessons/[lessonId]/page.tsx` — Lesson review page
    - Fetch lesson via `GET /api/lessons/[lessonId]` on load
    - Render `PageList` sidebar and `PageCard` for the selected page
    - Render `PublishBar` at the bottom
    - Manage selected page index in local state
    - _Requirements: 4.1, 5.1, 6.1, 7.1, 8.1_

  - [x] 6.5 Build `components/lesson/PageList.tsx` — Sidebar page list
    - Render one item per page showing order, title, and status badge (pending / approved)
    - Highlight selected page; clicking an item updates selected page in parent
    - _Requirements: 4.3_

  - [x] 6.6 Build `components/lesson/PageCard.tsx` — Single page display with actions
    - Display title, body, example, activity sections
    - Show Approve button when `status === "pending"` (Requirement 4.1)
    - Show Regenerate button always; disable and show spinner during regeneration (Requirement 5.4)
    - Show Edit button always; disable Approve and Regenerate while editing (Requirement 6.5)
    - On Approve click: call `POST /api/.../narration` (wired in Task 9); for now call `PATCH` to set status approved directly as a placeholder
    - On Regenerate click: `POST /api/.../regenerate`; restore previous content on error (Requirement 5.5)
    - _Requirements: 4.1, 4.2, 5.1, 5.4, 5.5, 6.1, 6.5_

  - [x] 6.7 Build `components/lesson/PageEditor.tsx` — Inline edit form
    - Editable fields for title, body, example, activity pre-populated with current page values
    - Save: `PATCH /api/.../[pageId]`; on success update parent state
    - Cancel: discard changes, exit edit mode (Requirement 6.4)
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 6.8 Build `components/lesson/PublishBar.tsx` — Approve All and Publish CTA
    - Show count of pending pages; disable Publish while any page is pending (Requirement 8.1)
    - Approve All button: calls `POST /api/lessons/[lessonId]/publish` after setting all pages approved via `PATCH` calls, or implement a dedicated bulk-approve endpoint
    - Publish button: calls `POST /api/lessons/[lessonId]/publish`; on success show shareable link in a copy-able display (Requirement 8.4)
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4_

- [x] 7. Lesson publish API
  - [x] 7.1 Implement `app/api/lessons/[lessonId]/publish/route.ts` — POST publish lesson
    - Verify all pages have `status: "approved"` using `canPublish`; return 400 with pending count if not
    - Set `lesson.status = "published"`, set `publishedAt` to current ISO timestamp
    - Update Firestore; return updated `Lesson`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Student viewer
  - [x] 8.1 Build `app/view/[lessonId]/page.tsx` — Student viewer server component
    - Fetch lesson from Firestore (or via `GET /api/lessons/[lessonId]`)
    - If `lesson.status !== "published"`, render "This lesson is not yet available" message (Requirement 9.5)
    - Otherwise pass lesson data to `ViewerClient` client component
    - _Requirements: 9.1, 9.5_

  - [x] 8.2 Build viewer client component with page navigation state
    - Manage `currentPageIndex` in `useState`
    - Render `StudentPage` for the current page
    - Render `ViewerNav` for prev/next controls
    - On page change: stop any playing audio via ref
    - _Requirements: 9.2, 9.4, 12.4_

  - [x] 8.3 Build `components/viewer/StudentPage.tsx` — Read-only page display
    - Display title, body, example, and activity sections with no editing controls
    - Accept `page` prop; render `NarrationPlayer` if `narrationUrl` is set (Requirement 12.5)
    - _Requirements: 9.1, 9.3, 12.5_

  - [x] 8.4 Build `components/viewer/ViewerNav.tsx` — Prev/Next navigation and page counter
    - Prev button (disabled on first page), Next button (disabled on last page)
    - Display "Page {current} of {total}"
    - _Requirements: 9.2, 9.4_

  - [ ]* 8.5 Write property test for viewer navigation display (Property 9)
    - **Property 9: Viewer navigation displays correct page number and total**
    - **Validates: Requirements 9.4**
    - Generate lessons with N ≥ 1 pages and index i in [0, N); assert display shows `i + 1` and `N`

- [x] 9. Checkpoint — Core demo flow end-to-end
  - Ensure all non-optional tests pass. Manually verify: profile setup → brief → generation → review → approve all → publish → open shareable link → navigate pages. Ask the user if questions arise.

- [x] 10. Narration generation — ElevenLabs TTS and Firebase Storage
  - [x] 10.1 Implement `app/api/lessons/[lessonId]/pages/[pageId]/narration/route.ts` — POST generate narration
    - Read active `VoiceProfile` from `teacher/default` Firestore document; fall back to `ELEVENLABS_DEFAULT_VOICE_ID` if none set
    - Build TTS text with `buildTtsText(page)`
    - Call ElevenLabs `POST /v1/text-to-speech/{voice_id}` with `xi-api-key` header, model `eleven_turbo_v2`, format `mp3_44100_128`
    - Upload returned audio buffer to Firebase Storage at `audio/{lessonId}/{pageId}.mp3`
    - Retrieve download URL; set `page.narrationUrl` and `page.status = "approved"` using `applyPageContentChange` then override status
    - Update Firestore; return updated `Page`
    - On ElevenLabs error: return 500 with error message (Requirement 10.4)
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

  - [x] 10.2 Wire Approve button in `PageCard` to call narration route
    - Replace placeholder approve logic with `POST /api/lessons/[lessonId]/pages/[pageId]/narration`
    - Show loading spinner on the page card during narration generation
    - On success: update page state with returned page (status approved, narrationUrl set)
    - On error: show error toast with "Retry narration" option (Requirement 10.4)
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 10.3 Build `components/lesson/NarrationPlayer.tsx` — Audio player component
    - Accept `src` (URL) and optional `autoPlay` prop
    - Render Play/Pause button; use an `<audio>` element ref for playback control
    - Expose a `stop()` method via `useImperativeHandle` for parent components to stop playback on page change
    - Hide player entirely if `src` is null or undefined (Requirement 12.5)
    - _Requirements: 10.3, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 10.4 Wire `NarrationPlayer` into `StudentPage` for viewer playback
    - Pass `page.narrationUrl` as `src`; hide if null
    - Pass player ref up to viewer client component so page navigation can call `stop()`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 11. Voice profile API
  - [x] 11.1 Implement `app/api/voice/route.ts` — GET and PUT voice profile
    - `GET`: reads `voiceProfile` from `teacher/default`; returns current profile or null
    - `PUT`: writes provided `VoiceProfile` to `teacher/default`; returns 200
    - _Requirements: 11.6_

  - [x] 11.2 Implement `app/api/voice/record/route.ts` — POST submit voice sample for cloning
    - Parse `multipart/form-data` request; extract audio file
    - Forward to ElevenLabs `POST /v1/voices/add` with `name: "Teacher Voice"` and audio file
    - On success: store returned `voice_id` as `VoiceProfile { type: "clone", elevenLabsVoiceId, createdAt }`; write to `teacher/default`; return updated profile
    - On failure: return 500; client falls back to default voice (Requirement 11.5)
    - _Requirements: 11.3, 11.4, 11.5_

- [x] 12. Voice recording UI
  - [x] 12.1 Build `components/teacher/VoiceSetup.tsx` — Voice recording and clone status
    - Show current voice profile status (default or custom clone with creation date)
    - "Record Voice Sample" button: request microphone access via `getUserMedia`, record for ≥30 seconds, show recording timer
    - On stop: submit audio blob to `POST /api/voice/record` as `multipart/form-data`
    - On success: show confirmation and update displayed voice profile
    - On failure: show error toast; retain default voice (Requirement 11.5)
    - Toggle between default and custom voice via `PUT /api/voice` (Requirement 11.6)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 12.2 Add voice setup entry point to teacher home or profile page
    - Link or section on `app/page.tsx` or `app/setup/page.tsx` that renders `VoiceSetup`
    - _Requirements: 11.1_

- [x] 13. Final checkpoint — Full demo ready
  - Ensure all non-optional tests pass. Manually verify the full teacher flow including voice clone, narration generation, and student playback. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Narration and voice features (Tasks 10–12) are intentionally last — the core lesson flow works without them
- The Approve button in Task 6.6 uses a placeholder until Task 10.2 wires in the real narration route
- Property tests use `fast-check`; tag each test: `// Feature: ai-lesson-planner, Property {N}: {property_text}`
- Pages are stored as an embedded array on the lesson document — no subcollection needed for demo scale
- The shareable link is simply `/view/{lessonId}` — no separate slug generation required
