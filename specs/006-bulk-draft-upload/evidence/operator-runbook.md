# Operator Runbook (Real Study)

## Goal
Collect valid SC-003 evidence from 20 independent operators for first-attempt completion.

## Rules
- Use real operators (no duplicate person).
- One operator = one attempt.
- No coaching during attempt.
- If operator restarts flow, mark first attempt as `N`.
- If operator asks for help, mark `external_help` as `Y`.

## Scoring
- `first_attempt_success = Y` only if:
  - completes Setup -> Review -> Confirm without restart
  - no external help
- Otherwise set `first_attempt_success = N`.

## Data Entry
Fill rows in:
- `specs/006-bulk-draft-upload/evidence/first-attempt-log.csv`

Allowed values:
- `first_attempt_success`: `Y` or `N`
- `restart_required`: `Y` or `N`
- `external_help`: `Y` or `N`
- `duration_minutes`: integer

## Evaluate
Run:

```bash
node scripts/usability/calc-first-attempt-rate.mjs
```

Pass criteria:
- total attempts >= 20
- success rate >= 95%

