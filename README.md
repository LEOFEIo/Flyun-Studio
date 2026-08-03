# FLYUN Studio · Leo Xu Portfolio

A data-driven personal portfolio for interaction design, AI product, Unity/XR, spatial experience and talent technology. The home page is presented as a small, folder-based archive inspired by the reference portfolio template.

## What changed

- Rebuilt the homepage as a light editorial archive with four interactive folders: Selected Work, Practice, Notes and Elsewhere.
- Added a folder-to-stage transition: folders fan out into a full-screen project reader with keyboard navigation.
- Kept the shared project/profile data layer with local-first caching and Supabase cloud sync.
- Kept `admin.html` as the portfolio CMS; changes made there still update the Selected Work folder.
- Added bilingual content, light/dark themes, responsive folder layouts and reduced-motion support.

See [`DESIGN.md`](DESIGN.md) for the design and interaction rules.

## Main files

```text
index.html                    Folder-based personal portfolio
assets/folder-portfolio.css   Homepage visual system
assets/folder-portfolio.js    Folder archive and stage interactions
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

- interactive folder archive
- full-screen project reader with previous/next navigation
- dynamic project cards from the CMS data layer
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
