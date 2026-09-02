/* =========================================================
   LOAD ADMIN MANAGED SCHEMES
   ========================================================= */

function getExploreSchemes() {

    const baseSchemes =
        typeof schemes !== "undefined"
            ? schemes
            : [];


    let adminSchemes = [];

    let approvedSchemes = [];

    let removedSchemes = [];


    try {

        adminSchemes =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_adminSchemes"
                ) || "[]"
            );

        if (!Array.isArray(adminSchemes)) {
            adminSchemes = [];
        }

    } catch (error) {

        adminSchemes = [];

    }


    try {

        approvedSchemes =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_approvedSchemes"
                ) || "[]"
            );

        if (!Array.isArray(approvedSchemes)) {
            approvedSchemes = [];
        }

    } catch (error) {

        approvedSchemes = [];

    }


    try {

        removedSchemes =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_removedSchemes"
                ) || "[]"
            );

        if (!Array.isArray(removedSchemes)) {
            removedSchemes = [];
        }

    } catch (error) {

        removedSchemes = [];

    }


    const combined = [
        ...baseSchemes,
        ...adminSchemes,
        ...approvedSchemes
    ];


    const unique =
        new Map();


    combined.forEach(
        scheme => {

            if (
                scheme &&
                scheme.id !== undefined
            ) {

                unique.set(
                    Number(scheme.id),
                    scheme
                );

            }

        }
    );


    return Array.from(
        unique.values()
    ).filter(
        scheme =>
            !removedSchemes.some(
                id =>
                    Number(id) ===
                    Number(scheme.id)
            )
    );

}


/* =========================================================
   MAKE AVAILABLE GLOBALLY
   ========================================================= */

window.loadAdminManagedSchemes =
    function () {

        if (
            typeof window.refreshExploreSchemes ===
            "function"
        ) {

            window.refreshExploreSchemes();

        }

    };

document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // ELEMENTS
    // =========================================================
    let activeSchemes = getExploreSchemes();

    const schemeContainer = document.getElementById("schemeContainer");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const documentFilter = document.getElementById("documentFilter");

    const totalSchemes = document.getElementById("totalSchemes");
    const educationCount = document.getElementById("educationCount");
    const governmentCount = document.getElementById("governmentCount");
    const privateCount = document.getElementById("privateCount");

    const viewSavedBtn = document.getElementById("viewSavedBtn");
    const savedCount = document.getElementById("savedCount");


    updateExploreSavedVisibility();


    // =========================================================
    // SAFETY CHECK
    // =========================================================

    if (!schemeContainer) {
        console.error("ERROR: #schemeContainer not found.");
        return;
    }

    if (typeof schemes === "undefined") {
        console.error("ERROR: schemes.js is not loaded.");
        schemeContainer.innerHTML = `
            <div class="col-12">
                <div class="no-result">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Unable to Load Schemes</h3>
                    <p>Please make sure schemes.js is loaded correctly.</p>
                </div>
            </div>
        `;
        return;
    }


    // =========================================================
    // SAVED SCHEMES
    // =========================================================

    function getSavedSchemes() {

        try {

            const raw =
                localStorage.getItem("savedSchemes");

            if (!raw) {
                return [];
            }

            const saved = JSON.parse(raw);

            if (!Array.isArray(saved)) {
                return [];
            }

            return saved
                .map(item => {

                    if (
                        item &&
                        typeof item === "object" &&
                        item.id !== undefined
                    ) {
                        return Number(item.id);
                    }

                    return Number(item);

                })
                .filter(id => !Number.isNaN(id));

        } catch (error) {

            console.error(
                "Error reading saved schemes:",
                error
            );

            return [];
        }
    }


    function isSchemeSaved(id) {

        return getSavedSchemes().some(
            savedId =>
                Number(savedId) === Number(id)
        );
    }

    function updateSavedCount() {

        const savedCount =
            document.getElementById("savedCount");

        if (savedCount) {

            savedCount.textContent =
                getSavedSchemes().length;

        }

    }


    window.toggleSaveScheme = function (id, button) {

        let saved =
            getSavedSchemes();

        const numericId =
            Number(id);


        const index =
            saved.findIndex(
                savedId =>
                    Number(savedId) === numericId
            );


        if (index !== -1) {

            /* UNSAVE */

            saved.splice(index, 1);

        } else {

            /* SAVE */

            saved.push(numericId);

        }


        localStorage.setItem(
            "savedSchemes",
            JSON.stringify(saved)
        );


        updateSavedCount();


        /*
         * Re-render the page.
         * If Saved Schemes mode is active,
         * the removed card disappears immediately.
         */

        filterSchemes();

    };


    function isSchemeSaved(id) {

        return getSavedSchemes().some(
            savedId => Number(savedId) === Number(id)
        );

    }


    function updateSavedCount() {

        if (savedCount) {
            savedCount.textContent =
                getSavedSchemes().length;
        }

    }


    window.toggleSaveScheme = function (id, button) {

        let saved = getSavedSchemes();

        const numericId = Number(id);

        const exists = saved.some(
            savedId => Number(savedId) === numericId
        );


        if (exists) {

            saved = saved.filter(
                savedId => Number(savedId) !== numericId
            );

        } else {

            saved.push(numericId);

        }


        localStorage.setItem(
            "savedSchemes",
            JSON.stringify(saved)
        );


        updateSavedCount();

        // Re-render current results
        filterSchemes();

    };


    // =========================================================
    // URL CATEGORY
    // =========================================================

    const params = new URLSearchParams(window.location.search);

    const urlCategory = params.get("category");
    const urlScheme = params.get("scheme");
    const showSavedFromHome = params.get("saved") === "true";


    // =========================================================
    // STATISTICS
    // =========================================================

    function updateStatistics() {

        if (totalSchemes) {
            totalSchemes.textContent =
                schemes.length;
        }


        if (educationCount) {

            educationCount.textContent =
                schemes.filter(
                    scheme =>
                        String(scheme.category)
                            .trim()
                            .toLowerCase() === "education"
                ).length;

        }


        if (governmentCount) {

            governmentCount.textContent =
                schemes.filter(
                    scheme =>
                        String(scheme.schemeType)
                            .trim()
                            .toLowerCase() === "government"
                ).length;

        }


        if (privateCount) {

            privateCount.textContent =
                schemes.filter(scheme => {

                    const type =
                        String(scheme.schemeType)
                            .trim()
                            .toLowerCase();

                    return (
                        type === "private" ||
                        type === "csr"
                    );

                }).length;

        }

    }


    // =========================================================
    // DOCUMENT FILTER
    // =========================================================

    function populateDocumentFilter() {

        if (!documentFilter) {
            return;
        }

        const docSet = new Set();

        schemes.forEach(scheme => {

            if (Array.isArray(scheme.documents)) {

                scheme.documents.forEach(doc => {

                    if (doc) {
                        docSet.add(String(doc).trim());
                    }

                });

            }

        });

        Array.from(docSet)
            .sort()
            .forEach(doc => {

                const option =
                    window.document.createElement("option");

                option.value = doc;
                option.textContent = doc;

                documentFilter.appendChild(option);

            });

    }


    // =========================================================
    // DISPLAY SCHEMES
    // =========================================================

    function displaySchemes(data) {

        schemeContainer.innerHTML = "";


        if (!Array.isArray(data) || data.length === 0) {

            schemeContainer.innerHTML = `
                <div class="col-12">
                    <div class="no-result">
                        <i class="bi bi-search"></i>
                        <h3>No Schemes Found</h3>
                        <p>
                            Try changing your search or category.
                        </p>
                    </div>
                </div>
            `;

            return;
        }


        data.forEach(scheme => {

            const saved =
                isSchemeSaved(scheme.id);


            const category =
                scheme.category || "General";

            const type =
                scheme.schemeType || "Government";

            const organization =
                scheme.organization || "Not specified";

            const benefit =
                scheme.benefit || "See official website";

            const occupation =
                scheme.occupation || "Any";

            const state =
                scheme.state || "All India";

            const website =
                scheme.website || "#";


            const card = document.createElement("div");

            card.className =
                "col-lg-4 col-md-6 mb-4";


            card.innerHTML = `

                <div class="scheme-card">

                    <!-- TOP ROW -->

                    <div class="card-top-row">

                        <div class="card-top-badges">

                            <span class="badge-category">
                                ${category}
                            </span>

                            <span class="badge-type">
                                ${type}
                            </span>

                        </div>


                        <button
                            class="save-btn ${saved ? "saved" : ""}"
                            data-id="${scheme.id}"
                            title="Save Scheme">

                            <i class="bi ${saved
                    ? "bi-heart-fill"
                    : "bi-heart"
                }"></i>

                            ${saved
                    ? "Saved"
                    : "Save"
                }

                        </button>

                    </div>


                    <!-- TITLE -->

                    <h4 class="scheme-title">
                        ${scheme.schemeName}
                    </h4>


                    <!-- INFORMATION -->

                    <div class="scheme-info">

                        <p>
                            <i class="bi bi-building"></i>

                            <strong>
                                Organization :
                            </strong>

                            ${organization}
                        </p>


                        <p>
                            <i class="bi bi-gift"></i>

                            <strong>
                                Benefit :
                            </strong>

                            ${benefit}
                        </p>


                        <p>
                            <i class="bi bi-person"></i>

                            <strong>
                                Occupation :
                            </strong>

                            ${occupation}
                        </p>


                        <p>
                            <i class="bi bi-geo-alt"></i>

                            <strong>
                                State :
                            </strong>

                            ${state}
                        </p>

                    </div>


                    ${buildDeadlineHTML(scheme)}


                    <!-- BUTTONS -->

                    <div class="scheme-buttons">

                        <button
                            class="btn btn-view view-details-btn"
                            data-id="${scheme.id}">

                            View Details

                        </button>


                        <a
                            href="${website}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-apply">

                            Apply Now

                        </a>

                    </div>

                </div>

            `;


            // SAVE BUTTON

            const saveButton =
                card.querySelector(".save-btn");

            saveButton.addEventListener(
                "click",
                function () {

                    toggleSaveScheme(
                        scheme.id,
                        saveButton
                    );

                }
            );


            // VIEW DETAILS

            const detailsButton =
                card.querySelector(
                    ".view-details-btn"
                );

            detailsButton.addEventListener(
                "click",
                function () {

                    showDetails(scheme.id);

                }
            );


            schemeContainer.appendChild(card);

        });

    }


    // =========================================================
    // SEARCH + FILTER
    // =========================================================

    let showSavedOnly = showSavedFromHome;


    function filterSchemes() {

        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        const category =
            categoryFilter
                ? categoryFilter.value
                    .trim()
                    .toLowerCase()
                : "all";

        const documentValue =
            documentFilter
                ? documentFilter.value
                    .trim()
                    .toLowerCase()
                : "all";


        const filtered =
            schemes.filter(scheme => {

                const name =
                    String(scheme.schemeName || "")
                        .trim()
                        .toLowerCase();


                const schemeCategory =
                    String(scheme.category || "")
                        .trim()
                        .toLowerCase();


                const documents =
                    Array.isArray(scheme.documents)
                        ? scheme.documents
                        : [];


                const matchSearch =
                    name.includes(search);


                const matchCategory =
                    category === "all" ||
                    schemeCategory === category;


                const matchDocument =
                    documentValue === "all" ||
                    documents.some(
                        document =>
                            String(document)
                                .trim()
                                .toLowerCase() ===
                            documentValue
                    );


                const matchSaved =
                    !showSavedOnly ||
                    isSchemeSaved(scheme.id);


                return (
                    matchSearch &&
                    matchCategory &&
                    matchDocument &&
                    matchSaved
                );

            });


        displaySchemes(filtered);
    }


    // =========================================================
    // VIEW DETAILS
    // =========================================================

    window.showDetails = function (id) {

        const scheme =
            schemes.find(
                scheme =>
                    Number(scheme.id) ===
                    Number(id)
            );


        if (!scheme) {
            console.error(
                "Scheme not found:",
                id
            );
            return;
        }


        const modalTitle =
            document.getElementById(
                "modalTitle"
            );

        const modalBody =
            document.getElementById(
                "modalBody"
            );


        if (!modalTitle || !modalBody) {
            return;
        }


        modalTitle.textContent =
            scheme.schemeName;


        const income =
            scheme.incomeLimit ===
                Number.MAX_SAFE_INTEGER
                ? "No Income Limit"
                : scheme.incomeLimit === undefined ||
                    scheme.incomeLimit === null
                    ? "Not specified"
                    : typeof scheme.incomeLimit === "number"
                        ? "₹" +
                        scheme.incomeLimit
                            .toLocaleString("en-IN")
                        : scheme.incomeLimit;


        modalBody.innerHTML = `

            <h4>
                ${scheme.schemeName}
            </h4>

            <hr>

            <p>
                <strong>Organization :</strong>
                ${scheme.organization || "Not specified"}
            </p>

            <p>
                <strong>Scheme Type :</strong>
                ${scheme.schemeType || "Not specified"}
            </p>

            <p>
                <strong>Category :</strong>
                ${scheme.category || "Not specified"}
            </p>

            <p>
                <strong>Benefit :</strong>
                ${scheme.benefit || "Not specified"}
            </p>

            <p>
                <strong>Occupation :</strong>
                ${scheme.occupation || "Any"}
            </p>

            <p>
                <strong>State :</strong>
                ${scheme.state || "All India"}
            </p>

            <p>
                <strong>Gender :</strong>
                ${scheme.gender || "Any"}
            </p>

            <p>
                <strong>Age :</strong>
                ${scheme.minAge ?? 0}
                -
                ${scheme.maxAge ?? 100}
            </p>

            <p>
                <strong>Income Limit :</strong>
                ${income}
            </p>

            <p>
                <strong>Apply Mode :</strong>
                ${scheme.applyMode || "Online"}
            </p>

            ${buildDeadlineHTML(scheme)}

            ${buildDocumentsHTML(scheme)}

            ${scheme.website
                ? `
                    <a
                        href="${scheme.website}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-primary mt-3">

                        Apply Now

                    </a>
                `
                : ""
            }

        `;


        const modalElement =
            document.getElementById(
                "schemeModal"
            );


        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();

        }

    };


    // =========================================================
    // DOCUMENT HTML
    // =========================================================

    function buildDocumentsHTML(scheme) {

        if (
            Array.isArray(scheme.documents) &&
            scheme.documents.length > 0
        ) {

            const items =
                scheme.documents
                    .map(
                        document => `
                            <li>
                                <i class="bi bi-check-circle-fill"></i>
                                ${document}
                            </li>
                        `
                    )
                    .join("");


            return `

                <div class="documents-card">

                    <h6>
                        <i class="bi bi-file-earmark-text-fill"></i>
                        Required Documents
                    </h6>

                    <ul>
                        ${items}
                    </ul>

                </div>

            `;

        }


        return `

            <div class="documents-card documents-card-empty">

                <h6>
                    <i class="bi bi-file-earmark-text-fill"></i>
                    Required Documents
                </h6>

                <p>
                    Document requirements may vary.
                    Please check the official application website.
                </p>

            </div>

        `;

    }


    // =========================================================
    // DEADLINE
    // =========================================================

    function buildDeadlineHTML(scheme) {

        if (!scheme.deadline) {

            return `
                <p class="deadline-note">

                    <i class="bi bi-calendar3"></i>

                    Check official website
                    for application dates

                </p>
            `;

        }


        const state =
            getDeadlineState(
                scheme.deadline
            );


        return `
            <p class="deadline-badge deadline-${state}">

                <i class="bi bi-alarm-fill"></i>

                Apply before
                ${scheme.deadline}

            </p>
        `;

    }


    function getDeadlineState(deadline) {

        const date =
            new Date(deadline);


        if (isNaN(date.getTime())) {
            return "green";
        }


        const daysLeft =
            Math.ceil(
                (
                    date - new Date()
                ) /
                (1000 * 60 * 60 * 24)
            );


        if (daysLeft <= 7) {
            return "red";
        }


        if (daysLeft <= 30) {
            return "orange";
        }


        return "green";

    }


    // =========================================================
    // EVENT LISTENERS
    // =========================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterSchemes
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterSchemes
        );

    }


    if (documentFilter) {

        documentFilter.addEventListener(
            "change",
            filterSchemes
        );

    }


    // =========================================================
    // SAVED SCHEMES BUTTON
    // =========================================================

    if (viewSavedBtn) {

        viewSavedBtn.addEventListener(
            "click",
            function () {

                showSavedOnly =
                    !showSavedOnly;


                if (showSavedOnly) {

                    viewSavedBtn.innerHTML = `
                    <i class="bi bi-x-circle"></i>
                    Show All Schemes
                `;

                } else {

                    viewSavedBtn.innerHTML = `
                    <i class="bi bi-heart"></i>
                    Saved Schemes
                    (<span id="savedCount">
                        ${getSavedSchemes().length}
                    </span>)
                `;
                }


                filterSchemes();

            }
        );
    }


    // =========================================================
    // INITIALIZATION
    // =========================================================

    updateStatistics();
    populateDocumentFilter();
    updateSavedCount();


    // =========================================================
    // URL PARAMETERS
    // =========================================================

    if (showSavedFromHome) {

        // Open Saved Schemes directly
        showSavedOnly = true;

        if (viewSavedBtn) {
            viewSavedBtn.innerHTML = `
            <i class="bi bi-x-circle"></i>
            Show All Schemes
        `;
        }

        filterSchemes();

    }
    else if (urlCategory) {

        const decodedCategory =
            decodeURIComponent(urlCategory).trim();

        const matchingOption =
            [...categoryFilter.options].find(
                option =>
                    option.value.trim().toLowerCase() ===
                    decodedCategory.toLowerCase()
            );

        if (matchingOption) {

            categoryFilter.value =
                matchingOption.value;

        } else {

            const matchingScheme =
                schemes.find(
                    scheme =>
                        String(scheme.category || "")
                            .trim()
                            .toLowerCase() ===
                        decodedCategory.toLowerCase()
                );

            if (matchingScheme) {

                const option =
                    document.createElement("option");

                option.value =
                    matchingScheme.category;

                option.textContent =
                    matchingScheme.category;

                categoryFilter.appendChild(option);

                categoryFilter.value =
                    matchingScheme.category;
            }
        }

        filterSchemes();

    }
    else if (urlScheme) {

        const scheme =
            schemes.find(
                scheme =>
                    Number(scheme.id) ===
                    Number(urlScheme)
            );

        if (scheme) {

            displaySchemes([scheme]);

        } else {

            displaySchemes([]);

        }

    }
    else {

        // Normal Explore page
        filterSchemes();

    }


    console.log(
        "Explore page initialized successfully.",
        "Schemes:",
        schemes.length,
        "Category:",
        urlCategory || "All",
        "Saved:",
        showSavedFromHome
    );


    // =========================================================
    // SINGLE SCHEME FROM URL
    // =========================================================

    if (
        urlScheme &&
        !urlCategory
    ) {

        const scheme =
            schemes.find(
                scheme =>
                    Number(scheme.id) ===
                    Number(urlScheme)
            );


        if (scheme) {

            displaySchemes([scheme]);

        } else {

            displaySchemes([]);

        }

    } else {

        // Normal page / category page

        filterSchemes();

    }


    console.log(
        "Explore page initialized successfully.",
        "Schemes:",
        schemes.length,
        "Category:",
        urlCategory || "All"
    );

});


function updateExploreSavedVisibility() {

    const savedButton =
        document.getElementById(
            "viewSavedBtn"
        );


    if (!savedButton) {
        return;
    }


    let session = null;

    try {

        session =
            JSON.parse(
                localStorage.getItem(
                    "oneScheme_session"
                )
            );

    } catch (error) {

        session = null;

    }


    /*
     * Only normal users see Saved Schemes.
     */

    if (
        session &&
        session.role === "user"
    ) {

        savedButton.style.display = "";

    } else {

        savedButton.style.display =
            "none";

    }

}

/* =========================================================
   REFRESH EXPLORE AFTER ADMIN CHANGES
   ========================================================= */

window.refreshExploreSchemes =
    function () {

        const container =
            document.getElementById(
                "schemeContainer"
            );


        if (!container) {
            return;
        }


        const freshSchemes =
            getExploreSchemes();


        /*
         * Update the global schemes reference
         * used by this page.
         */

        if (
            typeof window.activeExploreSchemes !==
            "undefined"
        ) {

            window.activeExploreSchemes =
                freshSchemes;

        }


        /*
         * Reload page because URL filters,
         * statistics and document filters
         * all depend on the scheme list.
         */

        window.location.reload();

    };