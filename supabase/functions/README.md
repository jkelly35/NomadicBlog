# Supabase Edge Functions (Strava)

This folder contains Strava integration functions used by `profile.html` / `js/athlete-profile.js`.

It also contains nutrition catalog enrichment used by `athlete-nutrition.html` / `js/athlete-nutrition.js`.

## Functions

- `strava-connect-start`
  - Auth required
  - Returns `auth_url` for Strava OAuth
- `strava-connect-callback`
  - Public callback target from Strava
  - Exchanges code for tokens and upserts connection rows
  - Redirects back to dashboard with `strava_status` query params
- `strava-sync-latest`
  - Auth required
  - Refreshes token if needed
  - Pulls recent activities and upserts `athlete_strava_daily_metrics`
- `strava-disconnect`
  - Auth required
  - Deauthorizes token at Strava and deletes local Strava rows
- `nutrition-food-search`
  - Auth required
  - Searches local `nutrition_foods`
  - Pulls additional matches from USDA FoodData Central and Open Food Facts
  - Normalizes and upserts rows into `nutrition_foods` + default serving in `nutrition_food_servings`
  - Returns merged foods for typeahead search

## Required Secrets

Set these in Supabase project secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_STATE_SECRET` (long random string)
- `STRAVA_CALLBACK_URL` (must match Strava app callback URL)
- `STRAVA_POST_CONNECT_REDIRECT` (optional, e.g. `https://nomadicperformance.com/profile.html`)
- `STRAVA_OAUTH_SCOPES` (optional, default: `read,activity:read_all,profile:read_all`)
- `STRAVA_OAUTH_PROMPT` (optional, default: `auto`)
- `USDA_FOODDATA_API_KEY` (required for USDA import; function still works without it)
- `OPENFOODFACTS_USER_AGENT` (optional but recommended, e.g. `NomadicPerformance/1.0 (support@nomadicperformance.com)`)

## Local Setup

1. Copy `supabase/functions/.env.example` to your local env file and fill values.
2. Ensure `supabase/config.toml` is present (included in this repo).
3. Start local functions runtime from repo root:

```bash
supabase functions serve --env-file supabase/functions/.env.example
```

## Deploy

```bash
supabase functions deploy strava-connect-start
supabase functions deploy strava-connect-callback
supabase functions deploy strava-sync-latest
supabase functions deploy strava-disconnect
supabase functions deploy nutrition-food-search
```

## SQL Setup

Run:

- `sql/create-strava-integration.sql`
- `sql/create-athlete-nutrition-tracking-tables.sql`

before using these functions.
