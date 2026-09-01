# brain.md — OneScheme Project Memory

This file is a working "brain dump" for anyone (human or AI) picking up this codebase.
It complements `README.md` (which sells the project) by documenting how it's actually
built: architecture, data flow, conventions, gotchas, and TODOs. Read this before
making changes.

---

## 1. What this project actually is

A **static, client-side-only** website (no backend, no build step, no package.json).
Everything — data, auth, filtering, matching — runs in the browser using vanilla
JS + `localStorage`. It's a portfolio/academic project, not production software.

- Entry point: `index.html` (home page — hero, search bar, auth modal, nav)
- Sub-pages live in `pages/`: `explore.html`, `eligibility.html`, `compare.html`, `results.html`
- Styling: Bootstrap 5 + custom CSS per page (one stylesheet per feature area)
- No framework, no bundler, no npm dependencies. Open `index.html` directly or serve statically.
- `css/schemes.css` exists but is **empty (0 bytes)** — dead file, safe to remove or ignore.

## 2. File map

```
index.html              Home: hero, search, nav, auth modal markup
pages/
  explore.html           Browse/filter all schemes
  eligibility.html        Multi-step eligibility questionnaire (the main funnel)
  results.html            Shows matched schemes + match %, save/compare actions
  compare.html             Side-by-side comparison table for 2+ saved schemes

js/
  schemes.js       (531 lines) The DATA: array of ~13 scheme objects, each with
                    an eligibility(user) predicate function baked in.
  script.js        (118 lines) Home page live search (search-as-you-type dropdown).
  explore.js       (1092 lines) Explore page: render cards, search/category/
                    document filters, save-scheme toggle, stat counters.
  eligibility.js   (657 lines) Multi-step form wizard: step nav, validation,
                    gender/institution "pill" selectors, conditional sections
                    (student fields, disability %), submits user profile to
                    localStorage → redirects to results.html.
  results.js       (628 lines) Reads userData from localStorage, filters
                    `schemes` via each scheme's eligibility(user), computes a
                    weighted "match %" (calculateMatch), renders result cards,
                    handles save-for-compare + save-for-later.
  compare.js       (172 lines) Reads compareSchemes ids from localStorage,
                    builds a feature-by-feature <table> comparing 2+ schemes.
  auth.js          (387 lines) Front-end-only login/register modal. Multi-step
                    UI (role select → user or provider or admin flows →
                    state-based registration forms). Persists to localStorage.
                    Explicitly documented in-file as a DEMO, not real auth.
  translate.js     (101 lines) Google Translate widget wrapper; adds a single
                    "English ⇄ Hindi" toggle button and hides Google's default
                    translate banner UI.

css/
  style.css         (1052) Global/home styles
  explore.css       (660)
  eligibility.css   (841)
  results.css       (527)
  compare.css       (64)
  auth.css          (399)
  responsive.css    (527) Breakpoints/overrides, loaded after page-specific CSS
  schemes.css       (0)   EMPTY — unused

images/
  logo.png, hero-bg.png
```

## 3. Core data model — `schemes.js`

`schemes` is a flat `const` array. Each scheme object looks like:

```js
{
  id: 1,
  schemeName: "HDFC Bank Parivartan ECSS",
  occupation: "Student",              // top-level target group
  organization: "HDFC Bank",
  schemeType: "CSR",                  // Government | Private | CSR | NGO ...
  category: "Education",              // Education | Agriculture | Employment |
                                       // Finance | Startup | Women | Health |
                                       // Social Welfare (per README)
  state: "All",                       // "All" / "All India" = no state restriction
  gender: "Any",                      // Any | Male | Female
  minAge: 17, maxAge: 40,
  student: true,
  academicLevel: "Any",               // Any | Undergraduate | ...
  incomeLimit: 250000,                // annual income ceiling (₹); some schemes
                                       // effectively have no cap
  disability: false,
  disabilityPercentage: 0,
  benefit: "₹15,000 - ₹75,000",       // free-text description shown in UI
  applyMode: "Online",
  website: "https://...",
  documents: ["Aadhaar Card", ...],   // required docs, shown as a checklist
  eligibility(user) { ...return boolean... }  // THE SOURCE OF TRUTH for matching
}
```

**Important:** eligibility isn't derived generically from the flat fields (minAge/
maxAge/incomeLimit/etc.) — each scheme has its own hand-written `eligibility(user)`
function with bespoke logic (e.g. scheme #1 requires `studentType === "College
Student"`, `course === "Engineering"`, specific `institutionType` values). The flat
fields are partly for display/filtering (explore/compare pages) and partly just
mirror what's inside `eligibility()`. **When editing a scheme's eligibility rules,
update the `eligibility()` function — the flat fields alone won't change matching
behavior.**

There are currently **13 schemes** in the array (`grep -c "id:" js/schemes.js`).

## 4. The `user` object shape

Built by `eligibility.js` on form submit and stored as `localStorage.userData`:

```js
{
  gender, age, state, area, category,
  disabled,               // boolean
  disabilityPercentage,   // number
  occupation,
  studentType, academicLevel, course, institutionType,
  income
}
```

Every scheme's `eligibility(user)` function and `calculateMatch(scheme, user)` in
`results.js` consume this exact shape. If you add a new field to the eligibility
form, you must also thread it through this object and update any `eligibility()`
functions that should consider it.

## 5. Page-to-page data flow (all via `localStorage`, no backend/API)

```
index.html (search)          → in-memory filter of `schemes`, no persistence
pages/eligibility.html        → user fills multi-step form
        │  submit
        ▼
localStorage["userData"]      ← eligibility.js writes it
        │
        ▼
pages/results.html            → results.js reads userData, filters schemes via
                                 scheme.eligibility(user), ranks by calculateMatch()
        │  user clicks "Save" / "Add to Compare"
        ▼
localStorage["savedSchemes"]  ← array of scheme ids (results.js / explore.js)
localStorage["compareSchemes"]← array of scheme ids (results.js → compare.js)
        │
        ▼
pages/compare.html            → compare.js reads compareSchemes ids, builds table

pages/explore.html             → independent browse/filter/search flow, also
                                  reads/writes savedSchemes (shared with results)

Auth (separate concern):
localStorage["oneScheme_users"]    ← array of registered "accounts" (demo only)
localStorage["oneScheme_session"]  ← currently logged-in user (demo only)
```

**Key localStorage keys** (all plain JSON, no namespacing beyond the key name):
| Key | Written by | Read by | Shape |
|---|---|---|---|
| `userData` | eligibility.js | results.js | single user profile object |
| `savedSchemes` | explore.js, results.js | explore.js, results.js | array of scheme ids |
| `compareSchemes` | results.js | compare.js | array of scheme ids |
| `oneScheme_users` | auth.js | auth.js | array of demo account objects |
| `oneScheme_session` | auth.js | auth.js | current demo session object |

## 6. Matching / scoring logic (`results.js`)

Two-stage process:
1. **Hard filter**: `schemes.filter(s => s.eligibility(user))` — boolean pass/fail
   per scheme, using each scheme's own bespoke predicate.
2. **Soft ranking**: `calculateMatch(scheme, user)` computes a weighted 0–100%
   "match score" *on top of* the schemes that already passed the hard filter, plus
   a human-readable list of `reasons` (used to render "Why you're eligible" text).
   Weights are hardcoded per criterion (occupation 20, age-closeness 20,
   income-margin 20, gender 15 if scheme is gender-specific, state 15 if
   state-specific, area if area-specific, etc.) — see `calculateMatch()` for the
   exact formula, roughly starting at line ~14 of `results.js`.

This two-stage design (binary eligibility + separate cosmetic score) is the main
non-obvious architectural decision in the app — don't conflate the two when adding
new schemes or new matching criteria.

## 7. Auth system — explicitly a front-end demo

`auth.js` header comment states this outright: **"Accounts" are simulated with
localStorage so the flow feels real. In production these calls should hit a real,
secure backend API instead.** There is no password hashing, no server validation,
no real session security. Treat any "login/register/admin" behavior as UI
prototyping only — do not extend this into anything security-sensitive without a
real backend.

Roles supported in the modal flow: **User**, **Scheme Provider** (Government /
Private / NGO / Other, each with its own registration sub-form and a "pending
approval" step), and **Admin** (separate login step, no visible signup — implies a
seeded/hardcoded admin account somewhere in auth.js, worth checking before relying
on it).

## 8. i18n

Only English ⇄ Hindi, implemented via the **Google Website Translator widget**
(`translate.js`), not a real i18n framework/string catalog. The toggle button
swaps the `googtrans` cookie and reloads, or triggers the widget's hidden
`<select>`. This means: (a) all "translation" is machine-translated on the fly by
Google, not curated copy; (b) it depends on Google's translate script loading
correctly; (c) there's brittle DOM-hiding logic (`hideGoogleBar`, run on a timer
loop up to 5s) to suppress the default Google translate banner — fragile if
Google changes their widget markup.

## 9. UI conventions worth knowing

- Bootstrap 5 + Bootstrap Icons + Google Fonts (Poppins) throughout.
- Each major page/feature has its **own dedicated CSS file** rather than shared
  component classes — expect some duplication across `explore.css`,
  `eligibility.css`, `results.css`, etc.
- `responsive.css` is loaded last and centralizes breakpoint overrides rather than
  each file having its own media queries (mixed — worth verifying per-file before
  assuming this is 100% consistent).
- Multi-step wizards (auth modal, eligibility form) both implement their own
  bespoke step-stack/navigation logic independently (`authState.stack` in
  auth.js, `currentStep`/`.form-step` in eligibility.js) — not a shared component.
  If you build a third wizard, consider extracting a shared step-navigator instead
  of copy-pasting a third implementation.
- Money is displayed as free-text strings with ₹ symbols (`benefit` field), not
  computed/formatted — can't be sorted or compared numerically as-is.

## 10. Known gaps / things to double check before extending

- `css/schemes.css` is empty — likely a stub some code may still `<link>` to; check
  before deleting.
- No tests, no linting config, no CI (git history only shows content commits).
- No error handling for `localStorage` being unavailable/full/disabled (private
  browsing, etc.) beyond a few `try/catch` around `JSON.parse`.
- Eligibility logic is duplicated conceptually between per-scheme `eligibility()`
  predicates and the flat fields used for explore/compare filtering — the two can
  drift out of sync if only one is edited.
- README's "Future Enhancements" (backend, DB, AI recommendations, multilingual
  beyond Hindi, admin dashboard) are all unimplemented — current admin/provider
  flows in `auth.js` are UI-only scaffolding with no real backing data model for
  provider-submitted schemes.
- Single developer, academic/portfolio project — expect inconsistent code style
  across files (e.g. varying blank-line/whitespace conventions between js/auth.js
  and js/schemes.js) rather than an enforced style guide.

## 11. If you're asked to add a new scheme

1. Add an object to the `schemes` array in `js/schemes.js` with the next `id`.
2. Fill in all flat fields (used for explore filters/cards and compare table).
3. Write a bespoke `eligibility(user)` function — copy the closest existing
   scheme as a template and adjust the specific conditions.
4. No other file needs to change — explore/results/compare all read from the
   same `schemes` array reactively.

## 12. If you're asked to add a new eligibility question/field

1. Add the form control to `pages/eligibility.html`.
2. Add its wiring (event listener / value read) in `js/eligibility.js`, and
   include it in the `user` object built in the submit handler (~line 630+).
3. Update `calculateMatch()` in `js/results.js` if the field should affect the
   match score/reasons.
4. Update any `eligibility()` functions in `js/schemes.js` that should now
   consider this field — it is **not** picked up automatically.
