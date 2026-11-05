# Inter font faces

These are static Inter subsets with separate outlines for weights 400, 500, 600,
650 (Display), and 700. The original font is licensed under `Inter-OFL.txt`.

Each face must retain its unique PostScript name: `RecurInter-Regular`,
`RecurInter-Medium`, `RecurInter-SemiBold`, `RecurInter-Display`, and
`RecurInter-Bold`. The Expo font aliases and Login styles use these same names.

The original generated files accidentally all retained the internal PostScript
name `Inter-Regular`. Expo's iOS font loader maps aliases to that internal name,
so distinct JS aliases resolved to the same face. Renaming only the file or JS
alias does not fix that collision.

When replacing these assets, verify registration and resolved weight using the
same Apple CoreText APIs that native font loading uses:

```sh
swift scripts/check-fonts.swift
```

Run from the project root on macOS. Fully restart Expo Go/the development app
after changing font files to clear fonts already registered in its process.
