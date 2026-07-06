PaymentFlow AI — Design folder

This folder contains starter artifacts to help frontend teams adopt the PaymentFlow AI design system.

Files:
- design-tokens.scss — a pointer that identifies `design-tokens.json` as the canonical token source. It intentionally does not duplicate token values.
- components/
  - Button.jsx — React starter for primary/ghost/danger variants.
  - Card.jsx — simple card wrapper using CSS variables and utility classes.
  - DataTable.jsx — lightweight data table shell with support for columns and rows.

Usage:
1. Generate framework-specific tokens from `design-tokens.json` during the future build setup.
2. Use `styles.css` directly when running the dependency-free prototype.
3. Use the components as examples and adapt them into the future component library.

This is a minimal starter — for production, wire up build tooling and tests.
