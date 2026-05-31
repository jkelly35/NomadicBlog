# Performance Platform Implementation Roadmap

This roadmap turns the premium, data-driven coaching vision into shippable phases.

## Current Status

- Implemented: athlete Daily Readiness Score in Today strip.
- Inputs used: active training status, nutrition adherence, event proximity, Strava recovery context.
- Output: simple readiness state (`Ready`, `Moderate`, `Caution`) with supporting signal hints.

## Phase 1: Readiness and Risk Baseline

1. Athlete readiness score (completed).
2. Coach risk board card:
   - Show athletes grouped by readiness band.
   - Include top 1-2 signal reasons per athlete.
3. Daily intervention suggestions:
   - Rule-based recommendations (reduce load, recovery day, nutrition follow-up).
4. Readiness trend sparkline:
   - 7-day trend snapshot per athlete in coach view.

## Phase 2: Program Intelligence

1. Periodization guardrails:
   - Flag monotony, excessive ramp rates, and missed deload windows.
2. Goal-aware program suggestions:
   - Adjust suggested intensity based on event proximity.
3. Session completion fidelity:
   - Planned vs completed tracking and adherence score.

## Phase 3: High-End Coaching Experience

1. Unified coach command center:
   - Priority queue (`Urgent`, `Watch`, `Stable`) with one-click actions.
2. Athlete insight narratives:
   - Auto-generated weekly summaries with notable trend changes.
3. Accountability automations:
   - Nudges for missing logs, readiness drops, and pre-event checklists.

## Technical Notes

- Favor incremental changes in existing page controllers (`js/admin.js`, `js/athlete-profile.js`).
- Keep empty states actionable and role-aware.
- Validate every slice with syntax checks and diagnostics before shipping.
- Add SQL migrations only when a new persistent entity is required.
