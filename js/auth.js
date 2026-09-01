/* =======================================================
   AUTH MODAL LOGIC
   Front-end only demo flow. "Accounts" are simulated with
   localStorage so the Sign In / Create Account flow feels
   real. In production these calls should hit a real,
   secure backend API instead.
========================================================== */

const STATES = [
    "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
    "Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa",
    "Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
    "Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
    "Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu",
    "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

const authState = {
    stack: [],
    current: "role",
    providerOrgKind: null,   // "gov" | "private" | "ngo" | "other"
    providerCustomType: ""
};

/* ---------- helpers ---------- */

function $(sel, root){ return (root || document).querySelector(sel); }
function $all(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

function stateOptionsHtml(selectedValue){
    let html = `<option value="">Select State / UT</option>`;
    STATES.forEach(s=>{
        html += `<option${s===selectedValue ? " selected" : ""}>${s}</option>`;
    });
    return html;
}

function goToStep(stepId, opts){
    const push = !opts || opts.push !== false;
    if(push && authState.current) authState.stack.push(authState.current);

    $all(".auth-step").forEach(el=>el.classList.remove("active"));
    const target = document.getElementById("authStep-" + stepId);
    if(target) target.classList.add("active");

    authState.current = stepId;

    const backBtn = document.getElementById("authBackBtn");
    backBtn.style.visibility = authState.stack.length ? "visible" : "hidden";

    const titles = {
        "role":"Login / Register",
        "user-auth":"👤 User",
        "user-forgot":"Reset Password",
        "provider-orgtype":"🏛️ Scheme Provider",
        "provider-form-gov":"Government Organization Registration",
        "provider-form-private":"Private Organization Registration",
        "provider-form-ngo":"NGO / Other Organization Registration",
        "provider-pending":"Registration Submitted",
        "admin-login":"🛡️ Platform Admin"
    };
    document.getElementById("authModalTitleText").textContent = titles[stepId] || "Login";
}

function goBack(){
    if(!authState.stack.length) return;
    const prev = authState.stack.pop();
    $all(".auth-step").forEach(el=>el.classList.remove("active"));
    document.getElementById("authStep-" + prev).classList.add("active");
    authState.current = prev;
    document.getElementById("authBackBtn").style.visibility =
        authState.stack.length ? "visible" : "hidden";

    const titles = {
        "role":"Login / Register",
        "user-auth":"👤 User",
        "provider-orgtype":"🏛️ Scheme Provider",
        "admin-login":"🛡️ Platform Admin"
    };
    if(titles[prev]) document.getElementById("authModalTitleText").textContent = titles[prev];
}

function resetAuthModal(){
    authState.stack = [];
    authState.current = "role";
    authState.providerOrgKind = null;
    authState.providerCustomType = "";
    $all(".auth-step").forEach(el=>el.classList.remove("active"));
    document.getElementById("authStep-role").classList.add("active");
    document.getElementById("authBackBtn").style.visibility = "hidden";
    document.getElementById("authModalTitleText").textContent = "Login / Register";

    // reset sub views
    switchUserTab("signin");
    $all(".auth-error").forEach(el=>{ el.textContent = ""; el.style.display = "none"; });
    $all("#authModal form").forEach(f=>f.reset());
    const otherWrap = document.getElementById("otherOrgTypeWrap");
    if(otherWrap) otherWrap.classList.remove("active");
    $all(".orgtype-card").forEach(c=>c.classList.remove("selected"));
    document.getElementById("ngoOrgTypeDropdownWrap").style.display = "block";
    document.getElementById("ngoOrgTypeCustomWrap").style.display = "none";
}

/* ---------- local "session" helpers (demo only) ---------- */

function getUsers(){
    return JSON.parse(localStorage.getItem("oneScheme_users") || "[]");
}
function saveUsers(list){
    localStorage.setItem("oneScheme_users", JSON.stringify(list));
}
function setSession(user){
    localStorage.setItem("oneScheme_session", JSON.stringify(user));
}
function getSession(){
    const raw = localStorage.getItem("oneScheme_session");
    return raw ? JSON.parse(raw) : null;
}
function clearSession(){
    localStorage.removeItem("oneScheme_session");
}

function updateNavbarForSession(){
    const btn = document.getElementById("loginTrigger");
    if(!btn) return;
    const session = getSession();
    if(session){
        btn.classList.add("is-logged-in");
        btn.innerHTML = `<i class="bi bi-person-circle"></i> ${session.name.split(" ")[0]}`;
        btn.onclick = function(){
            if(confirm("Log out of your account?")){
                clearSession();
                btn.classList.remove("is-logged-in");
                btn.innerHTML = "Login";
                btn.onclick = openAuthModal;
            }
        };
    } else {
        btn.classList.remove("is-logged-in");
        btn.innerHTML = "Login";
        btn.onclick = openAuthModal;
    }
}

let authModalInstance = null;

function openAuthModal(){
    resetAuthModal();
    const modalEl = document.getElementById("authModal");
    authModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    authModalInstance.show();
}

function showError(id, message){
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = message;
    el.style.display = "block";
}
function clearError(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = "";
    el.style.display = "none";
}

/* ---------- User tabs ---------- */

function switchUserTab(tab){
    $all(".auth-tab-btn").forEach(b=>b.classList.toggle("active", b.dataset.tab === tab));
    $all(".auth-panel").forEach(p=>p.classList.toggle("active", p.dataset.panel === tab));
}

function togglePasswordVisibility(inputId, btn){
    const input = document.getElementById(inputId);
    const isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    btn.innerHTML = isPw
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
}

function toggleOptionalFields(){
    const box = document.getElementById("optionalProfileFields");
    const btn = document.getElementById("optionalToggleBtn");
    const isOpen = box.classList.toggle("active");
    btn.innerHTML = isOpen
        ? '<i class="bi bi-dash-circle"></i> Hide optional profile information'
        : '<i class="bi bi-plus-circle"></i> Add optional profile information';
}

/* ---------- Provider org type selection ---------- */

function selectOrgType(kind, cardEl){
    $all(".orgtype-card").forEach(c=>c.classList.remove("selected"));
    if(cardEl) cardEl.classList.add("selected");
    authState.providerOrgKind = kind;

    const otherWrap = document.getElementById("otherOrgTypeWrap");

    if(kind === "other"){
        otherWrap.classList.add("active");
        return;
    }
    otherWrap.classList.remove("active");

    if(kind === "gov") goToStep("provider-form-gov");
    if(kind === "private") goToStep("provider-form-private");
    if(kind === "ngo"){
        // make sure the NGO form shows the normal dropdown, not the
        // locked custom-type field left over from an "Other" attempt
        document.getElementById("ngoOrgTypeDropdownWrap").style.display = "block";
        document.getElementById("ngoOrgTypeCustomWrap").style.display = "none";
        goToStep("provider-form-ngo");
    }
}

function continueWithCustomOrgType(){
    const val = document.getElementById("customOrgTypeInput").value.trim();
    if(!val){
        showError("customOrgTypeError", "Please specify your organization type.");
        return;
    }
    clearError("customOrgTypeError");
    authState.providerOrgKind = "other";
    authState.providerCustomType = val;

    // Route into the NGO/Other style form, but lock the org-type field
    // to the custom value the user supplied.
    const dropdownWrap = document.getElementById("ngoOrgTypeDropdownWrap");
    const customWrap = document.getElementById("ngoOrgTypeCustomWrap");
    dropdownWrap.style.display = "none";
    customWrap.style.display = "block";
    document.getElementById("ngoOrgTypeCustomValue").value = val;

    goToStep("provider-form-ngo");
}

function handleNgoOrgTypeChange(selectEl){
    const customField = document.getElementById("ngoOtherTypeInput");
    if(selectEl.value === "Other"){
        customField.style.display = "block";
        customField.required = true;
    } else {
        customField.style.display = "none";
        customField.required = false;
    }
}

/* ---------- Submit handlers ---------- */

function handleSignIn(e){
    e.preventDefault();
    clearError("signInError");

    const idVal = document.getElementById("signInId").value.trim();
    const pwVal = document.getElementById("signInPassword").value;

    const users = getUsers();
    const match = users.find(u =>
        (u.email.toLowerCase() === idVal.toLowerCase()) && u.password === pwVal
    );

    if(!match){
        showError("signInError", "We couldn't find an account with those details. Check your Email/Mobile and Password, or create a new account.");
        return;
    }

    setSession({ name: match.name, email: match.email });
    updateNavbarForSession();
    authModalInstance.hide();
}

function handleCreateAccount(e){
    e.preventDefault();
    clearError("createAccountError");

    const name = document.getElementById("caName").value.trim();
    const email = document.getElementById("caEmail").value.trim();
    const password = document.getElementById("caPassword").value;
    const state = document.getElementById("caState").value;

    if(!name || !email || !password || !state){
        showError("createAccountError", "Please fill in all required fields.");
        return;
    }

    const users = getUsers();
    if(users.some(u => u.email.toLowerCase() === email.toLowerCase())){
        showError("createAccountError", "An account with this Email/Mobile already exists. Try signing in instead.");
        return;
    }

    const newUser = {
        name, email, password, state,
        dob: document.getElementById("caDob") ? document.getElementById("caDob").value : "",
        gender: document.getElementById("caGender") ? document.getElementById("caGender").value : "",
        occupation: document.getElementById("caOccupation") ? document.getElementById("caOccupation").value : ""
    };
    users.push(newUser);
    saveUsers(users);
    setSession({ name: newUser.name, email: newUser.email });
    updateNavbarForSession();
    authModalInstance.hide();
}

function handleForgotPassword(e){
    e.preventDefault();
    const val = document.getElementById("forgotIdInput").value.trim();
    const msgBox = document.getElementById("forgotSuccessMsg");
    if(!val){
        showError("forgotError", "Please enter your registered Email or Mobile number.");
        return;
    }
    clearError("forgotError");
    msgBox.style.display = "block";
    document.getElementById("forgotForm").style.display = "none";
}

function handleProviderSubmit(e, kind){
    e.preventDefault();
    let orgName = "";
    if(kind === "gov") orgName = document.getElementById("govOrgName").value.trim();
    if(kind === "private") orgName = document.getElementById("privOrgName").value.trim();
    if(kind === "ngo") orgName = document.getElementById("ngoOrgName").value.trim();

    showProviderPending(orgName, kind);
}

function showProviderPending(orgName, kind){
    const labelMap = {
        gov:"Government Organization",
        private:"Private Organization",
        ngo:"NGO / Other Organization",
        other: authState.providerCustomType || "Other Organization"
    };
    document.getElementById("pendingOrgSummary").textContent =
        (orgName ? orgName + " — " : "") + (labelMap[kind] || labelMap[authState.providerOrgKind] || "Organization");
    goToStep("provider-pending");
}

/* DEMO ONLY: a real backend would authenticate admins against a secure,
   internally-provisioned account store — never hardcoded credentials
   shipped in front-end JS. This exists purely so you can test the
   success path locally. Remove before going live. */
const DEMO_ADMIN = { id: "admin@onescheme.gov.in", password: "Admin@123" };

function handleAdminLogin(e){
    e.preventDefault();
    clearError("adminLoginError");

    const idVal = document.getElementById("adminId").value.trim();
    const pwVal = document.getElementById("adminPassword").value;

    if(idVal.toLowerCase() === DEMO_ADMIN.id && pwVal === DEMO_ADMIN.password){
        setSession({ name: "Platform Admin", email: idVal, role: "admin" });
        updateNavbarForSession();
        authModalInstance.hide();
        return;
    }

    showError("adminLoginError", "Invalid Admin ID or Password. Platform Admin accounts are provisioned internally — contact the platform team if you require access.");
}

/* ---------- init ---------- */

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("caState").innerHTML = stateOptionsHtml();
    document.getElementById("govState").innerHTML = stateOptionsHtml();

    document.getElementById("authBackBtn").addEventListener("click", goBack);
    document.getElementById("authModal").addEventListener("hidden.bs.modal", resetAuthModal);

    $all(".auth-tab-btn").forEach(btn=>{
        btn.addEventListener("click", ()=>switchUserTab(btn.dataset.tab));
    });

    document.getElementById("signInForm").addEventListener("submit", handleSignIn);
    document.getElementById("createAccountForm").addEventListener("submit", handleCreateAccount);
    document.getElementById("forgotForm").addEventListener("submit", handleForgotPassword);
    document.getElementById("govForm").addEventListener("submit", e=>handleProviderSubmit(e,"gov"));
    document.getElementById("privateForm").addEventListener("submit", e=>handleProviderSubmit(e,"private"));
    document.getElementById("ngoForm").addEventListener("submit", e=>handleProviderSubmit(e, authState.providerOrgKind === "other" ? "other" : "ngo"));
    document.getElementById("adminLoginForm").addEventListener("submit", handleAdminLogin);

    updateNavbarForSession();
});
