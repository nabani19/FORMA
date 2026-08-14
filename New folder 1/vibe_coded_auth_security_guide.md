# Fixing Auth Problems in Vibe-Coded Apps

Vibe-coded apps often ship fast but break security basics. Here are the **most common auth failures** and their bulletproof fixes, plus a master prompt to prevent them at the source.

---

## Table of Contents
1. [JWTs Done Wrong](#1-jwts-done-wrong)
2. [Password Handling Disasters](#2-password-handling-disasters)
3. [Missing Authorization After Authentication](#3-missing-authorization-after-authentication)
4. [CORS Misconfiguration](#4-cors-misconfiguration)
5. [No CSRF Protection](#5-no-csrf-protection)
6. [SQL/NoSQL Injection via Auth](#6-sqlnosql-injection-via-auth)
7. [XSS via Auth Flows](#7-xss-via-auth-flows)
8. [Missing Rate Limiting](#8-missing-rate-limiting)
9. [Secrets in Frontend/Code](#9-secrets-in-frontendcode)
10. [Insecure Password Reset](#10-insecure-password-reset)
11. [OAuth 2.0 / Social Login](#11-oauth-20--social-login-google-github-etc----done-wrong)
12. [Secure Auth Architecture Pattern](#-secure-auth-architecture-pattern)
13. [Master Prompt for 100% Secure Auth](#-master-prompt-for-100-secure-auth)
14. [Quick Wins](#-quick-wins)

---

## 1. JWTs Done Wrong

**Problem:** Storing JWTs in `localStorage`, no expiration validation, using weak secrets, or rolling custom JWT logic.

**Fix:**
- Store access tokens in **memory** (React context/Zustand), **never** `localStorage`
- Store refresh tokens in **`httpOnly`, `Secure`, `SameSite=Strict` cookies**
- Use short-lived access tokens (15 min) + long-lived refresh tokens (7-30 days) with rotation
- Use a battle-tested library (`jose`, `jsonwebtoken`, `PyJWT`, `paseto` if paranoid)
- Validate `exp`, `iat`, `iss`, `aud` on every request server-side

```javascript
// BAD
localStorage.setItem('token', jwt);

// GOOD
// Access token: in-memory only
// Refresh token: httpOnly cookie set by server
res.cookie('refresh_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

---

## 2. Password Handling Disasters

**Problem:** Plaintext passwords, weak hashing (MD5/SHA1), no salt, client-side hashing only.

**Fix:**
- **Never** store passwords you can read. Use **Argon2id** (preferred) or **bcrypt** with cost factor >=10
- Enforce minimum 8 chars, but don't impose ridiculous complexity rules
- Use a library (`argon2`, `bcryptjs`) -- never roll your own
- Implement rate limiting on login endpoints (5 attempts -> 15 min lockout)

---

## 3. Missing Authorization After Authentication

**Problem:** Verifying the user is logged in, but not checking if they can access *that specific resource* (IDOR - Insecure Direct Object Reference).

**Fix:**
- Every protected endpoint must check: **Who are you?** AND **What can you do?**
- Never trust `user_id` from the request body/params for authorization; use the ID from the verified token
- Implement RBAC (Role-Based Access Control) or ABAC (Attribute-Based)

```javascript
// BAD
app.get('/api/invoice/:id', authMiddleware, (req, res) => {
  const invoice = db.invoices.find(req.params.id); // Any user can access any invoice!
});

// GOOD
app.get('/api/invoice/:id', authMiddleware, async (req, res) => {
  const invoice = await db.invoices.findOne({
    id: req.params.id,
    user_id: req.user.id  // FROM TOKEN, not request
  });
  if (!invoice) return res.status(404).send(); // Same 404 for "not yours" and "not found"
});
```

---

## 4. CORS Misconfiguration

**Problem:** `Access-Control-Allow-Origin: *` with credentials enabled, or reflecting the origin header.

**Fix:**
- Whitelist exact origins. Never use `*` when cookies/credentials are involved
- Validate the `Origin` header server-side against an allowlist

```javascript
// BAD
app.use(cors({ origin: '*', credentials: true }));

// GOOD
const allowedOrigins = ['https://myapp.com', 'https://app.myapp.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed'));
  },
  credentials: true
}));
```

---

## 5. No CSRF Protection

**Problem:** State-changing actions via cookies without CSRF tokens or `SameSite` protection.

**Fix:**
- Set `SameSite=Strict` on all auth cookies
- For cookie-based session auth, implement Double Submit Cookie pattern or Synchronizer Token Pattern
- Prefer `Authorization: Bearer` header for APIs (CSRF-proof by design)

---

## 6. SQL/NoSQL Injection via Auth

**Problem:** Passing raw user input into database queries in login/registration.

**Fix:**
- Use parameterized queries/ORMs exclusively (`$1`, `?`, `:param`)
- Never concatenate user input into queries
- Validate all inputs with Zod/Joi/Yup before touching the database

---

## 7. XSS via Auth Flows

**Problem:** Reflecting user input in error messages, rendering tokens in DOM, or storing tokens where XSS can steal them.

**Fix:**
- Sanitize all user-generated content before rendering
- Content Security Policy (CSP) headers
- `httpOnly` cookies for anything sensitive
- Escape output in error messages (`"User ${username} not found"` -> can leak valid usernames)

---

## 8. Missing Rate Limiting

**Problem:** Login, password reset, and registration endpoints wide open to brute force.

**Fix:**
- Implement per-IP and per-account rate limiting
- Use `express-rate-limit`, `fail2ban`, or cloud WAF rules
- Add CAPTCHA after 3 failed attempts

---

## 9. Secrets in Frontend/Code

**Problem:** Hardcoding JWT secrets, API keys, or DB credentials in frontend code or `.env` files committed to git.

**Fix:**
- Frontend should have **zero** secrets. Public API keys only.
- Use a secret manager (AWS Secrets Manager, Doppler, 1Password Secrets Automation)
- `.env` in `.gitignore`, validate in CI/CD

---

## 10. Insecure Password Reset

**Problem:** Predictable reset tokens, tokens sent in URL that get logged, no expiration, no invalidation on password change.

**Fix:**
- Generate cryptographically random tokens (32+ bytes via `crypto.randomBytes`)
- Hash the token in the database (like a password)
- Send token via email only, expire in 15-60 minutes
- Invalidate all sessions/tokens on password reset
- Use single-use tokens

---

## Secure Auth Architecture Pattern

```
+-------------+         +--------------+         +-------------+
|   Client    |-------->|  API Gateway |-------->|  Auth Svc   |
|  (No secrets|         | (Rate Limit, |         | (Issue/     |
|   in code)  |<--------|   WAF, TLS)  |<--------|   Verify)   |
+-------------+         +--------------+         +-------------+
        |                                              |
        |         +--------------+                    |
        +-------->|  Resource    |<-------------------+
                  |    APIs      |
                  | (RBAC Check, |
                  |  Param Query)|
                  +--------------+
```

**Rules:**
1. Client holds **only** a short-lived access token in memory
2. Refresh token lives in `httpOnly`, `Secure`, `SameSite=Strict` cookie
3. Auth service is the only service that touches password hashes
4. Resource APIs validate JWT independently (stateless) or via introspection
5. Database queries are always parameterized
6. Every request passes through rate limiting + input validation

---

## Master Prompt for 100% Secure Auth

Copy-paste this into any AI coding assistant before asking it to build auth:

```
You are a senior security engineer building authentication and authorization for a production web application. Follow these non-negotiable rules:

SECURITY REQUIREMENTS:
1. AUTHENTICATION:
   - Use short-lived JWT access tokens (15 minutes) stored ONLY in application memory (never localStorage/sessionStorage)
   - Use refresh tokens stored in httpOnly, Secure, SameSite=Strict cookies with rotation (new refresh token issued on each use, old one invalidated)
   - Passwords must be hashed with Argon2id (or bcrypt if unavailable) before storage. Never store plaintext or reversible passwords.
   - Implement rate limiting: 5 failed login attempts per IP per 15 minutes. Return generic error messages ("Invalid credentials") to prevent user enumeration.
   - All auth endpoints must use HTTPS only. Reject HTTP requests.

2. AUTHORIZATION:
   - Every protected endpoint MUST verify BOTH authentication (who) and authorization (what they can access)
   - Never trust user_id, role, or permissions from request body/query params. Extract identity ONLY from the verified JWT/session.
   - Implement RBAC: at minimum distinguish between admin and user roles. Middleware must enforce role checks.
   - Use the principle: "404 for unauthorized access to existing resources" -- don't reveal resource existence via 403s.

3. INPUT VALIDATION:
   - Validate and sanitize ALL inputs using a schema validator (Zod/Joi/Yup) before processing.
   - Use parameterized queries/ORM for ALL database operations. String concatenation in queries is FORBIDDEN.
   - Sanitize email format, enforce password minimum 8 characters, reject NoSQL injection patterns.

4. SESSION & TOKEN SECURITY:
   - Invalidate all sessions/tokens on password change or suspicious activity.
   - Implement secure password reset: cryptographically random tokens (32+ bytes), hashed before DB storage, expire in 15 minutes, single-use only.
   - Include token versioning or jti claim to enable global logout.

5. CORS & CSRF:
   - CORS: Whitelist exact origins. Never use wildcard (*) when credentials are enabled.
   - CSRF: SameSite=Strict cookies. If using cookie-based sessions, implement Double Submit Cookie pattern.

6. ERROR HANDLING & LOGGING:
   - Never expose stack traces, database errors, or internal paths to the client.
   - Log security events (failed logins, password resets, privilege escalation attempts) but NEVER log passwords or tokens.
   - Return identical error messages for "user not found" and "wrong password" to prevent enumeration.

7. DEPENDENCIES:
   - Use only well-maintained, audited libraries for crypto and auth (e.g., jose, passport.js, auth.js/next-auth, Lucia, or framework-native solutions).
   - Never implement custom crypto algorithms, custom JWT parsing, or custom session management.

8. FRONTEND:
   - Zero secrets in frontend code or environment variables exposed to the browser.
   - Implement automatic silent refresh for access tokens before expiry.
   - Clear all client-side auth state on logout.

Before writing any code, state your security architecture decisions. After writing code, review it against each requirement above and confirm compliance. If any requirement cannot be met, explicitly state why and provide the safest alternative.
```

---



---

## 11. OAuth 2.0 / Social Login (Google, GitHub, etc.) — Done Wrong

**Problem:** Vibe-coding OAuth often means copy-pasting a quick Google Sign-In snippet without understanding the security implications. This leads to token theft, account pre-hijacking, CSRF via missing `state`, and using access tokens as proof of identity.

### 11.1 The PKCE Flow (Mandatory for SPAs & Mobile)

**Problem:** Using the traditional Authorization Code flow from a client-side app exposes your client secret.

**Fix:**
- Always use **Authorization Code + PKCE** (Proof Key for Code Exchange) for SPAs, mobile apps, and any client that can't keep a secret
- Generate a cryptographically random `code_verifier` (43-128 chars) and hash it to create `code_challenge` (S256 method)
- The `code_verifier` must never leave the client until the token exchange

```javascript
// BAD — Client Secret exposed in frontend
const params = new URLSearchParams({
  client_id: 'xxx',
  client_secret: 'xxx',  // NEVER in frontend!
  response_type: 'code',
  redirect_uri: '...'
});

// GOOD — PKCE flow
const codeVerifier = generateCodeVerifier(); // 43-128 random chars
const codeChallenge = await sha256(codeVerifier); // base64url encoded

const params = new URLSearchParams({
  client_id: 'xxx',
  response_type: 'code',
  redirect_uri: 'https://myapp.com/auth/callback',
  scope: 'openid email profile',
  state: generateState(),
  code_challenge: codeChallenge,
  code_challenge_method: 'S256'
});

// Store codeVerifier in memory (or sessionStorage at absolute worst)
// Exchange code + code_verifier for tokens server-side
```

### 11.2 The `state` Parameter (CSRF Prevention)

**Problem:** Missing or predictable `state` parameter allows attackers to trick users into linking their account to an attacker's identity (account pre-hijacking) or force actions on behalf of the victim.

**Fix:**
- Generate a cryptographically random `state` value (32+ bytes)
- Store it server-side (session/cache) or in a signed cookie before redirecting to the OAuth provider
- Validate the returned `state` matches exactly on callback. Reject if missing or mismatched.

```javascript
// Generate and store state BEFORE redirect
const state = crypto.randomBytes(32).toString('hex');
res.cookie('oauth_state', state, { 
  httpOnly: true, 
  secure: true, 
  sameSite: 'strict', 
  maxAge: 600000 // 10 min
});

// On callback
const returnedState = req.query.state;
const storedState = req.cookies.oauth_state;
if (!returnedState || !storedState || returnedState !== storedState) {
  return res.status(403).send('Invalid state parameter');
}
```

### 11.3 ID Token vs Access Token — Know the Difference

**Problem:** Using the OAuth access token to identify the user or making auth decisions. Access tokens are for **resource APIs**, not identity.

**Fix:**
- **ID Token** (JWT from OpenID Connect) = who the user is. Use this for authentication decisions.
- **Access Token** = what the app can do on behalf of the user. Use this to call Google APIs.
- Never accept an access token as proof of identity in your own app
- Validate the ID token's signature using the provider's JWKS endpoint
- Verify `iss`, `aud` (must match your client_id), `exp`, `iat`, and `nonce`

```javascript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

async function verifyIdToken(idToken, clientId) {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: clientId,
    clockTolerance: 60
  });

  // payload.sub = Google's unique user ID
  // payload.email = verified email (if scope included)
  return payload;
}
```

### 11.4 The `nonce` Parameter (Replay Attack Prevention)

**Problem:** Without a `nonce`, an attacker could replay an old ID token to impersonate a user.

**Fix:**
- Include a `nonce` in the authorization request
- Store it alongside `state`
- Verify the `nonce` claim in the returned ID token matches exactly

```javascript
const nonce = crypto.randomBytes(32).toString('hex');
res.cookie('oauth_nonce', nonce, { httpOnly: true, secure: true, sameSite: 'strict' });

// In authorization params:
// nonce: nonce

// After receiving ID token:
if (idTokenPayload.nonce !== req.cookies.oauth_nonce) {
  throw new Error('Nonce mismatch - possible replay attack');
}
```

### 11.5 Account Linking & Pre-Hijacking Prevention

**Problem:** A user signs up with email/password, then an attacker creates an OAuth account with the same email and links it before the real user does.

**Fix:**
- **Verify email ownership before linking.** If the OAuth provider gives `email_verified: true` (Google does), you can auto-link. If not, require email verification first.
- **Never auto-link unverified emails.**
- If a local account exists with the same email, require the user to log in to the local account first, then explicitly confirm the link.
- Log all account linking/unlinking events.

```javascript
async function handleOAuthCallback(provider, idTokenPayload) {
  const { sub, email, email_verified } = idTokenPayload;

  // 1. Check if user already exists with this OAuth identity
  let user = await db.users.findOne({ [`oauth.${provider}.id`]: sub });
  if (user) return user;

  // 2. Check if local account exists with same email
  const localUser = await db.users.findOne({ email });

  if (localUser) {
    if (!email_verified) {
      throw new Error('Email not verified by provider. Cannot auto-link.');
    }

    // Require explicit confirmation or password re-auth before linking
    // Don't silently merge accounts
    throw new Error('Account exists. Please log in and link manually.');
  }

  // 3. Create new user
  return await db.users.create({
    email,
    email_verified,
    oauth: { [provider]: { id: sub, linked_at: new Date() } }
  });
}
```

### 11.6 Secure OAuth Callback Handler

**Fix:**
- Validate `state` and `nonce` before anything else
- Exchange code for tokens server-side (never client-side for confidential clients)
- Verify ID token signature and claims
- Set your own session/JWT after successful OAuth — don't rely on the provider's tokens for your app session
- Clear OAuth cookies (`state`, `nonce`, `code_verifier`) immediately after use
- Implement short-lived authorization codes (10 minutes max)

```javascript
app.get('/auth/callback', async (req, res) => {
  try {
    // 1. Validate state
    const state = req.query.state;
    if (state !== req.cookies.oauth_state) {
      return res.status(403).send('Invalid state');
    }

    // 2. Exchange code for tokens (server-to-server)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://myapp.com/auth/callback',
        grant_type: 'authorization_code',
        code_verifier: req.cookies.code_verifier
      })
    });

    const { id_token, access_token } = await tokenResponse.json();

    // 3. Verify ID token
    const payload = await verifyIdToken(id_token, process.env.GOOGLE_CLIENT_ID);

    // 4. Validate nonce
    if (payload.nonce !== req.cookies.oauth_nonce) {
      return res.status(403).send('Invalid nonce');
    }

    // 5. Find or create user, generate YOUR OWN tokens
    const user = await handleOAuthCallback('google', payload);
    const { accessToken, refreshToken } = generateAppTokens(user);

    // 6. Set cookies and clear OAuth temp cookies
    res.clearCookie('oauth_state');
    res.clearCookie('oauth_nonce');
    res.clearCookie('code_verifier');

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'strict'
    });

    res.redirect(`/dashboard?token=${accessToken}`); // Or return in body for SPA

  } catch (err) {
    // Log securely, don't leak details
    console.error('OAuth callback error:', err.message);
    res.redirect('/login?error=auth_failed');
  }
});
```

### 11.7 OAuth Security Checklist

| Check | Status |
|-------|--------|
| Using Authorization Code + PKCE (not Implicit or Password grants) | [ ] |
| `state` parameter generated, stored, and validated on callback | [ ] |
| `nonce` parameter used and verified in ID token | [ ] |
| ID token signature validated against provider JWKS | [ ] |
| `iss`, `aud`, `exp`, `iat` claims verified in ID token | [ ] |
| Token exchange happens server-side (client secret protected) | [ ] |
| App uses its own session/JWT, not provider tokens directly | [ ] |
| Email verified before auto-linking accounts | [ ] |
| OAuth temp cookies (`state`, `nonce`, `code_verifier`) cleared after use | [ ] |
| HTTPS enforced on all OAuth endpoints | [ ] |
| Rate limiting on OAuth callback endpoint | [ ] |

---

## Updated Master Prompt (OAuth Included)

Use this extended version when asking AI to build auth with social login:

```
You are a senior security engineer building authentication and authorization for a production web application, including OAuth 2.0 / OpenID Connect social login (Google, GitHub, etc.). Follow these non-negotiable rules:

SECURITY REQUIREMENTS:
1. AUTHENTICATION (Local):
   - Use short-lived JWT access tokens (15 minutes) stored ONLY in application memory (never localStorage/sessionStorage)
   - Use refresh tokens stored in httpOnly, Secure, SameSite=Strict cookies with rotation
   - Passwords must be hashed with Argon2id (or bcrypt if unavailable) before storage
   - Implement rate limiting: 5 failed login attempts per IP per 15 minutes
   - Generic error messages ("Invalid credentials") to prevent user enumeration

2. AUTHENTICATION (OAuth 2.0 / Social Login):
   - Use Authorization Code + PKCE flow ONLY. Never use Implicit grant or Password grant.
   - Generate and validate a cryptographically random `state` parameter on every OAuth flow to prevent CSRF.
   - Include and verify a `nonce` parameter to prevent replay attacks.
   - Exchange authorization codes for tokens SERVER-SIDE only. Client secret must never be exposed to the browser.
   - Validate ID token signature using provider's JWKS endpoint. Verify `iss`, `aud` (must match your client_id), `exp`, `iat`, and `nonce`.
   - Use the ID token for identity, NOT the access token.
   - After successful OAuth, generate YOUR OWN session/JWT tokens. Do not use provider tokens as your app session.
   - Clear all OAuth temporary cookies (`state`, `nonce`, `code_verifier`) immediately after successful callback.
   - Only auto-link OAuth accounts to existing local accounts if the provider confirms `email_verified: true`. Otherwise require explicit confirmation.
   - Log all account linking/unlinking events.

3. AUTHORIZATION:
   - Every protected endpoint MUST verify BOTH authentication (who) and authorization (what they can access)
   - Never trust user_id, role, or permissions from request body/query params. Extract identity ONLY from the verified JWT/session.
   - Implement RBAC: at minimum distinguish between admin and user roles.
   - Use the principle: "404 for unauthorized access to existing resources" -- don't reveal resource existence via 403s.

4. INPUT VALIDATION:
   - Validate and sanitize ALL inputs using a schema validator (Zod/Joi/Yup) before processing.
   - Use parameterized queries/ORM for ALL database operations.
   - Enforce password minimum 8 characters.

5. SESSION & TOKEN SECURITY:
   - Invalidate all sessions/tokens on password change or suspicious activity.
   - Secure password reset: random tokens (32+ bytes), hashed in DB, expire in 15 minutes, single-use.
   - Include token versioning or jti claim to enable global logout.

6. CORS & CSRF:
   - CORS: Whitelist exact origins. Never use wildcard (*) when credentials are enabled.
   - CSRF: SameSite=Strict cookies. Double Submit Cookie pattern for cookie-based sessions.

7. ERROR HANDLING & LOGGING:
   - Never expose stack traces, database errors, or internal paths to the client.
   - Log security events but NEVER log passwords, tokens, or code_verifiers.
   - Identical error messages for "user not found" and "wrong password".

8. DEPENDENCIES:
   - Use only well-maintained, audited libraries for crypto and auth (jose, passport.js, auth.js/next-auth, Lucia, etc.).
   - Never implement custom crypto, custom JWT parsing, or custom session management.

9. FRONTEND:
   - Zero secrets in frontend code or environment variables exposed to the browser.
   - Implement automatic silent refresh for access tokens before expiry.
   - Clear all client-side auth state on logout.

Before writing any code, state your security architecture decisions. After writing code, review it against each requirement above and confirm compliance. If any requirement cannot be met, explicitly state why and provide the safest alternative.
```


---

## ## Quick Wins (Do These Now)


| Issue | 5-Minute Fix |
|-------|-------------|
| Token in localStorage | Move to memory + httpOnly refresh cookie |
| CORS wildcard | Replace with explicit origin whitelist |
| No rate limiting | Add `express-rate-limit` or cloudflare rules |
| Passwords in plaintext/hash | Migrate to Argon2id immediately |
| Missing RBAC | Add `req.user.role` checks to every route |
| Secrets in repo | Rotate them, move to env/secret manager, scrub git history |

---

**Bottom line:** Vibe-coding is great for velocity, but auth is where you can't afford shortcuts. Use the master prompt upfront, review against the checklist above, and you'll eliminate 99% of the auth vulnerabilities that plague AI-generated apps.
