# meta-ads-dashboard

AI-assisted comment moderation for Meta Pages and Instagram Business accounts.

Reviewers see one inbox of comments across organic posts and ads (incl. dark
posts), automatically classified (spam / toxic / negative-genuine / neutral /
positive) and translated to English from EN / ES / KO / ZH / JA. Actions are
hide-only (never delete) and fully audited.

See **[PLAN.md](./PLAN.md)** for architecture and the phased build plan.

## Stack

Next.js 15 (App Router, TypeScript) · Postgres + Prisma · NextAuth · Anthropic
Claude · Vercel + Vercel Cron.

## Local setup

```bash
cp .env.example .env.local       # fill in DATABASE_URL, secrets, Meta app creds
npm install
npx prisma migrate dev           # creates the schema in your local Postgres
npm run dev
```

## Status

**Phase 1 — Foundation.** Plan, schema, scaffolding. No working feature yet.
