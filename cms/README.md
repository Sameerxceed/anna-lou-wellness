# Anna Lou Wellness — Strapi CMS

The content management backend for annalouwellness.com.

## Quick Start (Local Development)

```bash
npm install
cp .env.example .env
npm run develop
```

Admin panel: http://localhost:1337/admin
API: http://localhost:1337/api

## Tech Stack

- Strapi 5 (headless CMS)
- SQLite (dev) / PostgreSQL (production)
- Node.js 20+

## Deployment

- **CMS**: Railway (Hobby plan, ~$5-10/month)
- **Frontend**: Vercel
- **Database**: Railway PostgreSQL

## Content Types

### Core Content
- Homepage, Site Settings, Contact Page (single types)
- Products, Product Categories, Events, Team Members (collections)

### E-Commerce
- Product Variants, Product Options, Coupons, Tax Rules
- Shipping Zones, Shipping Methods, Orders
- Customers, Wishlists, Product Reviews, Return Requests
- Cart (server-side), Currency Rates

### Dynamic Pages
- Page Builder with 14 section components (Hero, Text Block, Card Grid, Testimonials, CTA Banner, Gallery, FAQ, Team Grid, Contact Form, Embed, Featured Products, Custom HTML, Press Strip, Instagram Feed)

## Admin Panel

White-labelled for Anna Lou Wellness. Login at `/admin`.
