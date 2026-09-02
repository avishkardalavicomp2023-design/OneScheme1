/* =======================================================
   AUTH MODAL LOGIC
   Front-end only demo flow. "Accounts" are simulated with
   localStorage so the Sign In / Create Account flow feels
   real. In production these calls should hit a real,
   secure backend API instead.
========================================================== */

const STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const authState = {
    stack: [],
    current: "role",
    providerOrgKind: null,
    providerCustomType: "",
    providerOrganization: null
};


/* =========================================================
   HELPERS
========================================================= */

function $(sel, root) {
    return (root || document).querySelector(sel);
}

function $all(sel, root) {
    return Array.from(
        (root || document).querySelectorAll(sel)
    );
}

function stateOptionsHtml(selectedValue) {

    let html =
        `<option value="">Select State / UT</option>`;

    STATES.forEach(state => {

        html += `
            <option value="${state}"
                ${state === selectedValue ? "selected" : ""}>
                ${state}
            </option>
        `;
    });

    return html;
}


/* =========================================================
   STEP NAVIGATION
========================================================= */

function goToStep(stepId, opts) {

    const push =
        !opts || opts.push !== false;

    if (push && authState.current) {
        authState.stack.push(authState.current);
    }

    $all(".auth-step").forEach(el => {
        el.classList.remove("active");
    });

    const target =
        document.getElementById(
            "authStep-" + stepId
        );

    if (target) {
        target.classList.add("active");
    }

    authState.current = stepId;

    const backBtn =
        document.getElementById("authBackBtn");

    if (backBtn) {
        backBtn.style.visibility =
            authState.stack.length
                ? "visible"
                : "hidden";
    }

    const titles = {

        "role":
            "Login / Register",

        "user-auth":
            "👤 User",

        "user-forgot":
            "Reset Password",

        "provider-orgtype":
            "🏛️ Scheme Provider",

        "provider-form-gov":
            "Government Organization Registration",

        "provider-form-private":
            "Private Organization Registration",

        "provider-form-ngo":
            "NGO / Other Organization Registration",

        "provider-scheme":
            "Scheme Attributes",

        "provider-pending":
            "Registration Submitted",

        "admin-login":
            "🛡️ Platform Admin"
    };

    const title =
        document.getElementById(
            "authModalTitleText"
        );

    if (title) {
        title.textContent =
            titles[stepId] || "Login";
    }
}


function goBack() {

    if (!authState.stack.length) {
        return;
    }

    const prev =
        authState.stack.pop();

    $all(".auth-step").forEach(el => {
        el.classList.remove("active");
    });

    const previousStep =
        document.getElementById(
            "authStep-" + prev
        );

    if (previousStep) {
        previousStep.classList.add("active");
    }

    authState.current = prev;

    const backBtn =
        document.getElementById("authBackBtn");

    if (backBtn) {
        backBtn.style.visibility =
            authState.stack.length
                ? "visible"
                : "hidden";
    }

    const titles = {

        "role":
            "Login / Register",

        "user-auth":
            "👤 User",

        "user-forgot":
            "Reset Password",

        "provider-orgtype":
            "🏛️ Scheme Provider",

        "provider-form-gov":
            "Government Organization Registration",

        "provider-form-private":
            "Private Organization Registration",

        "provider-form-ngo":
            "NGO / Other Organization Registration",

        "provider-scheme":
            "Scheme Attributes",

        "provider-pending":
            "Registration Submitted",

        "admin-login":
            "🛡️ Platform Admin"
    };

    const title =
        document.getElementById(
            "authModalTitleText"
        );

    if (title && titles[prev]) {
        title.textContent = titles[prev];
    }
}


/* =========================================================
   RESET AUTH MODAL
========================================================= */

function resetAuthModal() {

    authState.stack = [];
    authState.current = "role";

    authState.providerOrgKind = null;
    authState.providerCustomType = "";
    authState.providerOrganization = null;

    $all(".auth-step").forEach(el => {
        el.classList.remove("active");
    });

    const roleStep =
        document.getElementById(
            "authStep-role"
        );

    if (roleStep) {
        roleStep.classList.add("active");
    }

    const backBtn =
        document.getElementById(
            "authBackBtn"
        );

    if (backBtn) {
        backBtn.style.visibility = "hidden";
    }

    const title =
        document.getElementById(
            "authModalTitleText"
        );

    if (title) {
        title.textContent =
            "Login / Register";
    }

    switchUserTab("signin");

    $all(".auth-error").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });

    $all("#authModal form").forEach(form => {
        form.reset();
    });

    const otherWrap =
        document.getElementById(
            "otherOrgTypeWrap"
        );

    if (otherWrap) {
        otherWrap.classList.remove("active");
    }

    $all(".orgtype-card").forEach(card => {
        card.classList.remove("selected");
    });

    const ngoDropdown =
        document.getElementById(
            "ngoOrgTypeDropdownWrap"
        );

    const ngoCustom =
        document.getElementById(
            "ngoOrgTypeCustomWrap"
        );

    if (ngoDropdown) {
        ngoDropdown.style.display = "block";
    }

    if (ngoCustom) {
        ngoCustom.style.display = "none";
    }
}


/* =========================================================
   LOCAL STORAGE SESSION
========================================================= */

function getUsers() {

    try {
        return JSON.parse(
            localStorage.getItem(
                "oneScheme_users"
            ) || "[]"
        );
    } catch (error) {

        console.error(
            "Error reading users:",
            error
        );

        return [];
    }
}


function saveUsers(list) {

    localStorage.setItem(
        "oneScheme_users",
        JSON.stringify(list)
    );
}


function setSession(user) {

    localStorage.setItem(
        "oneScheme_session",
        JSON.stringify(user)
    );
}


function getSession() {

    try {

        const raw =
            localStorage.getItem(
                "oneScheme_session"
            );

        return raw
            ? JSON.parse(raw)
            : null;

    } catch (error) {

        console.error(
            "Error reading session:",
            error
        );

        return null;
    }
}


function clearSession() {

    localStorage.removeItem(
        "oneScheme_session"
    );
}


/* =========================================================
   NAVBAR SESSION CONTROL

   Saved Schemes:
   USER       -> visible
   PROVIDER   -> hidden
   ADMIN      -> hidden
   LOGGED OUT -> hidden
========================================================= */

function updateNavbarForSession() {

    const loginBtn =
        document.getElementById("loginTrigger");

    const savedNav =
        document.getElementById("savedSchemesNav");

    const session =
        getSession();


    /* =====================================================
       SAVED SCHEMES

       ONLY regular users can see this.
    ===================================================== */

    if (savedNav) {

        if (
            session &&
            session.role === "user"
        ) {

            savedNav.style.display = "";

        } else {

            savedNav.style.display = "none";

        }
    }


    if (!loginBtn) {
        return;
    }


    /* =====================================================
       LOGGED OUT
    ===================================================== */

    if (!session) {

        loginBtn.classList.remove("is-logged-in");

        loginBtn.innerHTML = `
            Login
        `;

        loginBtn.onclick = openAuthModal;

        return;
    }


    /* =====================================================
       PLATFORM ADMIN
    ===================================================== */

    if (session.role === "admin") {

        loginBtn.classList.add("is-logged-in");

        loginBtn.innerHTML = `
            <i class="bi bi-shield-check"></i>
            Platform
            <i class="bi bi-chevron-down ms-1"></i>
        `;

        loginBtn.onclick = function (event) {

            event.preventDefault();
            event.stopPropagation();

            toggleAdminMenu();

        };

        return;
    }


    /* =====================================================
       SCHEME PROVIDER
    ===================================================== */

    if (session.role === "provider") {

        loginBtn.classList.add("is-logged-in");

        loginBtn.innerHTML = `
            <i class="bi bi-building"></i>
            ${getFirstName(session.name)}
            <i class="bi bi-chevron-down ms-1"></i>
        `;

        loginBtn.onclick = function () {

            if (
                confirm(
                    "Log out of your account?"
                )
            ) {

                logoutUser();

            }

        };

        return;
    }


    /* =====================================================
       REGULAR USER
    ===================================================== */

    loginBtn.classList.add("is-logged-in");

    loginBtn.innerHTML = `
        <i class="bi bi-person-circle"></i>
        ${getFirstName(session.name)}
        <i class="bi bi-chevron-down ms-1"></i>
    `;

    loginBtn.onclick = function () {

        if (
            confirm(
                "Log out of your account?"
            )
        ) {

            logoutUser();

        }

    };

}


/* =========================================================
   FIRST NAME
   ========================================================= */

function getFirstName(name) {

    if (!name) {
        return "Account";
    }

    return String(name)
        .trim()
        .split(" ")[0];

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    clearSession();

    const savedNav =
        document.getElementById("savedSchemesNav");

    const loginBtn =
        document.getElementById("loginTrigger");


    if (savedNav) {
        savedNav.style.display = "none";
    }


    if (loginBtn) {

        loginBtn.classList.remove(
            "is-logged-in"
        );

        loginBtn.innerHTML =
            "Login";

        loginBtn.onclick =
            openAuthModal;

    }


    closeAdminMenu();

}

/* =========================================================
   PLATFORM ADMIN MENU
   ========================================================= */

let adminMenuElement = null;


/* =========================================================
   CREATE ADMIN MENU
   ========================================================= */

function createAdminMenu() {

    if (adminMenuElement) {
        return;
    }


    adminMenuElement =
        document.createElement("div");

    adminMenuElement.id =
        "platformAdminMenu";

    adminMenuElement.innerHTML = `

        <div class="admin-menu-header">

            <div class="admin-menu-icon">
                <i class="bi bi-shield-lock-fill"></i>
            </div>

            <div>
                <strong>Platform Admin</strong>

                <small>
                    Administration Panel
                </small>
            </div>

        </div>


        <button
            type="button"
            class="admin-menu-item"
            onclick="openManageSchemes()">

            <i class="bi bi-collection"></i>

            <span>
                <strong>Manage Schemes</strong>
                <small>Add or remove schemes</small>
            </span>

        </button>


        <button
            type="button"
            class="admin-menu-item"
            onclick="openApproveSchemes()">

            <i class="bi bi-check2-circle"></i>

            <span>
                <strong>Approve Schemes</strong>
                <small>Review provider submissions</small>
            </span>

            <span
                id="pendingSchemeBadge"
                class="pending-badge">
                0
            </span>

        </button>


        <div class="admin-menu-divider"></div>


        <button
            type="button"
            class="admin-menu-item admin-logout"
            onclick="adminLogout()">

            <i class="bi bi-box-arrow-right"></i>

            <span>
                <strong>Log Out</strong>
                <small>Sign out from admin account</small>
            </span>

        </button>

    `;


    document.body.appendChild(
        adminMenuElement
    );


    updatePendingSchemeBadge();

}


/* =========================================================
   TOGGLE ADMIN MENU
   ========================================================= */

function toggleAdminMenu() {

    const session =
        getSession();


    if (
        !session ||
        session.role !== "admin"
    ) {

        return;

    }


    createAdminMenu();


    if (
        adminMenuElement.classList.contains(
            "show"
        )
    ) {

        closeAdminMenu();

    } else {

        positionAdminMenu();

        adminMenuElement.classList.add(
            "show"
        );

        updatePendingSchemeBadge();

    }

}


/* =========================================================
   POSITION ADMIN MENU
   ========================================================= */

function positionAdminMenu() {

    const loginBtn =
        document.getElementById(
            "loginTrigger"
        );

    if (
        !loginBtn ||
        !adminMenuElement
    ) {

        return;

    }


    const rect =
        loginBtn.getBoundingClientRect();


    adminMenuElement.style.top =
        `${rect.bottom + 10}px`;

    adminMenuElement.style.right =
        `${window.innerWidth - rect.right}px`;

}


/* =========================================================
   CLOSE ADMIN MENU
   ========================================================= */

function closeAdminMenu() {

    if (adminMenuElement) {

        adminMenuElement.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   ADMIN LOGOUT
   ========================================================= */

function adminLogout() {

    if (
        !confirm(
            "Are you sure you want to log out from the Platform Admin account?"
        )
    ) {

        return;

    }


    logoutUser();

}


/* =========================================================
   CLOSE MENU WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const loginBtn =
            document.getElementById(
                "loginTrigger"
            );


        if (
            adminMenuElement &&
            !adminMenuElement.contains(event.target) &&
            event.target !== loginBtn
        ) {

            closeAdminMenu();

        }

    }
);

/* =========================================================
   ADMIN SCHEME STORAGE
   ========================================================= */

function getAdminAddedSchemes() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_adminSchemes"
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Unable to read admin schemes:",
            error
        );

        return [];

    }

}


function saveAdminAddedSchemes(data) {

    localStorage.setItem(
        "oneScheme_adminSchemes",
        JSON.stringify(data)
    );

}


/* =========================================================
   REMOVED SCHEMES
   ========================================================= */

function getRemovedSchemes() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_removedSchemes"
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveRemovedSchemes(data) {

    localStorage.setItem(
        "oneScheme_removedSchemes",
        JSON.stringify(data)
    );

}


/* =========================================================
   GET ALL ADMIN-MANAGED SCHEMES
   ========================================================= */

function getAdminManagedSchemes() {

    const baseSchemes =
        typeof schemes !== "undefined"
            ? schemes
            : [];


    const addedSchemes =
        getAdminAddedSchemes();


    const removed =
        getRemovedSchemes()
            .map(id => Number(id));


    return [
        ...baseSchemes,
        ...addedSchemes
    ].filter(
        scheme =>
            !removed.includes(
                Number(scheme.id)
            )
    );

}


/* =========================================================
   OPEN MANAGE SCHEMES
   ========================================================= */

function openManageSchemes() {

    closeAdminMenu();


    const session =
        getSession();


    if (
        !session ||
        session.role !== "admin"
    ) {

        alert(
            "Only Platform Admin can access Manage Schemes."
        );

        return;

    }


    const schemesList =
        getAdminManagedSchemes();


    let html = `

        <div class="admin-panel">

            <div class="admin-panel-header">

                <div>

                    <h3>
                        <i class="bi bi-collection"></i>
                        Manage Schemes
                    </h3>

                    <p>
                        Add, view and remove platform schemes.
                    </p>

                </div>

                <button
                    type="button"
                    class="admin-close-btn"
                    onclick="closeAdminPanel()">

                    <i class="bi bi-x-lg"></i>

                </button>

            </div>


            <div class="admin-panel-actions">

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="showAddSchemeForm()">

                    <i class="bi bi-plus-circle"></i>
                    Add New Scheme

                </button>

            </div>


            <div
                id="adminSchemeList"
                class="admin-scheme-list">

    `;


    if (schemesList.length === 0) {

        html += `

            <div class="admin-empty">

                <i class="bi bi-inbox"></i>

                <h5>No Schemes Available</h5>

                <p>
                    Add a scheme to the platform.
                </p>

            </div>

        `;

    } else {

        schemesList.forEach(
            scheme => {

                html += `

                    <div
                        class="admin-scheme-card">

                        <div>

                            <span class="admin-scheme-category">
                                ${escapeAdminHTML(
                    scheme.category || "General"
                )}
                            </span>

                            <h5>
                                ${escapeAdminHTML(
                    scheme.schemeName || "Unnamed Scheme"
                )}
                            </h5>

                            <p>
                                <strong>Organization:</strong>
                                ${escapeAdminHTML(
                    scheme.organization || "Not specified"
                )}
                            </p>

                            <p>
                                <strong>Type:</strong>
                                ${escapeAdminHTML(
                    scheme.schemeType || "Not specified"
                )}
                            </p>

                        </div>


                        <button
                            type="button"
                            class="btn btn-outline-danger"
                            onclick="removeAdminScheme(${Number(scheme.id)})">

                            <i class="bi bi-trash"></i>
                            Remove

                        </button>

                    </div>

                `;

            }
        );

    }


    html += `

            </div>

        </div>

    `;


    openAdminPanel(
        "Manage Schemes",
        html
    );

}


/* =========================================================
   ADD SCHEME FORM
   ========================================================= */

function showAddSchemeForm() {

    const html = `

        <div class="admin-add-form">

            <div class="admin-panel-header">

                <div>

                    <h3>
                        <i class="bi bi-plus-circle"></i>
                        Add New Scheme
                    </h3>

                    <p>
                        Enter the scheme information.
                    </p>

                </div>

                <button
                    type="button"
                    class="admin-close-btn"
                    onclick="closeAdminPanel()">

                    <i class="bi bi-x-lg"></i>

                </button>

            </div>


            <form
                id="adminAddSchemeForm">


                <div class="row g-3">


                    <div class="col-md-6">

                        <label>
                            Scheme Name
                        </label>

                        <input
                            id="adminSchemeName"
                            class="form-control"
                            required>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Organization
                        </label>

                        <input
                            id="adminSchemeOrganization"
                            class="form-control"
                            required>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Scheme Type
                        </label>

                        <select
                            id="adminSchemeType"
                            class="form-select"
                            required>

                            <option value="">
                                Select Type
                            </option>

                            <option value="Government">
                                Government
                            </option>

                            <option value="Private">
                                Private
                            </option>

                            <option value="CSR">
                                CSR
                            </option>

                        </select>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Category
                        </label>

                        <select
                            id="adminSchemeCategory"
                            class="form-select"
                            required>

                            <option value="">
                                Select Category
                            </option>

                            <option>Education</option>
                            <option>Agriculture</option>
                            <option>Employment</option>
                            <option>Finance</option>
                            <option>Startup</option>
                            <option>Healthcare</option>
                            <option>Housing</option>
                            <option>Women</option>

                        </select>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Occupation
                        </label>

                        <input
                            id="adminSchemeOccupation"
                            class="form-control"
                            placeholder="e.g. Student">

                    </div>


                    <div class="col-md-6">

                        <label>
                            State
                        </label>

                        <input
                            id="adminSchemeState"
                            class="form-control"
                            value="All">

                    </div>


                    <div class="col-md-6">

                        <label>
                            Minimum Age
                        </label>

                        <input
                            type="number"
                            id="adminSchemeMinAge"
                            class="form-control"
                            min="0"
                            max="100"
                            value="0"
                            required>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Maximum Age
                        </label>

                        <input
                            type="number"
                            id="adminSchemeMaxAge"
                            class="form-control"
                            min="0"
                            max="100"
                            value="100"
                            required>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Gender
                        </label>

                        <select
                            id="adminSchemeGender"
                            class="form-select">

                            <option>Any</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>

                        </select>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Income Limit
                        </label>

                        <input
                            type="number"
                            id="adminSchemeIncome"
                            class="form-control"
                            min="0"
                            value="0">

                    </div>


                    <div class="col-md-6">

                        <label>
                            Benefit
                        </label>

                        <input
                            id="adminSchemeBenefit"
                            class="form-control"
                            required>

                    </div>


                    <div class="col-md-6">

                        <label>
                            Apply Mode
                        </label>

                        <select
                            id="adminSchemeApplyMode"
                            class="form-select">

                            <option>Online</option>
                            <option>Offline</option>
                            <option>Online / Offline</option>

                        </select>

                    </div>


                    <div class="col-12">

                        <label>
                            Official Website
                        </label>

                        <input
                            type="url"
                            id="adminSchemeWebsite"
                            class="form-control"
                            placeholder="https://example.com"
                            required>

                    </div>


                    <div class="col-12">

                        <label>
                            Required Documents
                        </label>

                        <textarea
                            id="adminSchemeDocuments"
                            class="form-control"
                            rows="5"
                            placeholder="Enter one document per line"
                            required></textarea>

                    </div>


                </div>


                <div
                    id="adminAddSchemeError"
                    class="text-danger mt-3"
                    style="display:none;">
                </div>


                <div class="admin-form-buttons">

                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="openManageSchemes()">

                        Cancel

                    </button>


                    <button
                        type="submit"
                        class="btn btn-primary">

                        <i class="bi bi-check-circle"></i>
                        Add Scheme

                    </button>

                </div>


            </form>

        </div>

    `;


    openAdminPanel(
        "Add Scheme",
        html
    );


    document
        .getElementById(
            "adminAddSchemeForm"
        )
        .addEventListener(
            "submit",
            handleAdminAddScheme
        );

}


/* =========================================================
   ADD SCHEME
   ========================================================= */

function handleAdminAddScheme(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "adminSchemeName"
        ).value.trim();


    const organization =
        document.getElementById(
            "adminSchemeOrganization"
        ).value.trim();


    const type =
        document.getElementById(
            "adminSchemeType"
        ).value;


    const category =
        document.getElementById(
            "adminSchemeCategory"
        ).value;


    const occupation =
        document.getElementById(
            "adminSchemeOccupation"
        ).value.trim();


    const state =
        document.getElementById(
            "adminSchemeState"
        ).value.trim() || "All";


    const minAge =
        Number(
            document.getElementById(
                "adminSchemeMinAge"
            ).value
        );


    const maxAge =
        Number(
            document.getElementById(
                "adminSchemeMaxAge"
            ).value
        );


    const gender =
        document.getElementById(
            "adminSchemeGender"
        ).value;


    const income =
        Number(
            document.getElementById(
                "adminSchemeIncome"
            ).value
        ) || 0;


    const benefit =
        document.getElementById(
            "adminSchemeBenefit"
        ).value.trim();


    const applyMode =
        document.getElementById(
            "adminSchemeApplyMode"
        ).value;


    const website =
        document.getElementById(
            "adminSchemeWebsite"
        ).value.trim();


    const documents =
        document.getElementById(
            "adminSchemeDocuments"
        ).value
            .split("\n")
            .map(doc => doc.trim())
            .filter(Boolean);


    const error =
        document.getElementById(
            "adminAddSchemeError"
        );


    if (
        !name ||
        !organization ||
        !type ||
        !category ||
        !benefit ||
        !website ||
        documents.length === 0
    ) {

        error.textContent =
            "Please fill all required fields.";

        error.style.display =
            "block";

        return;

    }


    if (
        minAge < 0 ||
        minAge > 100 ||
        maxAge < 0 ||
        maxAge > 100
    ) {

        error.textContent =
            "Age must be between 0 and 100.";

        error.style.display =
            "block";

        return;

    }


    if (minAge > maxAge) {

        error.textContent =
            "Minimum age cannot be greater than maximum age.";

        error.style.display =
            "block";

        return;

    }


    const allSchemes =
        getAdminManagedSchemes();


    const numericIds =
        allSchemes
            .map(
                scheme =>
                    Number(scheme.id)
            )
            .filter(
                id =>
                    !Number.isNaN(id)
            );


    const newId =
        numericIds.length
            ? Math.max(...numericIds) + 1
            : 1;


    const newScheme = {

        id: newId,

        schemeName: name,

        occupation:
            occupation || "Any",

        organization,

        schemeType: type,

        category,

        state,

        gender,

        minAge,

        maxAge,

        student: false,

        studentType: "Any",

        academicLevel: "Any",

        course: "Any",

        institutionType: "Any",

        incomeLimit:
            income === 0
                ? Number.MAX_SAFE_INTEGER
                : income,

        disability: false,

        disabilityPercentage: 0,

        benefit,

        applyMode,

        website,

        documents,

        verificationStatus:
            "approved",

        publishingAllowed:
            true,

        addedBy:
            "admin"

    };


    const adminSchemes =
        getAdminAddedSchemes();


    adminSchemes.push(
        newScheme
    );


    saveAdminAddedSchemes(
        adminSchemes
    );


    alert(
        "Scheme added successfully."
    );


    closeAdminPanel();


    refreshExploreIfAvailable();

}


/* =========================================================
   REMOVE SCHEME
   ========================================================= */

function removeAdminScheme(id) {

    if (
        !confirm(
            "Are you sure you want to remove this scheme?"
        )
    ) {

        return;

    }


    let removed =
        getRemovedSchemes();


    if (
        !removed.some(
            existing =>
                Number(existing) ===
                Number(id)
        )
    ) {

        removed.push(
            Number(id)
        );

    }


    saveRemovedSchemes(
        removed
    );


    /* Remove from admin-added schemes too */

    let added =
        getAdminAddedSchemes();


    added =
        added.filter(
            scheme =>
                Number(scheme.id) !==
                Number(id)
        );


    saveAdminAddedSchemes(
        added
    );


    alert(
        "Scheme removed successfully."
    );


    openManageSchemes();

    refreshExploreIfAvailable();

}


/* =========================================================
   REFRESH EXPLORE PAGE
   ========================================================= */

function refreshExploreIfAvailable() {

    if (
        typeof window.loadAdminManagedSchemes ===
        "function"
    ) {

        window.loadAdminManagedSchemes();

    }

}

/* =========================================================
   APPROVE SCHEMES
   ========================================================= */

function getProviderSchemes() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_providerSchemes"
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveProviderSchemes(data) {

    localStorage.setItem(
        "oneScheme_providerSchemes",
        JSON.stringify(data)
    );

}


/* =========================================================
   PENDING COUNT
   ========================================================= */

function updatePendingSchemeBadge() {

    const badge =
        document.getElementById(
            "pendingSchemeBadge"
        );


    if (!badge) {
        return;
    }


    const pending =
        getProviderSchemes()
            .filter(
                scheme =>
                    scheme.verificationStatus ===
                    "pending"
            );


    badge.textContent =
        pending.length;


    badge.style.display =
        pending.length > 0
            ? "inline-flex"
            : "none";

}


/* =========================================================
   OPEN APPROVE SCHEMES
   ========================================================= */

function openApproveSchemes() {

    closeAdminMenu();


    const session =
        getSession();


    if (
        !session ||
        session.role !== "admin"
    ) {

        alert(
            "Only Platform Admin can access Approve Schemes."
        );

        return;

    }


    const providerSchemes =
        getProviderSchemes();


    const pendingSchemes =
        providerSchemes.filter(
            scheme =>
                scheme.verificationStatus ===
                "pending"
        );


    let html = `

        <div class="admin-panel">

            <div class="admin-panel-header">

                <div>

                    <h3>
                        <i class="bi bi-check2-circle"></i>
                        Approve Schemes
                    </h3>

                    <p>
                        Review schemes submitted by Scheme Providers.
                    </p>

                </div>


                <button
                    type="button"
                    class="admin-close-btn"
                    onclick="closeAdminPanel()">

                    <i class="bi bi-x-lg"></i>

                </button>

            </div>


            <div class="provider-approval-list">

    `;


    if (pendingSchemes.length === 0) {

        html += `

            <div class="admin-empty">

                <i class="bi bi-check-circle"></i>

                <h5>No Pending Schemes</h5>

                <p>
                    There are currently no scheme provider submissions waiting for verification.
                </p>

            </div>

        `;

    } else {

        pendingSchemes.forEach(
            scheme => {

                const provider =
                    scheme.providerOrganization
                        ? scheme.providerOrganization
                        : {};


                html += `

                    <div
                        class="provider-approval-card">

                        <div class="approval-card-header">

                            <div>

                                <span class="admin-scheme-category">
                                    ${escapeAdminHTML(
                    scheme.category || "General"
                )}
                                </span>

                                <h4>
                                    ${escapeAdminHTML(
                    scheme.schemeName || "Unnamed Scheme"
                )}
                                </h4>

                            </div>

                            <span class="approval-pending">
                                <i class="bi bi-hourglass-split"></i>
                                Pending
                            </span>

                        </div>


                        <div class="approval-details">

                            <div>
                                <strong>Organization</strong>
                                <span>
                                    ${escapeAdminHTML(
                    scheme.organization || provider.organization || "Not specified"
                )}
                                </span>
                            </div>


                            <div>
                                <strong>Organization Type</strong>
                                <span>
                                    ${escapeAdminHTML(
                    provider.organizationType || "Not specified"
                )}
                                </span>
                            </div>


                            <div>
                                <strong>Scheme Type</strong>
                                <span>
                                    ${escapeAdminHTML(
                    scheme.schemeType || "Not specified"
                )}
                                </span>
                            </div>


                            <div>
                                <strong>Occupation</strong>
                                <span>
                                    ${escapeAdminHTML(
                    scheme.occupation || "Any"
                )}
                                </span>
                            </div>


                            <div>
                                <strong>Age</strong>
                                <span>
                                    ${scheme.minAge ?? 0}
                                    -
                                    ${scheme.maxAge ?? 100}
                                </span>
                            </div>


                            <div>
                                <strong>Benefit</strong>
                                <span>
                                    ${escapeAdminHTML(
                    scheme.benefit || "Not specified"
                )}
                                </span>
                            </div>


                            <div>
                                <strong>State</strong>
                                <span>
                                    ${escapeAdminHTML(
                    scheme.state || "All"
                )}
                                </span>
                            </div>


                            <div>
                                <strong>Website</strong>
                                <span>
                                    ${escapeAdminHTML(
                    scheme.website || "Not specified"
                )}
                                </span>
                            </div>

                        </div>


                        <div class="approval-actions">

                            <button
                                type="button"
                                class="btn btn-success"
                                onclick="approveProviderScheme(${Number(scheme.id)})">

                                <i class="bi bi-check-lg"></i>
                                Approve

                            </button>


                            <button
                                type="button"
                                class="btn btn-outline-danger"
                                onclick="rejectProviderScheme(${Number(scheme.id)})">

                                <i class="bi bi-x-lg"></i>
                                Reject

                            </button>

                        </div>

                    </div>

                `;

            }
        );

    }


    html += `

            </div>

        </div>

    `;


    openAdminPanel(
        "Approve Schemes",
        html
    );

}


/* =========================================================
   APPROVE PROVIDER SCHEME
   ========================================================= */

function approveProviderScheme(id) {

    let providerSchemes =
        getProviderSchemes();


    const index =
        providerSchemes.findIndex(
            scheme =>
                Number(scheme.id) ===
                Number(id)
        );


    if (index === -1) {

        alert(
            "Scheme not found."
        );

        return;

    }


    const scheme =
        providerSchemes[index];


    scheme.verificationStatus =
        "approved";


    scheme.publishingAllowed =
        true;


    scheme.approvedBy =
        "Platform Admin";


    scheme.approvedAt =
        new Date().toISOString();


    providerSchemes[index] =
        scheme;


    saveProviderSchemes(
        providerSchemes
    );


    /* Add to approved schemes */

    let approved =
        getApprovedSchemes();


    approved =
        approved.filter(
            existing =>
                Number(existing.id) !==
                Number(scheme.id)
        );


    approved.push(
        scheme
    );


    saveApprovedSchemes(
        approved
    );


    alert(
        "Scheme approved successfully. It is now available on the platform."
    );


    updatePendingSchemeBadge();

    openApproveSchemes();

    refreshExploreIfAvailable();

}


/* =========================================================
   APPROVED SCHEMES STORAGE
   ========================================================= */

function getApprovedSchemes() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_approvedSchemes"
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveApprovedSchemes(data) {

    localStorage.setItem(
        "oneScheme_approvedSchemes",
        JSON.stringify(data)
    );

}


/* =========================================================
   REJECT PROVIDER SCHEME
   ========================================================= */

function rejectProviderScheme(id) {

    if (
        !confirm(
            "Reject this scheme submission?"
        )
    ) {

        return;

    }


    let providerSchemes =
        getProviderSchemes();


    const index =
        providerSchemes.findIndex(
            scheme =>
                Number(scheme.id) ===
                Number(id)
        );


    if (index === -1) {
        return;
    }


    providerSchemes[index]
        .verificationStatus =
        "rejected";


    providerSchemes[index]
        .publishingAllowed =
        false;


    providerSchemes[index]
        .rejectedBy =
        "Platform Admin";


    providerSchemes[index]
        .rejectedAt =
        new Date().toISOString();


    saveProviderSchemes(
        providerSchemes
    );


    /* Remove from approved if previously present */

    let approved =
        getApprovedSchemes();


    approved =
        approved.filter(
            scheme =>
                Number(scheme.id) !==
                Number(id)
        );


    saveApprovedSchemes(
        approved
    );


    alert(
        "Scheme rejected."
    );


    updatePendingSchemeBadge();

    openApproveSchemes();

    refreshExploreIfAvailable();

}


/* =========================================================
   ADMIN PANEL MODAL
   ========================================================= */

function openAdminPanel(title, content) {

    closeAdminPanel();


    const overlay =
        document.createElement("div");


    overlay.id =
        "adminPanelOverlay";


    overlay.innerHTML = `

        <div
            class="admin-panel-window">

            ${content}

        </div>

    `;


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                closeAdminPanel();

            }

        }
    );


    document.body.appendChild(
        overlay
    );


    document.body.style.overflow =
        "hidden";

}


function closeAdminPanel() {

    const overlay =
        document.getElementById(
            "adminPanelOverlay"
        );


    if (overlay) {

        overlay.remove();

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeAdminHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateNavbarForSession();

        updatePendingSchemeBadge();

    }
);


/* =========================================================
   MODAL
========================================================= */

let authModalInstance = null;


function openAuthModal() {

    resetAuthModal();

    const modalEl =
        document.getElementById(
            "authModal"
        );

    if (!modalEl) {
        console.error(
            "authModal not found."
        );
        return;
    }

    if (
        typeof bootstrap === "undefined" ||
        !bootstrap.Modal
    ) {

        console.error(
            "Bootstrap Modal is not loaded."
        );

        return;
    }

    authModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            modalEl
        );

    authModalInstance.show();
}


/* =========================================================
   ERROR HELPERS
========================================================= */

function showError(id, message) {

    const el =
        document.getElementById(id);

    if (!el) {
        console.error(
            "Error element not found:",
            id
        );
        return;
    }

    el.textContent = message;
    el.style.display = "block";
}


function clearError(id) {

    const el =
        document.getElementById(id);

    if (!el) {
        return;
    }

    el.textContent = "";
    el.style.display = "none";
}


/* =========================================================
   USER TABS
========================================================= */

function switchUserTab(tab) {

    $all(".auth-tab-btn").forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.tab === tab
        );
    });


    $all(".auth-panel").forEach(panel => {

        panel.classList.toggle(
            "active",
            panel.dataset.panel === tab
        );
    });
}


function togglePasswordVisibility(
    inputId,
    btn
) {

    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    const isPassword =
        input.type === "password";

    input.type =
        isPassword
            ? "text"
            : "password";

    if (btn) {

        btn.innerHTML =
            isPassword
                ? '<i class="bi bi-eye-slash"></i>'
                : '<i class="bi bi-eye"></i>';
    }
}


function toggleOptionalFields() {

    const box =
        document.getElementById(
            "optionalProfileFields"
        );

    const btn =
        document.getElementById(
            "optionalToggleBtn"
        );

    if (!box || !btn) {
        return;
    }

    const isOpen =
        box.classList.toggle(
            "active"
        );

    btn.innerHTML =
        isOpen
            ? '<i class="bi bi-dash-circle"></i> Hide optional profile information'
            : '<i class="bi bi-plus-circle"></i> Add optional profile information';
}


/* =========================================================
   PROVIDER ORGANIZATION TYPE
========================================================= */

function selectOrgType(
    kind,
    cardEl
) {

    $all(".orgtype-card").forEach(card => {
        card.classList.remove("selected");
    });

    if (cardEl) {
        cardEl.classList.add("selected");
    }

    authState.providerOrgKind =
        kind;

    const otherWrap =
        document.getElementById(
            "otherOrgTypeWrap"
        );


    if (kind === "other") {

        if (otherWrap) {
            otherWrap.classList.add(
                "active"
            );
        }

        return;
    }


    if (otherWrap) {
        otherWrap.classList.remove(
            "active"
        );
    }


    if (kind === "gov") {

        goToStep(
            "provider-form-gov"
        );

        return;
    }


    if (kind === "private") {

        goToStep(
            "provider-form-private"
        );

        return;
    }


    if (kind === "ngo") {

        const dropdownWrap =
            document.getElementById(
                "ngoOrgTypeDropdownWrap"
            );

        const customWrap =
            document.getElementById(
                "ngoOrgTypeCustomWrap"
            );

        if (dropdownWrap) {
            dropdownWrap.style.display =
                "block";
        }

        if (customWrap) {
            customWrap.style.display =
                "none";
        }

        goToStep(
            "provider-form-ngo"
        );
    }
}


function continueWithCustomOrgType() {

    const input =
        document.getElementById(
            "customOrgTypeInput"
        );

    if (!input) {
        return;
    }

    const val =
        input.value.trim();

    if (!val) {

        showError(
            "customOrgTypeError",
            "Please specify your organization type."
        );

        return;
    }

    clearError(
        "customOrgTypeError"
    );

    authState.providerOrgKind =
        "other";

    authState.providerCustomType =
        val;


    const dropdownWrap =
        document.getElementById(
            "ngoOrgTypeDropdownWrap"
        );

    const customWrap =
        document.getElementById(
            "ngoOrgTypeCustomWrap"
        );

    const customValue =
        document.getElementById(
            "ngoOrgTypeCustomValue"
        );


    if (dropdownWrap) {
        dropdownWrap.style.display =
            "none";
    }

    if (customWrap) {
        customWrap.style.display =
            "block";
    }

    if (customValue) {
        customValue.value = val;
    }

    goToStep(
        "provider-form-ngo"
    );
}


function handleNgoOrgTypeChange(
    selectEl
) {

    if (!selectEl) {
        return;
    }

    const customField =
        document.getElementById(
            "ngoOtherTypeInput"
        );

    if (!customField) {
        return;
    }

    if (
        selectEl.value === "Other"
    ) {

        customField.style.display =
            "block";

        customField.required =
            true;

    } else {

        customField.style.display =
            "none";

        customField.required =
            false;

        customField.value = "";
    }
}


/* =========================================================
   USER LOGIN
========================================================= */

function handleSignIn(e) {

    e.preventDefault();

    clearError(
        "signInError"
    );

    const idElement =
        document.getElementById(
            "signInId"
        );

    const passwordElement =
        document.getElementById(
            "signInPassword"
        );

    if (
        !idElement ||
        !passwordElement
    ) {

        showError(
            "signInError",
            "Login form is incomplete."
        );

        return;
    }

    const idVal =
        idElement.value
            .trim();

    const pwVal =
        passwordElement.value;


    const users =
        getUsers();


    const match =
        users.find(user => {

            return (
                user.email &&
                user.email.toLowerCase() ===
                idVal.toLowerCase() &&
                user.password ===
                pwVal
            );
        });


    if (!match) {

        showError(
            "signInError",
            "We couldn't find an account with those details. Check your Email/Mobile and Password, or create a new account."
        );

        return;
    }


    setSession({

        name:
            match.name,

        email:
            match.email,

        role:
            "user"
    });


    updateNavbarForSession();


    if (authModalInstance) {
        authModalInstance.hide();
    }
}


/* =========================================================
   CREATE USER ACCOUNT
========================================================= */

function handleCreateAccount(e) {

    e.preventDefault();

    clearError(
        "createAccountError"
    );


    const nameElement =
        document.getElementById(
            "caName"
        );

    const emailElement =
        document.getElementById(
            "caEmail"
        );

    const passwordElement =
        document.getElementById(
            "caPassword"
        );

    const stateElement =
        document.getElementById(
            "caState"
        );


    if (
        !nameElement ||
        !emailElement ||
        !passwordElement ||
        !stateElement
    ) {

        showError(
            "createAccountError",
            "Registration form is incomplete."
        );

        return;
    }


    const name =
        nameElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;

    const state =
        stateElement.value;


    if (
        !name ||
        !email ||
        !password ||
        !state
    ) {

        showError(
            "createAccountError",
            "Please fill in all required fields."
        );

        return;
    }


    const users =
        getUsers();


    if (
        users.some(
            user =>
                user.email &&
                user.email.toLowerCase() ===
                email.toLowerCase()
        )
    ) {

        showError(
            "createAccountError",
            "An account with this Email/Mobile already exists. Try signing in instead."
        );

        return;
    }


    const dobElement =
        document.getElementById(
            "caDob"
        );

    const genderElement =
        document.getElementById(
            "caGender"
        );

    const occupationElement =
        document.getElementById(
            "caOccupation"
        );


    const newUser = {

        name:
            name,

        email:
            email,

        password:
            password,

        state:
            state,

        dob:
            dobElement
                ? dobElement.value
                : "",

        gender:
            genderElement
                ? genderElement.value
                : "",

        occupation:
            occupationElement
                ? occupationElement.value
                : ""
    };


    users.push(
        newUser
    );

    saveUsers(
        users
    );


    setSession({

        name:
            newUser.name,

        email:
            newUser.email,

        role:
            "user"
    });


    updateNavbarForSession();


    if (authModalInstance) {
        authModalInstance.hide();
    }
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function handleForgotPassword(e) {

    e.preventDefault();

    const input =
        document.getElementById(
            "forgotIdInput"
        );

    const msgBox =
        document.getElementById(
            "forgotSuccessMsg"
        );

    const form =
        document.getElementById(
            "forgotForm"
        );


    if (!input) {
        return;
    }


    const val =
        input.value.trim();


    if (!val) {

        showError(
            "forgotError",
            "Please enter your registered Email or Mobile number."
        );

        return;
    }


    clearError(
        "forgotError"
    );


    if (msgBox) {
        msgBox.style.display =
            "block";
    }

    if (form) {
        form.style.display =
            "none";
    }
}


/* =========================================================
   ORGANIZATION FORM
   -> SCHEME ATTRIBUTES
========================================================= */

function goToSchemeAttributes(
    kind
) {

    let form = null;

    let orgName = "";

    let organization = "";

    let organizationType = "";

    let state = "";

    let website = "";

    let email = "";


    /* -----------------------------------------------------
       GOVERNMENT
    ----------------------------------------------------- */

    if (kind === "gov") {

        form =
            document.getElementById(
                "govForm"
            );

        if (!form) {

            console.error(
                "govForm not found."
            );

            return;
        }


        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        const orgNameElement =
            document.getElementById(
                "govOrgName"
            );

        const stateElement =
            document.getElementById(
                "govState"
            );

        const websiteElement =
            document.getElementById(
                "govWebsite"
            );

        const emailElement =
            document.getElementById(
                "govEmail"
            );


        orgName =
            orgNameElement
                ? orgNameElement.value.trim()
                : "";

        organization =
            orgName;

        organizationType =
            "Government";

        state =
            stateElement
                ? stateElement.value
                : "";

        website =
            websiteElement
                ? websiteElement.value.trim()
                : "";

        email =
            emailElement
                ? emailElement.value.trim()
                : "";
    }


    /* -----------------------------------------------------
       PRIVATE
    ----------------------------------------------------- */

    else if (
        kind === "private"
    ) {

        form =
            document.getElementById(
                "privateForm"
            );

        if (!form) {

            console.error(
                "privateForm not found."
            );

            return;
        }


        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        const orgNameElement =
            document.getElementById(
                "privOrgName"
            );

        const orgTypeElement =
            document.getElementById(
                "privOrgType"
            );

        const websiteElement =
            document.getElementById(
                "privWebsite"
            );

        const emailElement =
            document.getElementById(
                "privEmail"
            );


        orgName =
            orgNameElement
                ? orgNameElement.value.trim()
                : "";

        organization =
            orgName;

        organizationType =
            orgTypeElement
                ? orgTypeElement.value.trim()
                : "";

        website =
            websiteElement
                ? websiteElement.value.trim()
                : "";

        email =
            emailElement
                ? emailElement.value.trim()
                : "";
    }


    /* -----------------------------------------------------
       NGO / OTHER
    ----------------------------------------------------- */

    else if (
        kind === "ngo" ||
        kind === "other"
    ) {

        form =
            document.getElementById(
                "ngoForm"
            );

        if (!form) {

            console.error(
                "ngoForm not found."
            );

            return;
        }


        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        const orgNameElement =
            document.getElementById(
                "ngoOrgName"
            );

        const ngoTypeElement =
            document.getElementById(
                "ngoOrgType"
            );

        const ngoOtherTypeElement =
            document.getElementById(
                "ngoOtherTypeInput"
            );

        const customValueElement =
            document.getElementById(
                "ngoOrgTypeCustomValue"
            );

        const websiteElement =
            document.getElementById(
                "ngoWebsite"
            );

        const emailElement =
            document.getElementById(
                "ngoEmail"
            );


        orgName =
            orgNameElement
                ? orgNameElement.value.trim()
                : "";

        organization =
            orgName;


        if (kind === "other") {

            organizationType =
                authState.providerCustomType ||
                (
                    customValueElement
                        ? customValueElement.value.trim()
                        : ""
                );

        } else {

            organizationType =
                ngoTypeElement
                    ? ngoTypeElement.value
                    : "";


            if (
                organizationType === "Other" &&
                ngoOtherTypeElement &&
                ngoOtherTypeElement.value.trim()
            ) {

                organizationType =
                    ngoOtherTypeElement
                        .value
                        .trim();
            }
        }


        website =
            websiteElement
                ? websiteElement.value.trim()
                : "";

        email =
            emailElement
                ? emailElement.value.trim()
                : "";
    }


    /* -----------------------------------------------------
       SAVE ORGANIZATION DATA
    ----------------------------------------------------- */

    authState.providerOrganization = {

        organization:
            organization,

        organizationType:
            organizationType,

        state:
            state,

        website:
            website,

        email:
            email,

        kind:
            kind
    };


    /* -----------------------------------------------------
       PREFILL SCHEME ORGANIZATION
    ----------------------------------------------------- */

    const organizationInput =
        document.getElementById(
            "schemeOrganizationInput"
        );

    if (organizationInput) {

        organizationInput.value =
            organization;
    }


    /* -----------------------------------------------------
       PREFILL SCHEME TYPE
    ----------------------------------------------------- */

    const schemeTypeInput =
        document.getElementById(
            "schemeTypeInput"
        );

    if (schemeTypeInput) {

        const values =
            Array.from(
                schemeTypeInput.options
            ).map(
                option => option.value
            );


        if (
            kind === "gov" &&
            values.includes("Government")
        ) {

            schemeTypeInput.value =
                "Government";
        }

        else if (
            kind === "private" &&
            values.includes("Private")
        ) {

            schemeTypeInput.value =
                "Private";
        }

        else if (
            (
                kind === "ngo" ||
                kind === "other"
            ) &&
            values.includes("CSR")
        ) {

            schemeTypeInput.value =
                "CSR";
        }
    }


    /* -----------------------------------------------------
       GO TO SCHEME ATTRIBUTES
    ----------------------------------------------------- */

    goToStep(
        "provider-scheme"
    );
}


/* =========================================================
   SUBMIT SCHEME ATTRIBUTES
========================================================= */

function handleProviderSchemeSubmit(
    e
) {

    e.preventDefault();

    clearError(
        "schemeFormError"
    );


    const form =
        document.getElementById(
            "providerSchemeForm"
        );


    if (!form) {

        console.error(
            "ERROR: providerSchemeForm not found."
        );

        return;
    }


    /* =====================================================
       SAFE VALUE HELPER
    ===================================================== */

    function getValue(
        id,
        defaultValue = ""
    ) {

        const element =
            document.getElementById(id);


        if (!element) {

            console.error(
                "Missing element:",
                id
            );

            return defaultValue;
        }


        const rawValue =
            element.value;


        return (
            rawValue === undefined ||
            rawValue === null
        )
            ? defaultValue
            : String(rawValue).trim();
    }


    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    const schemeName =
        getValue(
            "schemeNameInput"
        );


    const organization =
        authState.providerOrganization &&
            authState.providerOrganization.organization
            ? String(
                authState.providerOrganization.organization
            ).trim()
            : getValue(
                "schemeOrganizationInput",
                ""
            );


    const schemeType =
        getValue(
            "schemeTypeInput"
        );


    const category =
        getValue(
            "schemeCategoryInput"
        );


    const occupation =
        getValue(
            "schemeOccupationInput"
        );


    const state =
        getValue(
            "schemeStateInput"
        );


    const gender =
        getValue(
            "schemeGenderInput"
        );


    /* =====================================================
       REQUIRED BASIC VALIDATION
    ===================================================== */

    if (
        !schemeName ||
        !organization ||
        !schemeType ||
        !category ||
        !occupation ||
        !state ||
        !gender
    ) {

        showError(
            "schemeFormError",
            "Please fill all required scheme information."
        );

        return;
    }


    /* =====================================================
       AGE
    ===================================================== */

    const minAge =
        Number(
            getValue(
                "schemeMinAgeInput",
                "0"
            )
        );


    const maxAge =
        Number(
            getValue(
                "schemeMaxAgeInput",
                "100"
            )
        );


    if (
        minAge < 0 ||
        minAge > 100
    ) {

        showError(
            "schemeFormError",
            "Minimum age must be between 0 and 100."
        );

        return;
    }


    if (
        maxAge < 0 ||
        maxAge > 100
    ) {

        showError(
            "schemeFormError",
            "Maximum age must be between 0 and 100."
        );

        return;
    }


    if (
        minAge > maxAge
    ) {

        showError(
            "schemeFormError",
            "Minimum age cannot be greater than maximum age."
        );

        return;
    }


    /* =====================================================
       INCOME
    ===================================================== */

    const incomeValue =
        Number(
            getValue(
                "schemeIncomeInput",
                "0"
            )
        );


    if (
        incomeValue < 0
    ) {

        showError(
            "schemeFormError",
            "Income cannot be negative."
        );

        return;
    }


    const incomeLimit =
        incomeValue === 0
            ? Number.MAX_SAFE_INTEGER
            : incomeValue;


    /* =====================================================
       STUDENT ELIGIBILITY
    ===================================================== */

    const student =
        getValue(
            "schemeStudentInput"
        ) === "true";


    let studentType =
        "Any";

    let academicLevel =
        "Any";

    let course =
        "Any";

    let institutionType =
        "Any";


    if (student) {

        studentType =
            getValue(
                "schemeStudentTypeInput",
                "Any"
            );


        academicLevel =
            getValue(
                "schemeAcademicLevelInput",
                "Any"
            );


        course =
            getValue(
                "schemeCourseInput",
                "Any"
            ) || "Any";


        institutionType =
            getValue(
                "schemeInstitutionInput",
                "Any"
            ) || "Any";
    }


    /* =====================================================
       DISABILITY
    ===================================================== */

    const disability =
        getValue(
            "schemeDisabilityInput"
        ) === "true";


    let disabilityPercentage =
        0;


    if (disability) {

        disabilityPercentage =
            Number(
                getValue(
                    "schemeDisabilityPercentageInput",
                    "0"
                )
            );


        if (
            disabilityPercentage < 0 ||
            disabilityPercentage > 100
        ) {

            showError(
                "schemeFormError",
                "Disability percentage must be between 0 and 100."
            );

            return;
        }

    } else {

        disabilityPercentage =
            0;
    }


    /* =====================================================
       BENEFIT / APPLICATION
    ===================================================== */

    const benefit =
        getValue(
            "schemeBenefitInput"
        );


    const applyMode =
        getValue(
            "schemeApplyModeInput"
        );


    const website =
        getValue(
            "schemeWebsiteInput"
        );


    const deadline =
        getValue(
            "schemeDeadlineInput"
        );


    if (
        !benefit ||
        !applyMode ||
        !website
    ) {

        showError(
            "schemeFormError",
            "Please fill all required benefit and application details."
        );

        return;
    }


    /* =====================================================
       DOCUMENTS
    ===================================================== */

    const documentsText =
        getValue(
            "schemeDocumentsInput"
        );


    const documents =
        documentsText
            .split("\n")
            .map(
                doc => doc.trim()
            )
            .filter(
                doc => doc.length > 0
            );


    if (
        documents.length === 0
    ) {

        showError(
            "schemeFormError",
            "Please enter at least one required document."
        );

        return;
    }


    /* =====================================================
       READ EXISTING PROVIDER SCHEMES
    ===================================================== */

    let existingProviderSchemes =
        [];


    try {

        existingProviderSchemes =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_providerSchemes"
                ) || "[]"
            );


        if (
            !Array.isArray(
                existingProviderSchemes
            )
        ) {

            existingProviderSchemes =
                [];
        }

    } catch (error) {

        console.error(
            "Error reading provider schemes:",
            error
        );

        existingProviderSchemes =
            [];
    }


    /* =====================================================
       GENERATE NEW ID
    ===================================================== */

    const existingIds =
        typeof schemes !== "undefined" &&
            Array.isArray(schemes)
            ? schemes
                .map(
                    scheme =>
                        Number(scheme.id)
                )
                .filter(
                    id =>
                        !Number.isNaN(id)
                )
            : [];


    const providerIds =
        existingProviderSchemes
            .map(
                scheme =>
                    Number(scheme.id)
            )
            .filter(
                id =>
                    !Number.isNaN(id)
            );


    const allIds =
        [
            ...existingIds,
            ...providerIds
        ];


    const newId =
        allIds.length > 0
            ? Math.max(...allIds) + 1
            : 1;


    /* =====================================================
       CREATE SCHEME OBJECT
    ===================================================== */

    const newScheme = {

        id:
            newId,

        schemeName:
            schemeName,

        occupation:
            occupation,

        organization:
            organization,

        schemeType:
            schemeType,

        category:
            category,

        state:
            state || "All",

        gender:
            gender,

        minAge:
            minAge,

        maxAge:
            maxAge,

        student:
            student,

        studentType:
            studentType,

        academicLevel:
            academicLevel,

        course:
            course,

        institutionType:
            institutionType,

        incomeLimit:
            incomeLimit,

        disability:
            disability,

        disabilityPercentage:
            disabilityPercentage,

        benefit:
            benefit,

        applyMode:
            applyMode,

        website:
            website,

        deadline:
            deadline,

        documents:
            documents,


        /* =================================================
           ELIGIBILITY CRITERIA
        ================================================= */

        eligibilityCriteria: {

            occupation:
                occupation,

            student:
                student,

            studentType:
                studentType,

            academicLevel:
                academicLevel,

            course:
                course,

            institutionType:
                institutionType,

            minAge:
                minAge,

            maxAge:
                maxAge,

            incomeLimit:
                incomeLimit,

            gender:
                gender,

            state:
                state || "All",

            disability:
                disability,

            disabilityPercentage:
                disabilityPercentage
        },


        /* =================================================
           PROVIDER ORGANIZATION
        ================================================= */

        providerOrganization:
            authState.providerOrganization ||
            null,


        /* =================================================
           VERIFICATION
        ================================================= */

        verificationStatus:
            "pending",

        publishingAllowed:
            false
    };


    /* =====================================================
       SAVE SCHEME
    ===================================================== */

    existingProviderSchemes.push(
        newScheme
    );


    localStorage.setItem(
        "oneScheme_providerSchemes",
        JSON.stringify(
            existingProviderSchemes
        )
    );


    /* =====================================================
       SHOW VERIFICATION PENDING
    ===================================================== */

    showProviderPending(
        organization,
        authState.providerOrgKind
    );


    console.log(
        "Provider scheme submitted successfully:",
        newScheme
    );
}


/* =========================================================
   VERIFICATION PENDING
========================================================= */

function showProviderPending(
    orgName,
    kind
) {

    const labelMap = {

        gov:
            "Government Organization",

        private:
            "Private Organization",

        ngo:
            "NGO / Other Organization",

        other:
            authState.providerCustomType ||
            "Other Organization"
    };


    const summary =
        document.getElementById(
            "pendingOrgSummary"
        );


    if (summary) {

        summary.textContent =
            (
                orgName
                    ? orgName + " — "
                    : ""
            ) +
            (
                labelMap[kind] ||
                labelMap[
                authState.providerOrgKind
                ] ||
                "Organization"
            );
    }


    goToStep(
        "provider-pending"
    );
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

const DEMO_ADMIN = {

    id:
        "admin@onescheme.gov.in",

    password:
        "Admin@123"
};


function handleAdminLogin(e) {

    e.preventDefault();

    clearError(
        "adminLoginError"
    );


    const idElement =
        document.getElementById(
            "adminId"
        );

    const passwordElement =
        document.getElementById(
            "adminPassword"
        );


    if (
        !idElement ||
        !passwordElement
    ) {

        showError(
            "adminLoginError",
            "Admin login form is incomplete."
        );

        return;
    }


    const idVal =
        idElement.value.trim();

    const pwVal =
        passwordElement.value;


    if (
        idVal.toLowerCase() ===
        DEMO_ADMIN.id &&
        pwVal ===
        DEMO_ADMIN.password
    ) {

        setSession({

            name:
                "Platform Admin",

            email:
                idVal,

            role:
                "admin"
        });


        updateNavbarForSession();


        if (authModalInstance) {
            authModalInstance.hide();
        }

        return;
    }


    showError(
        "adminLoginError",
        "Invalid Admin ID or Password. Platform Admin accounts are provisioned internally — contact the platform team if you require access."
    );
}


/* =========================================================
   SCHEME ATTRIBUTE CONTROLS
========================================================= */

function setupSchemeAttributeControls() {

    const minAgeInput =
        document.getElementById(
            "schemeMinAgeInput"
        );


    const maxAgeInput =
        document.getElementById(
            "schemeMaxAgeInput"
        );


    const studentInput =
        document.getElementById(
            "schemeStudentInput"
        );


    const studentFields =
        document.getElementById(
            "studentEligibilityFields"
        );


    const disabilityInput =
        document.getElementById(
            "schemeDisabilityInput"
        );


    const disabilityFields =
        document.getElementById(
            "disabilityPercentageFields"
        );


    const disabilityPercentageInput =
        document.getElementById(
            "schemeDisabilityPercentageInput"
        );


    /* =====================================================
       AGE LIMIT
       0 - 100
    ===================================================== */

    function restrictAgeInput(
        input
    ) {

        if (!input) {
            return;
        }


        input.setAttribute(
            "min",
            "0"
        );

        input.setAttribute(
            "max",
            "100"
        );


        input.addEventListener(
            "input",
            function () {

                let value =
                    this.value.replace(
                        /[^0-9]/g,
                        ""
                    );


                if (value === "") {

                    this.value =
                        "";

                    return;
                }


                let number =
                    Number(value);


                if (number > 100) {

                    number =
                        100;
                }


                if (number < 0) {

                    number =
                        0;
                }


                this.value =
                    number;
            }
        );
    }


    restrictAgeInput(
        minAgeInput
    );

    restrictAgeInput(
        maxAgeInput
    );


    /* =====================================================
       MIN / MAX AGE RELATION
    ===================================================== */

    if (
        minAgeInput &&
        maxAgeInput
    ) {

        minAgeInput.addEventListener(
            "input",
            function () {

                if (
                    this.value === ""
                ) {
                    return;
                }


                let min =
                    Number(
                        this.value
                    );


                if (min > 100) {

                    min =
                        100;

                    this.value =
                        "100";
                }


                if (
                    maxAgeInput.value !== "" &&
                    Number(
                        maxAgeInput.value
                    ) < min
                ) {

                    maxAgeInput.value =
                        min;
                }
            }
        );


        maxAgeInput.addEventListener(
            "input",
            function () {

                if (
                    this.value === ""
                ) {
                    return;
                }


                let max =
                    Number(
                        this.value
                    );


                if (max > 100) {

                    max =
                        100;

                    this.value =
                        "100";
                }


                if (
                    minAgeInput.value !== "" &&
                    Number(
                        minAgeInput.value
                    ) > max
                ) {

                    minAgeInput.value =
                        max;
                }
            }
        );
    }


    /* =====================================================
       STUDENT FIELDS

       YES -> SHOW
       NO  -> HIDE + DISABLE
    ===================================================== */

    function updateStudentFields() {

        if (
            !studentInput ||
            !studentFields
        ) {
            return;
        }


        const controls =
            studentFields.querySelectorAll(
                "input, select, textarea"
            );


        const show =
            studentInput.value ===
            "true";


        studentFields.style.display =
            show
                ? "block"
                : "none";


        /*
         * IMPORTANT:
         *
         * If hidden fields have required="true",
         * browser validation can prevent submit.
         *
         * Therefore hidden student fields are disabled.
         */

        controls.forEach(
            control => {

                control.disabled =
                    !show;
            }
        );


        if (!show) {

            const studentType =
                document.getElementById(
                    "schemeStudentTypeInput"
                );


            const academicLevel =
                document.getElementById(
                    "schemeAcademicLevelInput"
                );


            const course =
                document.getElementById(
                    "schemeCourseInput"
                );


            const institution =
                document.getElementById(
                    "schemeInstitutionInput"
                );


            if (studentType) {

                studentType.value =
                    "Any";
            }


            if (academicLevel) {

                academicLevel.value =
                    "Any";
            }


            if (course) {

                course.value =
                    "";
            }


            if (institution) {

                institution.value =
                    "Any";
            }
        }
    }


    if (studentInput) {

        studentInput.addEventListener(
            "change",
            updateStudentFields
        );


        updateStudentFields();
    }


    /* =====================================================
       DISABILITY FIELDS

       YES -> SHOW
       NO  -> HIDE + DISABLE
    ===================================================== */

    function updateDisabilityFields() {

        if (
            !disabilityInput ||
            !disabilityFields
        ) {
            return;
        }


        const show =
            disabilityInput.value ===
            "true";


        disabilityFields.style.display =
            show
                ? "block"
                : "none";


        if (
            disabilityPercentageInput
        ) {

            disabilityPercentageInput.disabled =
                !show;


            if (!show) {

                disabilityPercentageInput.value =
                    "0";
            }
        }
    }


    if (disabilityInput) {

        disabilityInput.addEventListener(
            "change",
            updateDisabilityFields
        );


        updateDisabilityFields();
    }


    /* =====================================================
       DISABILITY PERCENTAGE
       0 - 100
    ===================================================== */

    if (
        disabilityPercentageInput
    ) {

        disabilityPercentageInput.setAttribute(
            "min",
            "0"
        );


        disabilityPercentageInput.setAttribute(
            "max",
            "100"
        );


        disabilityPercentageInput.addEventListener(
            "input",
            function () {

                let value =
                    this.value.replace(
                        /[^0-9]/g,
                        ""
                    );


                if (value === "") {

                    this.value =
                        "";

                    return;
                }


                let number =
                    Number(value);


                if (number > 100) {

                    number =
                        100;
                }


                if (number < 0) {

                    number =
                        0;
                }


                this.value =
                    number;
            }
        );
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* -------------------------------------------------
           STATE DROPDOWNS
        ------------------------------------------------- */

        const caState =
            document.getElementById(
                "caState"
            );

        if (caState) {

            caState.innerHTML =
                stateOptionsHtml();
        }


        const govState =
            document.getElementById(
                "govState"
            );

        if (govState) {

            govState.innerHTML =
                stateOptionsHtml();
        }


        const schemeState =
            document.getElementById(
                "schemeStateInput"
            );

        if (schemeState) {

            schemeState.innerHTML =
                stateOptionsHtml();
        }


        /* -------------------------------------------------
           SCHEME ATTRIBUTE CONTROLS
        ------------------------------------------------- */

        setupSchemeAttributeControls();


        /* -------------------------------------------------
           BACK BUTTON
        ------------------------------------------------- */

        const backBtn =
            document.getElementById(
                "authBackBtn"
            );

        if (backBtn) {

            backBtn.addEventListener(
                "click",
                goBack
            );
        }


        /* -------------------------------------------------
           AUTH MODAL
        ------------------------------------------------- */

        const authModal =
            document.getElementById(
                "authModal"
            );


        if (authModal) {

            authModal.addEventListener(
                "hidden.bs.modal",
                resetAuthModal
            );
        }


        /* -------------------------------------------------
           USER TABS
        ------------------------------------------------- */

        $all(
            ".auth-tab-btn"
        ).forEach(
            btn => {

                btn.addEventListener(
                    "click",
                    () =>
                        switchUserTab(
                            btn.dataset.tab
                        )
                );
            }
        );


        /* -------------------------------------------------
           SIGN IN
        ------------------------------------------------- */

        const signInForm =
            document.getElementById(
                "signInForm"
            );


        if (signInForm) {

            signInForm.addEventListener(
                "submit",
                handleSignIn
            );
        }


        /* -------------------------------------------------
           CREATE ACCOUNT
        ------------------------------------------------- */

        const createAccountForm =
            document.getElementById(
                "createAccountForm"
            );


        if (createAccountForm) {

            createAccountForm.addEventListener(
                "submit",
                handleCreateAccount
            );
        }


        /* -------------------------------------------------
           FORGOT PASSWORD
        ------------------------------------------------- */

        const forgotForm =
            document.getElementById(
                "forgotForm"
            );


        if (forgotForm) {

            forgotForm.addEventListener(
                "submit",
                handleForgotPassword
            );
        }


        /* =================================================
           GOVERNMENT ORGANIZATION
           DETAILS -> NEXT -> SCHEME ATTRIBUTES
        ================================================= */

        const govForm =
            document.getElementById(
                "govForm"
            );


        if (govForm) {

            govForm.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();

                    goToSchemeAttributes(
                        "gov"
                    );
                }
            );
        }


        /* =================================================
           PRIVATE ORGANIZATION
           DETAILS -> NEXT -> SCHEME ATTRIBUTES
        ================================================= */

        const privateForm =
            document.getElementById(
                "privateForm"
            );


        if (privateForm) {

            privateForm.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();

                    goToSchemeAttributes(
                        "private"
                    );
                }
            );
        }


        /* =================================================
           NGO / OTHER ORGANIZATION
           DETAILS -> NEXT -> SCHEME ATTRIBUTES
        ================================================= */

        const ngoForm =
            document.getElementById(
                "ngoForm"
            );


        if (ngoForm) {

            ngoForm.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();


                    const kind =
                        authState.providerOrgKind ===
                            "other"
                            ? "other"
                            : "ngo";


                    goToSchemeAttributes(
                        kind
                    );
                }
            );
        }


        /* =================================================
           SCHEME ATTRIBUTES
           SUBMIT -> VERIFICATION PENDING
        ================================================= */

        const providerSchemeForm =
            document.getElementById(
                "providerSchemeForm"
            );


        if (providerSchemeForm) {

            providerSchemeForm.addEventListener(
                "submit",
                handleProviderSchemeSubmit
            );
        }


        /* -------------------------------------------------
           ADMIN LOGIN
        ------------------------------------------------- */

        const adminLoginForm =
            document.getElementById(
                "adminLoginForm"
            );


        if (adminLoginForm) {

            adminLoginForm.addEventListener(
                "submit",
                handleAdminLogin
            );
        }


        /* -------------------------------------------------
           UPDATE NAVBAR
        ------------------------------------------------- */

        updateNavbarForSession();
    }
);