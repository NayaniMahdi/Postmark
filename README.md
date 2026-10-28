# Postmark — Intelligent Support Workspace

> A production-quality AI-powered customer support workspace built with Next.js 16 (App Router), TypeScript, Tailwind CSS, real AI model inference through **NVIDIA NIM** and **OpenRouter**, **Gmail API** OAuth integration, and strict **human-in-the-loop approval enforcement**.

Inspired by Apple's desktop productivity design language: sophisticated glassmorphism, subtle translucency, refined typography, and a multi-column email workspace.

---

## 📸 Visual Design

Postmark is designed to match desktop macOS productivity applications:
- **Frosted Glassmorphism**: Translucent panels with controlled backdrop blurs (`backdrop-filter: blur(24px)`), luminous borders, and soft diffuse shadows.
- **Warm Minimalist Environment**: Ambient desert mountain vista backdrop with floor-to-ceiling modern architectural framing.
- **macOS Window Chrome**: Traffic light controls, centered command search bar (`⌘K`), and instant mode switching indicator.
- **Multi-Column Workspace**:
  1. **Left Sidebar**: Inboxes (`Inbox`, `Needs Review`, `Assigned to Me`, `Starred`, `Drafts`, `Sent`, `Resolved`), `Team Spaces` (`Billing & Payments`, `Technical Support`, `Sales`, `Customer Success`, `Security`), and motivational brand card.
  2. **Conversation List**: Filter tabs (`All`, `High`, `Medium`, `Low`), sender avatars with initials, unread indicators, and priority pills.
  3. **Selected Conversation**: Action toolbar, rich email message thread, and interactive **AI Draft Response** panel with tone controls (`Professional`, `Friendly`, `Concise`, `Empathetic`), quick refinement chips (`Make shorter`, `Add details`), version tags, and dual-gate approval buttons.
  4. **Right Intelligence Panel**: **AI Assessment** card (Confidence %, Topic, Urgency, Assigned Team, Sentiment, Risk Flags, collapsible rationale), **Relevant Knowledge** card citing approved company articles, and chronological **Conversation Timeline**.

---

## ⚡ Core Workflow & Safety Architecture

```
Inbound Email (Gmail / Synthetic)
             ↓
AI Structured Classification (Topic, Urgency, Sentiment, Risk)
             ↓
Knowledge Retrieval (Grounded RAG from Approved Articles Only)
             ↓
AI-Generated Reply Draft (Editable, Versioned)
             ↓
Human Specialist Review & Optional Refinement
             ↓
Explicit Version-Locked Approval
             ↓
Send Dispatch (Gmail API in Real Mode / Simulated in Demo Mode)
             ↓
Audit Event Recorded (Full Traceability & Zero Duplicate Sends)
```

### Safety Principles Enforced by Code
1. **No Autonomous Dispatch**: AI can never send an email independently.
2. **Version-Locked Signoff**: Approvals apply strictly to an exact draft version (e.g. `v1`).
3. **Automatic Approval Invalidation**: Any manual edit to the draft body or prompt regeneration increments the draft version (e.g. `v2`) and immediately revokes previous approval.
4. **Independent Server Validation**: The backend independently verifies `draft.is_approved === true && draft.version === expectedVersion`. Frontend button visibility is never treated as a security boundary.
5. **Simulated Sending in Demo Mode**: Demo mode operates on 20 realistic synthetic customer conversations and never transmits external emails to real recipients.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript (strict mode), Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend & APIs**: Next.js Server Route Handlers, Zod schema validation, Gmail REST API client.
- **AI Inference Engine**:
  - **NVIDIA NIM Provider**: Official endpoint (`https://integrate.api.nvidia.com/v1`) supporting `meta/llama-3.3-70b-instruct`, `mistralai/mistral-large-2-instruct`, `deepseek-ai/deepseek-r1`.
  - **OpenRouter Provider**: Official endpoint (`https://openrouter.ai/api/v1`) supporting `meta-llama/llama-3.3-70b-instruct`, `anthropic/claude-3.5-haiku`, `openai/gpt-4o-mini`.
  - **Dynamic Fallback Router**: Automatically routes to fallback model if primary experiences rate limits or outages.
  - **Deterministic Mock Provider**: Transparently simulates inference if API keys are omitted, with honest labelling.
- **Database & Storage**:
  - PostgreSQL schema with migrations for **Supabase** (`supabase/migrations/01_initial_schema.sql`).
  - Resilient local JSON persistence in `.data/store.json` for immediate out-of-the-box local development without requiring external cloud accounts.
- **Testing**: Vitest automated test suite covering safety rules, approval revocation, schema validation, and grounding citations.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `10.x` or later

### 2. Installation
```bash
git clone <your-repo-url> postmark
cd postmark
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your API keys as desired:
```env
# Primary & Fallback AI
AI_PRIMARY_PROVIDER=nvidia
AI_FALLBACK_PROVIDER=openrouter
AI_CLASSIFIER_MODEL=meta/llama-3.3-70b-instruct
AI_DRAFT_MODEL=meta/llama-3.3-70b-instruct
AI_FALLBACK_MODEL=meta-llama/llama-3.3-70b-instruct

# API Credentials (Optional - Mock mode runs automatically if omitted)
NVIDIA_API_KEY=nvapi-...
OPENROUTER_API_KEY=sk-or-v1-...

# Google OAuth & Gmail (Optional - Demo mode works out of the box)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Automated Safety Tests
```bash
npm test
```
Runs the Vitest suite verifying:
- Drafts cannot be sent without approval.
- Editing draft text invalidates previous approval.
- Model structured outputs conform to Zod schemas.
- AI fallback and knowledge grounding operate reliably.

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Integration Guides

### A. NVIDIA NIM Setup
1. Visit [build.nvidia.com](https://build.nvidia.com).
2. Generate an API Key under your NVIDIA Developer profile.
3. Paste the key into `NVIDIA_API_KEY` in `.env.local` or directly inside the app under **Settings > Real AI API Credentials > Test Connection**.

### B. OpenRouter Setup
1. Visit [openrouter.ai/keys](https://openrouter.ai/keys).
2. Create an API key with credit balance.
3. Set `OPENROUTER_API_KEY` in `.env.local` or via the in-app Settings modal.

### C. Google OAuth & Gmail API Setup
1. In the [Google Cloud Console](https://console.cloud.google.com):
   - Create a new project.
   - Enable the **Gmail API** (`APIs & Services > Library > Gmail API`).
   - Configure the **OAuth Consent Screen** with user type **External** and add support scopes:
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
   - Under **Credentials > Create Credentials > OAuth client ID**, select **Web application**.
   - Add Authorized redirect URI:
     - `http://localhost:3000/api/auth/google/callback` (Local)
     - `https://your-domain.vercel.app/api/auth/google/callback` (Production)
2. Copy the Client ID and Client Secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
3. In Postmark, click the mode pill in the top-left or open **Settings** and click **Connect Real Gmail**.

### D. Supabase Setup
1. Create a new database project on [supabase.com](https://supabase.com).
2. Open the SQL Editor in Supabase and run the migration in [01_initial_schema.sql](supabase/migrations/01_initial_schema.sql).
3. Set your Supabase connection keys in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 🚢 Vercel Deployment

1. Push your repository to GitHub.
2. In the Vercel dashboard, click **Add New > Project** and import the repository.
3. Add your environment variables (`NVIDIA_API_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`).
4. Ensure your Google OAuth Client in Google Cloud Console has your Vercel URL added under Authorized redirect URIs (`https://<project>.vercel.app/api/auth/google/callback`).
5. Deploy.

---

## 🔒 Security & Privacy Notes

- **Zero Client-Side Secret Exposure**: All AI calls, Gmail API requests, and credential tests occur strictly on the server in Next.js Route Handlers. API keys are masked (`nvapi-••••••••...`) when retrieved by the client.
- **Email Content Sanitization**: Inbound HTML emails are stripped of dangerous `<script>`, `<iframe>`, inline event listeners, and `javascript:` URLs.
- **Idempotent Dispatch**: Sending calls require explicit expected version numbers, preventing duplicate deliveries on network retries.

---

## 📄 License
MIT
