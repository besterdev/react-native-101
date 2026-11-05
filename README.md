<img src="assets/brand/recur-logo.svg" width="150" alt="Recur">

# Recur

A mobile-first subscription tracker built with Expo and React Native for iOS, Android, and web. Recur helps you manage recurring services, see scheduled payments, and understand monthly spending.

This project is a local demo. Sign-in is simulated; there is no authentication server, payment integration, or cloud synchronization.

## Features

- **Login:** explore the demo directly, or enter a sample email and a password of at least eight characters. Passwords are not saved or sent to a server.
- **Overview:** monthly/yearly spending, budget usage, and upcoming payments.
- **Subscriptions:** search, filter active/paused services, add, edit, pause tracking, and remove subscriptions.
- **Calendar:** recurring payment projections, full scheduled charges, selected-payment context, and a Today shortcut.
- **Insights:** spending by category, category drill-down, annual projections, and editable monthly budget.
- **Shared controls:** draggable action sheets, session draft recovery, discard confirmation, and success feedback.
- **Motion and branding:** Lottie splash, Reanimated transitions, gentle reminder-bell animation, Inter fonts, and orange `#FF7A1A` primary actions with white labels.

## Stack

| Area | Technology |
| --- | --- |
| App | Expo SDK 57, React Native 0.86, React 19.2, TypeScript |
| Navigation | Expo Router; native tabs on mobile and custom tabs on web |
| Motion | React Native Reanimated 4, Gesture Handler, Lottie |
| Native controls | Expo UI |
| Local persistence | Expo SecureStore on native; localStorage on web |

Exact dependency versions are in [package.json](package.json) and [package-lock.json](package-lock.json).

## Getting started

Use Node.js 22.13+ and npm. Local iOS Simulator development requires macOS and Xcode; local Android emulation requires Android Studio and an emulator. See the [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/) for supported runtimes.

From the application repository root:

```bash
npm ci
npm start
```

Choose one platform, or launch it directly:

| Command | Purpose |
| --- | --- |
| `npm run ios` | Start Metro and open iOS Simulator |
| `npm run android` | Start Metro and open an Android emulator/device |
| `npm run web` | Start the web development server |
| `npx expo start --web --port 8081` | Start web on a fixed local port |
| `npx expo start --clear` | Restart Metro with a cleared bundler cache |

Open **Explore demo** on the login screen to start. No environment variables or backend setup are required for the current demo.

The native client must support the installed Expo SDK and native modules. If Expo Go cannot load them, use a development build. Native configuration or module changes require rebuilding that client.

## Demo data and behavior

- The sample clock is fixed to **16 October 2026** so the designs and sample totals remain reproducible. Calendar's Today action uses this reference date.
- The initial six subscriptions total **฿1,576/month**, with a default **฿2,000 monthly budget**.
- Spending summaries average yearly subscriptions over 12 months. Calendar shows the full charge in its scheduled billing month.
- Future calendar entries and annual totals are projections, not recorded transactions or payment history.
- Pausing tracking excludes a subscription from spending totals; it does not cancel the service.
- Payment reminders are displayed inside the app. Push notifications and scheduled OS reminders are not implemented.
- **Reset sample data** in Settings restores the six subscriptions and the default budget, and clears the unfinished draft.

### Storage

| Key/state | Lifetime |
| --- | --- |
| `session` | Saved locally; cleared on sign-out |
| `recur-subscriptions-v1` | Saved subscription collection |
| `recur-budget-v1` | Saved monthly budget |
| Add-subscription draft | In memory while the signed-in app session remains mounted |

A draft survives sheet dismissal and tab changes, but not an app reload, restart, or sign-out. Subscription and budget storage is shared by demo sign-ins on the same device/browser origin; it is not isolated by account. Signing out clears the session, not the saved subscriptions or budget.

## Project structure

```text
src/
  app/                         Expo Router routes and layouts
    login.tsx                  Demo sign-in
    (app)/                     Overview, Subscriptions, Calendar, Insights
  features/subscriptions/      Screens, shared sheets, models, and context
  components/                  Tabs, splash, and shared components
  ctx/auth.tsx                 Local demo session
  hooks/use-storage-state.ts   Native/web storage adapter
assets/
  brand/                       Logo and service/navigation assets
  animations/                  Lottie splash and license
  fonts/                       Inter font faces and license
tests/                        Model tests and browser flow helpers
docs/                         Design review and animation notes
```

## Checks

```bash
npm run lint
npx tsc --noEmit
node --experimental-strip-types --test tests/subscriptions.test.mjs tests/calendar.test.mjs
```

The model tests cover spending calculations, stored-data validation, budget defaults, filtering, and recurring calendar dates.

The `tests/*.browser.mjs` files export helpers that accept an authenticated Playwright `Page`. They cover subscription management, draft recovery, budgets, calendar context, and sheet gestures. They are not standalone Node tests or an `npm test` script. Use a separate browser profile with the six-item sample dataset when running them; the existing subscription-screen flow changes demo data.

To check export/bundling separately from device behavior:

```bash
npx expo export --platform web --output-dir dist/web
npx expo export --platform ios --output-dir dist/ios
```

An export verifies bundling; it does not replace native runtime, gesture, accessibility, or release-launch testing.

## EAS build profiles

[eas.json](eas.json) defines:

| Profile | Purpose |
| --- | --- |
| `development` | Internal development client |
| `preview` | Internal distribution build |
| `production` | Production build with automatic build-number increment |

For example, to request an iOS preview build from an Expo account with access to the configured project:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

Before using the development-client profile, install `expo-dev-client` with `npx expo install expo-dev-client`; it is not currently listed in this project. Device signing and distribution requirements still apply. See [EAS profile configuration](https://docs.expo.dev/build/eas-json/) and [internal distribution](https://docs.expo.dev/build/internal-distribution/).

## Design and assets

- [Figma design](https://www.figma.com/design/b90GTpwpZLzemqJFwl0I1L/Recur?node-id=0-1)
- [UX/UI review and implementation notes](docs/reviews/recur-premium-ux-review.md)
- [Splash animation documentation](docs/animations/recur-splash.md)
- [Splash preview](docs/animations/recur-splash-preview.html)
- [Font registration and iOS verification](assets/fonts/README.md)

When replacing Inter assets, preserve their distinct internal PostScript names and Expo aliases. On macOS, run `swift scripts/check-fonts.swift`, then fully restart the native app to reload registered fonts. Keep the bundled font licenses with redistributed assets.
