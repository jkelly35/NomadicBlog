# Supabase Edge Functions (Strava + Whoop)

This folder contains Strava and Whoop integration functions used by `profile.html` / `js/athlete-profile.js`.

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
- `whoop-connect-start`
  - Auth required
  - Returns `auth_url` for Whoop OAuth
- `whoop-connect-callback`
  - Public callback target from Whoop
  - Exchanges code for tokens and upserts connection rows
  - Redirects back to dashboard with `whoop_status` query params
- `whoop-sync-latest`
  - Auth required
  - Refreshes token if needed
  - Pulls recent Whoop recovery/sleep/workout rows and upserts `athlete_whoop_daily_metrics`
- `whoop-disconnect`
  - Auth required
  - Best-effort token revoke (if configured) and deletes local Whoop rows
- `whoop-manual-connect`
  - Auth required
  - Stores user-provided Whoop access/refresh token pair and connection row
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
- `WHOOP_CLIENT_ID`
- `WHOOP_CLIENT_SECRET`
- `WHOOP_CALLBACK_URL` (must match Whoop app callback URL)
- `WHOOP_STATE_SECRET` (long random string)
- `WHOOP_POST_CONNECT_REDIRECT` (optional, e.g. `https://nomadicperformance.com/profile.html`)
- `WHOOP_OAUTH_SCOPES` (optional)
- `WHOOP_AUTH_URL` (optional, default: `https://api.prod.whoop.com/oauth/oauth2/auth`)
- `WHOOP_TOKEN_URL` (optional, default: `https://api.prod.whoop.com/oauth/oauth2/token`)
- `WHOOP_API_BASE` (optional, default: `https://api.prod.whoop.com/developer/v1`)
- `WHOOP_RECOVERY_PATH` (optional, default: `/recovery`)
- `WHOOP_SLEEP_PATH` (optional, default: `/sleep`)
- `WHOOP_WORKOUT_PATH` (optional, default: `/workout`)
- `WHOOP_START_PARAM` (optional, default: `start_date`)
- `WHOOP_END_PARAM` (optional, default: `end_date`)
- `WHOOP_REVOKE_URL` (optional; if unset, disconnect only clears local rows)
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
supabase functions deploy whoop-connect-start
supabase functions deploy whoop-connect-callback
supabase functions deploy whoop-sync-latest
supabase functions deploy whoop-disconnect
supabase functions deploy whoop-manual-connect
supabase functions deploy nutrition-food-search
```

## SQL Setup

Run:

- `sql/create-strava-integration.sql`
- `sql/create-whoop-integration.sql`
- `sql/create-athlete-nutrition-tracking-tables.sql`

before using these functions.
