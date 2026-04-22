# 🎲 D&D Character Webapp — Implementation Plan

**Client:** Ms. Sheldon (NSW Software Engineering Stage 6)  
**Repository:** https://github.com/1dvv3/sashi  
**Tech Stack:** HTML5, CSS3 (Mobile-First), Vanilla JavaScript (ES6+ Modules)  
**Development Approach:** WAgile (Phased Implementation)  
**Status:** 🟢 Active Development

---

## 📖 1. Project Overview

Ms. Sheldon requires a mobile-responsive digital character sheet to replace error-prone handwritten D&D 5e sheets. The application must automate point-buy character creation, calculate modifiers in real-time, track combat/XP/death saves, and support both persistent (Campaign) and temporary (One-Shot) sessions. All logic runs client-side with zero backend dependencies.

---

## 🗂️ 2. File Structure

```
sashi/
├── index.html              # SPA entry, mobile viewport, semantic structure
├── css/
│   └── style.css           # Mobile-first CSS variables, flexbox, touch targets
├── js/
│   ├── state.js            # Central state object, RULES constants, save/load
│   ├── logic.js            # Pure functions: calcModifier(), adjustStat(), etc.
│   ├── ui.js               # DOM rendering, tab switching, event delegation
│   └── app.js              # Initialization, lifecycle, mobile handlers
├── assets/                 # SVG icons, favicon
├── docs/                   # Meeting minutes, test data, AI citation screenshots
├── IMPLEMENTATION.md       # This file
└── README.md               # Project overview + academic citation
```

---

## 📅 3. Phased Implementation Plan (WAgile)

### Phase 1 — Core State & Mobile UI Foundation (Days 1–3)

| Deliverable | Details |
|---|---|
| `state.js` skeleton | Central state object with all character properties, RULES constants (point-buy costs, XP thresholds, proficiency table) |
| CSS design system | CSS custom properties for theme tokens, typography scale, spacing scale |
| Touch-optimized container | Mobile viewport meta, `.container` layout, `44px` min touch targets |
| Tab navigation | Horizontal scrollable tabs (Overview / Stats / Combat / Progression / Storage) |
| **Report Sections** | 2.3 (Structure Chart), 1.1 (Need 8) |

### Phase 2 — Creation, Stats & Combat (Days 4–6)

| Deliverable | Details |
|---|---|
| Point-buy system | 27-point budget, +/− stepper controls per stat (8–15 range), real-time remaining display |
| Auto-modifiers | `calcModifier(score)` → `Math.floor((score - 10) / 2)`, live DOM updates |
| Race bonus application | Dropdown selection → automatic stat adjustments |
| HP / AC / Temp HP | Current/max HP tracking, damage/heal buttons, temp HP clamping at 0 |
| **Report Sections** | 1.1 (Needs 1–3), 2.2 (Criteria 1–3) |

### Phase 3 — Progression, Death Saves & Storage (Days 7–8)

| Deliverable | Details |
|---|---|
| XP / Level system | XP thresholds table (levels 1–20), auto-level on threshold, proficiency bonus lookup |
| Death saves | 3 success / 3 failure pip UI, reset on HP > 0, "Stable" / "Dead" state triggers |
| Session modes | Campaign (localStorage persist) vs One-Shot (sessionStorage, auto-clear) toggle |
| JSON export/import | Full character state serialisation, download as `.json`, file upload to restore |
| **Report Sections** | 1.1 (Needs 4–5, 7), 2.2 (Criteria 4–5, 7) |

### Phase 4 — Polish, Accessibility & Testing (Days 9–10)

| Deliverable | Details |
|---|---|
| Motion preferences | `prefers-reduced-motion` media query, disable animations accordingly |
| ARIA labels | `aria-live="polite"` on dynamic values, proper `role` attributes, focus management |
| Boundary testing | Populate test tables with actual results (see §6) |
| Path testing | Execute happy/edge/storage paths, document results |
| Video walkthrough | Record demo for submission |
| **Report Sections** | 2.2 (Criteria 6), 4.2 (Testing) |

---

## 📱 4. Mobile-First UI Strategy

### Viewport & Layout
- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
- **Container:** `.container { max-width: 480px; margin: 0 auto; padding: 16px; }`
- **Typography:** `font-size: clamp(1rem, 2.5vw, 1.125rem);`

### Touch & Interaction
- All interactive elements ≥ `44px` (Apple HIG / WCAG 2.5.5)
- Horizontal tab scroll (`overflow-x: auto`), sticky active state, swipe-friendly spacing

### Theme
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#1a1a1d` | Page background |
| `--bg-card` | `#2a2a2f` | Card / section surfaces |
| `--accent` | `#c49b63` | Gold accent (buttons, highlights) |
| `--text-primary` | `#e8e8e8` | Primary body text |
| `--text-muted` | `#8a8a8a` | Secondary / label text |

> *Design brief: "pretty but not overstimulating" — Ms. Sheldon*

### Accessibility
- `aria-live="polite"` on dynamic modifiers
- High contrast ratios (WCAG AA minimum)
- Keyboard navigation fallback for all controls

---

## 🔄 5. Git & Version Control Workflow

- **Remote:** Push all code to https://github.com/1dvv3/sashi
- **Branching:** `main` for stable releases, feature branches for each phase
- **Commits:** Conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`)
- **Tags:** Version tag at the end of each phase (`v0.1`, `v0.2`, `v0.3`, `v1.0`)

---

## 🧪 6. Testing Strategy (Sec 4.2 Alignment)

### Boundary Testing Table

| Variable | Min | Max | Default | Expected Output | Actual | Reason |
|---|---|---|---|---|---|---|
| `stats[STR]` | 8 | 15 | 8 | Reject <8 or >15 | _TBD_ | Need 1 validation |
| `hp.current` | 0 | `hp.max` | 10 | Clamp at 0/max | _TBD_ | Need 3 combat safety |
| `xp` | 0 | 355,000 | 0 | Trigger level at thresholds | _TBD_ | Need 4 progression |
| `deathSaves.success` | 0 | 3 | 0 | Reset on HP>0, trigger stable at 3 | _TBD_ | Need 5 rules compliance |
| `deathSaves.failure` | 0 | 3 | 0 | Trigger dead at 3 | _TBD_ | Need 5 rules compliance |
| `pointBuy.remaining` | 0 | 27 | 27 | Block allocation at 0 | _TBD_ | Need 1 budget enforcement |

### Path Testing

| Path | Steps | Expected Outcome |
|---|---|---|
| **Happy Path** | Create character → allocate 27 pts → apply race bonus → take damage → level up → save as JSON → reload | Character fully persists with correct values |
| **Edge Path** | Set HP to 0 → fill 3 death fails → restore HP to 1 → verify counters reset | Death saves clear, character returns to alive state |
| **Storage Path** | Toggle One-Shot → close tab → reopen → verify empty. Toggle Campaign → export → delete → import → verify intact | Session mode correctly controls persistence |

---

## 📎 7. Open Questions

> [!IMPORTANT]
> The following questions need answers before/during development to finalise the plan.

1. **Races:** Which D&D 5e races should be supported? (PHB only, or expanded?)
2. **Classes:** Are class features needed, or just the class name as a label?
3. **Skills & Proficiencies:** Should the sheet track individual skill proficiencies, or just the proficiency bonus?
4. **Spellcasting:** Is any spell tracking required, or is this purely martial/stats focused?
5. **Multi-character:** Should users be able to store and switch between multiple characters?
6. **Inventory/Equipment:** Is there an equipment or inventory section needed?
7. **Notes field:** Should there be a free-text notes/backstory area?
8. **Dice roller:** Is a built-in dice roller desired (e.g., roll d20 + modifier)?
9. **Print view:** Does Ms. Sheldon want a print-friendly CSS layout for physical copies?
10. **Deployment:** GitHub Pages hosting, or purely local/repo submission?
