---
name: deploy-and-harden-cloudflare-spa
description: End-to-end guide for auditing, securing, bundle-optimizing, and deploying single-page web applications (Vite/React/Next.js) to Cloudflare Pages via Wrangler with OAuth/API token resolution. Use whenever deploying a frontend app to Cloudflare Pages, diagnosing Wrangler authentication failures, hardening production headers (CSP/HSTS), eliminating hardcoded client secrets, or optimizing production chunking.
---

# Deploy & Harden Cloudflare SPA

A standardized, repeatable workflow to audit client secrets, configure security headers, optimize bundler chunking, authenticate Wrangler, and deploy web applications to Cloudflare Pages.

---

## 1. Description & Trigger Conditions

### Use When:
- Deploying a frontend single-page application (React, Vite, Next.js static export) to Cloudflare Pages.
- A user says: *"Deploy this to Cloudflare"*, *"Fix Cloudflare wrangler deployment"*, *"Push the latest build to Cloudflare Pages"*, or *"Audit and deploy our web app"*.
- Diagnosing `CLOUDFLARE_API_TOKEN` errors, Wrangler OAuth timeouts, or permission code `10000`/`9109` issues.
- Hardening client production assets (`_headers`, CSP, HSTS, disabling source maps, removing obfuscated secrets).

### Do NOT Use When:
- Building complex multi-region Cloudflare Workers / Durable Objects backend microservices (use `cloudflare` or `durable-objects` skills).
- Managing raw SQL schema migrations for Neon/Postgres (use database migration skills).

---

## 2. Step-by-Step Instructions

```
Step 1: Client Secret & Code Hygiene Audit
  └─ Grep for base64 strings, hardcoded API keys (e.g. sk-or-*, sk-*, bearer tokens).
  └─ Move all sensitive keys to environment variables or user-provided runtime storage.
  └─ Redact any exposed secret immediately and instruct the user to rotate the compromised key.

Step 2: Build & Chunk Optimization (vite.config.ts)
  └─ Set build.sourcemap = false to prevent source code exposure in production.
  └─ Configure manualChunks to split heavy third-party vendor libraries (e.g. recharts, lucide-react).
  └─ Verify clean build execution: npm run build (ensure zero compiler errors).

Step 3: Security Headers Hardening (public/_headers)
  └─ Create or update public/_headers with strict production policies:
     • Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
     • X-Frame-Options: DENY (or frame-ancestors 'none')
     • X-Content-Type-Options: nosniff
     • Content-Security-Policy (CSP) tailored to actual loaded assets (fonts, APIs, image CDNs).
     • Permissions-Policy (restricting mic/geo/camera unless needed).

Step 4: SEO & Metadata Alignment (index.html)
  └─ Verify canonical URL, OpenGraph og:url, Twitter cards, and JSON-LD schema point to the exact target domain.

Step 5: Cloudflare Wrangler Authentication
  └─ Check stored token: verify if $env:CLOUDFLARE_API_TOKEN is active.
  └─ If unset or expired, provide user with the exact permission template link:
     URL: https://dash.cloudflare.com/profile/api-tokens
     Required Permissions: Account -> Cloudflare Pages -> Edit, Account Resources: All Accounts.
  └─ Verify token via curl: https://api.cloudflare.com/client/v4/user/tokens/verify

Step 6: Production Deployment
  └─ Run deployment: npx wrangler pages deploy dist --project-name <project-name>
  └─ Capture the deployment URL (e.g. https://<hash>.<project>.pages.dev) and primary domain.

Step 7: Post-Deploy Verification
  └─ Validate live HTTP response headers and asset loading.
  └─ Execute test suite (npm run test:all or Playwright E2E) against the deployed build.
```

---

## 3. Rules & Constraints

1. **NEVER bake API secrets into the client bundle**: Base64 encoding via `atob()` is NOT security. All API keys must come from user input in UI or server-side proxies.
2. **NEVER expose source maps in production**: Always enforce `build.sourcemap = false`.
3. **DO NOT modify working code without evidence**: Inspect first, run type checks, ensure zero regressions.
4. **Mandatory Redaction**: Any discovered token must be redacted in logs and outputs (`sk-or-v1-****REDACTED****`).

---

## 4. Output Format

When executing this workflow, output the status report in this format:

```markdown
### ☁️ Cloudflare Pages Deployment & Security Summary

| Parameter | Status / Value |
|---|---|
| 🌐 Production URL | `https://<project-name>.pages.dev` |
| 🔗 Deployment Hash | `https://<deploy-id>.<project-name>.pages.dev` |
| 🛡️ Security Headers | CSP, HSTS, X-Frame-Options, Nosniff active in `_headers` |
| 📦 Bundle Optimization | Chunk splitting enabled (`dist/assets/`) |
| 🔑 Secret Hygiene | Zero hardcoded client credentials |
| 🧪 Test Verification | `<N>` Passed \| 0 Failed |
```

---

## 5. Worked Example

```powershell
# 1. Verify Cloudflare Token
$env:CLOUDFLARE_API_TOKEN="cfut_****REDACTED****"
curl.exe "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN"

# 2. Build hardened production bundle
npm.cmd run build

# 3. Deploy to Cloudflare Pages
npx.cmd wrangler pages deploy dist --project-name forma-ai
```

---

## 6. Failure Modes & Mitigations

1. **Error: `Invalid access token [code: 9109]` or `Authentication error [code: 10000]`**:
   - *Cause*: Token missing `Cloudflare Pages: Edit` permissions or expired.
   - *Fix*: Create a Custom Token at `dash.cloudflare.com/profile/api-tokens` with Account -> Cloudflare Pages -> Edit.
2. **Error: `Generated an empty chunk: "vendor-react"`**:
   - *Cause*: Bundler already pulled React into root entry chunk.
   - *Fix*: Remove `vendor-react` from `manualChunks` in `vite.config.ts`, retaining other heavy libraries like `vendor-recharts`.
3. **Wrangler OAuth Timeout (`Timed out waiting for authorization code`)**:
   - *Cause*: Non-interactive background environment blocking port `8976` callback.
   - *Fix*: Switch to `CLOUDFLARE_API_TOKEN` environment variable deployment.
