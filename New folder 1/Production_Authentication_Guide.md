# Production Authentication Guide

## Overview

This guide covers secure authentication architecture for AI-generated
("vibe-coded") apps.

## Recommended Stack

-   Authentication: Better Auth or Auth.js
-   Database: PostgreSQL
-   ORM: Prisma
-   Password hashing: Argon2id
-   Sessions: Secure HttpOnly cookies
-   OAuth: Google OAuth 2.0 (+ GitHub optional)
-   Validation: Zod
-   Rate limiting: Upstash Redis
-   CAPTCHA: Cloudflare Turnstile
-   HTTPS everywhere

## Core Security Rules

1.  Never trust the client.
2.  Store sessions in Secure, HttpOnly cookies.
3.  Never store JWTs in localStorage.
4.  Verify authentication and authorization on the server.
5.  Require email verification.
6.  Use Argon2id for passwords.
7.  Rotate refresh tokens or sessions.
8.  Protect POST/PUT/PATCH/DELETE with CSRF.
9.  Apply middleware to protected routes.
10. Enforce RBAC and resource ownership.

## Google Authentication

-   Google OAuth 2.0
-   Secure account linking
-   Prevent duplicate users
-   Store minimal profile data
-   Handle revoked tokens
-   Require verified email

## Common Problems and Fixes

  Problem                     Fix
  --------------------------- ------------------------------------------
  Redirect loop               Validate callback URLs and cookie domain
  Random logout               Fix cookie settings and session expiry
  Duplicate Google accounts   Link by verified email
  Unauthorized API access     Server-side auth middleware
  Token theft                 HttpOnly cookies, HTTPS
  Brute force                 Rate limiting + temporary lockout
  CSRF                        CSRF tokens + SameSite cookies
  XSS                         Escape output, CSP

## Security Checklist

-   Secure + HttpOnly + SameSite cookies
-   HTTPS
-   Email verification
-   Password reset with expiring single-use tokens
-   Session/device management
-   Audit logs
-   MFA ready
-   Rate limiting
-   CSRF protection
-   SQL injection prevention
-   XSS protection
-   Environment variables only
-   Generic auth error messages

## Folder Structure

``` text
src/
  auth/
  api/auth/
  lib/
  middleware.ts
  prisma/
```

## Master Prompt

``` text
You are a Principal Security Engineer and Senior Full-Stack Authentication Architect.

Design, debug, and maintain a production-ready authentication system.

Requirements:
- Better Auth/Auth.js
- PostgreSQL + Prisma
- Argon2id
- Google OAuth 2.0
- Email verification
- Secure password reset
- Session authentication with Secure, HttpOnly cookies
- RBAC
- CSRF
- Rate limiting
- Audit logging
- HTTPS
- Environment variables only

Rules:
- Never trust the client.
- Never store JWTs in localStorage.
- Never bypass authentication.
- Never hardcode secrets.
- Validate all inputs.
- Test attack vectors and regressions.
- Follow OWASP ASVS and OWASP Top 10.
```
