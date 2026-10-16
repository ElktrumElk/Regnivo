# Regnivo — Product Scope & Technical Specification

**Document version:** 1.0  
**Status:** Proposed / ready for implementation planning  
**Frontend:** React + TypeScript (Vite)  
**Backend:** Go (REST API, background scheduler and workers)  
**Primary database:** PostgreSQL  
**Optional infrastructure:** Redis for distributed job coordination and rate limiting

> **Working name:** Regnivo. Final product name and domain availability require verification.

## 1. Executive Summary

Regnivo is a hosted uptime and HTTP monitoring platform that periodically sends lightweight requests to user-configured server endpoints. Its primary use case is reducing cold starts on services that suspend after inactivity, where this behavior is permitted by the hosting provider. It also provides a reliable monitoring dashboard with historical request metrics, response logs, performance graphs, and manual testing.

**Core promise:** Users configure an endpoint once, and Regnivo runs scheduled checks on its own backend—even when the user's browser is closed or their device is offline.

**Important limitation:** Scheduled requests cannot guarantee that a third-party provider will keep an instance awake. Providers may enforce sleep policies, minimum intervals, quotas, or prohibit artificial traffic. The product must disclose this and respect provider terms.

## 2. Goals and Success Criteria

- Let a registered user create and manage multiple projects and monitored endpoints.
- Support configurable intervals with safe minimums, limits and clear next-run timestamps.
- Execute scheduled requests independently of frontend/browser sessions.
- Capture status code, latency, bytes transferred, timestamps, and error details.
- Provide manual HTTP tests and near-real-time feedback.
- Present clear analytics, graphs, logs, and project health summaries.
- Protect credentials, user data, and the platform from misuse.

**MVP acceptance targets:** Scheduled jobs continue after browser closure; worker restarts do not permanently lose schedules; every attempt has a persisted outcome; authorized users can see only their projects; dashboard figures match stored request history.

## 3. Target Users and Use Cases

- **Independent developers:** monitor demo APIs and free-tier backends.
- **Small teams:** track health and responsiveness of development/staging endpoints.
- **Portfolio owners:** maintain visibility into deployed projects and cold starts.

Typical flow: Sign up → verify account → create project → add endpoint URL → select method and interval → run manual test → activate monitoring → review dashboard and logs.

## 4. Functional Scope

### 4.1 Authentication and Account Management

- Sign up with name, email, and password; email verification.
- Login, logout, persistent secure session, password reset, and change password.
- Account profile and security settings.
- Protected routes and per-user authorization on every backend resource.
- Optional future enhancements: OAuth sign-in, MFA, team organizations.

### 4.2 Project Management

A **project** groups one or more endpoints and their monitoring data.

- Create, rename, describe, archive, and delete projects.
- Project listing with search, sorting, status, endpoint count, and last activity.
- Select a project to open its dedicated dashboard, endpoint list, and logs.
- Project creation generates a unique internal project ID; it does **not** deploy a server.
- Explicit confirmation and retention rules for destructive actions.

### 4.3 Add / Deploy Monitoring Page

A dedicated **Add Endpoint** page lets users register an already-deployed server URL. “Deploy” means deploying a monitoring configuration, not provisioning third-party hosting.

Fields:

| Field | Behavior |
|---|---|
| Project | Select existing project or create a new one |
| Endpoint name | Human-readable label |
| Target URL | HTTPS URL; HTTP only if explicitly permitted by policy |
| Request method | GET or HEAD for MVP |
| Interval | User-configurable from allowed presets and validated custom duration |
| Timeout | Configurable within platform limits |
| Expected status | Default 2xx; optional custom accepted codes |
| Monitoring state | Active or paused |
| Optional headers | Allowlisted, encrypted at rest, never exposed in logs |

- Validate URL and target network before saving and again before each request.
- Preview schedule, estimated daily request count, and approximate bandwidth implications.
- Test endpoint before activation; show clear success/error feedback.
- Generate a unique monitor ID and configuration summary.
- Pause, resume, edit, and remove monitors without affecting other project endpoints.
- Do not claim to generate or host a new external server URL; URL generation is limited to internal monitor identifiers and share links if enabled later.

### 4.4 Automatic Background Requests

- Go-based scheduler dispatches due monitoring jobs to backend workers.
- Execution is server-side, independent of React, open tabs, service workers, or the user's device.
- Record every attempted check with start/end timestamps, status, outcome, latency, and bytes transferred.
- Respect request timeout, bounded concurrency, rate limits, and account quotas.
- Use durable schedules and leases to prevent overlapping or duplicate execution where possible.
- Define missed-run behavior: do not flood endpoints with backlog after downtime; resume at the next eligible interval.
- Implement retry/backoff only for internal transient failures, with strict caps; distinguish retries from scheduled checks.
- Support worker restarts and multi-instance deployment with idempotent execution records.
- Provide last-run, next-run, and schedule state in the UI.
- Minimum interval is a configurable platform policy (suggested MVP default: 5 minutes), not unrestricted seconds.

### 4.5 Manual HTTP Test

- **Test Now** button on each endpoint and project dashboard.
- Display response status, response time, request outcome, timestamp, and safe error details.
- Manual tests count separately from scheduled tests, with an optional combined total.
- Apply authorization, SSRF protection, timeouts, and per-user throttling.
- No arbitrary request bodies or unsafe methods in MVP.

### 4.6 Dashboard and Analytics

**Global dashboard:** total projects, active monitors, requests in selected period, successful/failed checks, average and p95 response time, total bytes transferred, and recent activity.

**Project dashboard:** scoped totals, endpoint health, status distribution, monitoring frequency, and latest events.

**Endpoint dashboard:**

- Total HTTP requests, split by scheduled and manual.
- Success rate, HTTP status distribution (2xx/3xx/4xx/5xx), network/timeout errors.
- Average, median and p95 response time (milliseconds).
- Total bandwidth measured as observed request/response bytes, with methodology disclosed; not a hosting-provider billing metric.
- Last response, last checked, next scheduled check, current monitor state.
- Time range filters: 24 hours, 7 days, 30 days, custom (subject to retention).

**Graphs:**

1. Requests over time — line/area chart.
2. Response time over time — line chart with average/p95 options.
3. Success vs failure — stacked bar or donut chart.
4. Bandwidth usage over time — bar/area chart.
5. HTTP status codes by time — stacked bars.

Charts must support loading, empty, and error states; units and time zones must be explicit. Live updates may use polling initially, with SSE/WebSocket later.

### 4.7 Request Logs

Each log record includes:

- Request ID, project/monitor ID, UTC timestamp, source (`scheduled` or `manual`).
- HTTP method, safe URL display, status code if received, success/failure category.
- DNS/connect/TLS errors where available, timeout indicator, elapsed time in ms.
- Observed bytes sent/received and optionally limited response metadata.
- Safe, truncated diagnostic message; no secrets or raw response bodies by default.

Features: chronological table, pagination, filtering by time/status/source, search by request ID, details drawer, and CSV export (post-MVP optional). Retention limits and deletion rules are displayed to users.

### 4.8 Settings and Notifications

**MVP:** account settings, time zone display, default interval, retention visibility, pause-all monitoring, and logout.  
**Phase 2:** email/webhook alerts for repeated failures, recovery notifications, threshold settings, notification history, and team access.

## 5. Information Architecture and Routes

| Route | Page | Access |
|---|---|---|
| `/` | Public landing page, benefits, limitations, CTA | Public |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/verify-email` | Verify email | Public/token |
| `/forgot-password` | Request password reset | Public |
| `/reset-password` | Complete reset | Public/token |
| `/app` | Global overview dashboard | Authenticated |
| `/app/projects` | Project directory | Authenticated |
| `/app/projects/new` | Create project | Authenticated |
| `/app/projects/:projectId` | Project dashboard | Authorized owner |
| `/app/projects/:projectId/endpoints/new` | Add/deploy monitor | Authorized owner |
| `/app/projects/:projectId/endpoints/:monitorId` | Endpoint metrics and logs | Authorized owner |
| `/app/activity` | Cross-project activity/logs | Authenticated |
| `/app/settings` | Account and monitoring preferences | Authenticated |

Navigation: **Overview · Projects · Add Monitor · Activity · Settings**. A project context switcher should make moving between projects easy.

## 6. User Experience and Visual Direction

- Professional SaaS interface: clear typography, generous spacing, restrained accent colors, responsive cards and accessible contrast.
- Desktop: sidebar, header with project switcher and account menu, KPI cards, chart grid, logs table.
- Mobile: collapsible navigation, vertically stacked charts, responsive tables, easy-to-tap controls.
- Meaningful statuses: Healthy, Failing, Paused, Pending, and Unknown; do not infer uptime from a single successful request.
- Skeleton loading, friendly empty states, inline validation, confirmation dialogs, toasts, and retry actions.
- Keyboard-accessible controls, chart text alternatives, WCAG 2.2 AA-oriented design.

## 7. Technical Architecture

```text
React + TypeScript (Vite)
        │ HTTPS
        ▼
Go API ────────────── PostgreSQL
  │                       ▲
  ├─ Auth / Projects       │
  ├─ Monitors / Analytics  │
  └─ Scheduler ── Queue/Leases ── Go Workers
                                  │
                                  ▼
                         Validated external HTTPS endpoints
                                  │
                                  ▼
                         Results and metrics persistence
```

**Frontend:** React, TypeScript, Vite, React Router, TanStack Query, charting library (e.g. Recharts), accessible component primitives.  
**Backend:** Go `net/http` or a lightweight router (e.g. chi), structured logging, request validation, API middleware, graceful shutdown.  
**Storage:** PostgreSQL for users, projects, monitors, check results, sessions/tokens and aggregates.  
**Scheduling:** database-backed due-job claiming and leases for MVP; Redis/queue optional for scale.  
**Deployment:** frontend on static hosting; Go API and scheduler/workers on an **always-running service**. A backend subject to sleep cannot reliably run scheduled checks.

## 8. Suggested Data Model

| Entity | Important fields |
|---|---|
| `users` | id, name, email (unique), password_hash, verified_at, created_at |
| `sessions` | id, user_id, token_hash, expires_at, revoked_at |
| `projects` | id, owner_id, name, description, archived_at, created_at |
| `monitors` | id, project_id, name, url, method, interval_seconds, timeout_ms, expected_status, enabled, last_run_at, next_run_at, created_at |
| `check_results` | id, monitor_id, trigger_type, started_at, completed_at, status_code, outcome, duration_ms, bytes_sent, bytes_received, error_code, message |
| `monitor_leases` | monitor_id, lease_owner, lease_until, execution_key |
| `daily_metrics` (optional) | monitor_id, date, check_count, success_count, failure_count, bytes_total, latency aggregates |

Use UUIDs, indexed foreign keys, UTC timestamps, cascade/restrict rules as appropriate, and migrations. Add indexes for `monitors(next_run_at, enabled)` and `check_results(monitor_id, started_at DESC)`.

## 9. Proposed REST API (v1)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Start session |
| POST | `/api/v1/auth/logout` | Revoke session |
| POST | `/api/v1/auth/refresh` | Renew session if token-based |
| POST | `/api/v1/auth/forgot-password` | Start password reset |
| POST | `/api/v1/auth/reset-password` | Complete password reset |
| GET | `/api/v1/me` | Current account |
| GET, POST | `/api/v1/projects` | List/create projects |
| GET, PATCH, DELETE | `/api/v1/projects/:id` | Read/edit/delete project |
| GET, POST | `/api/v1/projects/:id/monitors` | List/create monitors |
| GET, PATCH, DELETE | `/api/v1/monitors/:id` | Read/edit/delete monitor |
| POST | `/api/v1/monitors/:id/test` | Run manual test |
| POST | `/api/v1/monitors/:id/pause` | Pause monitor |
| POST | `/api/v1/monitors/:id/resume` | Resume monitor |
| GET | `/api/v1/monitors/:id/results` | Paginated logs |
| GET | `/api/v1/monitors/:id/metrics` | Time-series metrics |
| GET | `/api/v1/projects/:id/metrics` | Project metrics |
| GET | `/api/v1/dashboard` | Account overview |

Responses should use consistent JSON error codes, validation errors, pagination metadata, and ISO 8601 UTC timestamps. Authorization must be enforced in Go, not just hidden in React.

## 10. Security, Safety and Abuse Prevention

Because the platform sends HTTP requests to user-supplied URLs, **server-side request forgery (SSRF) prevention is mandatory**:

- Allow only approved schemes (prefer HTTPS); deny loopback, private, link-local, multicast, metadata-service, and reserved IP ranges, including IPv6.
- Resolve and validate all DNS answers before connecting; pin validated IPs for the connection and revalidate redirects (or disable redirects in MVP) to prevent DNS rebinding.
- Restrict destination ports, limit redirects, response sizes, total bytes, timeout, and concurrent connections.
- Block credential-bearing URLs; redact query strings, tokens, headers, and other secrets from logs.
- Never expose a general-purpose open proxy or arbitrary traffic generator.
- Apply account/target-level rate limits, quotas, abuse detection, and acceptable-use policy.
- Use Argon2id/bcrypt password hashes, secure HttpOnly SameSite cookies (or equivalent token hygiene), CSRF protections where relevant, TLS, CORS allowlists, and email verification.
- Encrypt stored sensitive headers, use least-privilege database credentials, and audit sensitive account operations.
- Provide deletion and data retention policies; avoid storing full HTTP response bodies by default.

## 11. Reliability and Observability

- Scheduler must survive application restarts and support graceful worker shutdown.
- Use transaction-safe job claiming; protect against concurrent execution of the same monitor.
- Record monitoring attempts separately from scheduler/system errors.
- Define expected scheduling drift and display actual execution timestamps.
- Provide API health/readiness checks, worker heartbeat, metrics, structured logs, error tracking, and backups.
- Monitoring availability is not guaranteed to be 100%; display any monitoring gaps instead of presenting them as target outages.

## 12. Performance, Limits and Retention

Proposed initial policy (adjust after capacity testing):

- Minimum interval: **5 minutes** per endpoint.
- Default interval: **10 minutes**.
- Timeout: **10 seconds**, configurable within approved bounds.
- Limit concurrent jobs per account and globally.
- Raw check-result retention: **30 days** for MVP; aggregated daily metrics may be kept longer.
- Pagination on all log views; downsample high-volume chart series.
- Set free-tier project/monitor quotas before public launch based on measured operating costs.

**Capacity example:** One endpoint checked every 5 minutes generates up to 288 scheduled requests/day, or about 8,640 in a 30-day period (excluding manual checks and skipped runs). This is a planning estimate, not a guaranteed delivery count.

## 13. Implementation Phases

### Phase 1 — Foundation
- Repository setup, React app shell, Go API, PostgreSQL schema/migrations.
- Authentication, sessions, route guards, validation, baseline security.
- Project CRUD and protected project directory.

### Phase 2 — Monitoring MVP
- Monitor CRUD, URL safety validation, configurable intervals.
- Persistent Go scheduler/worker, result storage, manual test.
- Pause/resume, schedule visibility, status and error classification.

### Phase 3 — Analytics and Polish
- Overview/project/endpoint dashboards, KPI calculations and graphs.
- Request logs, filters, pagination, responsive UI, empty/error states.
- Worker observability, deployment configuration, integration and load testing.

### Phase 4 — Post-MVP
- Alerts, CSV export, OAuth/MFA, organization roles, public status pages.
- Advanced scheduling, retention tiers, usage billing, API keys, integrations.

## 14. Acceptance Criteria / Definition of Done

1. A new user can register, verify email, log in, log out, and reset a password.
2. Users cannot access another account's projects, monitors, results, or metrics.
3. A user can create a project and add a valid public HTTPS endpoint.
4. A configured monitor executes at its permitted interval while the browser is closed.
5. Scheduler/worker restarts recover schedules without uncontrolled duplicate bursts.
6. Manual tests return accurate outcomes and are labeled separately in logs.
7. Every attempt records time, status/error, latency, and measured bytes where available.
8. Dashboards and graphs agree with stored results for the selected time range.
9. A user can pause/resume/delete monitors and see their current state.
10. SSRF, DNS rebinding, redirects, restricted addresses, quotas, and secrets handling pass security tests.
11. UI works on desktop/mobile, supports loading/empty/error states, and remains keyboard usable.
12. Production includes HTTPS, environment-based secrets, migrations, backups, logs, and monitoring.

## 15. Out of Scope for MVP

- Provisioning/deploying third-party application servers.
- Guaranteeing prevention of sleep or cold starts on every hosting provider.
- Browser-only scheduling or device-based background pings.
- Arbitrary HTTP methods, request bodies, scripted workflows, or load testing.
- Multi-region checks, synthetic browser tests, SLA guarantees, and complex alert escalation.

## 16. Open Product Decisions

- Confirm brand name, domain, and visual identity.
- Choose whether endpoints are single-user or shareable within teams.
- Finalize account quotas, allowed intervals, target rate limits, and retention by plan.
- Decide whether to permit HTTP for development endpoints (public HTTPS is safer by default).
- Confirm hosting-provider compliance and acceptable-use language.
- Select deployment provider with **always-on Go workers** and budget for persistent compute.

---

**Deliverable:** A secure, professional React + Go monitoring SaaS with independent background scheduling, project organization, manual testing, actionable HTTP logs, and meaningful analytics—without misleading guarantees about third-party server uptime.
