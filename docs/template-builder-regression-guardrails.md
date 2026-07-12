# Template Builder Regression Guardrails

Use this checklist whenever you edit anything outside the template-builder feature to avoid accidental regressions.

## Protected Flow (Do Not Change Unintentionally)

File: js/training-program-demo.js

1. Create New Program opens blank builder state.
2. No stale template/preset data appears when creating a new program.
3. Step 3 uses Next to open Workout Overview + Calendar editor.
4. Calendar view supports drag and drop of workout sessions between weekdays.
5. Save Template from overview/calendar saves to training_programs and returns to coach-training-programs.html.
6. Save flow does not show a name prompt when name was entered on page 1.

## Manual Smoke Test (2-3 minutes)

1. Open coach-training-programs.html.
2. Click Create Training Program.
3. Verify builder is blank (no old template preloaded).
4. Enter template name on step 1 and proceed to step 3.
5. Click Next: Workout Overview & Calendar.
6. Confirm calendar appears first.
7. Drag one workout card to a different weekday and verify it re-renders in the new day.
8. Click Save Template.
9. Confirm redirect to coach-training-programs.html.
10. Confirm saved template appears in the list.

## Fast Diff Scope Check Before Commit

Run these commands:

```bash
git --no-pager diff -- js/training-program-demo.js
rg -n "newTemplate|autosaveTemplate|redirectToLibrary|templateName|openTemplateProgramOverviewPage" js/training-program-demo.js
```

If changes touched these areas unintentionally, revert or re-test the full smoke checklist.

## Safer Workflow Recommendation

1. Do unrelated work on a separate branch.
2. Avoid broad find/replace in js/training-program-demo.js.
3. Re-run the smoke test before merging.
