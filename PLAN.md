# Medication Calculator Rewrite Plan

## Goal

Rewrite `src/App.tsx` as a medication quantity calculator. The user selects a date range, enters a medication and its daily amounts, and adds the calculated requirement to a results list.

## Planned behavior

1. Replace the existing weight-based dose and safety-check workflow.
2. Provide start-date and end-date inputs, and show the calculated number of days in a small, fully rounded chip with a subtle white glow at the image's upper-right corner, without a label.
3. Provide a medication entry form containing:
   - Medication name.
   - Four required numeric daily amount fields: morning, midday, evening, and night. Enter `0` for unused time slots.
   - A required unit selector with `drop`, `pill`, `ml`, and `mg` options.
4. On **Calc**, sum the four daily amounts, then multiply by the number of days to calculate the total quantity required.
5. Show each successful calculation below the form, including medication name, per-day quantity, date-range day count, total quantity, and unit.
6. After a successful calculation, clear the medication name, four numeric amounts, and unit selection for the next medication. Keep the date range available.
7. Validate the date range and numeric inputs before adding a result; require non-negative values and an end date on or after the start date.
8. Keep the start and end date inputs on the same row.
9. Keep all four daily amount inputs on one row, separated by hyphens, with compact field widths.
10. Use a white page background and bold, primary-colored labels.
11. Darken the image with a black overlay and place a larger white title and concise description at the bottom, without a logo or backing panel.
12. Use a two-column desktop layout with a full-height contextual medication image on the left and the calculator inputs/results on the right; overlay the header at the bottom of the image and stack the image above the calculator on smaller screens.
13. When `drop` is selected, require a drops-per-mL conversion factor and show the range total in mL, along with the equivalent drop count and conversion ratio.
14. Replace visible field labels with concise section guidance and input hints while preserving accessible labels for assistive technology.
15. Validate daily amount precision based on unit: drops must be whole numbers; pills, mL, and mg may include decimals.
16. Keep the image title smaller on mobile screens.
17. Use the shadcn Calendar and Popover components for selecting start and end dates.
18. Build the app on every push and deploy the `main` branch build to GitHub Pages.

## Implementation notes

- Keep the rewrite in `src/App.tsx` and use the existing React, Tailwind, and UI components where appropriate.
- Use shadcn Calendar and Popover components for date selection, with `date-fns` for displaying and serializing selected dates.
- Keep the calendar popover wide enough for comfortably sized date cells while constraining it to the viewport on mobile.
- Keep results in component state so multiple medications can be calculated for the same date range.
- Handle date differences using calendar dates so daylight-saving transitions do not change the day count.
- Preserve the single-row date and dosage layouts on narrow screens without horizontal overflow.
- Keep the unlabeled, rounded day-count chip legible at the upper-right of the image and scale the image title down on mobile.
- Store the contextual medication image locally in `public/` so it is available without a runtime image service.
- Do not assume a universal drops-per-mL value; use the ratio provided for the medication or dropper.
- Keep associated labels available to screen readers when removing their visible presentation.
- Use a GitHub Actions workflow to build on pushes and pull requests, and deploy the `main` branch artifact to GitHub Pages.
- Set Vite's project-page base path from the GitHub repository name and use it for local static assets.

## Confirmed decisions

- Count both the start and end dates. For example, the 1st through the 3rd is 3 days.
- Use separate morning, midday, evening, and night amounts; require all four, using `0` for unused slots.
- Reset the unit selection after each successful calculation.
- For drop-based medication, require the user-provided drops-per-mL ratio before calculating the mL total.
- Reject fractional drop amounts while accepting decimal pill, mL, and mg amounts.

## Verification

- Run `npm run build` after implementation.
- Check that the selected date range produces the expected day count and total quantity.
- Check that invalid input does not create a result and that a successful calculation clears only the medication entry fields.
