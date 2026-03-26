# SC-003 Usability Summary

## Objective
- Measure first-attempt completion for the Bulk Upload flow (Setup -> Review -> Confirm).
- Pass threshold: at least 20 attempts and success rate >= 95%.

## Execution Steps
1. Fill `specs/006-bulk-draft-upload/evidence/first-attempt-log.csv` for each operator attempt.
2. Score `first_attempt_success` as `Y` or `N`.
3. Run:

```bash
node scripts/usability/calc-first-attempt-rate.mjs
```

## Result (to be filled after operator study)
- Date:
- Total attempts:
- First-attempt successes:
- Success rate:
- Pass/Fail:
- Owner:

