PaymentFlow AI — Design folder

This folder contains starter artifacts to help frontend teams adopt the PaymentFlow AI design system.

Files:
- design-tokens.scss — a SCSS mapping of key tokens (colors, spacing, radii, font sizes) to CSS variables. Aligns with `styles.css` :root.
- components/
  - Button.jsx — React starter for primary/ghost/danger variants.
  - Card.jsx — simple card wrapper using CSS variables and utility classes.
  - DataTable.jsx — lightweight data table shell with support for columns and rows.

Usage:
1. Import `design-tokens.scss` into your app entry (or convert tokens to Tailwind config).
2. Use the components as examples and adapt them into your component library.

This is a minimal starter — for production, wire up build tooling and tests.
