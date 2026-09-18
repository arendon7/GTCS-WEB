# Greenatics Web Design System

## Purpose

This document turns the project design stack into repeatable rules for the public Greenatics web and its connected applications. Product truth in `apps/greenatics-ops/PRODUCT.md`, active decisions in `apps/greenatics-ops/knowledge/memory.jsonl`, and the canonical editorial documents have priority over any external skill.

## Design Stack

- **Impeccable:** shape the information architecture, critique hierarchy, audit contrast and polish the final interface.
- **Taste Skill:** establish visual language, composition, density, typography and anti-slop decisions before adding decoration.
- **Emil Kowalski principles:** use motion only for feedback, continuity and explanation; never for ornamental delay.
- **Vercel React Best Practices:** keep Next.js rendering, assets, component boundaries and client state lean.
- **Vercel Web Design Guidelines:** verify keyboard focus, semantic structure, responsive behavior, forms, touch targets and reduced motion.
- **Project editorial canon:** preserve the Greenatics voice, claims governance, official assets and technical boundaries in `docs/knowledge/`.

## Public Web Direction

- Contemporary, natural, technical and premium without eco cliches or generic SaaS gradients.
- Green forest, cream, white and lime accents; color must carry hierarchy or state, not decoration alone.
- Serif or expressive display typography for editorial headlines; neutral, highly legible sans for navigation, body copy and data.
- Prefer asymmetric editorial compositions, numbered sequences, rules, photography and technical diagrams over repeated card grids.
- Use official logos, packshots and documentary imagery from approved project assets. Do not invent labels, packaging or scientific visuals.
- Explain Greenatics as a connected chain: territory, operation, biological process, product, data, evidence and value.
- Separate public marketing from product UI. `/app` and connected tools should feel operational and trustworthy, not like a landing page.

## Screen Gate

Before calling a screen ready, check:

1. The page answers one clear user question.
2. The primary action is visible and unambiguous.
3. Empty, loading, error and permission states are intentional where applicable.
4. Layout works at desktop, tablet and mobile widths without hiding essential content.
5. Keyboard focus, semantic headings, contrast and touch targets are verified.
6. Claims have a source, context or an explicit validation boundary.
7. Images have useful alt text, correct cropping and no distorted aspect ratio.
8. Motion respects `prefers-reduced-motion` and supports a task.
9. The final route is checked in a real browser at desktop and mobile sizes.
10. Typecheck, production build and static QA pass before release.

## Anti-Patterns

- Card inside card inside card.
- Low-contrast text on branded backgrounds.
- Decorative leaves, fake molecules, invented metrics or generic sustainability imagery.
- Claims without date, context, source or validation boundary.
- One generic CTA repeated when users have different entry points.
- A product page that lists a formula without explaining stage, role, evidence and next action.
- A dashboard that uses charts without answering an operational question.
