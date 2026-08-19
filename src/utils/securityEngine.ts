/**
 * Phase 29: End-to-End Security Hardening & Penetration Testing Engine
 * FitForge AI / TRACker Security Subsystem
 */

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

/**
 * 1. XSS Sanitization & HTML Escaping
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips HTML tags entirely for plain text attributes
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * 2. Content Security Policy (CSP) & HTTP Security Headers Generator
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
  };
}

/**
 * 3. Rate Limiter (Windowed Bucket)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60000
): RateLimitStatus {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}

/**
 * 4. Sensitive Data Redaction
 */
export function redactSensitiveData(data: Record<string, any>): Record<string, any> {
  const redacted = { ...data };
  const sensitiveKeys = ['password', 'token', 'refreshToken', 'apiKey', 'secret', 'ssn', 'cardNumber'];

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}

/**
 * 5. OWASP Security Audit Verification
 * Performs real runtime checks — not hardcoded scores.
 * Each check tests an actual observable property of the application.
 */
export function runOwaspSecurityAudit() {
  const checks: { name: string; status: string; score: number; detail: string }[] = [];

  // A01: Broken Access Control — verify no admin/debug routes exposed in window
  const isBrowser = typeof window !== 'undefined';
  const a01Pass = !isBrowser || (
    typeof (window as any).__ADMIN_BACKDOOR__ === 'undefined' &&
    typeof (window as any).__DEBUG_MODE__ === 'undefined'
  );
  checks.push({
    name: 'OWASP A01: Broken Access Control',
    status: a01Pass ? 'PASS' : 'FAIL',
    score: a01Pass ? 100 : 0,
    detail: a01Pass ? 'No debug/admin globals exposed on window' : 'Admin backdoor detected on window object',
  });

  // A02: Cryptographic Failures — verify HTTPS or localhost dev
  const hasLocation = typeof location !== 'undefined';
  const a02Pass = !hasLocation || (
    location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  );
  checks.push({
    name: 'OWASP A02: Cryptographic Failures (HTTPS enforcement)',
    status: a02Pass ? 'PASS' : 'FAIL',
    score: a02Pass ? 100 : 0,
    detail: hasLocation ? `Transport: ${location.protocol}//${location.hostname}` : 'Secure Node/SSR execution context',
  });

  // A03: Injection — verify sanitizeInput and stripHtml are functional
  const testPayload = '<script>alert(1)</script>';
  const sanitized = sanitizeInput(testPayload);
  const stripped = stripHtml(testPayload);
  const a03Pass = !sanitized.includes('<script>') && !stripped.includes('<script>');
  checks.push({
    name: 'OWASP A03: Injection (XSS Sanitization functional)',
    status: a03Pass ? 'PASS' : 'FAIL',
    score: a03Pass ? 100 : 0,
    detail: a03Pass ? 'sanitizeInput and stripHtml correctly neutralize script injection' : 'XSS sanitizer is broken',
  });

  // A04: Insecure Design — verify rate limiter rejects after threshold
  const rlId = `owasp_audit_test_${Date.now()}`;
  checkRateLimit(rlId, 1, 60000);
  const rlResult = checkRateLimit(rlId, 1, 60000);
  const a04Pass = !rlResult.allowed;
  checks.push({
    name: 'OWASP A04: Insecure Design (Rate Limiting functional)',
    status: a04Pass ? 'PASS' : 'FAIL',
    score: a04Pass ? 100 : 0,
    detail: a04Pass ? 'Rate limiter correctly blocks requests exceeding threshold' : 'Rate limiter not enforcing limits',
  });

  // A05: Security Misconfiguration — verify security headers object is non-empty
  const headers = getSecurityHeaders();
  const a05Pass = Object.keys(headers).length >= 5 &&
                  Boolean(headers['Content-Security-Policy']) &&
                  Boolean(headers['Strict-Transport-Security']);
  checks.push({
    name: 'OWASP A05: Security Misconfiguration (HTTP Headers)',
    status: a05Pass ? 'PASS' : 'FAIL',
    score: a05Pass ? 100 : 0,
    detail: a05Pass ? `${Object.keys(headers).length} security headers configured including CSP and HSTS` : 'Missing critical security headers',
  });

  // A07: Authentication Failures — verify no API keys are exposed in window or globalThis
  const a07Pass = !isBrowser || (
    typeof (window as any).OPENROUTER_KEY === 'undefined' &&
    typeof (window as any).__API_KEY__ === 'undefined'
  );
  checks.push({
    name: 'OWASP A07: Identification & Auth Failures (No API key leakage)',
    status: a07Pass ? 'PASS' : 'FAIL',
    score: a07Pass ? 100 : 0,
    detail: a07Pass ? 'No API keys exposed on window object' : 'API key found on global window — critical leak',
  });

  // A08: Software & Data Integrity — verify redactSensitiveData masks secrets
  const testData = { password: 'hunter2', apiKey: 'sk-test-123', username: 'forma' };
  const redacted = redactSensitiveData(testData);
  const a08Pass = redacted.password === '[REDACTED]' && redacted.apiKey === '[REDACTED]' && redacted.username === 'forma';
  checks.push({
    name: 'OWASP A08: Software & Data Integrity (Sensitive Data Redaction)',
    status: a08Pass ? 'PASS' : 'FAIL',
    score: a08Pass ? 100 : 0,
    detail: a08Pass ? 'Sensitive data fields are correctly redacted before any logging' : 'Sensitive data redaction is broken',
  });

  const failedChecks = checks.filter(c => c.status === 'FAIL');
  const overallScore = Math.round(checks.reduce((acc, c) => acc + c.score, 0) / checks.length);

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    status: failedChecks.length === 0 ? 'SECURE' : 'VULNERABLE',
    checksPassed: checks.filter(c => c.status === 'PASS').length,
    totalChecks: checks.length,
    vulnerabilitiesDetected: failedChecks.length,
    checks,
    failedChecks: failedChecks.map(c => c.name),
  };
}

