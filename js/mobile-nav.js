/* =====================================================================
   ONE SCHEME — MOBILE NAVIGATION
   Mobile-only navigation, role-based action and settings/logout menu.
   Desktop navigation and authentication logic are not modified.
   ===================================================================== */

(function () {
    "use strict";

    const SESSION_KEY = "oneScheme_session";

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function getRole(session) {
        if (!session) return null;
        return String(session.role || "user").toLowerCase().trim();
    }

    function isHomePage() {
        const path = window.location.pathname.toLowerCase();
        return path.endsWith("/index.html") || path.endsWith("/");
    }

    function isPagesFolder() {
        return window.location.pathname.toLowerCase().includes("/pages/");
    }

    function markActiveTab() {
        const path = window.location.pathname.toLowerCase();
        document.querySelectorAll(".mobile-bottom-nav .mnav-item[data-match]").forEach(function (item) {
            const keys = item.getAttribute("data-match").split(",");
            const active = keys.some(function (key) {
                return path.endsWith(key);
            });
            item.classList.toggle("active", active);
        });
    }

    function updateSavedBadge() {
        const badge = document.getElementById("mnavSavedCount");
        if (!badge) return;

        const session = getSession();
        const role = getRole(session);

        if (role !== "user") {
            badge.style.display = "none";
            return;
        }

        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
        } catch (e) {
            saved = [];
        }

        if (!Array.isArray(saved)) saved = [];

        const savedIds = [...new Set(saved.map(item => {
            if (item && typeof item === "object" && item.id !== undefined) {
                return Number(item.id);
            }
            return Number(item);
        }).filter(id => !Number.isNaN(id)))];

        let count = savedIds.length;

        // On pages where the active scheme list is available, count only
        // schemes that actually exist. This prevents stale IDs from making
        // the badge show a misleading number.
        if (typeof window.getExploreSchemes === "function") {
            try {
                const active = window.getExploreSchemes();
                if (Array.isArray(active)) {
                    count = active.filter(scheme =>
                        savedIds.includes(Number(scheme.id))
                    ).length;
                }
            } catch (e) { }
        } else if (typeof schemes !== "undefined" && Array.isArray(schemes)) {
            count = schemes.filter(scheme =>
                savedIds.includes(Number(scheme.id))
            ).length;
        }

        if (count > 0) {
            badge.style.display = "flex";
            badge.textContent = count;
        } else {
            badge.style.display = "none";
        }
    }

    window.updateMobileSavedBadge = updateSavedBadge;

    function updateRoleButton() {
        const button = document.getElementById("mnavRoleButton");
        const label = document.getElementById("mnavRoleLabel");
        if (!button || !label) return;

        const icon = button.querySelector("i");
        const session = getSession();
        const role = getRole(session);

        button.classList.remove("mnav-role-user", "mnav-role-provider", "mnav-role-admin");

        if (!session) {
            label.textContent = "Login";
            if (icon) icon.className = "bi bi-box-arrow-in-right";
        } else if (role === "user") {
            label.textContent = "Saved Schemes";
            if (icon) icon.className = "bi bi-heart-fill";
            button.classList.add("mnav-role-user");
        } else if (role === "provider") {
            label.textContent = "My Schemes";
            if (icon) icon.className = "bi bi-building-fill";
            button.classList.add("mnav-role-provider");
        } else if (role === "admin") {
            label.textContent = "Manage Schemes";
            if (icon) icon.className = "bi bi-shield-lock-fill";
            button.classList.add("mnav-role-admin");
        } else {
            label.textContent = "Login";
            if (icon) icon.className = "bi bi-box-arrow-in-right";
        }
    }

    function ensureSettingsMenu() {
        if (document.getElementById("mobileSettingsMenu")) return;

        const menu = document.createElement("div");
        menu.id = "mobileSettingsMenu";
        menu.className = "mobile-settings-menu";
        menu.innerHTML = `
            <div class="mobile-settings-header">
                <span>Settings</span>
                <button type="button" class="mobile-settings-close" aria-label="Close settings" onclick="toggleMobileSettings(event)">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <button type="button" class="mobile-settings-action" id="mobileEditProfileButton"
                onclick="openProfileSetupModal()">
                <i class="bi bi-person-gear"></i>
                <span>Edit Your Profile</span>
            </button>

            <button type="button" class="mobile-settings-action" id="mobileLogoutButton" onclick="mobileLogout()">
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
            </button>
        `;
        document.body.appendChild(menu);
        refreshSettingsMenu();
    }

    function refreshSettingsMenu() {
        const button = document.getElementById("mobileLogoutButton");
        const editProfile = document.getElementById("mobileEditProfileButton");
        if (!button) return;

        const session = getSession();
        const loggedIn = !!session;
        const isUser = getRole(session) === "user";

        button.disabled = !loggedIn;
        button.classList.toggle("is-disabled", !loggedIn);
        button.querySelector("span").textContent = loggedIn ? "Logout" : "Login required";

        if (editProfile) {
            editProfile.style.display = isUser ? "flex" : "none";
        }
    }

    window.toggleMobileSettings = function (event) {
        if (event) event.stopPropagation();
        ensureSettingsMenu();
        const menu = document.getElementById("mobileSettingsMenu");
        if (!menu) return;
        menu.classList.toggle("show");
        refreshSettingsMenu();
    };

    window.mobileLogout = function () {
        if (!getSession()) return;

        try {
            localStorage.removeItem(SESSION_KEY);
        } catch (e) { }

        const menu = document.getElementById("mobileSettingsMenu");
        if (menu) menu.classList.remove("show");

        updateRoleButton();
        updateSavedBadge();

        // Reuse the existing application's logout handler when available.
        if (typeof window.logoutUser === "function") {
            try { window.logoutUser(); } catch (e) { }
        }

        if (!isHomePage()) {
            window.location.href = isPagesFolder() ? "../index.html" : "index.html";
        } else {
            window.location.reload();
        }
    };

    function openProviderSchemes() {
        const session = getSession();
        if (!session) return;

        let all = [];
        try {
            all = JSON.parse(localStorage.getItem("oneScheme_providerSchemes") || "[]");
        } catch (e) {
            all = [];
        }

        const email = String(session.email || "").toLowerCase();
        const mine = Array.isArray(all) ? all.filter(function (scheme) {
            const providerEmail = scheme && scheme.providerOrganization && scheme.providerOrganization.email;
            return providerEmail && String(providerEmail).toLowerCase() === email;
        }) : [];

        let overlay = document.getElementById("mobileProviderSchemes");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "mobileProviderSchemes";
            overlay.className = "mobile-provider-overlay";
            document.body.appendChild(overlay);
        }

        const esc = function (value) {
            return String(value == null ? "" : value)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;")
                .replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
        };

        overlay.innerHTML = `
            <div class="mobile-provider-panel">
                <div class="mobile-provider-header">
                    <div>
                        <strong>My Schemes</strong>
                        <small>Scheme Provider</small>
                    </div>
                    <button type="button" aria-label="Close" onclick="closeProviderSchemes()">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="mobile-provider-list">
                    ${mine.length ? mine.map(function (scheme) {
            const status = scheme.verificationStatus || "pending";
            return `
                            <div class="mobile-provider-card">
                                <strong>${esc(scheme.schemeName || scheme.name || "Untitled Scheme")}</strong>
                                <span>${esc(scheme.category || "Scheme")}</span>
                                <em class="status-${esc(status)}">${esc(status)}</em>
                            </div>`;
        }).join("") : `
                        <div class="mobile-provider-empty">
                            <i class="bi bi-building"></i>
                            <strong>No schemes submitted yet</strong>
                            <span>Your submitted schemes and verification status will appear here.</span>
                        </div>`}
                </div>
            </div>`;

        requestAnimationFrame(function () { overlay.classList.add("show"); });
    }

    window.closeProviderSchemes = function () {
        const overlay = document.getElementById("mobileProviderSchemes");
        if (overlay) overlay.classList.remove("show");
    };

    window.handleMobileRoleAction = function () {
        const session = getSession();
        const role = getRole(session);

        if (role === "user") {
            const target = isPagesFolder()
                ? "explore.html?saved=true"
                : "pages/explore.html?saved=true";
            window.location.href = target;
            return;
        }

        if (role === "provider") {
            openProviderSchemes();
            return;
        }

        if (role === "admin") {
            // auth.js contains the real Manage Schemes panel on the home page.
            if (isHomePage() && typeof window.openManageSchemes === "function") {
                window.openManageSchemes();
            } else {
                window.location.href = isPagesFolder()
                    ? "../index.html#manage-schemes"
                    : "index.html#manage-schemes";
            }
            return;
        }

        // Logged out: use the existing Login modal on home.
        if (isHomePage()) {
            const trigger = document.getElementById("loginTrigger");
            if (trigger) {
                trigger.click();
                return;
            }
            if (typeof window.openAuthModal === "function") {
                window.openAuthModal();
                return;
            }
        }

        window.location.href = isPagesFolder() ? "../index.html" : "index.html";
    };

    /* Existing mobile eligibility toggle behavior */
    function initEligibilityToggle() {

        const container = document.getElementById("eligibilityContainer");
        const toggle = document.getElementById("eligToggleBtn");

        if (!container || !toggle) return;

        document.body.classList.add("os-home");

        // Prevent duplicate event listeners
        if (toggle.dataset.eligibilityInitialized === "true") {
            return;
        }

        toggle.dataset.eligibilityInitialized = "true";

        toggle.addEventListener("click", function () {

            const isOpen = container.classList.toggle("mobile-open");

            toggle.classList.toggle("open", isOpen);

            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

        });
    }

    function init() {
        markActiveTab();
        updateRoleButton();
        updateSavedBadge();
        ensureSettingsMenu();
        initEligibilityToggle();

        // Allow index.html#manage-schemes to open the existing admin panel.
        if (isHomePage() && window.location.hash === "#manage-schemes") {
            const session = getSession();
            if (getRole(session) === "admin" && typeof window.openManageSchemes === "function") {
                window.openManageSchemes();
            }
            history.replaceState(null, "", window.location.pathname + window.location.search);
        }
    }

    document.addEventListener("DOMContentLoaded", init);

    // Keep the role button/badge correct if another script changes the session.
    window.addEventListener("storage", function (event) {
        if (event.key === SESSION_KEY || event.key === "savedSchemes") {
            updateRoleButton();
            updateSavedBadge();
            refreshSettingsMenu();
        }
    });

    window.addEventListener("oneSchemeSessionChanged", function () {
        updateRoleButton();
        updateSavedBadge();
        refreshSettingsMenu();
    });

})();


/* =========================================================
   LIQUID UI MOBILE NAVIGATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const nav = document.getElementById("mobileBottomNav");

    if (!nav) return;

    const items =
        nav.querySelectorAll(".liquid-nav-item");


    /* -----------------------------------------------------
       ACTIVE PAGE
       ----------------------------------------------------- */

    const currentPath =
        window.location.pathname
            .replace(/\\/g, "/")
            .toLowerCase();


    items.forEach(function (item) {

        const page =
            item.dataset.page;

        let active = false;


        if (page === "home") {

            active =
                currentPath.endsWith("/index.html") ||
                currentPath.endsWith("/");
        }


        if (page === "explore") {

            active =
                currentPath.includes("/explore.html");
        }


        if (page === "saved") {

            active =
                currentPath.includes("saved");
        }


        if (page === "settings") {

            active =
                currentPath.includes("settings");
        }


        if (active) {

            items.forEach(i =>
                i.classList.remove("active")
            );

            item.classList.add("active");
        }

    });


    /* -----------------------------------------------------
       SAVED SCHEMES
       ----------------------------------------------------- */

    const savedButton =
        document.getElementById("mobileSavedNav");

    if (savedButton) {

        savedButton.addEventListener(
            "click",
            function () {

                if (typeof openSavedSchemes === "function") {

                    openSavedSchemes();

                } else {

                    window.location.href =
                        "pages/explore.html#saved";
                }

            }
        );
    }


    /* -----------------------------------------------------
       SETTINGS
       ----------------------------------------------------- */

    const settingsButton =
        document.getElementById(
            "mobileSettingsNav"
        );

    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            function () {

                openLiquidSettings();

            }
        );
    }


    updateLiquidSavedCount();

});


/* =========================================================
   SAVED COUNT
   ========================================================= */

function updateLiquidSavedCount() {

    const badge =
        document.getElementById(
            "mnavSavedCount"
        );

    if (!badge) return;


    let saved = [];

    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "savedSchemes"
                ) || "[]"
            );

    } catch (error) {

        saved = [];

    }


    if (!Array.isArray(saved)) {

        saved = [];

    }


    const uniqueSaved =
        [...new Set(
            saved.map(function (id) {

                if (
                    typeof id === "object" &&
                    id !== null
                ) {
                    return String(id.id);
                }

                return String(id);

            })
        )];


    const count =
        uniqueSaved.length;


    if (count > 0) {

        badge.textContent =
            count > 99
                ? "99+"
                : count;

        badge.style.display =
            "flex";

    } else {

        badge.style.display =
            "none";
    }
}


/* =========================================================
   SETTINGS POPUP
   ========================================================= */

function openLiquidSettings() {

    let popup =
        document.getElementById(
            "liquidSettingsPopup"
        );


    if (popup) {

        popup.classList.toggle("show");

        return;
    }


    popup =
        document.createElement("div");

    popup.id =
        "liquidSettingsPopup";

    popup.className =
        "liquid-settings-popup";


    popup.innerHTML = `

        <div class="liquid-settings-card">

            <button
                class="liquid-settings-close"
                onclick="
                    document
                    .getElementById(
                        'liquidSettingsPopup'
                    )
                    .remove();
                "
            >
                <i class="bi bi-x-lg"></i>
            </button>


            <div class="liquid-settings-icon">
                <i class="bi bi-gear-fill"></i>
            </div>


            <h3>Settings</h3>

            <p>
                Manage your One Scheme account
            </p>


            <button
                class="liquid-logout-btn"
                onclick="
                    if (typeof clearSession === 'function') {
                        clearSession();
                    }

                    location.reload();
                "
            >
                <i class="bi bi-box-arrow-right"></i>
                Logout
            </button>

        </div>
    `;


    document.body.appendChild(popup);
}