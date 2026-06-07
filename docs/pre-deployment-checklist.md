# Pre-Deployment Checklist

Use this checklist before every production release.

## Environment Variables

- [ ] All API keys secured (not in code)
  - [ ] No secrets in source files (client/server)
  - [ ] No secrets committed to git history
  - [ ] Public keys use `NEXT_PUBLIC_*`; secret keys do not
- [ ] Database connection strings configured
  - [ ] Frontend `NEXT_PUBLIC_API_URL` points to production API
  - [ ] Backend `MONGODB_URI` points to production/managed cluster
  - [ ] TLS and network access policies verified
- [ ] Third-party service credentials configured
  - [ ] Analytics: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - [ ] Behavior analytics: `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `NEXT_PUBLIC_HOTJAR_ID`, `NEXT_PUBLIC_HOTJAR_VERSION`
  - [ ] Error monitoring: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
  - [ ] Payments/SMS/Auth provider keys set in runtime environment
- [ ] Feature flags configuration
  - [ ] Production defaults reviewed
  - [ ] Kill switches verified for risky features
  - [ ] Staging and production flag values documented

## Security & Compliance

- [ ] Consent flow blocks non-essential analytics until accepted
- [ ] CORS, rate limiting, and security headers validated
- [ ] No PII/secrets in logs or analytics payloads
- [ ] Sentry source maps/release mapping verified

## Performance

- [ ] Lighthouse score > 90 in all categories
  - [ ] Performance >= 90
  - [ ] Accessibility >= 90
  - [ ] Best Practices >= 90
  - [ ] SEO >= 90
- [ ] Bundle size reviewed
  - [ ] Compare with previous release baseline
  - [ ] No unexpected large chunk increases
  - [ ] Remove/replace heavy dependencies where needed

## Functional Validation

- [ ] Authentication flows pass (login/register/logout)
- [ ] Core conversion paths pass
  - [ ] Registration (buyer/farmer)
  - [ ] Marketplace search/view/add-to-cart/buy
  - [ ] Loan application submit
  - [ ] Payment success verification
- [ ] API health check and critical endpoints respond as expected

## Observability

- [ ] GA4 events visible in DebugView for key journeys
- [ ] Funnel events visible (`funnel_step_view`, `funnel_step_complete`, `funnel_conversion`)
- [ ] Sentry receives test exception in target environment
- [ ] Core Web Vitals events are emitted

## Build, Quality, and Release

- [ ] Install dependencies cleanly
  - [ ] `npm ci`
- [ ] Lint and tests pass
  - [ ] `npm run lint`
  - [ ] `npm run test:ci`
- [ ] Production build succeeds
  - [ ] `npm run build`
- [ ] Optional bundle analysis run for release candidates
  - [ ] `npm run analyze`
- [ ] Rollback plan prepared
  - [ ] Previous stable version/tag identified
  - [ ] Environment snapshot/backup confirmed

## Recommended Pre-Deploy Command Sequence

```bash
npm ci
npm run lint
npm run test:ci
npm run build
npm run analyze
```

## Sign-Off

- [ ] Engineering sign-off
- [ ] Product/QA sign-off
- [ ] Deployment window approved
- [ ] Post-deploy smoke test owner assigned
