# Auth Hardening: Master Prompt + Checklist for Vibe-Coded Apps

## How to use this
Don't ask the AI to "make auth secure." That's too vague to act on. Instead, paste the
**Master Audit Prompt** below into your coding assistant (Claude Code, Cursor, etc.)
*after* your app already has basic login working. Treat it as a mandatory second pass,
not a one-shot request.

---

## The Master Audit Prompt

```
Act as a security engineer performing an authentication and authorization audit on
this codebase. Do NOT just tell me it looks fine — assume it doesn't, and prove it
either way by checking each item below against the actual code.

For every item: quote the relevant file/line, state PASS or FAIL, and if FAIL,
give the exact fix (code, not description).

1. AUTHORIZATION, NOT JUST AUTHENTICATION
   - For every API route / server action / database query that returns or mutates
     user data: is the owning user_id derived from the verified server-side session
     token, or is it read from the request body/query params/client state?
     Any case of the latter is a FAIL — client-supplied identity must never be trusted.
   - For every database table containing user data: does it have row-level security
     (or equivalent server-side filtering) that restricts rows to the requesting
     user, not just an application-layer "if" check that a client could bypass by
     calling the API directly?

2. TOKEN / SESSION HANDLING
   - Are auth tokens stored in httpOnly, secure, SameSite cookies — not localStorage
     or sessionStorage?
   - Do sessions have an expiry and refresh rotation? Does logout invalidate the
     token server-side, not just clear it client-side?

3. SECRETS
   - Search the entire repo (including frontend bundles/env files committed to git)
     for API keys, service-role keys, or client secrets. Any secret usable to bypass
     RLS or call privileged APIs must live only in server-side environment variables,
     never shipped to the browser.

4. INPUT TRUST BOUNDARY
   - List every place the server trusts a value from the client without
     re-validating against the session (role, price, permission flags, ownership).
   - Check for IDOR: can changing an ID in a URL or request body access another
     user's resource?

5. RATE LIMITING & BRUTE FORCE
   - Do login, signup, and password-reset endpoints have rate limiting / lockout?

6. CORS & TRANSPORT
   - Is CORS scoped to specific origins, not `*`, on any endpoint that accepts
     credentials?
   - Is everything served over HTTPS with no mixed content?

7. LEFTOVER DEBUG ACCESS
   - Search for hardcoded credentials, bypass flags, or test-only admin routes
     that were added during development and never removed.

8. PASSWORD HANDLING (if not using a managed auth provider)
   - Confirm passwords are hashed with bcrypt/argon2/scrypt — never stored plain
     or with a fast hash like MD5/SHA1.

Give me a prioritized list ordered by exploitability, not by how easy each fix is.
```

---

## Fast-track alternative: don't hand-roll it

The highest-leverage fix, honestly, is architectural: **stop writing custom auth logic
and use a managed provider** (Supabase Auth, Firebase Auth, Auth.js/NextAuth, Clerk,
or Auth0). Every item in section 1–2 above is something these handle correctly by
default. Vibe-coded custom auth fails because the AI is reinventing session
management and RLS from scratch, under time pressure, without a security review loop.
If you're not locked into a stack yet, this alone removes most of the risk surface.

---

## Adding Google OAuth (Sign in with Google)

The vibe-coding failure mode here specifically is: AI implements the OAuth redirect
flow by hand, forgets the `state` parameter (CSRF exposure), doesn't validate the
`redirect_uri` server-side, or puts the client secret in frontend code.

**Use this prompt instead of asking for it from scratch:**

```
Add Google OAuth sign-in using [Supabase Auth / NextAuth.js / Firebase Auth — pick
one], NOT a custom hand-rolled OAuth redirect flow. Requirements:
- Client secret must only exist in server-side env vars, never in frontend bundle.
- Verify the provider handles the `state` parameter for CSRF protection automatically
  (confirm this in the library's implementation, don't assume).
- On first Google sign-in, create the user record server-side using the verified
  email from Google's token — do not trust any user data sent from the client.
- Merge/link accounts only by verified email match, and flag if an account with
  that email already exists via a different provider, so we don't silently allow
  account takeover.
- Redirect URIs must be explicitly allow-listed in the Google Cloud Console —
  show me the exact URIs to register.
```

**Manual setup steps (provider-agnostic):**
1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application).
2. Add authorized redirect URIs — must match exactly what your auth library expects (e.g. `https://yourapp.com/api/auth/callback/google`).
3. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in server-side env vars only.
4. Enable the Google provider in your auth library's config — do not write the redirect/token-exchange logic yourself.
5. Re-run the Master Audit Prompt above once Google auth is wired in, since it's a new attack surface (account linking, email verification trust).

---

## The honest caveat

This checklist closes the recurring, well-known failure classes — it does not make
the app "100% secure." No audit does. Treat this as raising the floor to
industry-standard baseline, then repeat the audit prompt after every meaningful
auth-adjacent change (new OAuth provider, new role, new API route touching user data).
