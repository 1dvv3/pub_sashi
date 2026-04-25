# AGENTS.md — Sashi D&D Character Sheet

## Quick Start
Open `Gemini/index.html` in a browser, or serve locally:
```bash
python -m http.server 8080 --directory /mnt/Projects/dnd/Gemini
```

## No Build System
- Pure vanilla HTML5, CSS3, ES6 Modules
- No transpilation, no dependencies, no tests
- Deploy by pushing to `main` branch on GitHub Pages

## File Structure
```
Gemini/
├── index.html          # SPA entry point
├── css/style.css      # CSS variables, mobile-first styles
└── js/
    ├── state.js       # Core state, RULES constants, persistence
    ├── logic.js      # Pure calc functions (modifiers, HP, XP)
    ├── ui.js         # DOM rendering, tab panels
    └── app.js        # Event handlers, initialization
```

## Key Technical Facts
- **Persistence key**: `'sashi_character'`
- **Storage modes**: `campaign` → localStorage, `oneshot` → sessionStorage
- **Theme tokens**: dark base (`#1a1a1d`), gold accent (`#c49b63`)
- **Touch targets**: ≥44px (WCAG/mobile)
- **Viewport**: locked (`maximum-scale=1.0`)

## Development Notes
- All logic runs client-side (zero backend)
- Use browser DevTools console for debugging
- CSS `prefers-reduced-motion` supported
- ARIA labels on dynamic content

## Reference
- Feature roadmap: See `plan.md` in repo root