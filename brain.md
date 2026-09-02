# brain.md — OneScheme Project Memory

This file is the operational memory of the OneScheme codebase. It is intended for a developer or AI assistant who needs to understand the current implementation before modifying the project.

`README.md` explains the project from a user/repository perspective. This file explains how the code actually works, where state is stored, what the important flows are, and what must not be accidentally broken.

---

## 1. Project Reality

OneScheme is currently a **static, browser-only frontend application**.

There is:

- No backend.
- No API server.
- No database.
- No `package.json`.
- No build system.
- No npm dependency installation.
- No server-side authentication.
- No server-side role authorization.

The application runs primarily with:

- HTML
- CSS
- Vanilla JavaScript
- Bootstrap 5
- Bootstrap Icons
- Browser `localStorage`

The project is suitable as an academic/portfolio prototype. It is **not production-secure** in its current architecture.

---

## 2. Important Entry Points

```text
index.html
    ↓
Home page
    ├── Search
    ├── Authentication modal
    ├── User/provider/admin session handling
    └── Platform Admin menu

pages/explore.html
    ↓
Explore/filter all available schemes

pages/eligibility.html
    ↓
Multi-step eligibility questionnaire
    ↓
localStorage.userData
    ↓
pages/results.html

pages/results.html
    ↓
Hard eligibility filter
    ↓
Match-score calculation
    ↓
Save / Compare

pages/compare.html
    ↓
Side-by-side comparison
```

---

## 3. File Map

```text
index.html
  Main landing page.
  Contains navigation, hero/search UI, authentication modal,
  session-aware login button, and admin menu/panel containers.

pages/
  explore.html
    Scheme discovery, filtering, cards and saved schemes.

  eligibility.html
    Multi-step eligibility questionnaire.

  results.html
    Eligible schemes, match percentages, reasons, save/compare actions.

  compare.html
    Side-by-side comparison of selected schemes.

js/
  schemes.js
    Built-in scheme dataset. This is the main static scheme source.

  script.js
    Home-page search and navigation/search interactions.

  explore.js
    Explore rendering, filtering, saved schemes, statistics,
    and merging dynamic admin/provider schemes.

  eligibility.js
    Eligibility form wizard, validation, conditional fields,
    profile creation and redirect to results.

  results.js
    Reads userData, runs eligibility predicates, calculates
    match scores and renders results.

  compare.js
    Reads compareSchemes and generates the comparison table.

  auth.js
    Authentication modal, registration/login flows,
    role management, Platform Admin menu, admin scheme management,
    provider scheme submission and approval/rejection workflow.

  session.js
    Small session helper layer used mainly for saved-scheme visibility
    and normalized role detection.

  translate.js
    English/Hindi Google Website Translator wrapper.

css/
  style.css
    Global/home styling.

  auth.css
    Authentication modal and role-flow styling.

  explore.css
    Explore page styling.

  eligibility.css
    Eligibility wizard styling.

  results.css
    Results page styling.

  compare.css
    Comparison page styling.

  responsive.css
    Responsive/breakpoint overrides.

  schemes.css
    Currently empty (0 bytes).

images/
  logo.png
  hero-bg.png
```

---

## 4. Scheme Data Architecture

The built-in `schemes` variable in `js/schemes.js` is a flat JavaScript array.

Conceptually:

```js
const schemes = [
    {
        id: 1,
        schemeName: "...",
        occupation: "...",
        organization: "...",
        schemeType: "...",
        category: "...",
        state: "All",
        gender: "Any",
        minAge: 18,
        maxAge: 60,
        student: false,
        academicLevel: "Any",
        incomeLimit: 0,
        disability: false,
        disabilityPercentage: 0,
        benefit: "...",
        applyMode: "Online",
        website: "https://...",
        documents: [],

        eligibility(user) {
            return true;
        }
    }
];
```

The current built-in dataset contains **13 schemes**.

### Important rule

Do not assume the flat properties automatically determine eligibility.

Each scheme has its own:

```js
eligibility(user)
```

function.

That function is the source of truth for the hard eligibility check.

For example, a scheme can have:

```js
academicLevel: "Any"
```

but its custom `eligibility()` function may still require a specific user profile.

Therefore, when modifying eligibility:

1. Update the relevant scheme's `eligibility()` predicate.
2. Keep the displayed metadata consistent.
3. Check `results.js` scoring separately.

---

## 5. User Profile Shape

`eligibility.js` creates a user profile and stores it in:

```text
localStorage["userData"]
```

Expected structure:

```js
{
    gender,
    age,
    state,
    area,
    category,
    disabled,
    disabilityPercentage,
    occupation,
    studentType,
    academicLevel,
    course,
    institutionType,
    income
}
```

This object is consumed by:

- `scheme.eligibility(user)` in `schemes.js`
- `calculateMatch(scheme, user)` in `results.js`

### If adding a new eligibility field

You must update all relevant layers:

```text
eligibility.html
       ↓
eligibility.js
       ↓
userData
       ↓
schemes.js eligibility()
       ↓
results.js calculateMatch()
```

Do not add a field only to the HTML form.

---

## 6. Eligibility + Match Scoring

The Results flow has two separate concepts.

### Stage 1 — Hard eligibility

```js
schemes.filter(
    scheme => scheme.eligibility(user)
)
```

This decides whether the scheme is eligible or not.

### Stage 2 — Match percentage

`calculateMatch(scheme, user)` calculates a weighted score for already eligible schemes.

The score considers factors such as:

- Occupation
- Age proximity
- Income margin
- Gender where applicable
- State where applicable
- Area where applicable
- Other matching criteria

The exact weights are implemented in `results.js`.

### Important architectural rule

Do not use the match percentage as the eligibility decision.

Correct:

```text
eligibility() → eligible
calculateMatch() → ranking/explanation
```

Incorrect:

```text
calculateMatch() → decide eligibility
```

---

# 7. Authentication Architecture

Authentication lives in `js/auth.js`.

It is a frontend demonstration system.

### Storage

Registered accounts:

```text
oneScheme_users
```

Current session:

```text
oneScheme_session
```

### Supported roles

```text
user
provider
admin
```

Older accounts without a role are treated as:

```text
user
```

by `session.js`.

---

## 8. Navigation Role Behavior

`updateNavbarForSession()` in `auth.js` controls the main login/account button.

### Logged out

Displays:

```text
Login
```

and opens the authentication modal.

### Regular User

Displays the user's first name.

Saved Schemes is visible.

Clicking the account button provides the logout confirmation flow.

### Scheme Provider

Displays the provider's first name.

Saved Schemes is hidden.

Clicking the account button provides the logout confirmation flow.

### Platform Admin

Displays:

```text
Platform
```

with a shield icon and dropdown indicator.

Clicking it must **not log the admin out**.

Instead it opens the Platform Admin menu containing:

```text
Manage Schemes
Approve Schemes
Log Out
```

This is a critical role-specific behavior.

---

# 9. Platform Admin Menu

The admin menu is implemented in `auth.js`.

The menu is only accessible when:

```js
session.role === "admin"
```

The admin actions are:

```text
openManageSchemes()
openApproveSchemes()
adminLogout()
```

Unauthorized access attempts show an alert and return.

The menu also closes when the user clicks outside it.

---

# 10. Admin — Manage Schemes

Admin-managed schemes are stored in:

```text
oneScheme_adminSchemes
```

Removed IDs are stored in:

```text
oneScheme_removedSchemes
```

### Get admin schemes

```js
getAdminAddedSchemes()
```

### Save admin schemes

```js
saveAdminAddedSchemes(data)
```

### Get merged admin-managed list

```js
getAdminManagedSchemes()
```

This combines:

```text
built-in schemes
+
admin-added schemes
-
removed IDs
```

### Add flow

The Admin can enter:

- Scheme Name
- Organization
- Scheme Type
- Category
- Occupation
- State
- Minimum Age
- Maximum Age
- Gender
- Income Limit
- Benefit
- Apply Mode
- Official Website
- Required Documents

`handleAdminAddScheme()` creates a new scheme object.

Admin-added schemes are immediately marked:

```js
verificationStatus: "approved"
publishingAllowed: true
addedBy: "admin"
```

### Remove flow

`removeAdminScheme(id)`:

1. Confirms with the admin.
2. Adds the ID to `oneScheme_removedSchemes`.
3. Removes the scheme from `oneScheme_adminSchemes`.
4. Reopens Manage Schemes.
5. Requests an Explore-page refresh.

### Important

Built-in schemes live in `schemes.js` and cannot actually be deleted from the source file through the UI.

Instead, their IDs are added to:

```text
oneScheme_removedSchemes
```

and Explore filters them out.

This gives the UI the effect of removal without modifying the static JavaScript source.

---

# 11. Provider Scheme Submission

Scheme Provider submissions are stored in:

```text
oneScheme_providerSchemes
```

When a provider submits a scheme, `auth.js` creates a scheme object containing:

- ID
- Scheme name
- Occupation
- Organization
- Scheme type
- Category
- State
- Gender
- Minimum/maximum age
- Student criteria
- Academic level
- Course
- Institution type
- Income limit
- Disability requirements
- Benefit
- Apply mode
- Website
- Deadline
- Required documents
- Eligibility criteria
- Provider organization details

The object also contains:

```js
verificationStatus: "pending",
publishingAllowed: false
```

This means provider submissions are not immediately published.

---

# 12. Provider Approval Workflow

The intended state machine is:

```text
Provider submits
      ↓
PENDING
      ├───────────────┐
      ↓               ↓
   APPROVED         REJECTED
      ↓               ↓
published          not published
```

### Pending

```js
verificationStatus === "pending"
publishingAllowed === false
```

### Approve

`approveProviderScheme(id)`:

1. Finds the provider submission.
2. Changes status to `approved`.
3. Sets `publishingAllowed = true`.
4. Records:
   - `approvedBy = "Platform Admin"`
   - `approvedAt = new Date().toISOString()`
5. Saves the provider list.
6. Adds/replaces the scheme in:
   ```text
   oneScheme_approvedSchemes
   ```
7. Updates the pending badge.
8. Refreshes the approval panel.
9. Refreshes Explore.

### Reject

`rejectProviderScheme(id)`:

1. Confirms rejection.
2. Changes status to `rejected`.
3. Sets `publishingAllowed = false`.
4. Records:
   - `rejectedBy = "Platform Admin"`
   - `rejectedAt = new Date().toISOString()`
5. Removes the scheme from the approved list if it exists.
6. Updates the pending count.
7. Refreshes the approval UI.

---

# 13. Approved Scheme Storage

Approved provider schemes are stored separately:

```text
oneScheme_approvedSchemes
```

Helper functions:

```js
getApprovedSchemes()
saveApprovedSchemes(data)
```

This separate list allows Explore to publish only schemes that have passed the admin verification step.

---

# 14. Explore Scheme Aggregation

`getExploreSchemes()` in `explore.js` loads:

```text
schemes
+
oneScheme_adminSchemes
+
oneScheme_approvedSchemes
```

Then it:

1. Combines the arrays.
2. Uses a `Map` keyed by numeric scheme ID to avoid duplicate IDs.
3. Removes IDs listed in `oneScheme_removedSchemes`.

Conceptually:

```text
Built-in
   +
Admin Added
   +
Provider Approved
   ↓
Deduplicate by ID
   ↓
Remove blocked IDs
   ↓
Explore list
```

This is important: **provider pending/rejected schemes are not included in the Explore list.**

---

# 15. Explore Refresh

`explore.js` exposes:

```js
window.loadAdminManagedSchemes
```

This calls the page's refresh function when available.

`auth.js` uses:

```js
refreshExploreIfAvailable()
```

after admin add/remove/approve/reject operations.

This allows the Explore page to update without requiring a full page reload when the relevant UI is already active.

---

# 16. localStorage Contract

Treat these keys as part of the application's internal API.

| Key | Shape | Purpose |
|---|---|---|
| `userData` | object | Eligibility profile |
| `savedSchemes` | array of IDs | User saved schemes |
| `compareSchemes` | array of IDs | Schemes selected for comparison |
| `oneScheme_users` | array | Demo account records |
| `oneScheme_session` | object/null | Current session |
| `oneScheme_adminSchemes` | array | Admin-created schemes |
| `oneScheme_removedSchemes` | array of IDs | Hidden/removed scheme IDs |
| `oneScheme_providerSchemes` | array | Provider submissions + statuses |
| `oneScheme_approvedSchemes` | array | Approved provider schemes |

When changing a key name, update every reader and writer.

---

# 17. Saved Schemes and Role Restrictions

Regular users are the only role that should see Saved Schemes.

`session.js` normalizes role information:

```js
getRole(session)
isUser(session)
```

The saved-scheme UI is hidden for:

```text
provider
admin
logged out
```

and visible for:

```text
user
```

`auth.js` also performs the same role-aware navigation handling.

If changing this behavior, check both:

```text
auth.js
session.js
explore.js
```

to avoid contradictory UI states.

---

# 18. Compare Flow

Compare IDs are stored in:

```text
oneScheme_compareSchemes
```

Actually, the current code uses:

```text
compareSchemes
```

`results.js` writes the selected IDs.

`compare.js` reads the IDs and resolves the schemes from the available dataset before constructing the comparison table.

When changing the scheme source system, verify that Compare can resolve:

- built-in schemes
- admin-added schemes
- approved provider schemes

and does not accidentally display removed schemes.

---

# 19. Translation

`translate.js` wraps the Google Website Translator.

Current intent:

```text
English ⇄ Hindi
```

It uses Google's external translation script rather than a local translation catalog.

Implications:

- Translation quality is controlled by Google.
- The page depends on an external script.
- DOM manipulation is used to hide Google's default banner/UI.
- Changes to Google's widget markup may break the integration.

Do not treat this as a full internationalization framework.

---

# 20. Styling Architecture

The project uses Bootstrap plus feature-specific stylesheets.

Main CSS:

```text
style.css
auth.css
explore.css
eligibility.css
results.css
compare.css
responsive.css
```

`responsive.css` is intended to provide shared responsive overrides.

There is some duplication across page-specific stylesheets.

Before changing a component globally, search all CSS files for the relevant selector.

---

# 21. Important Security Limitation

The following are intentionally frontend-only and therefore **not secure**:

- Password storage.
- Admin credentials.
- Role authorization.
- Session state.
- Scheme approval.
- Scheme removal.
- Provider data.
- User data.

Anyone with browser developer tools can inspect or modify localStorage and JavaScript.

The current Admin account is a demo account hardcoded in `auth.js`.

**Do not publish real credentials or treat the demo credentials as production secrets. Before deploying publicly, replace this mechanism with server-side authentication and authorization.**

If the repository is public, the hardcoded demo password should be changed/removed before a production-style GitHub push.

---

# 22. Common Modification Rules

## Add a built-in scheme

Edit:

```text
js/schemes.js
```

Steps:

1. Add the next unique numeric ID.
2. Fill the flat metadata.
3. Add the required documents.
4. Implement `eligibility(user)`.
5. Test Explore.
6. Test Eligibility.
7. Test Results.
8. Test Compare.

Do not rely on the flat fields alone.

---

## Add an admin-managed field

If the Admin Add Scheme form receives a new field:

1. Add HTML input in `auth.js`.
2. Read the input in `handleAdminAddScheme()`.
3. Add it to `newScheme`.
4. Render it in Manage Schemes if needed.
5. Add it to Explore/Results/Compare if required.
6. Consider whether eligibility scoring must use it.

---

## Add a provider submission field

Update all relevant layers:

```text
provider form
    ↓
submission handler
    ↓
provider scheme object
    ↓
approval panel
    ↓
approved storage
    ↓
Explore rendering
```

If a field is not copied into the provider scheme object, it will disappear from the workflow.

---

## Add a new eligibility question

Update:

```text
pages/eligibility.html
js/eligibility.js
js/schemes.js
js/results.js
```

Minimum path:

```text
HTML control
    ↓
read value
    ↓
userData
    ↓
eligibility(user)
    ↓
calculateMatch()
```

---

# 23. Current Known Gaps

- No automated tests.
- No linting configuration.
- No CI pipeline.
- No backend.
- No persistent database.
- Client-side-only authentication.
- Client-side-only admin authorization.
- localStorage can be cleared or manipulated.
- Built-in scheme removal is a local browser override, not a source/database deletion.
- Eligibility rules are manually maintained.
- Display metadata and custom eligibility predicates can drift apart.
- `css/schemes.css` is empty.
- Money/benefits are stored mostly as free-text strings, making numeric comparison difficult.
- Translation depends on Google's external widget.
- No automated validation of official scheme URLs.
- No audit trail beyond local timestamps stored in browser data.
- No provider dashboard for viewing historical submissions.
- No server-side publishing gate.

---

# 24. Recommended Production Architecture

If this prototype is converted into a real service, use:

```text
Frontend
   ↓
REST/GraphQL API
   ↓
Authentication + Authorization
   ↓
Application Services
   ↓
Database
```

Recommended roles:

```text
USER
PROVIDER
ADMIN
```

Server-side authorization should independently enforce:

```text
USER
  → search/explore/eligibility/save/compare

PROVIDER
  → submit/manage own submissions

ADMIN
  → approve/reject/manage schemes
```

Never rely on:

```js
localStorage.role
```

for actual authorization.

Passwords must be hashed server-side.

Provider approval must be stored in the database.

Admin actions should produce an audit log.

---

# 25. Debugging Checklist

If schemes are missing from Explore:

1. Check `js/schemes.js` is loaded.
2. Check `getExploreSchemes()`.
3. Inspect:
   ```text
   oneScheme_adminSchemes
   oneScheme_approvedSchemes
   oneScheme_removedSchemes
   ```
4. Check for duplicate IDs.
5. Check browser console.

If a provider submission is not visible to Admin:

1. Inspect:
   ```text
   oneScheme_providerSchemes
   ```
2. Confirm:
   ```text
   verificationStatus === "pending"
   ```
3. Confirm the Admin session has:
   ```text
   role === "admin"
   ```

If an approved provider scheme is not visible:

1. Check `oneScheme_approvedSchemes`.
2. Check `verificationStatus`.
3. Check `publishingAllowed`.
4. Check whether its ID exists in `oneScheme_removedSchemes`.
5. Refresh Explore.

If the Platform button logs out the Admin:

Check:

```js
updateNavbarForSession()
```

and verify the admin branch assigns:

```js
loginBtn.onclick = function (event) {
    event.preventDefault();
    event.stopPropagation();
    toggleAdminMenu();
};
```

It must not call `logoutUser()`.

---

# 26. Safe Development Principle

Before changing a feature, identify its complete data path.

For example, for provider approval:

```text
Provider form
  ↓
handleProviderSchemeSubmit()
  ↓
oneScheme_providerSchemes
  ↓
openApproveSchemes()
  ↓
approveProviderScheme()
  ↓
oneScheme_approvedSchemes
  ↓
getExploreSchemes()
  ↓
Explore UI
```

For eligibility:

```text
Eligibility HTML
  ↓
eligibility.js
  ↓
userData
  ↓
schemes.js eligibility()
  ↓
results.js
  ↓
match score
  ↓
results UI
```

For admin management:

```text
Platform menu
  ↓
Manage Schemes
  ↓
oneScheme_adminSchemes / oneScheme_removedSchemes
  ↓
getExploreSchemes()
  ↓
Explore
```

Always preserve these paths when refactoring.

---

# 27. Final Mental Model

Think of OneScheme as four connected frontend systems:

```text
┌─────────────────────────────────────────────┐
│                 ONE SCHEME                  │
├─────────────────────────────────────────────┤
│                                             │
│  1. DISCOVERY                               │
│     Search → Explore → Scheme Details       │
│                                             │
│  2. ELIGIBILITY                             │
│     User Profile → Rules → Results          │
│                                             │
│  3. PERSONALIZATION                         │
│     Save → Compare                          │
│                                             │
│  4. PLATFORM GOVERNANCE                     │
│     Provider Submit → Admin Review          │
│                    → Approve → Publish       │
│                    → Reject                 │
│                                             │
└─────────────────────────────────────────────┘
```

The most important architectural facts are:

1. **Everything currently runs in the browser.**
2. **`schemes.js` contains the original built-in dataset.**
3. **Each scheme's `eligibility(user)` is the hard eligibility source of truth.**
4. **`results.js` calculates ranking/match scores separately.**
5. **`localStorage` is the current persistence layer.**
6. **Admin-added schemes and provider-approved schemes are dynamically merged into Explore.**
7. **Provider submissions remain pending until Platform Admin approval.**
8. **Only the Admin gets the Platform menu.**
9. **The Platform button must open the admin menu, not log the admin out.**
10. **The current auth/authorization system is a demonstration and must be replaced with a secure backend for production.**
