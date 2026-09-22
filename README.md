# PlacementWire

> **Your Placement Emails. Organized.**
> A smart placement email management and drive-tracking web application designed exclusively for students of **St. Andrews Institute of Technology and Management (SAITM)**.

---

## For SAITM Students — What Is This?

You get placement announcements (drives, internships, hackathons) on your **college Gmail**, but the important details — company, role, CTC, eligibility, **last date to apply**, form links — are buried inside long emails. PlacementWire reads those announcement emails and turns them into a clean personal dashboard: searchable drives, deadline countdowns with urgent/expiring alerts, application status tracking, private notes, and a one-click button to open the original email in Gmail.

### Your Privacy: What It Reads (and What It Never Touches)

- **Only @saitm.ac.in accounts can sign in.** Personal `@gmail.com` or any other domain is rejected on the server. No SAITM account = no access.
- **It only reads placement emails from the college.** Every Gmail search is hard-scoped to `{from:saitm.org from:saitm.ac.in subject:placement subject:drive subject:hiring subject:recruitment subject:campus subject:opportunity subject:internship subject:hackathon} label:INBOX` — i.e. only inbox mails **sent by SAITM addresses** (Training & Placement Cell / CRC) about placements. Your personal emails, OTPs, bank statements and everything else are never queried, never opened, never stored.
- **Read-only Gmail access.** The app requests the `gmail.readonly` scope, so it physically *cannot* send, delete or modify any email — it can only read.
- **Your data lives in YOUR Google Drive**, in `PlacementWire_Data/placements.json` (created via the `drive.file` scope, which only permits files the app itself created — it cannot see or touch the rest of your Drive). There is no central database; no other student, and no admin, can see your statuses, stars or private notes.
- **Your mail content never leaves your session.** Parsed drives keep only a Gmail message-ID reference so you can jump back to the original email; tokens stay encrypted server-side and never reach the browser.

---

## 1. Product Overview

Students receive placement announcements through their college Gmail accounts. These emails often contain important information scattered across paragraphs, bullet points, HTML tables, Google Drive documents, and application links.

PlacementWire connects to a student's college Gmail account, identifies placement announcements, extracts structured information (company, roles, CTC, locations, eligibility, deadlines, and application links), and presents everything through a responsive, searchable SaaS dashboard with Kanban and List views.

---

## 2. Architectural Guarantees

### A. Next.js Single-Repository Architecture
- **Single application**: Frontend and backend live together in one Next.js App Router codebase.
- **Node.js runtime**: Route Handlers under `/api/v1/...` for backend functionality.
- **No external backend**: Absolutely no separate FastAPI, Python, or Express servers required.
- **Single command deployment**: Deployable with one build to Vercel or any Node.js container.

### B. Zero-Database Privacy
- PlacementWire **does not** maintain a central database (no PostgreSQL, MongoDB, Firebase, or Supabase).
- Each student's placement records, custom notes, stars, and tracking statuses are stored in their own personal Google Drive:
  `PlacementWire_Data/placements.json`
- Information is cached in browser `localStorage` for instant rendering and debounced back to Google Drive in the background.

### C. Strict College Email Authentication
- Access is restricted exclusively to verified `@saitm.ac.in` Google Workspace accounts.
- Enforced on the server via exact domain validation. Personal `@gmail.com` and unauthorized domains are rejected.
- Sessions use encrypted HTTP-only cookies (`jose` AES-256-GCM). Google tokens are never exposed to browser JavaScript.

---

## 3. Directory Structure

```text
PLACEMENT-WIRE/
├── public/
│   ├── placement_wire_logo.png
│   ├── pw_icon_dark_only.png
│   └── pw_icon_light_only.png
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   └── page.tsx                 # Landing Page
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx             # SAITM Google OAuth Login Screen
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Main Placement Dashboard (Stats, Kanban, List)
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx             # Permissions & Drive explanation
│   │   │   └── settings/
│   │   │       └── page.tsx             # Account & Drive file management
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       │   ├── google/
│   │   │       │   │   ├── login/route.ts       # Generate Google OAuth consent URL
│   │   │       │   │   └── callback/route.ts    # Validate OAuth code, verify domain, create session
│   │   │       │   ├── me/route.ts              # Return authenticated user profile (no secrets)
│   │   │       │   ├── logout/route.ts          # Terminate session
│   │   │       │   ├── disconnect/route.ts      # Revoke tokens & disconnect
│   │   │       │   └── mock/route.ts            # Dev mock auth for fast testing
│   │   │       ├── gmail/
│   │   │       │   ├── sync/route.ts            # Ingest & parse placement emails
│   │   │       │   └── status/route.ts          # Gmail connection state
│   │   │       ├── drive/
│   │   │       │   ├── sync/route.ts            # Save placements.json to user's Drive
│   │   │       │   └── status/route.ts          # Drive file status & last modified
│   │   │       ├── placements/
│   │   │       │   └── route.ts                 # Fetch & update user placement data
│   │   │       └── health/
│   │   │           └── route.ts                 # System health check
│   │   ├── auth/
│   │   │   └── google/
│   │   │       └── callback/route.ts    # Compatibility alias for OAuth callback
│   │   ├── layout.tsx                   # Root layout with dark mode theme
│   │   ├── loading.tsx                  # Global sleek loading spinner
│   │   ├── error.tsx                    # Error boundary
│   │   └── not-found.tsx                # Custom 404 page
│   ├── components/
│   │   ├── layout/                      # Navbar, DriveSyncBadge, UserMenu
│   │   ├── dashboard/                   # QuickStats, SearchFilterBar
│   │   ├── kanban/                      # KanbanBoard (drag-and-drop & one-click move)
│   │   ├── list/                        # PlacementListView (sortable table)
│   │   ├── placements/                  # PlacementDetailModal (profiles, links, notes)
│   │   └── shared/                      # EmptyState, DeadlineCountdown
│   ├── lib/
│   │   ├── auth/                        # Session encryption (jose AES-256-GCM) & auth guard
│   │   ├── google/                      # OAuth2Client & automatic token refresher
│   │   ├── gmail/                       # Gmail API search & MIME payload parser
│   │   ├── drive/                       # Google Drive v3 file creation, fetch, and safe update
│   │   ├── parser/                      # Cheerio HTML parser, ID generator, merger, fixtures
│   │   ├── security/                    # Strict @saitm.ac.in domain validator
│   │   └── utils/                       # Deadline calculation & classnames merger
│   ├── schemas/                         # Zod schema for versioned placement JSON
│   ├── types/                           # Placement, Position, Source, DriveType, Status types
│   ├── hooks/                           # usePlacements (local cache + sync) & useAuth
│   └── config/                          # Validated environment configuration
├── tests/
│   ├── unit/
│   │   ├── domain-validator.test.ts     # Domain restriction & injection tests
│   │   ├── id-generator.test.ts         # Deterministic SHA-256 hash stability tests
│   │   ├── email-parser.test.ts         # RGF India, 75WAY, and BriBooks fixture tests
│   │   ├── merger.test.ts               # Non-destructive merger tests
│   │   └── placement-schema.test.ts     # Zod schema validation tests
├── vitest.config.ts                     # Vitest test configuration
├── tailwind.config.ts                   # Tailwind CSS theme tokens
├── tsconfig.json                        # TypeScript strict configuration
└── package.json                         # Unified single Next.js dependencies & scripts
```

---

## 4. Prerequisites

- **Node.js**: `v18.17+` (tested and recommended on `v20` or `v22`).
- **npm**: `v9+` or `v10+`.
- A Google Cloud Project with OAuth 2.0 Client Credentials configured.

---

## 5. Installation & Setup

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` (or edit `.env`):
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in the credentials**:
   ```env
   NODE_ENV=development
   PORT=8000
   APP_URL=http://localhost:8000
   SESSION_SECRET=your-secure-random-string-at-least-32-chars

   # Google OAuth Credentials (from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

   # Security
   ALLOWED_EMAIL_DOMAIN=saitm.ac.in

   # Fast Development Testing (enables one-click mock login & sample fixture sync)
   DEV_MOCK_AUTH=true
   ```

---

## 6. Google Cloud Console Setup

To enable real Gmail and Drive access:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the following APIs:
   - **Gmail API**
   - **Google Drive API**
   - **Google People API / OAuth2 API**
3. Configure the **OAuth Consent Screen**:
   - User Type: **External** (or **Internal** if using a Google Workspace domain).
   - App Name: `PlacementWire`.
   - Scopes to request:
     - `openid`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/drive.file`
4. Under **Credentials**, create an **OAuth 2.0 Client ID**:
   - Application Type: **Web application**.
   - Authorized redirect URIs:
     - `http://localhost:8000/auth/google/callback`
     - `http://localhost:8000/api/v1/auth/google/callback`
     - (And your production domain URL when deployed, e.g. `https://your-domain.com/api/v1/auth/google/callback`).
5. Copy the **Client ID** and **Client Secret** into your `.env.local`.

---

## 7. Development & Running the App

Run the development server on port 8000 (matching your registered redirect URI):
```bash
npm run dev
```

If your OAuth redirect URI in Google Cloud Console is configured on port 3000, run:
```bash
npm run dev:3000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 8. Running Automated Tests

PlacementWire includes unit and integration tests covering:
- Exact `@saitm.ac.in` domain validation & spoofed bypass rejection
- Deterministic placement ID generation
- Email parser tests against real college announcements (**RGF India**, **75WAY Technologies**, **BriBooks**)
- Non-destructive data merger (preserves user notes & status during sync)
- Zod schema validation

Run the test suite:
```bash
npm test
```

Or run Vitest in watch mode:
```bash
npm run test:watch
```

---

## 9. Production Build & Deployment

1. **Build the production bundle**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

PlacementWire can be deployed directly to **Vercel** or any containerized environment as a standard Next.js application without extra infrastructure or databases.

---

## 10. Security & Privacy Highlights

- **Encrypted Stateless Sessions**: Session payload encrypted using AES-256-GCM via the `jose` library in an HTTP-only, SameSite cookie.
- **Token Isolation**: Google Access & Refresh tokens never reach the browser bundle.
- **Targeted Gmail Ingestion**: Only inbox emails matching `{from:saitm.org from:saitm.ac.in subject:placement subject:drive subject:hiring subject:recruitment subject:campus subject:opportunity subject:internship subject:hackathon} label:INBOX` are ever queried — sender-restricted to SAITM addresses, read-only scope, nothing else in the mailbox is touched.
- **Client-Side Conflict Prevention**: ETag/revision numbers track Drive updates and prevent data clobbering.
