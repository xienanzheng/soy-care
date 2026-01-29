## Securing & Deploying the Pet Insights MCP server

The MCP server in `mcp/pet-insights-server.ts` now enforces per-user authorization so that only authenticated Soycraft sessions can request AI analysis. Follow these steps before exposing it to the public internet.

### 1. Environment variables

Set the following variables wherever you deploy the service:

| Key | Description |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | The service role key (keep secret, never expose client-side) |
| `OPENAI_API_KEY` | API key for OpenAI (or an Azure/OpenAI-compatible endpoint) |
| `OPENAI_MODEL` | Optional override, defaults to `gpt-4o-mini` |
| `PORT` | Optional. Defaults to `8787` locally |

The frontend already looks for `VITE_PET_INSIGHTS_URL`. Point that variable to the deployed MCP base URL (e.g., `https://insights.yourdomain.com`). No other code changes are needed client-side because the hooks now forward the user’s Supabase access token in the `Authorization` header automatically.

### 2. Authentication flow

1. The app requests a Supabase session via the standard client SDK.
2. Whenever the app calls `/analyze`, `/breed-breakdown`, or `/chat`, it attaches `Authorization: Bearer <access_token>` to the MCP request.
3. The server validates that token via `supabase.auth.getUser(token)` and stores `authUserId` on the request.
4. All queries enforce tenant isolation (`pets.user_id = authUserId`), so even if someone discovers another pet ID they cannot fetch it.

If the token is missing or invalid the server returns `401`. Make sure your mobile/desktop builds bubble that error up to the user.

### 3. Deployment recommendations

You can deploy the MCP server to any Node-friendly host:

- **Vercel** – simplest option. Use the “Other” framework preset, set the build command to `npm install && npm run build` if you add a build step or just `npm install`, and point the start command to `node --loader ts-node/esm mcp/pet-insights-server.ts` or compile to JS first.
- **Render / Railway / Fly.io** – choose a long-running Node service, set the start command to `node dist/mcp/pet-insights-server.js` (use `tsx` or `ts-node` when developing).
- **Self-hosted** – run `npm run mcp` behind a reverse proxy such as Nginx or Caddy with TLS.

Regardless of platform:

1. Enable HTTPS and, if available, add IP throttling or WAF rules so the `/analyze` endpoint cannot be abused.
2. Turn on request logging/metrics (Vercel Observability, Render logs, etc.) to monitor latency and OpenAI usage spikes.
3. Store secrets using the platform’s encrypted secret manager rather than `.env` files checked into the repo.
4. Rotate the Supabase service role key if it was ever exposed before adding this authentication step.

### 4. Local testing checklist

1. Copy `.env.example` to `.env` and add real Supabase/OpenAI credentials.
2. Run `npm run dev` to start the web client and `npm run mcp` (or `tsx mcp/pet-insights-server.ts`) for the MCP server.
3. Authenticate in the app, then trigger `/analyze` from the Analytics screen – you should see `Authorization` headers arrive in the MCP logs.

### 5. Fail-safe handling

- The server already rejects requests without an authenticated Supabase user.
- It saves AI responses only after a successful OpenAI completion, so no partial data is written.
- Add external monitoring (e.g., UptimeRobot hit to `/context/:petId`) plus Supabase row-count alerts for `health_notes` to be notified of anomalies.

Once deployed, update `VITE_PET_INSIGHTS_URL` in your `.env` (and in any native build configuration) so compiled mobile bundles target the hosted endpoint instead of localhost.
