# Recur splash animation

- Asset: `assets/animations/recur-splash.json` (320 × 160, 60 fps, 108 frames / 1.8 seconds).
- Sequence: orange R draws (0–0.87s), black `ecur` wordmark reveals (0.7–1.1s), holds, then fades (1.57–1.8s).
- The orange R supplies the initial letter; the black wordmark contains only `ecur`.
- Transparent canvas; present against white. No images, remote assets, or runtime fonts in the JSON.
- Wordmark outlines use Inter, weight 650. The font's OFL license is alongside the animation.
- `assets/brand/recur-logo.svg` is the static, outlined logo.
- Open `docs/animations/recur-splash-preview.html` to scrub or replay the actual JSON in an SVG Lottie renderer.

## App startup

`src/components/recur-splash.tsx` plays once per app mount after session restoration. The root layout mounts the real destination behind the overlay, so completion does not trigger a second navigation. Reduced motion skips the animation. Failure/completion and a four-second watchdog dismiss the overlay.

The OS launch screen is white; the custom animation runs after React mounts. The old Expo splash overlay is no longer mounted in the signed-in layout, so signing in does not replay it. Native splash configuration changes require a new build. Validate the final launch transition in an iOS and Android release build; Expo Go does not reproduce the production launch screen.

Dependencies were installed with `npx expo install lottie-react-native @lottiefiles/dotlottie-react`. Use a development/release build if your client lacks Lottie's native module. The web player's WASM may require network access; errors and the watchdog allow the app to continue.

## Validation

Run `npx tsc --noEmit`, `npx expo lint`, and `npx expo export --platform web`. Device checks: fresh session → login, persisted session → tabs, sign-out → login without replay, reduced motion → no animation, offline/player failure → usable destination.

References: [Expo SDK 57 SplashScreen](https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/), [Lottie React Native](https://github.com/lottie-react-native/lottie-react-native).
