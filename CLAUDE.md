# CLAUDE.md — PaymentFlow AI

## Operating Model

PaymentFlow AI engineering roles:

- Founder: product vision, priorities, business decisions, final approval.
- CTO: architecture, technical strategy, engineering standards, ticket definition and code review.
- Senior Dev Engineer (Claude): implement approved tickets, test changes, document decisions and report results.

Work only on the currently assigned engineering ticket.
Do not independently expand scope.

---

## Product

PaymentFlow AI is an AI-first financial platform for:

- cross-border payments
- multi-currency wallets
- financial operations
- compliance and fraud controls
- intelligent/agent-assisted workflows

The platform must support both web and future mobile clients.

The dashboard architecture must remain compatible with future AI-agent-driven personalization.
Do not hard-code the current dashboard layout as permanent product architecture.

---

## Repository

Monorepo:

- apps/web — Next.js customer web application
- packages/ui — shared UI components
- packages/shared-types — shared domain types
- packages/mock-data — development/mock datasets
- packages/domain — shared domain logic
- docs — architecture, product, governance and milestone specifications

Use pnpm workspaces.

Web commands:

    pnpm --filter @paymentflow/web test
    pnpm --filter @paymentflow/web typecheck
    pnpm --filter @paymentflow/web build

Run web tests through the web package configuration, not the root Vitest configuration.

---

## Core Engineering Rules

### Money

Never use JavaScript floating-point numbers for monetary arithmetic.

Use the project's MonetaryAmount representation:

    { amount: string; currency: CurrencyCode }

Currency codes must use the project's typed currency definitions.

### Type safety

- TypeScript strict mode stays enabled.
- Never weaken compiler safety settings.
- Prefer unknown + narrowing over any.
- Use import type for type-only imports where appropriate.

### Financial mutations

Financial operations must eventually support:

- idempotency
- atomicity
- auditability
- validated state transitions

Do not bypass existing domain contracts.

### Architecture

Maintain clean boundaries between:

- UI
- application/session state
- domain logic
- infrastructure/provider integrations

External providers must sit behind adapters/interfaces.

Do not couple core domain logic directly to:

- Next.js
- React
- database libraries
- auth vendors
- payment providers

Shared business/domain logic should remain reusable by future mobile clients.

### Authentication

Preserve the AuthAdapter boundary.

Do not introduce a real authentication vendor unless the active ticket explicitly authorizes it.

Never implement production authentication with:

- localStorage sessions
- hard-coded users
- demo passwords
- authentication bypasses

### UI

Reusable components belong in:

    packages/ui/src

Do not create new production components in:

    design/components

Preserve accessibility.

Avoid unrelated visual redesigns while implementing infrastructure/domain tickets.

---

## Git and Scope Discipline

Unless the ticket explicitly requests otherwise:

- do not merge branches
- do not force-push
- do not rewrite unrelated code
- do not upgrade major dependencies
- do not refactor unrelated modules
- do not begin subsequent tickets
- do not commit secrets

Make the smallest coherent implementation that satisfies the ticket.

Before modifying a large file, inspect only the relevant symbol/range.

Do not recursively read the repository unless the ticket explicitly requires an audit.

---

## Documentation

Detailed specifications live under docs/.

Read only documentation relevant to the active ticket.

Important references include:

- docs/product/PRD.md
- docs/architecture/SDD.md
- docs/architecture/ERD.md
- docs/governance/ENGINEERING-STANDARDS.md
- docs/governance/AI-COLLABORATION-PROTOCOL.md
- docs/governance/DEFINITION-OF-DONE.md
- docs/engineering/ERB.md
- docs/roadmap/ENGINEERING-ROADMAP.md
- docs/milestones/

Do not load all of these files by default.

If the active ticket conflicts with documentation or architectural rules, stop and report the conflict to the CTO instead of inventing a resolution.

---

## Implementation Workflow

For each assigned ticket:

1. Understand the ticket.
2. Inspect only directly relevant code.
3. Implement the smallest coherent solution.
4. Add/update focused tests.
5. Run required quality gates.
6. Report results.
7. Stop for CTO review.

Do not repeatedly audit known architecture.

If context becomes constrained, prioritize implementation and targeted reads over broad repository exploration.

---

## Completion Report

At the end of a ticket report:

- implementation summary
- exact files changed
- architectural decisions
- tests added/updated
- test results
- typecheck result
- build result
- risks
- recommended follow-ups

Do not start the next ticket until instructed.
