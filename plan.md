# 🎲 IMPLEMENTATION.md: D&D Character Webapp

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

| Phase | Days | Focus | Key Deliverables | Linked Report Sections | Status |
|-------|------|-------|------------------|------------------------|--------|
| **1** | 1-3  | Core State & Mobile UI Foundation | `state.js` skeleton, CSS variables, touch-optimized container, tab navigation | 2.3 (Structure Chart), 1.1 (Need 8) | ✅ Completed |
| **2** | 4-6  | Creation, Stats & Combat | Point-buy validation (+/- controls), auto-modifiers, HP/AC/temp HP clamping | 1.1 (Needs 1-3), 2.2 (Criteria 1-3) | 🟡 In Progress |
| **3** | 7-8  | Progression, Death Saves & Storage | XP/level thresholds, proficiency bonus table, 3/3 death save pips, JSON export/import + sessionStorage | 1.1 (Needs 4-5, 7), 2.2 (Criteria 4-5, 7) | ⏳ Pending |
| **4** | 9-10 | Polish, Accessibility & Testing | `prefers-reduced-motion`, aria-labels, boundary/path test tables, video walkthrough prep | 2.2 (Criteria 6), 4.2 (Testing) | ⏳ Pending |

---

## 📱 4. Mobile-First UI Strategy
- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
- **Touch Targets:** All interactive elements ≥ `44px` (Apple HIG / WCAG 2.5.5)
- **Layout:** `.container { max-width: 480px; margin: 0 auto; padding: 16px; }`
- **Typography:** `font-size: clamp(1rem, 2.5vw, 1.125rem);`
- **Theme:** Dark base (`#1a1a1d`), card (`#2a2a2f`), gold accent (`#c49b63`) per client request ("pretty but not overstimulating")
- **Tabs:** Horizontal scroll (`overflow-x: auto`), sticky active state, swipe-friendly spacing
- **Accessibility:** `aria-live="polite"` on dynamic modifiers, high contrast ratios, keyboard navigation fallback

---

## 🔄 5. Git & Version Control Workflow
I want u to push the code to https://github.com/1dvv3/sashi
- **Remote:** Push all code to https://github.com/1dvv3/sashi
- **Branching:** `main` for stable releases, feature branches for each phase
- **Commits:** Conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`)
- **Tags:** Version tag at the end of each phase (`v0.1`, `v0.2`, `v0.3`, `v1.0`)

---

## 🧪 6. Testing Strategy (Sec 4.2 Alignment)

### Boundary Testing Table Template
| Variable | Min | Max | Default | Expected Output | Actual | Reason |
|----------|-----|-----|---------|-----------------|--------|--------|
| `stats[STR]` | 8 | 15 | 8 | Reject <8 or >15 | | Need 1 validation |
| `hp.current` | 0 | `hp.max` | 10 | Clamp at 0/max | | Need 3 combat safety |
| `xp` | 0 | 355,000 | 0 | Trigger level at thresholds | | Need 4 progression |
| `deathSaves.success` | 0 | 3 | 0 | Reset on HP>0, trigger stable at 3 | | Need 5 rules compliance |
| `deathSaves.failure` | 0 | 3 | 0 | Trigger dead at 3 | | Need 5 rules compliance |
| `pointBuy.remaining` | 0 | 27 | 27 | Block allocation at 0 | | Need 1 budget enforcement |

### Path Testing Focus
- **Happy Path:** Create character → allocate 27 pts → apply race bonus → take damage → level up → save as JSON → reload.
- **Edge Path:** Set HP to 0 → fill 3 death fails → restore HP to 1 → verify counters reset.
- **Storage Path:** Toggle One-Shot → close tab → reopen → verify empty. Toggle Campaign → export → delete → import → verify intact.

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

---

## 📋 8. Next Immediate Tasks (Phase 2)

Based on the current state, the following tasks are planned for Phase 2 (Days 4-6):

### Task 1: Implement Point-Buy System with Validation
- **Files:** `js/logic.js` (adjustStat function already exists, needs validation), `js/ui.js` (stepper buttons)
- **Details:** Ensure the point-buy system enforces 8-15 range during point-buy phase and tracks remaining points correctly.
- **Acceptance Criteria:** 
  - Cannot increase a stat above 15 during point-buy.
  - Cannot decrease a stat below 8 during point-buy.
  - Point buy remaining updates correctly.
  - Point buy used updates correctly.

### Task 2: Implement Auto-Modifiers and Stat Display
- **Files:** `js/logic.js` (calcModifier function exists), `js/ui.js` (updateStatsTab to show modifiers)
- **Details:** Display real-time modifiers for each stat as they are adjusted.
- **Acceptance Criteria:**
  - Modifier shown as `(+X)` or `(-X)` next to each stat.
  - Modifier updates instantly when stat changes.

### Task 3: Implement Race Bonus Application
- **Files:** `js/logic.js` (applyRaceBonus function exists), `js/ui.js` (need to add race selection UI)
- **Details:** Allow user to select a race from a dropdown, which applies predefined stat bonuses.
- **Acceptance Criteria:**
  - Race dropdown appears in Stats tab after point-buy is complete (or can be applied anytime?).
  - Selecting a race updates the stats accordingly.
  - Stats can exceed 15 after racial bonuses.

### Task 4: Implement HP/AC/Temp HP Tracking
- **Files:** `js/logic.js` (changeHP, setTempHP functions exist), `js/ui.js` (combat tab controls)
- **Details:** Implement hit points, armor class, and temporary hit points with healing/damage buttons.
- **Acceptance Criteria:**
  - HP current cannot exceed HP max.
  - HP current cannot go below 0.
  - Temporary HP can be set and absorbs damage first.
  - AC and initiative are displayed (AC calculation to be implemented later based on Dex modifier and armor).

### Task 5: Implement Basic AC Calculation (Simplified)
- **Files:** `js/logic.js` (add function to calculate AC based on Dex modifier and armor, default to 10 + Dex modifier for now)
- **Details:** For now, assume no armor, so AC = 10 + Dex modifier.
- **Acceptance Criteria:**
  - AC updates when Dex changes.
  - AC displayed in combat tab.

These tasks will be implemented in the coming days, following the TDD approach as outlined in the writing-plans skill.

---