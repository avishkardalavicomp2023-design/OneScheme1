/* =========================================================
   ONE SCHEME — USER PROFILE & FIRST-VISIT FLOW
   Stores a normal user's eligibility profile in localStorage
   and reuses it inside the eligibility checker.
   ========================================================= */

(function () {
    "use strict";

    const PROFILE_KEY = "oneScheme_profile";
    const WELCOME_KEY = "oneScheme_welcomeHandled";

    function getSession() {
        try {
            const raw = localStorage.getItem("oneScheme_session");
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function isRegularUser() {
        const session = getSession();
        return session && String(session.role || "user").toLowerCase() === "user";
    }

    function getProfile() {
        const session = getSession();
        if (!session || !isRegularUser()) return null;

        try {
            if (session.profile) return session.profile;

            const users = JSON.parse(localStorage.getItem("oneScheme_users") || "[]");
            const email = String(session.email || "").toLowerCase();
            const match = Array.isArray(users)
                ? users.find(u => String(u.email || "").toLowerCase() === email)
                : null;

            return match && match.profile ? match.profile : null;
        } catch (e) {
            return null;
        }
    }

    function saveProfile(profile) {
        const session = getSession();
        if (!session || !isRegularUser()) return false;

        try {
            const users = JSON.parse(localStorage.getItem("oneScheme_users") || "[]");
            const email = String(session.email || "").toLowerCase();

            if (Array.isArray(users)) {
                const index = users.findIndex(
                    u => String(u.email || "").toLowerCase() === email
                );

                if (index >= 0) {
                    users[index].profile = profile;
                    // Keep the existing optional auth fields useful too.
                    users[index].dob = profile.dob || users[index].dob || "";
                    users[index].gender = profile.gender || "";
                    users[index].occupation = profile.occupation || "";
                    users[index].state = profile.state || users[index].state || "";
                }

                localStorage.setItem("oneScheme_users", JSON.stringify(users));
            }

            session.profile = profile;
            localStorage.setItem("oneScheme_session", JSON.stringify(session));
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

            window.dispatchEvent(new Event("oneSchemeProfileChanged"));
            return true;
        } catch (e) {
            console.error("Unable to save profile:", e);
            return false;
        }
    }

    function optionList(values, selected) {
        return values.map(value =>
            `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`
        ).join("");
    }

    function profileMarkup(profile) {
        profile = profile || {};

        const states = [
            "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
            "Bihar", "Chandigarh", "Chhattisgarh",
            "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat",
            "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
            "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
            "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
            "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
            "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ];

        const categories = ["General", "OBC", "SC", "ST", "EWS"];
        const occupations = [
            "Student", "Farmer", "Business Owner", "Startup Founder",
            "Government Employee", "Private Employee", "Self Employed",
            "Unemployed", "Retired", "Homemaker", "Other"
        ];
        const studentTypes = [
            "School Student", "College Student", "Diploma Student",
            "ITI Student", "Research Scholar"
        ];
        const academicLevels = ["Diploma", "Undergraduate", "Postgraduate", "PhD"];

        return `
            <form id="oneSchemeProfileForm" class="one-scheme-profile-form" novalidate>

                <div class="profile-intro">
                    <div class="profile-intro-icon">
                        <i class="bi bi-person-check-fill"></i>
                    </div>
                    <div>
                        <strong>Tell us about yourself</strong>
                        <p>This information will be used to find schemes relevant to you.</p>
                    </div>
                </div>

                <div class="profile-grid">

                    <div class="profile-field">
                        <label>Gender <span>*</span></label>
                        <select id="profileGender" required>
                            <option value="">Select Gender</option>
                            <option value="Male" ${profile.gender === "Male" ? "selected" : ""}>Male</option>
                            <option value="Female" ${profile.gender === "Female" ? "selected" : ""}>Female</option>
                            <option value="Other" ${profile.gender === "Other" ? "selected" : ""}>Other</option>
                        </select>
                    </div>

                    <div class="profile-field">
                        <label>Age <span>*</span></label>
                        <input id="profileAge" type="number" min="1" max="100"
                               value="${profile.age || ""}" placeholder="Enter your age" required>
                    </div>

                    <div class="profile-field profile-wide">
                        <label>State / UT <span>*</span></label>
                        <select id="profileState" required>
                            <option value="">Select State / UT</option>
                            ${optionList(states, profile.state || "")}
                        </select>
                    </div>

                    <div class="profile-field">
                        <label>Area <span>*</span></label>
                        <select id="profileArea" required>
                            <option value="">Select Area</option>
                            <option value="Urban" ${profile.area === "Urban" ? "selected" : ""}>Urban</option>
                            <option value="Rural" ${profile.area === "Rural" ? "selected" : ""}>Rural</option>
                        </select>
                    </div>

                    <div class="profile-field">
                        <label>Category <span>*</span></label>
                        <select id="profileCategory" required>
                            <option value="">Select Category</option>
                            ${optionList(categories, profile.category || "")}
                        </select>
                    </div>

                    <div class="profile-field">
                        <label>Disability <span>*</span></label>
                        <select id="profileDisabled" required>
                            <option value="">Select</option>
                            <option value="No" ${profile.disabled === false ? "selected" : ""}>No</option>
                            <option value="Yes" ${profile.disabled === true ? "selected" : ""}>Yes</option>
                        </select>
                    </div>

                    <div class="profile-field" id="profilePercentageWrap">
                        <label>Disability Percentage</label>
                        <input id="profilePercentage" type="number" min="1" max="100"
                               value="${profile.disabilityPercentage || ""}" placeholder="If applicable">
                    </div>

                    <div class="profile-field profile-wide">
                        <label>Occupation <span>*</span></label>
                        <select id="profileOccupation" required>
                            <option value="">Select Occupation</option>
                            ${optionList(occupations, profile.occupation || "")}
                        </select>
                    </div>

                    <div id="profileStudentFields" class="profile-wide profile-subsection">
                        <div class="profile-subtitle">
                            <i class="bi bi-mortarboard-fill"></i> Student Details
                        </div>

                        <div class="profile-grid">
                            <div class="profile-field">
                                <label>Student Type <span>*</span></label>
                                <select id="profileStudentType">
                                    <option value="">Select Student Type</option>
                                    ${optionList(studentTypes, profile.studentType || "")}
                                </select>
                            </div>

                            <div class="profile-field">
                                <label>Academic Level <span>*</span></label>
                                <select id="profileAcademicLevel">
                                    <option value="">Select Academic Level</option>
                                    ${optionList(academicLevels, profile.academicLevel || "")}
                                </select>
                            </div>

                            <div class="profile-field">
                                <label>Course <span>*</span></label>
                                <input id="profileCourse" type="text"
                                       value="${escapeHtml(profile.course || "")}"
                                       placeholder="e.g. B.Tech Computer Engineering">
                            </div>

                            <div class="profile-field">
                                <label>Institution Type <span>*</span></label>
                                <select id="profileInstitutionType">
                                    <option value="">Select Institution Type</option>
                                    <option value="Government" ${profile.institutionType === "Government" ? "selected" : ""}>Government</option>
                                    <option value="Private" ${profile.institutionType === "Private" ? "selected" : ""}>Private</option>
                                    <option value="Aided" ${profile.institutionType === "Aided" ? "selected" : ""}>Aided</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="profile-field profile-wide">
                        <label>Annual Income (₹) <span>*</span></label>
                        <input id="profileIncome" type="number" min="0"
                               value="${profile.income !== undefined && profile.income !== null ? profile.income : ""}"
                               placeholder="Enter your annual income" required>
                    </div>

                </div>

                <div class="profile-required-note">
                    <i class="bi bi-info-circle"></i>
                    Fields marked * are required. Complete all required information to enable Save Profile.
                </div>

                <div class="profile-actions">
                    <button type="button" class="profile-skip-btn" id="profileLaterBtn">
                        ${profile && profile.gender ? "Cancel" : "I'll do this later"}
                    </button>
                    <button type="submit" class="profile-save-btn" id="saveProfileBtn" disabled>
                        <i class="bi bi-check2-circle"></i> Save Profile
                    </button>
                </div>
            </form>
        `;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function createProfileModal() {
        let modal = document.getElementById("profileSetupModal");
        if (modal) return modal;

        modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "profileSetupModal";
        modal.tabIndex = -1;
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content profile-modal-content">
                    <div class="modal-header profile-modal-header">
                        <div>
                            <div class="profile-modal-eyebrow">
                                <i class="bi bi-stars"></i> Personalized Experience
                            </div>
                            <h5 class="modal-title" id="profileModalTitle">Complete Your Profile</h5>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="profileModalBody"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener("shown.bs.modal", function () {
            bindProfileForm();
        });

        return modal;
    }

    function bindProfileForm() {
        const form = document.getElementById("oneSchemeProfileForm");
        if (!form) return;

        if (form.dataset.profileBound === "true") return;
        form.dataset.profileBound = "true";

        const ids = [
            "profileGender", "profileAge", "profileState", "profileArea",
            "profileCategory", "profileDisabled", "profilePercentage",
            "profileOccupation", "profileStudentType", "profileAcademicLevel",
            "profileCourse", "profileInstitutionType", "profileIncome"
        ];

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", updateProfileValidity);
                el.addEventListener("change", updateProfileValidity);
            }
        });

        const disabled = document.getElementById("profileDisabled");
        if (disabled) disabled.addEventListener("change", refreshProfileConditionalFields);

        const occupation = document.getElementById("profileOccupation");
        if (occupation) occupation.addEventListener("change", refreshProfileConditionalFields);

        const later = document.getElementById("profileLaterBtn");
        if (later) {
            later.addEventListener("click", function () {
                const modal = bootstrap.Modal.getInstance(document.getElementById("profileSetupModal"));
                if (modal) modal.hide();
            });
        }

        form.addEventListener("submit", handleProfileSubmit);
        refreshProfileConditionalFields();
        updateProfileValidity();
    }

    function refreshProfileConditionalFields() {
        const disabled = document.getElementById("profileDisabled");
        const percentWrap = document.getElementById("profilePercentageWrap");
        const percentage = document.getElementById("profilePercentage");

        if (disabled && percentWrap) {
            const yes = disabled.value === "Yes";
            percentWrap.style.display = yes ? "" : "none";
            if (!yes && percentage) percentage.value = "";
        }

        const occupation = document.getElementById("profileOccupation");
        const studentWrap = document.getElementById("profileStudentFields");

        if (occupation && studentWrap) {
            const student = occupation.value === "Student";
            studentWrap.style.display = student ? "" : "none";

            ["profileStudentType", "profileAcademicLevel", "profileCourse", "profileInstitutionType"]
                .forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.required = student;
                });
        }

        updateProfileValidity();
    }

    function updateProfileValidity() {
        const button = document.getElementById("saveProfileBtn");
        if (!button) return;

        const requiredIds = [
            "profileGender", "profileAge", "profileState",
            "profileArea", "profileCategory", "profileDisabled",
            "profileOccupation", "profileIncome"
        ];

        let valid = requiredIds.every(id => {
            const el = document.getElementById(id);
            return el && String(el.value || "").trim() !== "";
        });

        const age = Number(document.getElementById("profileAge")?.value);
        const income = Number(document.getElementById("profileIncome")?.value);

        if (!Number.isFinite(age) || age < 1 || age > 100) valid = false;
        if (!Number.isFinite(income) || income < 0) valid = false;

        const disabled = document.getElementById("profileDisabled")?.value;
        if (disabled === "Yes") {
            const percentage = Number(document.getElementById("profilePercentage")?.value);
            if (!Number.isFinite(percentage) || percentage < 1 || percentage > 100) valid = false;
        }

        const occupation = document.getElementById("profileOccupation")?.value;
        if (occupation === "Student") {
            ["profileStudentType", "profileAcademicLevel", "profileCourse", "profileInstitutionType"]
                .forEach(id => {
                    const el = document.getElementById(id);
                    if (!el || !String(el.value || "").trim()) valid = false;
                });
        }

        button.disabled = !valid;
        button.classList.toggle("enabled", valid);
    }

    function readProfileForm() {
        const disabled = document.getElementById("profileDisabled").value === "Yes";
        return {
            gender: document.getElementById("profileGender").value,
            age: Number(document.getElementById("profileAge").value),
            state: document.getElementById("profileState").value,
            area: document.getElementById("profileArea").value,
            category: document.getElementById("profileCategory").value,
            disabled: disabled,
            disabilityPercentage: disabled
                ? Number(document.getElementById("profilePercentage").value || 0)
                : 0,
            occupation: document.getElementById("profileOccupation").value,
            studentType: document.getElementById("profileStudentType").value,
            academicLevel: document.getElementById("profileAcademicLevel").value,
            course: document.getElementById("profileCourse").value.trim(),
            institutionType: document.getElementById("profileInstitutionType").value,
            income: Number(document.getElementById("profileIncome").value),
            updatedAt: new Date().toISOString()
        };
    }

    function handleProfileSubmit(e) {
        e.preventDefault();
        updateProfileValidity();

        const button = document.getElementById("saveProfileBtn");
        if (!button || button.disabled) return;

        const profile = readProfileForm();
        if (!saveProfile(profile)) return;

        const modalEl = document.getElementById("profileSetupModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        updateUseSavedInformationButton();
    }

    window.openProfileSetupModal = function (options) {
        if (!isRegularUser()) return;

        const modalEl = createProfileModal();
        const body = document.getElementById("profileModalBody");
        const title = document.getElementById("profileModalTitle");

        const profile = (options && options.profile) || getProfile() || {};

        if (title) {
            title.textContent = profile.gender ? "Edit Your Profile" : "Complete Your Profile";
        }

        if (body) {
            body.innerHTML = profileMarkup(profile);
        }

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();

        setTimeout(bindProfileForm, 50);
    };

    function populateChoice(selector, value, optionSelector) {
        const select = document.querySelector(selector);
        if (!select) return;
        select.value = value || "";
        if (optionSelector) {
            document.querySelectorAll(optionSelector).forEach(btn => {
                btn.classList.toggle("active", btn.dataset.value === value);
            });
        }
        select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    window.useSavedProfileForEligibility = function () {
        const profile = getProfile();
        if (!profile) {
            window.openProfileSetupModal({ mode: "setup" });
            return;
        }

        const container = document.getElementById("eligibilityContainer");
        if (container && !container.querySelector(".wizard-card")) {
            alert("The eligibility checker is still loading. Please try again in a moment.");
            return;
        }

        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = value == null ? "" : value;
                el.dispatchEvent(new Event("input", { bubbles: true }));
                el.dispatchEvent(new Event("change", { bubbles: true }));
            }
        };

        set("gender", profile.gender);
        document.querySelectorAll(".gender-option").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.value === profile.gender);
        });

        set("age", profile.age);
        const ageLabel = document.getElementById("ageValueLabel");
        if (ageLabel) ageLabel.textContent = profile.age || 18;

        set("state", profile.state);
        set("area", profile.area);
        document.querySelectorAll(".area-option").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.value === profile.area);
        });

        set("category", profile.category);
        set("disabled", profile.disabled ? "Yes" : "No");
        document.querySelectorAll(".disability-option").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.value === (profile.disabled ? "Yes" : "No"));
        });

        set("percentage", profile.disabilityPercentage || 1);
        const percentageLabel = document.getElementById("percentageValueLabel");
        if (percentageLabel) percentageLabel.textContent = profile.disabilityPercentage || 1;

        const percentageBox = document.getElementById("percentageBox");
        if (percentageBox) percentageBox.style.display = profile.disabled ? "block" : "none";

        set("occupation", profile.occupation);
        const studentSection = document.getElementById("studentSection");
        if (studentSection) studentSection.style.display = profile.occupation === "Student" ? "block" : "none";

        set("studentType", profile.studentType);
        set("academicLevel", profile.academicLevel);
        set("course", profile.course);
        set("institutionType", profile.institutionType);

        set("income", profile.income);

        const toggle = document.getElementById("eligToggleBtn");
        if (toggle && container) {
            container.classList.add("mobile-open");
            toggle.classList.add("open");
            toggle.setAttribute("aria-expanded", "true");
        }

        // The saved profile already contains every eligibility answer.
        // Skip the six-step manual wizard and jump directly to Step 6.
        // A small delay lets the dynamically inserted eligibility.js finish
        // initializing before we call its public final-step helper.
        setTimeout(() => {
            if (typeof window.goToFinalEligibilityStep === "function") {
                window.goToFinalEligibilityStep();
            }
        }, 50);

        const heading = container?.querySelector(".wizard-card h2, .wizard-card h3");
        if (heading) {
            setTimeout(() => {
                const nav = document.querySelector(".custom-navbar");
                const offset = nav ? nav.getBoundingClientRect().height + 12 : 12;
                window.scrollTo({
                    top: Math.max(0, heading.getBoundingClientRect().top + window.scrollY - offset),
                    behavior: "smooth"
                });
            }, 150);
        }
    };

    function updateUseSavedInformationButton() {
        const button = document.getElementById("useSavedInformationBtn");
        if (!button) return;

        button.style.display = isRegularUser() && !!getProfile() ? "flex" : "none";
    }

    function ensureUseSavedInformationButton() {
        const toggle = document.getElementById("eligToggleBtn");
        if (!toggle || document.getElementById("useSavedInformationBtn")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.id = "useSavedInformationBtn";
        button.className = "use-saved-information-btn";
        button.innerHTML = `
            <span>
                <i class="bi bi-person-check-fill"></i>
                <span>
                    <strong>Use Your Saved Information</strong>
                    <small>Fill the eligibility checker automatically</small>
                </span>
            </span>
            <i class="bi bi-arrow-right"></i>
        `;
        button.addEventListener("click", window.useSavedProfileForEligibility);

        toggle.parentNode.insertBefore(button, toggle);
        updateUseSavedInformationButton();
    }

    function ensureWelcomeFlow() {
        // Show the welcome/login flow every time the homepage is opened.
        // Do not persist a "handled" flag; closing/skipping it only applies
        // to the current page load.
        if (!location.pathname.toLowerCase().endsWith("/index.html") &&
            !location.pathname.endsWith("/")) return;

        let modal = document.getElementById("niceMeetingModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.className = "nice-meeting-overlay";
            modal.id = "niceMeetingModal";
            modal.innerHTML = `
                <div class="nice-meeting-card">
                    <div class="nice-meeting-glow"></div>
                    <div class="nice-meeting-icon">
                        <i class="bi bi-stars"></i>
                    </div>
                    <h2>Nice Meeting You</h2>
                    <p>Welcome to One Scheme. Sign in so we can personalize the schemes you discover.</p>
                    <div class="nice-meeting-loading">
                        <span></span><span></span><span></span>
                    </div>
                    <button type="button" class="nice-skip-btn" id="niceMeetingSkip">
                        Skip login
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById("niceMeetingSkip").addEventListener("click", function () {
                // Skip only this time. The welcome popup will appear again
                // the next time the homepage is opened.
                modal.classList.remove("show");
            });
        }

        requestAnimationFrame(() => modal.classList.add("show"));

        // Brief welcome, then use the website's existing regular-user login modal.
        setTimeout(function () {
            if (!document.body.contains(modal) || !modal.classList.contains("show")) return;

            modal.classList.remove("show");

            // If the user is already logged in, don't interrupt the active
            // session with another login form. The welcome popup still appears
            // on every homepage load.
            if (getSession()) return;

            setTimeout(function () {
                if (typeof window.openAuthModal === "function") {
                    window.openAuthModal();
                    if (typeof window.goToStep === "function") {
                        window.goToStep("user-auth", { push: false });
                    }
                    addSkipLoginToAuthModal();
                }
            }, 250);
        }, 1200);
    }

    function addSkipLoginToAuthModal() {
        const modal = document.getElementById("authModal");
        if (!modal) return;

        let skip = document.getElementById("authSkipLoginBtn");
        if (!skip) {
            skip = document.createElement("button");
            skip.type = "button";
            skip.id = "authSkipLoginBtn";
            skip.className = "auth-skip-login-btn";
            skip.textContent = "Skip login";
            skip.addEventListener("click", function () {
                const instance = bootstrap.Modal.getInstance(modal);
                if (instance) instance.hide();
            });
            modal.querySelector(".modal-content")?.appendChild(skip);
        }
        skip.style.display = "block";
    }

    function hideAuthSkipOnNormalOpen() {
        const skip = document.getElementById("authSkipLoginBtn");
        if (skip) skip.style.display = "none";
    }

    document.addEventListener("DOMContentLoaded", function () {
        ensureUseSavedInformationButton();
        ensureWelcomeFlow();

        const authModal = document.getElementById("authModal");
        if (authModal) {
            authModal.addEventListener("show.bs.modal", hideAuthSkipOnNormalOpen);
        }

        // The welcome flow re-enables the skip button after openAuthModal().
        window.addEventListener("oneSchemeProfileChanged", function () {
            updateUseSavedInformationButton();
        });

        // Dynamic eligibility wizard is inserted after DOMContentLoaded.
        const observer = new MutationObserver(function () {
            ensureUseSavedInformationButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        updateUseSavedInformationButton();
    });

})();
