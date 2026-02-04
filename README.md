# Content Drip

Simple email drip subscriptions powered by Next.js.

## Run Locally

```bash
npm install
npm run dev
```

## Content Packs

- `quietly`: original pack
- `hello`: lightweight placeholder pack for quick testing
  - Steps: `welcome`, `day-1`, `day-2`, `day-3`

## Scheduler Modes

- Normal mode (default): uses each subscription's cron expression and timezone.
- Fast test mode: set `DRIP_STEP_MINUTES` to a positive integer to bypass cron parsing and advance one step whenever elapsed minutes since last update is at least that value.
- If `DRIP_STEP_MINUTES` is set but invalid/non-positive, it falls back to `10`.

Example:

```bash
DRIP_STEP_MINUTES=2 npm run dev
```

## Cron Endpoint

`GET /api/cron` requires `Authorization: Bearer <CRON_SECRET>`.

Example:

```bash
curl -X GET "http://localhost:3000/api/cron" \
  -H "Authorization: Bearer $CRON_SECRET"
```
