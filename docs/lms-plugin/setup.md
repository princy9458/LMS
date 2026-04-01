# LMS SaaS Production Deployment Guide

This guide outlines the steps to deploy the LMS plugin in a multi-tenant production environment.

## 1. Prerequisites
- **MongoDB**: Production cluster (Atlas recommended).
- **Redis**: For BullMQ and Caching.
- **Stripe Account**: For course monetization.
- **Media Storage**: AWS S3 or Cloudflare R2 bucket.

## 2. Environment Configuration
Copy `.env.example` to `.env.production` and fill in the secrets.

## 3. Local Development Environment
The Docker deployment configuration has been temporarily disabled during the development phase. The application currently runs using the local Node.js environment.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 4. Multi-Tenant Setup
1. Create a root `Tenant` record in the database.
2. Configure DNS subdomains to point to your deployment.
3. The system automatically detects the tenant via the `x-tenant-slug` header injected by middleware.

## 5. Security Checklist
- [ ] Enable `STRIPE_WEBHOOK_SECRET` for secure payment processing.
- [ ] Set `NODE_ENV=production`.
- [ ] Configure `CSP` headers in `middleware.ts`.
- [ ] Use `Sentry` for error tracking.

## 6. Scaling
- **Background Jobs**: Scale the `BullMQ` workers as certificate generation volume grows.
- **Database**: Use MongoDB read-replicas for high-traffic course listings.
