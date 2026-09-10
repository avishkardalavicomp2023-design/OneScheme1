const searchInput = document.getElementById("homeSearch");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");


/* ==========================================================
   HOME PAGE SEARCH
========================================================== */

function searchSchemes() {

    // Safety check
    if (!searchInput || !searchResults) {
        return;
    }

    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword === "") {

        searchResults.style.display = "none";

        return;
    }

    // Make sure schemes exists
    if (typeof schemes === "undefined" || !Array.isArray(schemes)) {

        console.error("schemes.js is not loaded or schemes is not defined.");

        searchResults.innerHTML = `
            <div class="search-item">
                No schemes available.
            </div>
        `;

        searchResults.style.display = "block";

        return;
    }

    const filtered = schemes.filter(scheme => {

        return (

            (scheme.schemeName || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (scheme.category || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (scheme.organization || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (scheme.occupation || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    showSearchResults(filtered);
}


/* ==========================================================
   SHOW SEARCH RESULTS
========================================================== */

function showSearchResults(data) {

    if (!searchResults) {
        return;
    }

    searchResults.innerHTML = "";

    if (!data || data.length === 0) {

        searchResults.innerHTML = `
            <div class="search-item">
                No Scheme Found
            </div>
        `;

    } else {

        data.forEach(scheme => {

            searchResults.innerHTML += `

                <div
                    class="search-item"
                    onclick="openScheme(${scheme.id})"
                >

                    <h6>
                        ${scheme.schemeName || "Unnamed Scheme"}
                    </h6>

                    <small>
                        ${scheme.category || ""}
                        •
                        ${scheme.organization || ""}
                    </small>

                </div>

            `;

        });

    }

    searchResults.style.display = "block";
}


/* ==========================================================
   SEARCH EVENT LISTENERS
========================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        searchSchemes
    );

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchSchemes
    );

}


/* ==========================================================
   CLOSE SEARCH RESULTS WHEN CLICKING OUTSIDE
========================================================== */

document.addEventListener("click", function (e) {

    const searchBox = document.querySelector(".search-box");

    // If this page doesn't have the search box,
    // simply do nothing.
    if (!searchBox || !searchResults) {
        return;
    }

    if (!searchBox.contains(e.target)) {

        searchResults.style.display = "none";

    }

});


/* ==========================================================
   OPEN SCHEME
========================================================== */

function openScheme(id) {

    if (!id) {
        return;
    }

    window.location.href = `pages/explore.html?scheme=${id}`;

}

/* =========================================================
   HOME - OPEN SAVED SCHEMES
========================================================= */

function openSavedSchemes() {

    const session =
        JSON.parse(
            localStorage.getItem("oneScheme_session")
        );


    /*
     * Only normal users can access Saved Schemes.
     */

    if (
        !session ||
        session.role !== "user"
    ) {

        alert(
            "Please login as a user to view your saved schemes."
        );

        return;

    }


    window.location.href =
        "pages/explore.html?saved=true";

}

function updateHomeSavedCount() {

    const countElement =
        document.getElementById(
            "homeSavedCount"
        );


    if (!countElement) {
        return;
    }


    let saved = [];

    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "savedSchemes"
                )
            ) || [];

    } catch (error) {

        saved = [];

    }


    countElement.textContent =
        Array.isArray(saved)
            ? saved.length
            : 0;

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateHomeSavedCount();

    }
);

/* =========================================================
   MOBILE HEADER SEARCH
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById("mobileHeaderSearch");
    const panel = document.getElementById("mobileSearchPanel");
    const input = document.getElementById("homeSearch");

    console.log("Mobile search setup started");

    if (!button) {
        console.error("ERROR: #mobileHeaderSearch not found");
        return;
    }

    if (!panel) {
        console.error("ERROR: #mobileSearchPanel not found");
        return;
    }

    if (!input) {
        console.error("ERROR: #homeSearch not found");
        return;
    }


    /* =====================================================
       BUTTON CLICK
       ===================================================== */

    button.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("SEARCH BUTTON CLICKED");


        const currentlyOpen =
            panel.classList.contains("search-visible");


        if (currentlyOpen) {

            /* CLOSE SEARCH */

            panel.classList.remove("search-visible");

            input.blur();

            console.log("Search closed");

        } else {

            /* OPEN SEARCH */

            panel.classList.add("search-visible");

            console.log("Search opened");

            /*
             * IMPORTANT:
             * There is NO scrollIntoView().
             * The page must NOT move.
             */

            setTimeout(function () {

                input.focus();

            }, 100);

        }

    });

});

/* =========================================================
   GLOBAL MOBILE BOTTOM NAVIGATION
   Works on ALL pages
   Mobile view ONLY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Prevent duplicate navigation
    if (document.getElementById("mobileLiquidNav")) {
        return;
    }

    const path = window.location.pathname.toLowerCase();

    // Check whether current page is inside /pages/
    const insidePagesFolder = path.includes("/pages/");

    // Correct paths depending on current page
    const homeURL = insidePagesFolder
        ? "../index.html"
        : "index.html";

    const exploreURL = insidePagesFolder
        ? "explore.html"
        : "pages/explore.html";

    const loginURL = insidePagesFolder
        ? "login.html"
        : "pages/login.html";

    const settingsURL = insidePagesFolder
        ? "settings.html"
        : "pages/settings.html";


    // Determine active page
    let activePage = "home";

    if (path.includes("explore")) {
        activePage = "explore";
    }
    else if (
        path.includes("login") ||
        path.includes("auth")
    ) {
        activePage = "login";
    }
    else if (path.includes("settings")) {
        activePage = "settings";
    }


    // Create navigation
    const nav = document.createElement("nav");

    nav.id = "mobileLiquidNav";
    nav.className = "mobile-liquid-nav";


    nav.innerHTML = `

        <!-- HOME -->
        <a
            href="${homeURL}"
            class="liquid-nav-item ${activePage === "home" ? "active" : ""}"
        >
            <span class="liquid-icon">
                <i class="bi bi-house-fill"></i>
            </span>

            <span class="liquid-label">
                Home
            </span>
        </a>


        <!-- EXPLORE -->
        <a
            href="${exploreURL}"
            class="liquid-nav-item ${activePage === "explore" ? "active" : ""}"
        >
            <span class="liquid-icon">
                <i class="bi bi-search"></i>
            </span>

            <span class="liquid-label">
                Explore
            </span>
        </a>


        <!-- LOGIN -->
        <a
            href="${loginURL}"
            class="liquid-nav-item ${activePage === "login" ? "active" : ""}"
        >
            <span class="liquid-icon">
                <i class="bi bi-person-fill"></i>
            </span>

            <span class="liquid-label">
                Login
            </span>
        </a>


        <!-- SETTINGS -->
        <a
            href="${settingsURL}"
            class="liquid-nav-item ${activePage === "settings" ? "active" : ""}"
        >
            <span class="liquid-icon">
                <i class="bi bi-gear-fill"></i>
            </span>

            <span class="liquid-label">
                Settings
            </span>
        </a>

    `;


    // Add navigation to current page
    document.body.appendChild(nav);

});