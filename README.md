# FLYUN Studio · Leo Xu Portfolio

A data-driven personal portfolio for interaction design, AI product, Unity/XR, spatial experience and talent technology.

## What changed

- Restored a valid root `index.html` after the previous homepage was renamed to `index55.html`.
- Removed the avatar-based Three.js hero and replaced it with a lightweight interactive signal field.
- Rebuilt the visual system around editorial typography, Bento project layouts, responsive motion and strong mobile behavior.
- Added a shared project/profile data layer with local-first caching and Supabase cloud sync.
- Rebuilt `admin.html` as a focused portfolio CMS.
- Removed obsolete avatar homepage assets.

See [`DESIGN.md`](DESIGN.md) for the design and interaction rules.

## Main files

```text
index.html                    Personal portfolio
admin.html                    Portfolio CMS
DESIGN.md                     Visual and interaction system
assets/studio-base.css        Global and hero styling
assets/studio-sections.css    Project, content and responsive styling
assets/studio.js              Portfolio interactions
assets/studio-data.js         Shared local/Supabase data layer
assets/admin.css              Admin styling
assets/admin.js               Admin CRUD and sync logic
supabase-schema.sql           Existing Supabase schema
```

## Portfolio features

- interactive signal-field canvas
- category filters
- dynamic project cards
- project detail dialog
- command palette (`⌘/Ctrl + K`)
- bilingual content
- dark/light themes
- responsive layouts
- reduced-motion support

## Admin features

- create, edit and delete projects
- reorder projects
- draft/published status
- featured projects
- cover URL or small Base64 upload
- bilingual profile editing
- JSON backup and restore
- Supabase Auth login
- cloud pull/push

The default local access code is `flyun2026`. Change it after first login under **系统设置**. This code only hides the browser UI; Supabase Auth and RLS protect cloud writes.

## Supabase

The data layer uses the existing Supabase project and schema:

- public visitors can read published projects
- authenticated administrators can write projects and profile settings
- localStorage remains the offline fallback

Run [`supabase-schema.sql`](supabase-schema.sql) once in the Supabase SQL editor if the tables have not been created.

## Local preview

No build step is required.

```bash
python3 -m http.server 8080
```

Open:

- `http://localhost:8080/`
- `http://localhost:8080/admin.html`
