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
   MOBILE HEADER SEARCH
   Mobile uses a separate search field so the desktop search remains
   exactly where it is on larger screens.
========================================================== */

const mobileSearchToggle = document.getElementById("mobileSearchToggle");
const mobileSearchPanel = document.getElementById("mobileSearchPanel");
const mobileSearchInput = document.getElementById("mobileHomeSearch");
const mobileSearchResults = document.getElementById("mobileSearchResults");
const mobileSearchBtn = document.getElementById("mobileSearchBtn");

function searchMobileSchemes() {

    if (!mobileSearchInput || !mobileSearchResults) {
        return;
    }

    const keyword = mobileSearchInput.value.trim().toLowerCase();

    if (keyword === "") {
        mobileSearchResults.innerHTML = "";
        mobileSearchResults.style.display = "none";
        return;
    }

    if (typeof schemes === "undefined" || !Array.isArray(schemes)) {
        mobileSearchResults.innerHTML = `
            <div class="search-item">
                No schemes available.
            </div>
        `;
        mobileSearchResults.style.display = "block";
        return;
    }

    const filtered = schemes.filter(scheme => {
        return (
            (scheme.schemeName || "").toLowerCase().includes(keyword) ||
            (scheme.category || "").toLowerCase().includes(keyword) ||
            (scheme.organization || "").toLowerCase().includes(keyword) ||
            (scheme.occupation || "").toLowerCase().includes(keyword)
        );
    });

    mobileSearchResults.innerHTML = "";

    if (filtered.length === 0) {
        mobileSearchResults.innerHTML = `
            <div class="search-item">
                No Scheme Found
            </div>
        `;
    } else {
        filtered.forEach(scheme => {
            mobileSearchResults.innerHTML += `
                <div class="search-item" onclick="openScheme(${scheme.id})">
                    <h6>${scheme.schemeName || "Unnamed Scheme"}</h6>
                    <small>${scheme.category || ""} • ${scheme.organization || ""}</small>
                </div>
            `;
        });
    }

    mobileSearchResults.style.display = "block";
}

if (mobileSearchToggle && mobileSearchPanel) {
    mobileSearchToggle.addEventListener("click", function () {
        const isOpen = mobileSearchPanel.classList.toggle("open");
        mobileSearchToggle.setAttribute("aria-expanded", String(isOpen));

        if (isOpen && mobileSearchInput) {
            setTimeout(function () {
                mobileSearchInput.focus();
            }, 80);
        }

        if (!isOpen && mobileSearchResults) {
            mobileSearchResults.style.display = "none";
        }
    });
}

if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", searchMobileSchemes);
}

if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener("click", searchMobileSchemes);
}

document.addEventListener("click", function (e) {
    if (!mobileSearchPanel || !mobileSearchToggle) {
        return;
    }

    if (!mobileSearchPanel.contains(e.target) && !mobileSearchToggle.contains(e.target)) {
        mobileSearchPanel.classList.remove("open");
        mobileSearchToggle.setAttribute("aria-expanded", "false");
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