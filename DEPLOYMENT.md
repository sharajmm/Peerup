Deployment checklist — Vercel

1. Set required environment variables in the Vercel project (Production & Preview):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

(Also set any additional keys you use in the code:)

- NEXT_PUBLIC_OPENROUTER_API_KEY
- NEXT_PUBLIC_EMAILJS_SERVICE_ID
- NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
- NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

Notes:

- Make sure the Firebase keys are set for both "Preview" and "Production" environments in Vercel if you want PR previews to work.
- If you remove or change `vercel.json`, Vercel's native Next.js support will still handle server-side rendering routes correctly. `vercel.json` in this repo is a conservative fallback to prevent 404s on direct refreshes in some static deployment scenarios.

2. Recommended Vercel settings

- Framework Preset: Next.js (should be automatic)
- Build command: npm run build
- Output directory: (leave blank for Next.js)

3. Local verification (copy these commands into PowerShell in your project root):

```powershell
# typecheck
npx tsc --noEmit

# production build
npm run build

# run locally in prod-like mode
npm run start
```

4. If you still see `Firebase: Error (auth/invalid-api-key)` during Vercel builds:

- Confirm env var names are exactly the same as in `.env.local` (case-sensitive).
- Confirm they are configured under the correct project and for the correct scope (Production/Preview).
- If your app initializes Firebase at build-time (server), prefer to guard initialization so it only runs in the browser or use runtime environment variables in Vercel.

5. Routing notes

- `vercel.json` added to this repo is a conservative catch-all rewrite:
  - Preserves `/_next/static` and `/api` routes
  - Falls back all other paths to `/` so the Next.js app shell can hydrate client-side routes (prevents 404s on refresh for SPA-style setups).
- If you use Vercel's native Next.js integration there's usually no need for the catch-all; you can remove `vercel.json` if you'd prefer strict Next routing.

6. Optional: Post-deploy smoke test

- Visit a nested route (e.g., /dashboard/connections) in a fresh incognito window or directly paste URL in the address bar — it should render without 404.
- Trigger Firebase-auth flows that require the public keys to confirm real-time features work.

If you want, I can also:

- Remove the `vercel.json` fallback and rely on default Next behavior.
- Make the catch-all more targeted (only certain prefixes) instead of `/:path*` if you prefer.
- Update any search routing behavior you flagged earlier (explain which input should avoid changing the pathname).
