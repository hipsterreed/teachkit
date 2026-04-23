# Requirements Document

## Introduction

An AI-powered lesson planner web app that helps teachers create structured, multi-page lessons quickly. Teachers define their profile (grade level, subject, teaching tone), provide a lesson brief, and the AI generates a paginated lesson with grade-appropriate content, examples, and activities. Teachers review each page individually — approving, regenerating, or editing — before publishing. Narration audio is generated and baked in at page approval time using ElevenLabs, so it is ready the moment the lesson is published. Published lessons generate a shareable link that opens a clean student viewer with per-page voice narration. Teachers can optionally record their own voice once; that voice profile is stored globally and reused across all lessons. Post-publish edits go live immediately with no re-approval required. The scope is intentionally tight for a hackathon demo: no user accounts, no classroom management, no grading — just a fast path from idea to polished, student-ready lesson.

## Glossary

- **Teacher**: The primary user of the app who creates, reviews, and publishes lessons.
- **Student**: A read-only consumer of a published lesson accessed via a shareable link.
- **Lesson**: A structured educational unit composed of multiple pages, created by a Teacher.
- **Page**: A single unit within a Lesson containing a title, body content, an example, and an activity or question.
- **Teacher_Profile**: A set of preferences defined by the Teacher including grade level, subject, and teaching tone.
- **Lesson_Brief**: The input provided by the Teacher to initiate AI generation, including lesson title, topic, learning objectives, and specific inclusions.
- **AI_Generator**: The AI subsystem responsible for generating Lesson Pages from a Lesson_Brief and Teacher_Profile.
- **Page_Status**: The review state of a Page, either `pending` or `approved`.
- **Lesson_Status**: The overall state of a Lesson, either `draft` or `published`.
- **Viewer**: The read-only student-facing interface for a published Lesson.
- **Narration**: Audio playback for a Page generated via ElevenLabs or recorded by the Teacher.
- **Voice_Profile**: The narration voice configuration for the Teacher, either a default ElevenLabs voice or a Teacher-recorded voice clone. Stored globally and reused across all Lessons.
- **ElevenLabs**: The third-party text-to-speech service used to generate and play Page narration.
- **Shareable_Link**: A unique URL that opens the Viewer for a specific published Lesson.

---

## Requirements

### Requirement 1: Teacher Profile Setup

**User Story:** As a Teacher, I want to define my grade level, subject, and teaching tone before creating lessons, so that all generated content is automatically tailored to my classroom context.

#### Acceptance Criteria

1. THE Teacher_Profile SHALL include a grade level field accepting values from Kindergarten through Grade 12.
2. THE Teacher_Profile SHALL include a free-text subject field for the class or subject being taught.
3. THE Teacher_Profile SHALL include a teaching tone field with selectable options: Fun, Structured, Simple, and Engaging.
4. WHEN a Teacher submits a Teacher_Profile, THE App SHALL persist the profile for use in all subsequent Lesson generation within the session.
5. WHEN a Teacher_Profile is incomplete, THE App SHALL prevent Lesson creation and display a message indicating which fields are required.
6. WHEN a Teacher updates the Teacher_Profile, THE App SHALL apply the updated values to all future Lesson generation without affecting previously generated Lessons.

---

### Requirement 2: Lesson Brief Input

**User Story:** As a Teacher, I want to provide a lesson title, topic, learning objectives, and specific inclusions, so that the AI generates content that matches my instructional intent.

#### Acceptance Criteria

1. THE Lesson_Brief SHALL include a required lesson title field.
2. THE Lesson_Brief SHALL include a required topic field describing the subject matter of the Lesson.
3. THE Lesson_Brief SHALL include a required learning objectives field accepting one or more objectives.
4. THE Lesson_Brief SHALL include an optional specific inclusions field for any content the Teacher wants explicitly covered.
5. WHEN a Teacher submits a Lesson_Brief with all required fields completed, THE App SHALL proceed to AI generation.
6. IF a required field in the Lesson_Brief is empty, THEN THE App SHALL display a validation error identifying the missing field and prevent submission.

---

### Requirement 3: AI Lesson Generation

**User Story:** As a Teacher, I want the AI to generate a complete multi-page lesson from my brief, so that I have a structured starting point I can review and refine.

#### Acceptance Criteria

1. WHEN a Lesson_Brief is submitted, THE AI_Generator SHALL produce between 5 and 8 Pages for the Lesson.
2. WHEN generating Pages, THE AI_Generator SHALL use the Teacher_Profile grade level to calibrate vocabulary, sentence complexity, and concept depth appropriate for that grade.
3. WHEN generating Pages, THE AI_Generator SHALL apply the Teacher_Profile teaching tone to the writing style of all Page content.
4. THE AI_Generator SHALL produce each Page with the following four sections: a title, body content written for students, a concrete example illustrating the concept, and an activity or question to reinforce learning.
5. WHEN generation is complete, THE App SHALL set the Page_Status of every generated Page to `pending`.
6. WHEN generation is in progress, THE App SHALL display a loading indicator to the Teacher.
7. IF the AI_Generator fails to produce a valid response, THEN THE App SHALL display an error message and offer the Teacher the option to retry generation.

---

### Requirement 4: Per-Page Review — Approve

**User Story:** As a Teacher, I want to approve individual pages I am satisfied with, so that I can track my review progress and signal which content is ready.

#### Acceptance Criteria

1. WHEN a Teacher views a Page with Page_Status `pending`, THE App SHALL display an Approve action for that Page.
2. WHEN a Teacher approves a Page, THE App SHALL set the Page_Status of that Page to `approved`.
3. WHEN a Page is approved, THE App SHALL visually distinguish it from `pending` Pages in the page list.
4. WHEN all Pages in a Lesson have Page_Status `approved`, THE App SHALL enable the Publish action for that Lesson.

---

### Requirement 5: Per-Page Review — Regenerate

**User Story:** As a Teacher, I want to regenerate a single page I am not satisfied with, so that I can get a better version without redoing the entire lesson.

#### Acceptance Criteria

1. WHEN a Teacher views any Page, THE App SHALL display a Regenerate action for that Page.
2. WHEN a Teacher triggers Regenerate on a Page, THE AI_Generator SHALL produce a new version of that Page using the same Lesson_Brief and Teacher_Profile.
3. WHEN a regenerated Page is returned, THE App SHALL replace the previous Page content and set the Page_Status to `pending`.
4. WHEN regeneration is in progress for a Page, THE App SHALL display a loading indicator on that Page and disable the Regenerate action until complete.
5. IF the AI_Generator fails during single-Page regeneration, THEN THE App SHALL display an error message on that Page and restore the previous Page content.

---

### Requirement 6: Per-Page Review — Manual Edit

**User Story:** As a Teacher, I want to manually edit the content of any page, so that I can make precise corrections or additions the AI did not capture.

#### Acceptance Criteria

1. WHEN a Teacher views any Page, THE App SHALL display an Edit action for that Page.
2. WHEN a Teacher activates Edit on a Page, THE App SHALL present editable fields for the Page title, body content, example, and activity or question.
3. WHEN a Teacher saves edits to a Page, THE App SHALL persist the updated content and set the Page_Status to `pending`.
4. WHEN a Teacher cancels an edit, THE App SHALL discard all unsaved changes and restore the previous Page content.
5. WHILE a Teacher is editing a Page, THE App SHALL disable the Approve and Regenerate actions for that Page.

---

### Requirement 7: Bulk Approve All Pages

**User Story:** As a Teacher, I want to approve all pages at once when I am satisfied with the full lesson, so that I can move to publishing without clicking through each page individually.

#### Acceptance Criteria

1. THE App SHALL display an Approve All action on the Lesson review screen.
2. WHEN a Teacher triggers Approve All, THE App SHALL set the Page_Status of every Page in the Lesson to `approved`.
3. WHEN Approve All is triggered, THE App SHALL enable the Publish action immediately after all statuses are updated.

---

### Requirement 8: Lesson Publishing

**User Story:** As a Teacher, I want to publish a lesson only after all pages are approved, so that students only ever see complete, reviewed content.

#### Acceptance Criteria

1. WHILE any Page in a Lesson has Page_Status `pending`, THE App SHALL disable the Publish action and display a message indicating how many Pages remain unapproved.
2. WHEN all Pages have Page_Status `approved`, THE App SHALL enable the Publish action.
3. WHEN a Teacher publishes a Lesson, THE App SHALL set the Lesson_Status to `published` and generate a unique Shareable_Link for that Lesson.
4. WHEN a Lesson is published, THE App SHALL display the Shareable_Link to the Teacher in a format that is easy to copy.
5. WHEN a Teacher edits a Page in a published Lesson, THE App SHALL persist the changes and make them immediately visible to Students via the Shareable_Link without requiring re-approval or re-publishing.

---

### Requirement 9: Student Viewer Mode

**User Story:** As a Teacher, I want students to access a clean, read-only view of the published lesson via a shareable link, so that students can focus on learning without any editing interface.

#### Acceptance Criteria

1. WHEN a Student opens a Shareable_Link, THE Viewer SHALL display the published Lesson in a read-only interface with no editing controls visible.
2. THE Viewer SHALL present Pages one at a time with navigation controls to move to the next or previous Page.
3. THE Viewer SHALL display the Page title, body content, example, and activity or question for the current Page.
4. WHEN a Student navigates to a Page, THE Viewer SHALL display the Page number and total Page count.
5. IF a Student opens a Shareable_Link for a Lesson with Lesson_Status other than `published`, THEN THE Viewer SHALL display a message indicating the lesson is not yet available.

---

### Requirement 10: Voice Narration — Default Voice

**User Story:** As a Teacher, I want each page to have AI-generated voice narration using a default ElevenLabs voice, so that students can listen to the lesson content without requiring me to record anything.

#### Acceptance Criteria

1. THE App SHALL provide a default Voice_Profile using an ElevenLabs voice for narration.
2. WHEN a Teacher approves a Page, THE App SHALL generate Narration audio for that Page using the ElevenLabs API and the active Voice_Profile, and associate the audio with that Page.
3. WHEN a Teacher is reviewing a Page, THE App SHALL allow the Teacher to preview the Narration audio for that Page before approving it.
4. IF the ElevenLabs API returns an error during Narration generation, THEN THE App SHALL display a message to the Teacher indicating the Page failed narration generation, with an option to retry.
5. WHEN Narration audio has been generated for a Page, THE App SHALL make it available for playback in the Viewer immediately upon publishing.

---

### Requirement 11: Voice Narration — Teacher Voice Recording

**User Story:** As a Teacher, I want the option to record my own voice so the lesson is narrated in my voice, so that students hear a familiar voice and the lesson feels more personal.

#### Acceptance Criteria

1. THE App SHALL provide a voice setup option allowing the Teacher to record a voice sample for use as a custom Voice_Profile.
2. WHEN a Teacher initiates voice recording, THE App SHALL request microphone access and record a voice sample of at least 30 seconds.
3. WHEN a voice sample is submitted, THE App SHALL send the sample to ElevenLabs to create a voice clone and store the resulting Voice_Profile globally for the Teacher's account.
4. WHEN a custom Voice_Profile exists, THE App SHALL use it as the default for all Narration generation across all Lessons.
5. IF voice cloning fails, THEN THE App SHALL display an error message and fall back to the default Voice_Profile for Narration generation.
6. THE App SHALL allow the Teacher to switch between the default Voice_Profile and the custom Voice_Profile at any time before approving a Page.

---

### Requirement 12: Narration Playback in Viewer

**User Story:** As a Student, I want to play narration for each page directly in the viewer, so that I can listen to the lesson content at my own pace.

#### Acceptance Criteria

1. WHEN a Student views a Page in the Viewer, THE Viewer SHALL display a Play button for that Page's Narration.
2. WHEN a Student activates the Play button, THE Viewer SHALL begin audio playback of the Page Narration.
3. WHEN Narration is playing, THE Viewer SHALL display a Pause button allowing the Student to pause playback.
4. WHEN a Student navigates to a different Page, THE Viewer SHALL stop any currently playing Narration.
5. IF Narration audio is unavailable for a Page, THEN THE Viewer SHALL hide the Play button for that Page and display no error to the Student.
