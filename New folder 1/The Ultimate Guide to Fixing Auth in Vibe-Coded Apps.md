# The Ultimate Guide to Fixing Auth in Vibe-Coded Apps

## Introduction
"Vibe coding"—building apps with natural language AI tools—is revolutionary for speed, but often disastrous for security. AI models frequently generate "demo-grade" authentication that works in a local environment but is vulnerable in production. This guide provides the solutions to fix these gaps and implement a professional-grade secure system.

---

## The "Rescue Plan": How to Fix a Broken Auth System
If you already have an app with auth issues, follow this 3-step triage:

1.  **Audit the Storage**: Check if you are saving tokens in `localStorage`. If yes, rewrite your auth logic to use `HttpOnly` cookies immediately. This is the #1 vulnerability.
2.  **Rotation of Secrets**: If you suspect a breach or were using weak secrets, change your `JWT_SECRET` in your environment variables. This will invalidate all current sessions and force users to log in again with the new, secure secret.
3.  **Database Lockdown**: If using Supabase or Firebase, check your RLS (Row Level Security). Run a test where you try to fetch data without being logged in. If you get data, your database is wide open. Enable RLS and add policies.

---

## Part 1: Top 10 Common Auth Problems & Solutions

### 1. Storing JWTs in `localStorage`
*   **The Problem**: `localStorage` is accessible to any JavaScript on your page. If an attacker injects a script (XSS), they can steal the user's token instantly.
*   **The Solution**: Use **`HttpOnly` cookies**. These are inaccessible to client-side scripts and are automatically sent by the browser.
*   **Code Fix**: Set the cookie header with `HttpOnly; Secure; SameSite=Strict`.

### 2. Weak or Default Secrets
*   **The Problem**: AI often uses `your_jwt_secret_here` or `secret` as placeholders. These are in every hacker's wordlist.
*   **The Solution**: Generate a cryptographically strong secret.
*   **Command**: `openssl rand -base64 32`
*   **Fix**: Store this in a `.env` file (never commit it to Git) and use it to sign your tokens.

### 3. Missing Refresh Token Rotation
*   **The Problem**: If a refresh token is stolen, the attacker has permanent access.
*   **The Solution**: Implement **Refresh Token Rotation**. Every time a refresh token is used to get a new access token, issue a *new* refresh token and invalidate the old one.
*   **Benefit**: If an old token is reused, it signals a breach, and you can kill all sessions for that user.

### 4. Brute-Force Vulnerability (No Account Lockout)
*   **The Problem**: AI-generated login endpoints often allow infinite attempts.
*   **The Solution**: Implement **Rate Limiting** and **Account Lockout**.
*   **Fix**: After 5-10 failed attempts, lock the account for 15 minutes or require a CAPTCHA.

### 5. Inconsistent Auth Middleware
*   **The Problem**: Protecting the `/dashboard` but forgetting the `/api/user/settings` endpoint.
*   **The Solution**: Use a **"Secure by Default"** approach. Apply auth middleware at the top level or use a framework that requires explicit "public" flags for routes.

### 6. Information Leakage in Error Messages
*   **The Problem**: "User not found" vs "Incorrect password" tells attackers exactly which emails have accounts (Account Enumeration).
*   **The Solution**: Use generic messages: "Invalid email or password."

### 7. Client-Side Role Checks
*   **The Problem**: Hiding the "Admin" button in the UI but not checking permissions on the API.
*   **The Solution**: **Always validate permissions on the server**. The frontend is for UX; the backend is for security.

### 8. No Email Verification
*   **The Problem**: Anyone can sign up with any email, leading to spam and account takeovers.
*   **The Solution**: Require email verification before allowing any sensitive actions.

### 9. Incomplete Logout
*   **The Problem**: Clearing the cookie on the client but leaving the session active on the server.
*   **The Solution**: **Invalidate the session in the database** or add the JWT to a blocklist upon logout.

### 10. Database-Level Security (RLS)
*   **The Problem**: Especially in Supabase/Firebase, missing Row Level Security (RLS) means anyone with your public API key can read *all* users' data.
*   **The Solution**: Enable RLS and write policies that restrict access to `auth.uid() = user_id`.

---

## Part 2: The Master Prompt for 100% Secure Auth

Copy and paste this prompt into your AI tool (Cursor, Replit, Lovable, etc.) to ensure your auth is built correctly from the start:

> "I want to implement a 100% secure authentication system for my [Framework, e.g., Next.js] app. Please follow these strict security requirements:
> 1. Use HttpOnly, Secure, and SameSite=Strict cookies for session management (no localStorage for JWTs).
> 2. Implement Refresh Token Rotation and secure session invalidation on the server during logout.
> 3. Use Argon2 or bcrypt for password hashing with a high cost factor.
> 4. Ensure all API routes are protected by default with middleware; only explicitly marked public routes should be accessible.
> 5. Implement rate limiting on all auth endpoints (login, signup, reset) and account lockout after 5 failed attempts.
> 6. Use generic error messages for auth failures to prevent account enumeration.
> 7. Add server-side validation for all inputs using a schema library like Zod.
> 8. If using a BaaS like Supabase, write strict Row Level Security (RLS) policies for every table.
> 9. Integrate Google OAuth 2.0 using [Library, e.g., Auth.js] with exact redirect URI matching and state/PKCE protection.
> 10. Ensure no secrets or API keys are hardcoded; use environment variables for everything."

---

## Part 3: Adding Google Auth (The Secure Way)

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and go to **APIs & Services > OAuth consent screen**.
3. Set it to "External" and fill in the app details.
4. Go to **Credentials > Create Credentials > OAuth client ID**.
5. Select "Web application".
6. **Crucial**: Add your `Authorized redirect URIs`.
   *   For NextAuth: `https://yourdomain.com/api/auth/callback/google`
   *   For Supabase: `https://[your-project-ref].supabase.co/auth/v1/callback`

### Step 2: Implementation (Example: Next.js + Auth.js)
```typescript
// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session for server-side checks
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // Ensure cookies are secure
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  }
})
```

### Step 3: Security Hardening
1. **Verify ID Tokens**: If you pass tokens to a separate backend, always verify them using Google's public keys.
2. **Restrict Domains**: If your app is for a specific organization, restrict sign-in to that domain in the code.
3. **Cross-Site Request Forgery (CSRF)**: Ensure your auth library handles the `state` parameter automatically (Auth.js and Supabase do this).

---

## Final Security Checklist
- [ ] Are all secrets in `.env` and NOT in Git?
- [ ] Is `HttpOnly` enabled for all auth cookies?
- [ ] Is Rate Limiting active on `/login`?
- [ ] Do your database tables have RLS policies?
- [ ] Did you test your app for "Open Redirect" vulnerabilities?

---

## Part 4: Ready-to-Use Secure Code Templates

### 1. Next.js (Auth.js / NextAuth) - Secure Session Config
```typescript
// pages/api/auth/[...nextauth].ts or auth.ts
import NextAuth from "next-auth"

export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true // MUST be true in production
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role; // Securely pass roles
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    }
  }
})
```

### 2. Supabase - The "Bulletproof" RLS Policy
Run this in your Supabase SQL Editor to secure a `profiles` table:
```sql
-- 1. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Create Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Create Policy: Service Role (Admin) has full access
CREATE POLICY "Service role full access" 
ON profiles TO service_role 
USING (true) 
WITH CHECK (true);
```

### 3. Express.js - Secure Middleware & Rate Limiting
```javascript
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// 1. Basic Security Headers
app.use(helmet());

// 2. Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/login", authLimiter, (req, res) => {
  // Your secure login logic here
});

// 3. Secure Cookie Config
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true, // Requires HTTPS
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
}));
```

---

## Summary of Best Practices
| Feature | Vibe-Coded Default (Unsafe) | Professional Solution (Secure) |
| :--- | :--- | :--- |
| **Token Storage** | `localStorage` | `HttpOnly` Cookies |
| **Passwords** | `MD5` / `SHA1` | `Argon2` / `bcrypt` |
| **API Access** | Public by default | Protected by Middleware |
| **Database** | No RLS / Client-side filtering | Row Level Security (RLS) |
| **Errors** | Detailed ("User not found") | Generic ("Invalid credentials") |
| **Secrets** | Hardcoded in code | Environment Variables (`.env`) |
