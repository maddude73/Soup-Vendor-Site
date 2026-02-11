# Athena's Soulful Soups - Online Soup Ordering Website

## Overview
A full-stack soup ordering platform where customers can browse weekly soups, place orders, make special requests (with upcharge), and pay online. Site owners can manage products, inventory, and orders from an admin dashboard.

## Recent Changes
- Feb 11, 2026: Added customer contact info capture (name, email, phone, address) during checkout; displayed on admin order management page
- Feb 11, 2026: Stripe integration connected via Replit connector. Real payments with Stripe Elements.
- Feb 11, 2026: Initial build - schema, API, products, orders, auth, frontend

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Zustand (cart state)
- **Backend**: Express + Drizzle ORM + PostgreSQL
- **Auth**: Replit Auth (OpenID Connect) - no local login forms
- **Payments**: Stripe (via Replit connector, sandbox mode)

## Stripe Integration
- `server/stripeClient.ts` - Fetches Stripe credentials from Replit connector API
- `server/webhookHandlers.ts` - Processes Stripe webhooks via stripe-replit-sync
- Stripe schema managed by stripe-replit-sync (DO NOT manually create stripe tables)
- Webhook route registered BEFORE express.json() in index.ts
- Payment flow: Create order -> Create PaymentIntent (server-computed amount) -> Stripe Elements -> Verify payment -> Mark paid
- Amount is computed server-side from order total + 8% tax

## Key Files
- `shared/schema.ts` - Drizzle tables: products, orders, orderItems + re-exports auth tables
- `shared/models/auth.ts` - Auth tables (users, sessions) - DO NOT modify
- `shared/routes.ts` - API contract definitions
- `server/routes.ts` - Express route handlers + seed data
- `server/storage.ts` - Database CRUD operations
- `server/db.ts` - Database connection
- `server/stripeClient.ts` - Stripe client and sync setup
- `server/webhookHandlers.ts` - Stripe webhook processing
- `server/replit_integrations/auth/` - Replit Auth module - DO NOT modify

## User Preferences
- Warm, soulful, rustic design theme
- Fonts: Lora (display), DM Sans (body), Architects Daughter (hand-written accents)

## Admin Access
After logging in via Replit Auth, the first user needs to be manually promoted to admin:
```sql
UPDATE users SET is_admin = true WHERE id = '<your-user-id>';
```
