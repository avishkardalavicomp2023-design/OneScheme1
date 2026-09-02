/* ===========================================
            COMPARE VARIABLES
=========================================== */
let compareMode = false;
let selectedSchemes = [];

/* ===========================================
        MATCH PERCENTAGE + WHY ELIGIBLE
   Explainable weighted score built from the
   same criteria used by the scheme's own
   eligibility() logic (age, occupation, income,
   gender, state, area, student, disability).
=========================================== */

function calculateMatch(scheme, user) {

    let totalWeight = 0;
    let earnedWeight = 0;
    const reasons = [];

    // Occupation (guaranteed match — results are pre-filtered by occupation)
    totalWeight += 20;
    earnedWeight += 20;
    reasons.push(`You are a ${user.occupation}, matching this scheme's target group`);

    // Age range — extra credit the closer you are to the middle of the range
    totalWeight += 20;
    {
        const range = (scheme.maxAge - scheme.minAge) || 1;
        const mid = (scheme.maxAge + scheme.minAge) / 2;
        const distance = Math.abs(user.age - mid);
        const closeness = Math.max(0, 1 - (distance / (range / 2)));
        earnedWeight += 20 * closeness;
        reasons.push(`Your age (${user.age}) matches the scheme's eligible range of ${scheme.minAge}-${scheme.maxAge} years`);
    }

    // Income limit — extra credit the further under the limit you are
    if (typeof scheme.incomeLimit === "number" && scheme.incomeLimit !== Number.MAX_SAFE_INTEGER) {
        totalWeight += 20;
        const margin = Math.max(0, (scheme.incomeLimit - user.income) / scheme.incomeLimit);
        earnedWeight += 20 * Math.min(1, 0.5 + margin);
        reasons.push(`Your income is within the required limit of ₹${scheme.incomeLimit.toLocaleString()}`);
    }

    // Gender — only counted when the scheme targets a specific gender
    if (scheme.gender && scheme.gender !== "Any") {
        totalWeight += 15;
        earnedWeight += 15;
        reasons.push(`Your gender matches this scheme's target group`);
    }

    // State — only counted when the scheme is state-specific
    if (scheme.state && scheme.state !== "All" && scheme.state !== "All India") {
        totalWeight += 15;
        earnedWeight += 15;
        reasons.push(`You live in ${scheme.state}, where this scheme is available`);
    }

    // Area — only counted when the scheme requires a specific area
    if (scheme.area && scheme.area !== "Any") {
        totalWeight += 10;
        earnedWeight += 10;
        reasons.push(`Your area (${user.area}) matches this scheme's requirement`);
    }

    // Student status
    if (scheme.student) {
        totalWeight += 10;
        earnedWeight += 10;
        reasons.push(`Your student profile matches this scheme's category`);
    }

    // Disability
    if (scheme.disability) {
        totalWeight += 10;
        earnedWeight += 10;
        reasons.push(`Your disability status matches this scheme's requirement`);
    }

    // Category — informational only (not used by scheme eligibility logic)
    if (user.category && user.category !== "" && user.category !== "General") {
        reasons.push(`Your category (${user.category}) has been noted for this scheme`);
    }

    const percent = totalWeight > 0
        ? Math.round((earnedWeight / totalWeight) * 100)
        : 100;

    return { percent, reasons };
}

function buildMatchHTML(percent) {
    return `
    <div class="match-wrap">
        <div class="match-ring" style="background: conic-gradient(#2563EB ${percent * 3.6}deg, #E5E7EB 0deg);">
            <div class="match-ring-inner">${percent}%</div>
        </div>
        <div class="match-label">Match</div>
    </div>
    `;
}

function buildWhyEligibleHTML(reasons) {

    if (!reasons || reasons.length === 0) {
        return "";
    }

    const items = reasons
        .slice(0, 4)
        .map(r => `<li><i class="bi bi-check-circle-fill"></i> ${r}</li>`)
        .join("");

    return `
    <div class="why-eligible-card">
        <h6>Why you're eligible</h6>
        <ul>${items}</ul>
    </div>
    `;
}

/* ===========================================
        REQUIRED DOCUMENTS (shared helper)
=========================================== */

function buildDocumentsHTML(scheme) {

    if (scheme.documents && scheme.documents.length > 0) {

        const items = scheme.documents
            .map(doc => `<li><i class="bi bi-check-circle-fill"></i> ${doc}</li>`)
            .join("");

        return `
        <div class="documents-card">
            <h6><i class="bi bi-file-earmark-text-fill"></i> Required Documents</h6>
            <ul>${items}</ul>
        </div>
        `;
    }

    return `
    <div class="documents-card documents-card-empty">
        <h6><i class="bi bi-file-earmark-text-fill"></i> Required Documents</h6>
        <p>Document requirements may vary. Please check the official application website.</p>
    </div>
    `;
}

/* ===========================================
        DEADLINE (shared helper)
=========================================== */

function buildDeadlineHTML(scheme) {

    if (!scheme.deadline) {
        return `<p class="deadline-note"><i class="bi bi-calendar3"></i> Check official website for application dates</p>`;
    }

    const state = getDeadlineState(scheme.deadline);

    return `<p class="deadline-badge deadline-${state}"><i class="bi bi-alarm-fill"></i> Apply before ${scheme.deadline}</p>`;
}

function getDeadlineState(deadlineStr) {

    const parsed = new Date(deadlineStr);

    if (isNaN(parsed)) {
        return "green";
    }

    const daysLeft = Math.ceil((parsed - new Date()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 7) {
        return "red";
    }
    else if (daysLeft <= 30) {
        return "orange";
    }

    return "green";
}

/* ===========================================
        SAVE / SHORTLIST SCHEME
=========================================== */

function getSavedSchemes() {
    return JSON.parse(localStorage.getItem("savedSchemes")) || [];
}

function isSchemeSaved(id) {
    return getSavedSchemes().includes(id);
}

function toggleSaveScheme(id, btn) {

    let saved = getSavedSchemes();

    if (saved.includes(id)) {

        saved = saved.filter(x => x !== id);

        if (btn) {
            btn.classList.remove("saved");
            btn.innerHTML = '<i class="bi bi-heart"></i> Save';
        }

    } else {

        saved.push(id);

        if (btn) {
            btn.classList.add("saved");
            btn.innerHTML = '<i class="bi bi-heart-fill"></i> Saved';
        }

    }

    localStorage.setItem("savedSchemes", JSON.stringify(saved));

    const countEl = document.getElementById("savedCount");
    if (countEl) {
        countEl.textContent = saved.length;
    }
}


// =====================================
// Get User Data
// =====================================
const user = JSON.parse(localStorage.getItem("userData"));
const resultContainer = document.getElementById("resultsContainer");


// No data

if (!user) {

    resultContainer.innerHTML = `
        <div class="alert alert-danger">
            No user data found.
        </div>
    `;

    throw new Error("User data not found");
}



// =====================================
// Find Eligible Schemes
// =====================================

const eligibleSchemes = [];

const notEligible = [];



schemes.forEach(scheme => {

    // Ignore schemes that don't match the user's occupation

    if (scheme.occupation !== user.occupation) {

        return;

    }

    if (scheme.eligibility(user)) {

        eligibleSchemes.push(scheme);

    }

    else {

        notEligible.push(scheme);

    }

});

console.log("Eligible Schemes:", eligibleSchemes);
console.log("User:", user);




// =====================================
// Display Results
// =====================================

let html = "";



if (eligibleSchemes.length > 0) {

    html += `<div class="row">`;

    eligibleSchemes.forEach(scheme => {

        const match = calculateMatch(scheme, user);
        const saved = isSchemeSaved(scheme.id);

        html += `
        <div class="col-lg-4 col-md-6 mb-4" data-scheme-id="${scheme.id}">
            <div class="scheme-card">
                <input
                    type="checkbox"
                    class="compare-checkbox"
                    value="${scheme.id}"
                    onchange="toggleSchemeSelection(${scheme.id}, this)">

                <div class="card-top-row">
                    <div class="card-top-badges">
                        <span class="badge-category">
                            ${scheme.category}
                        </span>

                        <span class="badge-type">
                            ${scheme.schemeType}
                        </span>
                    </div>

                    <button
                        class="save-btn ${saved ? 'saved' : ''}"
                        onclick="toggleSaveScheme(${scheme.id}, this)"
                        title="Save Scheme">
                        <i class="bi ${saved ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        ${saved ? 'Saved' : 'Save'}
                    </button>
                </div>

                <h4 class="scheme-title">
                    ${scheme.schemeName}
                </h4>

                ${buildMatchHTML(match.percent)}

                <div class="scheme-info">
                    <p>
                        <i class="bi bi-calendar3"></i>
                        <strong>Age Limit :</strong>
                        ${scheme.minAge} - ${scheme.maxAge} years
                    </p>

                    <p>
                        <i class="bi bi-gift"></i>
                        <strong>Benefit :</strong>
                        ${scheme.benefit}
                    </p>

                    <p>
                        <i class="bi bi-currency-rupee"></i>
                        <strong>Income Limit :</strong>
                        ${typeof scheme.incomeLimit === "number" ? "₹" + scheme.incomeLimit.toLocaleString() : scheme.incomeLimit}
                    </p>

                    <p>
                        <i class="bi bi-geo-alt"></i>
                        <strong>State :</strong>
                        ${scheme.state}
                    </p>
                </div>

                ${buildDeadlineHTML(scheme)}

                ${buildWhyEligibleHTML(match.reasons)}

                <div class="scheme-buttons">
                    <button
                        class="btn btn-view"
                        onclick="showDetails(${scheme.id})">
                        View Details
                    </button>

                    <a
                        href="${scheme.website}"
                        target="_blank"
                        class="btn btn-apply">
                        Apply Now
                    </a>
                </div>

            </div>
        </div>
        `;

    });

    html += `</div>`;
}



if (eligibleSchemes.length === 0) {

    html = `
    <div class="no-result">
        <i class="bi bi-search"></i>

        <h2>No Matching Schemes Found</h2>

        <p>Try changing your information and search again.</p>

        <a href="eligibility.html" class="btn btn-primary mt-4">
            Search Again
        </a>
    </div>
    `;
}


function showDetails(id) {
    const scheme = schemes.find(s => s.id === id);

    document.getElementById("modalTitle").innerHTML = scheme.schemeName;

    document.getElementById("modalBody").innerHTML = `
    <h4>${scheme.schemeName}</h4>
    <hr>

    <p><strong>Organization :</strong> ${scheme.organization}</p>

    <p><strong>Category :</strong> ${scheme.category}</p>

    <p><strong>Scheme Type :</strong> ${scheme.schemeType}</p>

    <p><strong>Benefit :</strong> ${scheme.benefit}</p>

    <p><strong>Occupation :</strong> ${scheme.occupation}</p>

    <p><strong>Gender :</strong> ${scheme.gender}</p>

    <p><strong>State :</strong> ${scheme.state}</p>

    <p><strong>Age :</strong> ${scheme.minAge} - ${scheme.maxAge}</p>

    <p><strong>Income Limit :</strong> ₹${scheme.incomeLimit.toLocaleString()}</p>

    <p><strong>Apply Mode :</strong> ${scheme.applyMode}</p>

    ${buildDeadlineHTML(scheme)}

    ${buildDocumentsHTML(scheme)}

    <a
        href="${scheme.website}"
        target="_blank"
        class="btn btn-primary mt-3">
        Apply Now
    </a>
    `;

    new bootstrap.Modal(document.getElementById("schemeModal")).show();
}

resultContainer.innerHTML = html;

/* ===========================================
            SHOW/HIDE COMPARE OPTION
=========================================== */

const eligibleCards = document.querySelectorAll(".scheme-card");

if (eligibleCards.length <= 1) {
    document.getElementById("toggleCompareBtn").style.display = "none";
} else {
    document.getElementById("toggleCompareBtn").style.display = "inline-block";
}

/* ===========================================
            ENABLE COMPARE MODE
=========================================== */

const toggleCompareBtn = document.getElementById("toggleCompareBtn");
const compareBtn = document.getElementById("compareBtn");
const compareCount = document.getElementById("compareCount");

toggleCompareBtn.addEventListener("click", function () {

    compareMode = !compareMode;

    const checkboxes = document.querySelectorAll(".compare-checkbox");

    if (compareMode) {

        checkboxes.forEach(cb => {
            cb.style.display = "block";
        });

        toggleCompareBtn.innerHTML =
            '<i class="bi bi-x-circle"></i> Cancel Compare';

    } else {

        checkboxes.forEach(cb => {
            cb.checked = false;
            cb.style.display = "none";
        });

        selectedSchemes = [];
        compareCount.innerHTML = 0;
        compareBtn.style.display = "none";

        toggleCompareBtn.innerHTML =
            '<i class="bi bi-ui-checks-grid"></i> Enable Compare';

    }

});

/* ===========================================
            SELECT SCHEMES
=========================================== */

function toggleSchemeSelection(id, checkbox) {

    if (checkbox.checked) {

        if (selectedSchemes.length >= 4) {
            alert("You can compare a maximum of 4 schemes.");
            checkbox.checked = false;
            return;
        }

        selectedSchemes.push(id);

    } else {

        selectedSchemes = selectedSchemes.filter(x => x !== id);

    }

    compareCount.innerHTML = selectedSchemes.length;

    if (selectedSchemes.length >= 2) {
        compareBtn.style.display = "inline-block";
    } else {
        compareBtn.style.display = "none";
    }

}


/* ===========================================
            GO TO COMPARE PAGE
=========================================== */

compareBtn.addEventListener("click", () => {

    localStorage.setItem(
        "compareSchemes",
        JSON.stringify(selectedSchemes)
    );

    window.location.href = "compare.html";

});

/* ===========================================
        VIEW SAVED SCHEMES TOGGLE
=========================================== */

let viewingSavedOnly = false;

const viewSavedBtn = document.getElementById("viewSavedBtn");
const savedCountLabel = document.getElementById("savedCount");

function refreshSavedCount() {
    if (savedCountLabel) {
        savedCountLabel.textContent = getSavedSchemes().length;
    }
}

refreshSavedCount();

if (viewSavedBtn) {

    viewSavedBtn.addEventListener("click", function () {

        viewingSavedOnly = !viewingSavedOnly;

        const savedIds = getSavedSchemes();
        const cardWraps = document.querySelectorAll("[data-scheme-id]");

        if (viewingSavedOnly) {

            let anySaved = false;

            cardWraps.forEach(wrap => {
                const id = Number(wrap.dataset.schemeId);
                if (savedIds.includes(id)) {
                    wrap.style.display = "";
                    anySaved = true;
                } else {
                    wrap.style.display = "none";
                }
            });

            viewSavedBtn.innerHTML =
                `<i class="bi bi-x-circle"></i> Show All Schemes`;

            if (!anySaved) {
                alert("You haven't saved any schemes yet. Click the Save button on a scheme to shortlist it.");
            }

        } else {

            cardWraps.forEach(wrap => {
                wrap.style.display = "";
            });

            viewSavedBtn.innerHTML =
                `<i class="bi bi-heart"></i> Saved Schemes (<span id="savedCount">${savedIds.length}</span>)`;

        }

    });

}



