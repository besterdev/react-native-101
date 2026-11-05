# Recur — UX/UI premium review

Reviewed: 17 October 2026. Scope: perceived quality and usability of Overview, Subscriptions, Calendar, Insights, and shared sheets. This is a design assessment, not a paid-plan proposal or user-research result. No application code changed.

## Assessment

The visual foundation is coherent: orange identity, quiet gray surfaces, clear spending totals, consistent service rows, and four understandable destinations. Insights is particularly easy to scan. Keep this direction.

The strongest opportunity is to make the experience easier to read, more controllable, and safer to recover from. Complete the everyday management flows before adding more decorative effects or charts.

## High priority

### 1. Complete editing and budget control

- **Confirmed:** Subscription details expose a tracking switch and removal, but no editing of price, billing cycle, category, or next payment. Settings shows the fixed ฿2,000 budget as a fact row. Insights asks the user to review subscriptions without offering budget adjustment.
- **Impact:** A price increase or date correction requires recreating a subscription. A budget that cannot be adjusted feels like sample content rather than a personal tool.
- **Change:** Add an explicit Edit action using the existing form, prefilled values, and Save changes. Make Monthly budget editable from Settings and reachable from Insights.
- **Acceptance:** A user can correct a price/date without deleting the item; all screens immediately reflect the change. Saving a budget updates Overview and Insights together.
- **Evidence:** `src/features/subscriptions/overview-sheets.tsx:465`, `src/features/subscriptions/overview-sheets.tsx:390`, `src/features/subscriptions/model.ts:18`.

### 2. Improve contrast and the secondary type scale

- **Measured from code colors:** White on orange `#ff7a1a` is 2.61:1. White against the two primary-button gradient stops is 2.21:1 and 2.85:1. Muted `#777780` on white is 4.44:1, and on the page background is 3.97:1. Calendar gray `#8e8e93` on white is 3.26:1.
- **Confirmed:** Service plans are 11pt and payment metadata is 10pt. These values and gray contrast make financial details visually subordinate enough to be hard to scan.
- **Change:** Retain white button labels as requested, but introduce a darker orange for action backgrounds and selected controls. Preserve bright orange as the brand accent. Raise important secondary text to roughly 12–13pt and use a stronger muted text color. Reflow rows as text grows.
- **Acceptance:** Normal text meets the 4.5:1 contrast benchmark; key billing metadata remains legible at increased system text sizes. Do not change all orange decoration just to meet a text threshold.
- **Evidence:** `src/features/subscriptions/ui.tsx:153`, `src/features/subscriptions/subscription-row.tsx:139`, `src/features/subscriptions/calendar-screen.tsx:278`.
- **Reference:** [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Ratios were computed from foreground/background colors, not sampled from screenshots; gradient values are endpoint checks.

### 3. Preserve unfinished work and confirm successful actions

- **Reproduced on web:** Type a service name in Add subscription, close the sheet, wait until it disappears, reopen it. The name is empty. No draft recovery is offered.
- **Confirmed in code:** Add closes the sheet and saves; removal uses confirmation, but there is no success message or undo path.
- **Change:** Preserve the add-form draft during the session, or offer a discard prompt only when a meaningful draft exists. Add brief “Subscription added” / “Changes saved” feedback. Consider undo for removal once editing is in place.
- **Acceptance:** An accidental dismissal does not silently lose entered data, and completion is apparent without inspecting totals.
- **Evidence:** `src/features/subscriptions/overview-sheets.tsx:245`, `src/features/subscriptions/subscription-sheets.tsx:32`, `src/features/subscriptions/overview-sheets.tsx:520`.

## Medium priority

### 4. Make the visual hierarchy quieter and more consistent

- **Observed:** Settings is a bright orange circle on every page and competes with Add on Overview and Subscriptions. The Home tab is filled while other navigation icons use outline strokes. Page heading sizes/line heights vary between screens. Figma and Notion service marks are letter placeholders.
- **Change:** Use a neutral Settings button; reserve the strongest orange treatment for the main action and selected state. Define common page-title and secondary-text tokens. Use a consistent navigation icon family and suitable service assets.
- **Acceptance:** Each page has one obvious primary action; heading baselines and icon weight feel consistent when switching tabs.
- **Evidence:** `src/features/subscriptions/recur-header.tsx:34`, `src/components/app-tabs.tsx:17`, `src/features/subscriptions/subscription-row.tsx:83`.

### 5. Preserve calendar context in details

- **Reproduced:** Open November, select Netflix on 18 November, open details. The sheet shows “Next payment — 18 October 2026.”
- **Interpretation:** October is still the subscription’s stored next-payment date, so this is not necessarily a calculation error. The sheet does not explain the difference between the selected projected occurrence and the subscription’s next payment.
- **Change:** Show “Selected payment — 18 November” in calendar-originated details, and distinguish the underlying next payment if needed. Add a Today shortcut to make month navigation easier.
- **Acceptance:** The date the user tapped remains visible in the sheet; future projections are distinguishable from recorded payments.
- **Evidence:** `src/features/subscriptions/calendar-screen.tsx:182`, `src/features/subscriptions/subscription-sheets.tsx:26`, `src/features/subscriptions/overview-sheets.tsx:492`.

### 6. Clarify what the financial numbers mean

- **Confirmed demo constraints:** The reference date is fixed to 16 October 2026, and Overview compares spending against a fixed 1457 baseline. The demo date is explained in Settings. These are intentional prototype choices, not evidence of historical transaction tracking.
- **Change:** Make sample mode visible near the main summary while demo data is in use. Before real use, derive comparisons from actual stored history or hide them until history exists. Explain that yearly plans are averaged into monthly spending, whereas Calendar shows scheduled full charges.
- **Acceptance:** A user can tell a sample, a forecast, a normalized monthly cost, and an actual scheduled charge apart. Do not add trend charts backed by invented history.
- **Evidence:** `src/features/subscriptions/model.ts:16`, `src/features/subscriptions/overview-screen.tsx:48`, `src/features/subscriptions/overview-sheets.tsx:395`.

### 7. Let Insights lead to a specific decision

- **Observed:** Category amounts are clear, but the only action is a generic Review subscriptions link.
- **Change:** Make a category row open its subscriptions, and let the budget card open budget editing. A short insight such as the largest spending category can be computed from existing data. Add historical trends only when there is real history.
- **Acceptance:** From the category taking the largest share, the user reaches the relevant subscriptions in one action.
- **Evidence:** `src/features/subscriptions/insights-screen.tsx:106`, `src/features/subscriptions/insights-screen.tsx:135`.

## Lower priority

### 8. Refine motion and touch behavior after the core flows

- **Confirmed:** The bell repeats a gentle swing while unread; reduced motion, focus, background state, and open sheets are already accounted for. Calendar day cells are 39pt high; Month/Year buttons have a 30pt minimum height.
- **Change:** Keep the requested bell animation, but consider one short swing when a new reminder arrives rather than repeating throughout reading. Expand small touch areas without crowding adjacent controls. Use restrained haptics for meaningful confirmations if desired.
- **Acceptance:** Controls remain easy to tap on small devices; motion supports feedback and respects user motion preferences.
- **Evidence:** `src/features/subscriptions/notification-bell.tsx:34`, `src/features/subscriptions/period-toggle.tsx:99`, `src/features/subscriptions/calendar-screen.tsx:271`.

## Verification and limits

- Inspected current iOS Simulator views of all four pages, with Overview captured through its explicit app-group route.
- Inspected live web content and exercised draft dismissal/reopen and the November calendar-to-details flow. Saved subscriptions were not modified.
- Read the shared sheet, theme, model, navigation, and screen implementations. Contrast calculations use current source tokens.
- Developer overlays shown by Expo Go were excluded from the design findings.
- Native drag interaction, VoiceOver/TalkBack, maximum Dynamic Type, and Android rendering were not tested in this review. Dark-mode quality was not validated.
- The skill’s generated design-system suggestion did not match this existing product well; its suggested pricing layout, fonts, and OLED-only theme were not adopted. This review preserves Recur’s established visual direction.

## Suggested implementation order

1. Readability: action/text contrast, secondary typography, small touch areas.
2. Everyday control: edit subscription and edit budget.
3. Recovery and clarity: draft preservation, success feedback, calendar context, visible sample mode.
4. Visual polish: neutral Settings, consistent headings/navigation/service icons, then category drill-down and motion refinement.

## Source implementation — 20 October 2026

- Brand decision: keep the original `#FF7A1A` primary color, existing orange gradient, and white button labels. This supersedes the darker-action suggestion in finding 2. Readability work applies to secondary text and type sizing.
- Subscription details now opens a prefilled edit form for name, amount, cycle, payment date, and category. Cancel keeps saved values; Save updates the shared collection and summaries.
- Monthly budget can be edited from Settings and Insights. It is saved on this device separately from the subscription list and shared by Overview and Insights. Reset sample data restores the default budget as well.
- An unfinished add form stays in the shared provider for the current app session, including when switching tabs. Closing or dragging the sheet preserves it; discarding requires explicit confirmation. Reloading or closing the app ends this draft session.
- Success messages acknowledge add, edit, removal, budget changes, and sample reset.
- Calendar-originated details shows the selected scheduled occurrence separately from the stored next-payment date. A Today shortcut returns to the explicit sample reference date.
- Overview no longer compares against the fixed historical baseline. Sample data, monthly equivalents, and projected annual/scheduled amounts are labeled. Insights categories open their active subscriptions.
- Settings uses a neutral control; titles use a consistent 32/38 scale; important secondary text is at least 12pt; period controls and calendar day targets are at least 44pt high. Primary actions retain the user's original colors.

Verification: TypeScript and Expo lint passed; the 13 model/calendar tests passed. Browser flows at 390px and 360px covered draft recovery/discard, edit validation/cancel/save, budget persistence and synchronized totals, category filtering, calendar occurrence context, and existing subscription management and sheet drag gestures. iOS export succeeded. Native rendering, VoiceOver, Android, and maximum Dynamic Type were not tested in this implementation pass.
