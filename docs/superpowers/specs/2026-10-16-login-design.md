# Mock Login with Persisted Session

## Goal

Add a mock sign-in flow to the Expo Router app: email + password (non-empty only), persist session across launches, and gate the main tabs behind authentication.

## Decisions

| Topic | Choice |
| --- | --- |
| Auth style | Mock (no real API) |
| Entry behavior | Persist session; skip login when already signed in |
| Form | Email + password (both required non-empty) |
| Routing pattern | Expo Router Protected Routes + SessionProvider |

## Architecture

```
src/app/
  _layout.tsx          # SessionProvider, splash until session loads, root Stack + Protected
  login.tsx            # Accessible only when logged out
  (app)/
    _layout.tsx        # Existing ThemeProvider + AppTabs
    index.tsx          # Home (+ Sign out)
    explore.tsx
    about/
      _layout.tsx
      index.tsx
      details.tsx
```

Move current tab routes under `(app)/`. Root layout becomes a `Stack` that protects `(app)` when `session` is set and `login` when it is not.

### Flow

1. App opens → keep splash visible while session loads from storage.
2. Session present → show `(app)` (Native Tabs).
3. Session absent → show `login`.
4. Successful sign-in → save session → navigate into `(app)`.
5. Sign out → clear session → return to `login`.

## Auth module

New files (outside `src/app/`):

- `src/ctx/auth.tsx` — `SessionProvider`, `useSession()` with `signIn`, `signOut`, `session`, `isLoading`
- `src/hooks/use-storage-state.ts` — persist string session via `expo-secure-store` (native) / `localStorage` (web)

`signIn(email)` stores the email (or a simple token string derived from it) as the session value. Password is validated only for non-empty; it is not stored.

Dependency: `expo-secure-store` via `npx expo install expo-secure-store`.

## UI

### Login (`login.tsx`)

- Title: “Sign in”
- Email and password `TextInput`s (password uses `secureTextEntry`)
- Sign in button disabled when either field is empty; optional short validation message if submitted empty
- On press: `signIn(email)` then enter the protected app (guard / replace)
- Match existing theme tokens (`ThemedView`, `ThemedText`, `Colors`, `Spacing`)

### Sign out

- Button on Home (`(app)/index.tsx`) calling `signOut()`
- Protected route guard redirects to login

## Error handling

- Empty fields: block submit / show brief inline message
- No network or credential errors (mock)
- Splash stays up until `isLoading` is false to avoid login flash

## Out of scope

- Real backend / OAuth / password hashing
- Register / forgot password
- Guest mode
- Biometrics
- Automated tests (manual check is enough for this learning app)

## Manual test plan

1. Fresh install / clear storage → opens login.
2. Empty submit → cannot proceed.
3. Enter email + password → lands on Home tabs.
4. Kill and reopen app → stays logged in (skips login).
5. Sign out on Home → returns to login.
6. About → Detail stack still works while logged in.
