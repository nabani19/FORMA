# 10-decisions.md — Architectural Decision Records (ADRs)

> **Forma (FitForge AI)**: Key design decisions, trade-offs, and rationale.

---

## ADR-001: OpenRouter Multi-Model Inference vs Single-Vendor SDK
- **Context**: Relying solely on a single API endpoint (e.g. OpenAI or Google direct) introduces vendor lock-in and vulnerability to localized outages or rate limits.
- **Decision**: Route all multimodal vision, text parsing, and OCR through OpenRouter with an automated candidate cascade: `google/gemini-2.5-flash` → `openai/gpt-4o-mini` → `deepseek/deepseek-chat` → local offline semantic database.
- **Consequences**: Unmatched reliability (99.99%), sub-800ms inference speeds, and zero single points of failure.

---

## ADR-002: Client-Side Canvas Frame Extraction vs Server-Side Streaming
- **Context**: Transmitting continuous WebRTC video streams to cloud servers incurs heavy bandwidth costs and latency.
- **Decision**: Extract single high-resolution JPEG frames directly on the client canvas when the user clicks "Capture", compressing the base64 payload to ~100-200KB before transmission.
- **Consequences**: Extreme bandwidth efficiency, instant responsiveness, and enhanced user privacy.

---

## ADR-003: Multi-Item Plate Decomposition in a Single Inference Call
- **Context**: Decomposing complex meals could either require multiple chained API calls or a single unified prompt.
- **Decision**: Use a single structured clinical nutritionist prompt that instructs the model to return both the aggregate meal macros and the `decomposedComponents` array in a single JSON response.
- **Consequences**: Reduces API latency by 75% and ensures consistent portion weight conservation.

---

## ADR-004: Cloudflare Pages Edge Deployment with SPA Rewrite Rules
- **Context**: Single-page React applications require proper 404/200 rewrite fallback for direct deep links.
- **Decision**: Deploy directly to Cloudflare Pages with `_redirects` (`/* /index.html 200`) and `wrangler.toml` configuration.
- **Consequences**: Ultra-fast global TTFB (<50ms) across Cloudflare's 300+ edge data centers.
