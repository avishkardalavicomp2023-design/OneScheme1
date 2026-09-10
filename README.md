# 🇮🇳 OneScheme --- One Nation, One Scheme

OneScheme is a responsive, client-side web application designed to make
Government and Private welfare schemes easier to discover, understand,
compare, and apply for.

The platform brings schemes from areas such as **Education, Agriculture,
Employment, Finance, Startups, Women, Healthcare, Housing, and Social
Welfare** into one interface. Users can browse schemes, check
eligibility, compare schemes, save schemes, and open the relevant
application website.

The current project is a **frontend prototype/academic project**.
Authentication, scheme management, and approval workflows use browser
`localStorage`; there is currently no secure backend or production
database.

------------------------------------------------------------------------

## ✨ Key Features

### 👤 Regular User

-   Register and log in through the authentication modal.
-   Search schemes from the home page.
-   Explore all available schemes.
-   Filter schemes by category and required documents.
-   Complete a multi-step eligibility questionnaire.
-   Receive schemes that match the submitted profile.
-   See an approximate match percentage and eligibility reasons.
-   Save schemes for later.
-   Add schemes to a comparison list.
-   Compare multiple schemes side-by-side.
-   Switch between English and Hindi using the Google Website Translator
    integration.

### 🏢 Scheme Provider

-   Register as a Scheme Provider.
-   Select organization type:
    -   Government
    -   Private
    -   NGO / Other
-   Complete the organization-specific registration flow.
-   Submit a new welfare scheme.
-   Submitted schemes are stored with:
    -   `verificationStatus: "pending"`
    -   `publishingAllowed: false`
-   A provider submission does **not** become publicly available until
    the Platform Admin approves it.

### 🛡️ Platform Admin

The Platform Admin has a dedicated **Platform** menu instead of being
logged out when the button is clicked.

Admin-only options include:

-   **Manage Schemes**
    -   View platform schemes.
    -   Add a new scheme.
    -   Remove a scheme.
    -   Refresh the Explore page after changes.
-   **Approve Schemes**
    -   View pending Scheme Provider submissions.
    -   Review organization and scheme information.
    -   Approve a submission.
    -   Reject a submission.
    -   Approved submissions become available to users.
-   **Log Out**

Admin controls are restricted in the UI using the session role check:

``` js
session.role === "admin"
```

Regular users and Scheme Providers do not receive the Platform Admin
menu.

------------------------------------------------------------------------

# 🧩 Main Application Modules

## 🏠 Home

`index.html`

The home page provides:

-   Navigation
-   Hero section
-   Scheme search
-   Authentication modal
-   Login/session-aware navigation
-   Platform Admin menu
-   Links to the main application modules

------------------------------------------------------------------------

## 🔎 Explore Schemes

`pages/explore.html` + `js/explore.js`

The Explore module combines:

1.  Built-in schemes from `js/schemes.js`
2.  Admin-added schemes
3.  Admin-approved provider schemes

It supports:

-   Search
-   Category filtering
-   Document filtering
-   Scheme cards
-   Scheme statistics
-   Save-for-later functionality
-   Role-aware saved-scheme visibility

Removed scheme IDs are excluded from the displayed collection.

------------------------------------------------------------------------

## ✅ Eligibility Checker

`pages/eligibility.html` + `js/eligibility.js`

A multi-step questionnaire collects information such as:

-   Gender
-   Age
-   State
-   Area
-   Category
-   Disability status
-   Disability percentage
-   Occupation
-   Student type
-   Academic level
-   Course
-   Institution type
-   Income

The resulting profile is saved as:

``` text
localStorage["userData"]
```

The user is then redirected to the Results page.

------------------------------------------------------------------------

## 📊 Results

`pages/results.html` + `js/results.js`

The Results module:

1.  Reads `userData`.
2.  Runs every scheme's `eligibility(user)` function.
3.  Removes schemes that fail the hard eligibility check.
4.  Calculates a weighted match percentage for eligible schemes.
5.  Displays reasons explaining why a scheme matches.
6.  Provides save and compare actions.

This is intentionally a **two-stage system**:

``` text
Eligibility predicate
        ↓
Eligible / Not eligible
        ↓
Match score
        ↓
Ranked results
```

The match percentage is a ranking/explanation mechanism; it is not the
source of truth for eligibility.

------------------------------------------------------------------------

## ⚖️ Compare Schemes

`pages/compare.html` + `js/compare.js`

Users can compare saved schemes using fields such as:

-   Scheme name
-   Organization
-   Scheme type
-   Category
-   Occupation
-   State
-   Age range
-   Gender
-   Income limit
-   Benefit
-   Application mode
-   Website
-   Required documents

The comparison list is stored in:

``` text
localStorage["compareSchemes"]
```

------------------------------------------------------------------------

# 🔐 Authentication & Roles

Authentication is implemented entirely in the browser and is intended
for demonstration purposes.

Supported roles:

``` text
User
Scheme Provider
Platform Admin
```

Session data is stored in:

``` text
localStorage["oneScheme_session"]
```

Registered demo accounts are stored in:

``` text
localStorage["oneScheme_users"]
```

### Role behavior

  Feature                   User   Scheme Provider   Platform Admin
  ------------------------ ------ ----------------- ----------------
  Search schemes             ✅          ✅                ✅
  Explore schemes            ✅          ✅                ✅
  Eligibility checker        ✅          ✅                ✅
  Save schemes               ✅          ❌                ❌
  Compare schemes            ✅          ❌                ❌
  Submit schemes             ❌          ✅                ❌
  Platform menu              ❌          ❌                ✅
  Manage schemes             ❌          ❌                ✅
  Approve/reject schemes     ❌          ❌                ✅
  Logout                     ✅          ✅                ✅

> **Security warning:** this authentication system is not
> production-safe. Credentials, sessions, roles, and data are handled in
> client-side JavaScript/localStorage. A production deployment requires
> a secure backend, hashed passwords, server-side authorization,
> protected sessions/tokens, and database validation.

------------------------------------------------------------------------

# 🗃️ Scheme Data

The original built-in scheme dataset is defined in:

``` text
js/schemes.js
```

Each scheme generally contains:

``` js
{
    id,
    schemeName,
    occupation,
    organization,
    schemeType,
    category,
    state,
    gender,
    minAge,
    maxAge,
    student,
    academicLevel,
    incomeLimit,
    disability,
    disabilityPercentage,
    benefit,
    applyMode,
    website,
    documents,
    eligibility(user) { ... }
}
```

The built-in dataset currently contains **13 scheme records**.

The most important field for eligibility is the scheme-specific:

``` js
eligibility(user)
```

The flat fields are also used by Explore/Compare and for displaying
scheme information.

------------------------------------------------------------------------

# 🔄 Dynamic Scheme Management

The application supports three scheme sources.

``` text
                     ┌─────────────────────┐
                     │ js/schemes.js       │
                     │ Built-in schemes    │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Explore Schemes     │
                     └─────────────────────┘

Admin ── Add ──► oneScheme_adminSchemes
Admin ── Remove ► oneScheme_removedSchemes

Provider ─ Submit ─► oneScheme_providerSchemes
                         │
                         ▼
                  Platform Admin
                    Approve / Reject
                         │
                         ▼
                oneScheme_approvedSchemes
                         │
                         ▼
                     Explore
```

### Admin-added schemes

Stored in:

``` text
oneScheme_adminSchemes
```

Admin-created schemes are immediately marked:

``` text
verificationStatus: "approved"
publishingAllowed: true
addedBy: "admin"
```

### Provider-submitted schemes

Stored in:

``` text
oneScheme_providerSchemes
```

Initially:

``` text
verificationStatus: "pending"
publishingAllowed: false
```

After approval:

``` text
verificationStatus: "approved"
publishingAllowed: true
approvedBy: "Platform Admin"
approvedAt: <ISO timestamp>
```

After rejection:

``` text
verificationStatus: "rejected"
publishingAllowed: false
rejectedBy: "Platform Admin"
rejectedAt: <ISO timestamp>
```

Approved provider schemes are copied to:

``` text
oneScheme_approvedSchemes
```

and become available to the Explore module.

------------------------------------------------------------------------

# 💾 localStorage Data Model

  -----------------------------------------------------------------------------
  Key                           Purpose                 Main Writer(s)
  ----------------------------- ----------------------- -----------------------
  `userData`                    Eligibility             `eligibility.js`
                                questionnaire profile   

  `savedSchemes`                IDs of schemes saved by `explore.js`,
                                users                   `results.js`

  `compareSchemes`              IDs selected for        `results.js`
                                comparison              

  `oneScheme_users`             Demo registered         `auth.js`
                                accounts                

  `oneScheme_session`           Current logged-in       `auth.js`
                                session                 

  `oneScheme_adminSchemes`      Schemes added by        `auth.js`
                                Platform Admin          

  `oneScheme_removedSchemes`    IDs removed by Platform `auth.js`
                                Admin                   

  `oneScheme_providerSchemes`   Provider submissions    `auth.js`
                                and verification status 

  `oneScheme_approvedSchemes`   Approved provider       `auth.js`
                                schemes                 
  -----------------------------------------------------------------------------

All values are stored as JSON strings.

------------------------------------------------------------------------

# 📁 Project Structure

``` text
OneScheme/
│
├── index.html
├── README.md
├── brain.md
│
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── explore.css
│   ├── eligibility.css
│   ├── results.css
│   ├── compare.css
│   ├── responsive.css
│   └── schemes.css
│
├── js/
│   ├── auth.js
│   ├── schemes.js
│   ├── script.js
│   ├── session.js
│   ├── explore.js
│   ├── eligibility.js
│   ├── results.js
│   ├── compare.js
│   └── translate.js
│
├── pages/
│   ├── explore.html
│   ├── eligibility.html
│   ├── results.html
│   └── compare.html
│
└── images/
    ├── logo.png
    └── hero-bg.png
```

`css/schemes.css` currently exists as an empty stylesheet and is not a
functional data source.

------------------------------------------------------------------------

# 🛠️ Technologies Used

### Frontend

-   HTML5
-   CSS3
-   JavaScript ES6+

### UI

-   Bootstrap 5
-   Bootstrap Icons
-   Google Fonts --- Poppins

### Browser Storage

-   Web Storage API / `localStorage`

### Translation

-   Google Website Translator

No Node.js, npm package installation, bundler, framework, or backend
server is required for the current prototype.

------------------------------------------------------------------------

# 🚀 Getting Started

## 1. Clone the repository

``` bash
git clone https://github.com/avishkardalavicomp2023-design/OneScheme1.git
cd OneScheme1
```

## 2. Run the project

The simplest option is to open:

``` text
index.html
```

in a modern browser.

For a more reliable development environment, serve the folder using a
local static server, for example:

``` bash
python -m http.server 8000
```

Then open:

``` text
http://localhost:8000
```

------------------------------------------------------------------------

# 🧪 Testing the Main Flows

## Regular User

1.  Open the application.
2.  Register/login as a User.
3.  Search or explore schemes.
4.  Open Eligibility Checker.
5.  Complete the questionnaire.
6.  Review Results.
7.  Save a scheme.
8.  Add schemes to Compare.
9.  Open Compare.

## Scheme Provider

1.  Register/login as a Scheme Provider.
2.  Complete organization details.
3.  Submit a scheme.
4.  Confirm the submission reaches the pending state.
5.  Log in as Platform Admin.

## Platform Admin

1.  Log in through the Admin login.
2.  Click the **Platform** button.
3.  Confirm the menu contains:
    -   Manage Schemes
    -   Approve Schemes
    -   Log Out
4.  Open Manage Schemes and add/remove a scheme.
5.  Open Approve Schemes.
6.  Approve or reject a provider submission.
7.  Confirm approved schemes appear in Explore.
8.  Confirm logout returns the navigation to the normal Login state.

------------------------------------------------------------------------

# 🌐 Deployment

Because this is a static frontend, it can be hosted on services such as:

-   GitHub Pages
-   Netlify
-   Vercel
-   Any static web server

However, the current authentication and admin functionality should
**not** be considered secure for a public production deployment.

------------------------------------------------------------------------

# ⚠️ Current Limitations

-   No backend.
-   No database.
-   Authentication is simulated using `localStorage`.
-   Passwords are not securely hashed.
-   Admin authorization is client-side only.
-   Scheme data is not centrally synchronized.
-   Eligibility rules are handwritten per scheme.
-   Google translation depends on the external Google translation
    widget.
-   No automated test suite.
-   No linting/formatting pipeline.
-   No CI/CD configuration.
-   Scheme application links redirect users to external websites.

------------------------------------------------------------------------

# 🔮 Future Enhancements

-   Secure backend authentication.
-   Role-based authorization on the server.
-   MySQL/PostgreSQL/MongoDB integration.
-   Secure password hashing.
-   JWT/session-based authentication.
-   Admin dashboard with persistent database records.
-   Provider dashboard for submitted/approved/rejected schemes.
-   Scheme versioning and audit logs.
-   Government API integration.
-   AI-powered scheme recommendation.
-   Advanced multilingual support.
-   Application/deadline tracking.
-   Notifications and reminders.
-   Automated eligibility-rule validation.
-   Mobile application.
-   Automated unit and end-to-end tests.

------------------------------------------------------------------------

# 🎯 Project Objective

OneScheme aims to reduce the difficulty citizens face when searching
across different welfare-program websites by providing a unified
discovery and eligibility experience.

The core idea is:

> **Find the right scheme, understand the eligibility, compare available
> options, and reach the application source from one platform.**

------------------------------------------------------------------------

# 👨‍💻 Developer

**Avishkar Sandip Dalavi**

Computer Engineering Student

------------------------------------------------------------------------

# 📄 License

This project is developed for educational and academic purposes.

------------------------------------------------------------------------

## Latest UI & Personalization Features

The current version includes the following user experience improvements.

### Welcome and Login Flow

Every time the homepage (`index.html`) is opened, the project displays:

**Nice Meeting You**

For visitors without an active session, the existing Regular User login
modal is then available, with a **Skip login** option.

Skipping login only skips authentication for the current visit. The
welcome flow is intentionally not permanently suppressed.

### Regular User Profile

After a successful Regular User login, the user can complete a profile
containing the information used by the eligibility checker, including:

-   Gender
-   Age
-   State/UT
-   Urban/Rural area
-   Category
-   Disability status
-   Disability percentage
-   Occupation
-   Student/academic information where applicable
-   Annual income

The **Save Profile** action is enabled only when the required
information has been completed.

The profile is persisted locally and associated with the logged-in user.

### Use Saved Information

If a logged-in Regular User has a saved profile, the homepage
eligibility section displays:

> **Use Your Saved Information**

Selecting it automatically populates the eligibility checker using the
saved profile.

The saved-profile flow skips the intermediate eligibility steps and
opens directly at:

> **Step 6 of 6**

The user can then submit the final eligibility check without manually
pressing Next through all previous steps.

### Edit Your Profile

Regular users can edit their saved eligibility information from their
account menu/settings.

The existing profile form is reused and opened with the user's saved
values pre-filled.

------------------------------------------------------------------------

## Account Menu

For a logged-in Regular User, clicking the desktop account/profile
button opens an account menu containing:

-   **Edit Your Profile**
-   **Log Out**

Clicking the account button no longer immediately logs the user out.

Platform Admin and Scheme Provider role behavior remains separate from
the Regular User account flow.

------------------------------------------------------------------------

## Mobile Liquid UI Navigation

The mobile bottom navigation uses a Liquid Glass-style visual treatment
while preserving the existing role-based behavior.

The four navigation positions are:

1.  Home
2.  Explore
3.  Role-based option
4.  Settings

The third position changes according to the current role:

  Session           Third option
  ----------------- ----------------
  Logged out        Login
  Regular User      Saved Schemes
  Scheme Provider   My Schemes
  Platform Admin    Manage Schemes

The Regular User Saved Schemes badge is dynamically updated.

------------------------------------------------------------------------

## Saved Schemes

Saved schemes are stored using:

``` text
localStorage["savedSchemes"]
```

The application normalizes saved IDs and avoids counting stale/duplicate
entries as valid visible saved schemes.

The same saved-scheme data is used by desktop and mobile flows.

------------------------------------------------------------------------

## Eligibility Results

The Eligibility Checker continues to determine eligible schemes and
retain the internal scoring/reason information.

The visible **match percentage/ring has been removed** from the Results
UI.

Results now emphasize:

-   Scheme information
-   Eligibility information
-   Why the user is eligible
-   View Details
-   Apply Now
-   Save
-   Compare

The internal eligibility/scoring logic is retained where required by the
application.

------------------------------------------------------------------------

## Desktop Saved-Information Layout

The **Use Your Saved Information** control is positioned above the
desktop eligibility checker and is prevented from being hidden behind
the eligibility wizard.

This layout adjustment is desktop-scoped so the mobile design is not
unnecessarily affected.

------------------------------------------------------------------------

## Project Structure

A simplified structure is:

``` text
OneScheme/
│
├── index.html
├── pages/
│   ├── explore.html
│   ├── results.html
│   ├── eligibility.html
│   └── compare.html
│
├── css/
│   ├── style.css
│   ├── responsive.css
│   ├── mobile-enhance.css
│   ├── eligibility.css
│   ├── auth.css
│   ├── results.css
│   ├── explore.css
│   ├── compare.css
│   └── schemes.css
│
├── js/
│   ├── script.js
│   ├── auth.js
│   ├── session.js
│   ├── mobile-nav.js
│   ├── profile.js
│   ├── eligibility.js
│   ├── results.js
│   ├── explore.js
│   ├── compare.js
│   ├── schemes.js
│   └── translate.js
│
├── images/
│   ├── logo.png
│   └── hero-bg.png
│
├── README.md
└── brain.md
```

------------------------------------------------------------------------

## Main Application Flow

``` text
Open Homepage
      │
      ▼
Nice Meeting You
      │
      ├── No active session
      │       │
      │       ▼
      │   Regular User Login
      │       │
      │       ├── Skip login
      │       │
      │       └── Successful login
      │                 │
      │                 ▼
      │          Complete Your Profile
      │                 │
      │                 ▼
      │            Save Profile
      │
      └── Existing active session
              │
              ▼
        Continue to Homepage
```

Saved profile eligibility flow:

``` text
Use Your Saved Information
          │
          ▼
Populate eligibility fields
          │
          ▼
Jump directly to Step 6
          │
          ▼
Find Eligible Schemes
          │
          ▼
Results
```

------------------------------------------------------------------------

## Roles

### Regular User

Regular users can:

-   Log in
-   Complete a personal eligibility profile
-   Edit their profile
-   Use saved profile information
-   Find eligible schemes
-   Save schemes
-   Compare schemes
-   Apply through scheme links
-   Access Saved Schemes

### Scheme Provider

Scheme providers can use the provider workflow for submitting/managing
schemes subject to the project's approval process.

### Platform Admin

Platform administrators can access administrative scheme-management
functionality and approve/manage provider-submitted schemes according to
the existing application logic.

------------------------------------------------------------------------

## Technology Stack

The project is a frontend web application using:

-   HTML5
-   CSS3
-   JavaScript
-   Bootstrap 5
-   Bootstrap Icons
-   Google Fonts / Poppins
-   Browser `localStorage` for local persistence

No backend service is required for the current frontend prototype flow.

------------------------------------------------------------------------

## Important Development Notes

### Authentication

The current project uses browser-side session/localStorage mechanisms
for the prototype.

This is suitable for demonstration and frontend development, but a
production application should use:

-   Server-side authentication
-   Secure password hashing
-   HTTP-only secure cookies or secure token handling
-   Server-side authorization
-   Database-backed user profiles
-   Server-side validation

### Profile Data

The current saved profile is stored locally in the browser. It should
not be treated as secure storage for sensitive production data.

### Scheme Data

The project can combine built-in schemes with dynamically
managed/approved scheme information according to the existing JavaScript
architecture.

------------------------------------------------------------------------

## Testing Checklist

Before presenting a new build, test:

### Homepage

-   [ ] Nice Meeting You appears every time homepage opens.
-   [ ] Skip login works.
-   [ ] Existing login modal opens correctly.
-   [ ] Desktop layout remains intact.
-   [ ] Mobile layout remains intact.

### Profile

-   [ ] Regular user can complete profile.
-   [ ] Save Profile is disabled until required fields are complete.
-   [ ] Saved profile persists.
-   [ ] Edit Your Profile opens the saved data.
-   [ ] Editing updates the profile.

### Eligibility

-   [ ] Manual six-step flow works.
-   [ ] Use Your Saved Information appears for a logged-in user with a
    profile.
-   [ ] Saved information populates the eligibility form.
-   [ ] Saved profile jumps directly to Step 6.
-   [ ] Final eligibility submission works.

### Results

-   [ ] Eligible schemes are displayed.
-   [ ] Match percentage/ring is not displayed.
-   [ ] Why you're eligible remains available.
-   [ ] Save works.
-   [ ] Compare works.
-   [ ] Apply Now works.

### Navigation

-   [ ] Desktop Regular User account opens Edit Your Profile / Log Out.
-   [ ] Mobile navigation has four items.
-   [ ] Third mobile item changes according to role.
-   [ ] Saved count is dynamic.
-   [ ] Settings works.
-   [ ] Admin/provider navigation remains role-specific.

------------------------------------------------------------------------

## Current Artifact

This README corresponds to the latest downloadable project version:

``` text
OneScheme1.zip
```

For the full implementation details and architecture notes, see:

``` text
brain.md
```
