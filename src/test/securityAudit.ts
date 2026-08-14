import assert from 'assert';
import {
  sanitizeInput,
  stripHtml,
  getSecurityHeaders,
  checkRateLimit,
  redactSensitiveData,
  runOwaspSecurityAudit,
} from '../utils/securityEngine';

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✕ FAILED: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

console.log('\n🔒 Starting Phase 29: OWASP Security Hardening & Penetration Audit Suite...\n');

runTest('XSS Sanitizer correctly escapes malicious script tags and HTML injection', () => {
  const malformedInput = '<script>alert("xss")</script>';
  const sanitized = sanitizeInput(malformedInput);
  assert.strictEqual(sanitized, '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  assert.ok(!sanitized.includes('<script>'));

  const stripped = stripHtml(malformedInput);
  assert.strictEqual(stripped, 'alert("xss")');
});

runTest('Security Headers Generator emits compliant OWASP CSP and STS security headers', () => {
  const headers = getSecurityHeaders();
  assert.ok(headers['Content-Security-Policy'].includes("default-src 'self'"));
  assert.ok(headers['Strict-Transport-Security'].includes('max-age=31536000'));
  assert.strictEqual(headers['X-Frame-Options'], 'DENY');
  assert.strictEqual(headers['X-Content-Type-Options'], 'nosniff');
});

runTest('Rate Limiter correctly permits allowed requests and blocks burst rate limits', () => {
  const clientIp = '192.168.1.100';

  // Request 1 to 3 allowed with max 3
  let res = checkRateLimit(clientIp, 3, 5000);
  assert.strictEqual(res.allowed, true);
  assert.strictEqual(res.remaining, 2);

  res = checkRateLimit(clientIp, 3, 5000);
  assert.strictEqual(res.allowed, true);
  assert.strictEqual(res.remaining, 1);

  res = checkRateLimit(clientIp, 3, 5000);
  assert.strictEqual(res.allowed, true);
  assert.strictEqual(res.remaining, 0);

  // 4th request exceeds rate limit
  res = checkRateLimit(clientIp, 3, 5000);
  assert.strictEqual(res.allowed, false);
  assert.strictEqual(res.remaining, 0);
});

runTest('Sensitive Data Redactor masks API keys, secrets, and auth tokens', () => {
  const payload = {
    username: 'john_doe',
    password: 'SuperSecretPassword123!',
    apiKey: 'sk_live_99213812893',
    profile: {
      bio: 'Fitness enthusiast',
      refreshToken: 'rt_88192381',
    },
  };

  const sanitized = redactSensitiveData(payload);
  assert.strictEqual(sanitized.username, 'john_doe');
  assert.strictEqual(sanitized.password, '[REDACTED]');
  assert.strictEqual(sanitized.apiKey, '[REDACTED]');
  assert.strictEqual(sanitized.profile.refreshToken, '[REDACTED]');
  assert.strictEqual(sanitized.profile.bio, 'Fitness enthusiast');
});

runTest('OWASP Audit verification yields 100% security rating and zero vulnerabilities', () => {
  const audit = runOwaspSecurityAudit();
  assert.strictEqual(audit.overallScore, 100);
  assert.strictEqual(audit.status, 'SECURE');
  assert.strictEqual(audit.vulnerabilitiesDetected, 0);
});

console.log(`\n==================================================`);
console.log(`SECURITY AUDIT RESULTS: ${passed} Passed | ${failed} Failed`);
console.log(`==================================================\n`);

if (failed > 0) {
  process.exit(1);
}
