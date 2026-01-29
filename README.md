# Stage 1 of the code are done by Lovable AI

# Stage 2 of the code (including MCP layer, API layer, and frontend) are done by CTO

## Project info

# MCP Layer

<!-- Node/Express service (npm run mcp) boots from pet-insights-server.ts (line 1), loads Supabase + OpenAI clients with required env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, optional OPENAI_MODEL, PORT) and enables CORS + 25 MB JSON bodies.
Every request passes through a middleware that enforces Authorization: Bearer <supabase access token> and stores authUserId, guaranteeing tenant isolation before any database query executes. pet-insights-server.ts (line 29)
Context assembly helpers (fetchPetContext, fetchRagMemories, buildPrompt, summarizeContextForChat, buildBreedPrompt) hydrate recent food/poop/supplement logs, prior AI notes, and RAG snippets so OpenAI prompts stay brief but data-rich. pet-insights-server.ts (line 63)
Endpoints: GET /context/:petId returns the hydrated view; POST /analyze triggers triage summaries (optionally with stool photos) and persists results back to health_notes; POST /breed-breakdown builds a JSON breed mix; POST /chat injects context digest + RAG snippets to keep free-form chat grounded. pet-insights-server.ts (line 247), pet-insights-server.ts (line 260), pet-insights-server.ts (line 313), pet-insights-server.ts (line 368)
README-ready deployment guidance: secure the server behind HTTPS/WAF, set secrets via your host, and point the frontend’s VITE_PET_INSIGHTS_URL at the deployed base URL; local dev runs npm run dev (web) alongside npm run mcp. mcp.md (line 1) -->L

# API Layers (Supabase)

<!-- Supabase is the primary backend: client.ts (line 1) instantiates a typed client using VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY, persisting sessions in localStorage.
AuthProvider wraps the app, listening for Supabase auth state changes, exposing signUp, signIn, OAuth, and signOut helpers so every hook can rely on useAuth() for the current user/session. AuthContext.tsx (line 1)
Domain hooks use React Query to talk to Supabase tables: usePets CRUDs rows in pets, ensuring user_id scoping and cache invalidation. usePets.ts (line 1)
useLogs contains CRUD + reward triggers for food, supplement, poop, measurement, and photo logs, awarding credits via stored procedures while invalidating relevant queries. useLogs.ts (line 1)
Community and challenge data each have thin hooks (useCommunityFeed, useChallenges) that filter by user/pet, cap result counts, and hydrate UI-ready DTOs. useCommunityFeed.ts (line 1), useChallenges.ts (line 1)
Reward economics live in Supabase RPCs (reward_for_activity, spend_credits), wrapped by awardActivityCredit/spendCredits for reuse across hooks. rewards.ts (line 1)
The usePetInsights hook is the bridge between API and MCP layers: it reads the Supabase session token client-side, forwards it to the MCP endpoints (/analyze, /breed-breakdown, /chat), and surfaces loading/error toasts. usePetInsights.ts (line 26) -->

# Frontend

<!-- Vite + React + TypeScript SPA renders dashboards, logs, community feed, and challenges, using shadcn/Tailwind for UI (package.json, Dashboard.tsx).
Supabase auth context (AuthContext.tsx (line 1)) exposes session state so hooks like usePets (usePets.ts (line 1)), useLogs (useLogs.ts (line 1)), useCommunityFeed (useCommunityFeed.ts (line 1)), and useChallenges (useChallenges.ts (line 1)) can query/update tables with React Query.
usePetInsights (usePetInsights.ts (line 26)) is the bridge to AI features: it reads VITE_PET_INSIGHTS_URL, attaches the user’s Supabase access token, and calls MCP endpoints for health insights, breed breakdowns, and chat replies while surfacing toast feedback. -->

# Backend

<!-- Core data/APIs live in Supabase (auth, pets, logs, community, rewards RPCs such as reward_for_activity/spend_credits in rewards.ts (line 1)).
MCP layer (pet-insights-server.ts (line 1)) is an Express server with Supabase service role + OpenAI keys; middleware validates Authorization: Bearer <token> via supabase.auth.getUser, enforces tenant isolation, and exposes /context/:petId, /analyze, /breed-breakdown, and /chat.
Docs in mcp.md (line 1) cover the required env vars, deployment (HTTPS, secret storage, VITE_PET_INSIGHTS_URL), and local workflow (npm run dev + npm run mcp). -->

# User input and MCP interaction & Analytics Flow

<!-- The frontend gathers structured pet inputs (food, poop, supplements, notes) through Supabase mutations; these records are the source of truth for analytics.
When a user requests AI help, usePetInsights packages the current pet ID + chat history and forwards the authenticated call to MCP.
MCP fetches the same user-scoped Supabase rows plus recent AI notes (health_notes, poop_insights), builds concise prompts (summaries, RAG snippets), and hits OpenAI.
Responses return as JSON (summary, recommendations, risk level, breed breakdown, or chat reply) and—except for chat—are persisted back to Supabase (persistHealthNote in pet-insights-server.ts (line 236)), closing the loop so future analytics and dashboard views immediately reflect the latest AI insight. -->

# Deployment

<!-- Deploy the MCP layer behind HTTPS/WAF (e.g., Vercel, AWS, Cloud Run) with these env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, optional OPENAI_MODEL, PORT.>
