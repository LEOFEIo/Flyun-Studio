# FLYUN Studio Design System

This document is the visual and interaction contract for the FLYUN personal portfolio.

## 1. Direction

FLYUN combines three qualities:

1. **Apple-like restraint** — generous negative space, clear hierarchy, strong typography and reduced visual noise.
2. **Tezign-style editorial energy** — oversized type, asymmetrical grids, modular cards and confident creative-direction language.
3. **FLYUN interaction identity** — signal fields, orbit geometry, responsive motion and data-driven project presentation.

The site must feel like a living design system rather than a static résumé or a generic template.

## 2. Core principles

- **Content first:** interaction supports the work and never blocks reading.
- **No decorative 3D avatar:** the previous digital human is removed. The hero uses a lightweight interactive signal field that performs better and is easier to maintain.
- **One source of truth:** project cards are rendered from the shared project data layer. The admin dashboard edits the same data.
- **Progressive enhancement:** the portfolio remains readable if Supabase, canvas animation or motion effects are unavailable.
- **Responsive by design:** layouts are defined for desktop, tablet and mobile rather than scaled down after the fact.
- **Accessible motion:** `prefers-reduced-motion` disables non-essential transitions and animation.

## 3. Visual tokens

### Color

- Background: `#080A08`
- Elevated surface: `#111510`
- Primary text: `#F1F4ED`
- Secondary text: `#A8B0A4`
- Signal lime: `#C5FF4A`
- Signal cobalt: `#315CFF`
- Supporting accents: orange, violet, cyan and rose

The light theme uses warm neutral surfaces rather than pure white.

### Typography

- Interface: Inter / Noto Sans SC
- Editorial italic: Fraunces / Noto Serif SC
- Metadata and system labels: JetBrains Mono

Headlines use tight tracking and short line lengths. Metadata remains small, uppercase and spaced.

### Geometry

- Main panel radius: 24–34px
- Compact controls: 10–14px or pill geometry
- Borders: low-contrast 1px rules
- Grid: 12 columns on desktop, 6/1 columns at responsive breakpoints

## 4. Interaction language

- Pointer-driven signal-field distortion in the hero
- Magnetic movement on key calls to action
- Project-card tilt and radial highlight on pointer movement
- Dynamic filtering by project category
- Project details in a modal with image, role, tools and outbound link
- Command palette with `⌘/Ctrl + K`
- Scroll progress and reveal transitions
- Theme and language toggles

No interaction should prevent keyboard access. Cards respond to Enter and Space, dialogs close with Escape, and all controls expose labels.

## 5. Content model

Projects use the Supabase `cases` table and local fallback cache:

- `id`
- `title_zh`, `title_en`
- `subtitle_zh`, `subtitle_en`
- `category`, `year`
- `cover`, `link`
- `position`, `status`
- `meta.featured`, `meta.role`, `meta.tools`, `meta.accent`, `meta.index`

Profile content is stored in `site_settings` with key `portfolio_profile`.

## 6. Admin experience

The admin dashboard provides:

- project create, edit, delete and reorder
- published/draft states
- featured-project control
- cover URL or small local image upload
- bilingual profile editing
- local-first persistence
- Supabase Auth login and cloud pull/push
- JSON export/import
- local access-code change

The local access code is only a front-end convenience. Real cloud write protection is handled by Supabase Auth and RLS.

## 7. Cleanup policy

Remove files only when they are clearly obsolete and replaced. In this rebuild:

- `index55.html` is replaced by a valid root `index.html`
- the old avatar-specific `portfolio3d.js` and `portfolio3d.css` are removed
- legacy pages remain in the repository but are no longer part of the primary navigation
