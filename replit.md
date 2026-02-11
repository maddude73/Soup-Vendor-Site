# Soulful Soups - Online Soup Ordering Website

## Overview
A full-stack soup ordering platform where customers can browse weekly soups, place orders, make special requests (with upcharge), and pay online. Site owners can manage products, inventory, and orders from an admin dashboard.

## Recent Changes
- Feb 11, 2026: Initial build - schema, API, products, orders, auth, frontend
- Stripe integration is NOT yet connected. Payment intent endpoint returns mock data. User dismissed the Stripe connector setup - they can connect later or provide a STRIPE_SECRET_KEY secret.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Zustand (cart state)
- **Backend**: Express + Drizzle ORM + PostgreSQL
- **Auth**: Replit Auth (OpenID Connect) - no local login forms
- **Payments**: Stripe (mock until key provided)

## Key Files
- `shared/schema.ts` - Drizzle tables: products, orders, orderItems + re-exports auth tables
- `shared/models/auth.ts` - Auth tables (users, sessions) - DO NOT modify
- `shared/routes.ts` - API contract definitions
- `server/routes.ts` - Express route handlers + seed data
- `server/storage.ts` - Database CRUD operations
- `server/db.ts` - Database connection
- `server/replit_integrations/auth/` - Replit Auth module - DO NOT modify

## User Preferences
- Warm, soulful, rustic design theme
- Fonts: Lora (display), DM Sans (body), Architects Daughter (hand-written accents)

## Admin Access
After logging in via Replit Auth, the first user needs to be manually promoted to admin:
```sql
UPDATE users SET is_admin = true WHERE id = '<your-user-id>';
```

## Stripe Integration Note
Stripe connector was dismissed. To enable real payments later:
1. Add STRIPE_SECRET_KEY as a secret
2. Update server/routes.ts payment intent endpoint to use real Stripe SDK
3. Add VITE_STRIPE_PUBLIC_KEY env var for frontend
