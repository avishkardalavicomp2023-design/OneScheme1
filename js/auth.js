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
        document.getElementById(
            "loginTrigger"
        );

    const savedNav =
        document.getElementById(
            "savedSchemesNav"
        );

    const session =
        getSession();


    /* -----------------------------------------------------
       SAVED SCHEMES VISIBILITY
    ----------------------------------------------------- */

    if (savedNav) {

        if (
            session &&
            session.role === "user"
        ) {

            savedNav.style.display = "";

        } else {

            savedNav.style.display =
                "none";
        }
    }


    /* -----------------------------------------------------
       LOGIN BUTTON
    ----------------------------------------------------- */

    if (!loginBtn) {
        return;
    }


    if (session) {

        loginBtn.classList.add(
            "is-logged-in"
        );

        const firstName =
            session.name
                ? session.name.split(" ")[0]
                : "Account";

        loginBtn.innerHTML = `
            <i class="bi bi-person-circle"></i>
            ${firstName}
        `;


        loginBtn.onclick = function () {

            if (
                confirm(
                    "Log out of your account?"
                )
            ) {

                clearSession();


                if (savedNav) {

                    savedNav.style.display =
                        "none";
                }


                loginBtn.classList.remove(
                    "is-logged-in"
                );

                loginBtn.innerHTML =
                    "Login";

                loginBtn.onclick =
                    openAuthModal;
            }
        };

    } else {

        loginBtn.classList.remove(
            "is-logged-in"
        );

        loginBtn.innerHTML =
            "Login";

        loginBtn.onclick =
            openAuthModal;
    }
}


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