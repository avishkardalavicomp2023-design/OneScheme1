// =========================================================
// GLOBAL VARIABLES
// =========================================================
const schemeContainer = document.getElementById("schemeContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const documentFilter = document.getElementById("documentFilter");

const totalSchemes = document.getElementById("totalSchemes");
const educationCount = document.getElementById("educationCount");
const governmentCount = document.getElementById("governmentCount");
const privateCount = document.getElementById("privateCount");


// ===========================================
// GET CATEGORY FROM URL
// ===========================================

const params = new URLSearchParams(window.location.search);

const selectedCategory = params.get("category");
const selectedScheme = params.get("scheme");

// =========================================================
// INITIALIZE
// =========================================================
updateStatistics();
populateDocumentFilter();

if(selectedCategory){

    categoryFilter.value = selectedCategory;

    filterSchemes();

}
else if(selectedScheme){

    const scheme = schemes.find(s => s.id == selectedScheme);

    if(scheme){
        displaySchemes([scheme]);
    }else{
        displaySchemes(schemes);
    }

}
else{

    displaySchemes(schemes);

}

// =========================================================
// DISPLAY SCHEMES
// =========================================================
function displaySchemes(data){
    schemeContainer.innerHTML = "";

    if(data.length === 0){
        schemeContainer.innerHTML = `
        <div class="col-12">
            <div class="no-result">
                <i class="bi bi-search"></i>
                <h3>No Schemes Found</h3>
                <p>Try changing your search or category.</p>
            </div>
        </div>
        `;
        return;
    }

    data.forEach((scheme, index) => {

        const saved = isSchemeSaved(scheme.id);

        schemeContainer.innerHTML += `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="scheme-card">

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

                <div class="scheme-info">
                    <p>
                        <i class="bi bi-building"></i>
                        <strong>Organization :</strong>
                        ${scheme.organization}
                    </p>

                    <p>
                        <i class="bi bi-gift"></i>
                        <strong>Benefit :</strong>
                        ${scheme.benefit}
                    </p>

                    <p>
                        <i class="bi bi-person"></i>
                        <strong>Occupation :</strong>
                        ${scheme.occupation}
                    </p>

                    <p>
                        <i class="bi bi-geo-alt"></i>
                        <strong>State :</strong>
                        ${scheme.state}
                    </p>
                </div>

                ${buildDeadlineHTML(scheme)}

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
}

/* =========================================================
   SAVE / SHORTLIST SCHEME (shared logic — same storage key
   as the results page, so shortlists stay in sync)
========================================================= */

function getSavedSchemes(){
    return JSON.parse(localStorage.getItem("savedSchemes")) || [];
}

function isSchemeSaved(id){
    return getSavedSchemes().includes(id);
}

function toggleSaveScheme(id, btn){

    let saved = getSavedSchemes();

    if(saved.includes(id)){

        saved = saved.filter(x => x !== id);

        if(btn){
            btn.classList.remove("saved");
            btn.innerHTML = '<i class="bi bi-heart"></i> Save';
        }

    }else{

        saved.push(id);

        if(btn){
            btn.classList.add("saved");
            btn.innerHTML = '<i class="bi bi-heart-fill"></i> Saved';
        }

    }

    localStorage.setItem("savedSchemes", JSON.stringify(saved));

    const countEl = document.getElementById("savedCount");
    if(countEl){
        countEl.textContent = saved.length;
    }
}

// =========================================================
// SEARCH
// =========================================================
searchInput.addEventListener("keyup", filterSchemes);
categoryFilter.addEventListener("change", filterSchemes);

if(documentFilter){
    documentFilter.addEventListener("change", filterSchemes);
}

let showSavedOnly = false;

function filterSchemes(){
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value || "All";
    const document_ = documentFilter ? (documentFilter.value || "All") : "All";
    const savedIds = getSavedSchemes();

    const filtered = schemes.filter(scheme => {
        const matchSearch =
            scheme.schemeName.toLowerCase().includes(search);

        const matchCategory =
            category === "All" ||
            scheme.category === category;

        const matchDocument =
            document_ === "All" ||
            (scheme.documents && scheme.documents.includes(document_));

        const matchSaved =
            !showSavedOnly || savedIds.includes(scheme.id);

        return matchSearch && matchCategory && matchDocument && matchSaved;
    });

    displaySchemes(filtered);
}

/* =========================================================
   VIEW SAVED SCHEMES TOGGLE
========================================================= */
const viewSavedBtn = document.getElementById("viewSavedBtn");
const savedCountLabel = document.getElementById("savedCount");

function refreshSavedCountLabel(){
    if(savedCountLabel){
        savedCountLabel.textContent = getSavedSchemes().length;
    }
}

refreshSavedCountLabel();

if(viewSavedBtn){

    viewSavedBtn.addEventListener("click", function(){

        showSavedOnly = !showSavedOnly;

        if(showSavedOnly){

            viewSavedBtn.innerHTML =
                `<i class="bi bi-x-circle"></i> Show All Schemes`;

            if(getSavedSchemes().length === 0){
                alert("You haven't saved any schemes yet. Click Save on a scheme card to shortlist it.");
            }

        }else{

            viewSavedBtn.innerHTML =
                `<i class="bi bi-heart"></i> Saved Schemes (<span id="savedCount">${getSavedSchemes().length}</span>)`;

        }

        filterSchemes();

    });

}

// =========================================================
// DOCUMENT FILTER OPTIONS (built from the schemes database)
// =========================================================
function populateDocumentFilter(){

    if(!documentFilter){
        return;
    }

    const docSet = new Set();

    schemes.forEach(scheme => {
        if(scheme.documents){
            scheme.documents.forEach(doc => docSet.add(doc));
        }
    });

    Array.from(docSet).sort().forEach(doc => {
        const option = document.createElement("option");
        option.value = doc;
        option.textContent = doc;
        documentFilter.appendChild(option);
    });
}

// =========================================================
// STATISTICS
// =========================================================
function updateStatistics(){
    totalSchemes.innerHTML = schemes.length;

    educationCount.innerHTML =
        schemes.filter(x => x.category === "Education").length;

    governmentCount.innerHTML =
        schemes.filter(x => x.schemeType === "Government").length;

    privateCount.innerHTML =
        schemes.filter(
            x => x.schemeType === "CSR" || x.schemeType === "Private"
        ).length;
}

// =========================================================
// MODAL
// =========================================================
function showDetails(id){

    const scheme = schemes.find(s => s.id === id);

    if(!scheme){
        return;
    }

    document.getElementById("modalTitle").innerHTML = scheme.schemeName;

    document.getElementById("modalBody").innerHTML = `
        <h4>${scheme.schemeName}</h4>
        <hr>

        <p><strong>Organization :</strong> ${scheme.organization}</p>

        <p><strong>Scheme Type :</strong> ${scheme.schemeType}</p>

        <p><strong>Category :</strong> ${scheme.category}</p>

        <p><strong>Benefit :</strong> ${scheme.benefit}</p>

        <p><strong>Occupation :</strong> ${scheme.occupation}</p>

        <p><strong>State :</strong> ${scheme.state}</p>

        <p><strong>Gender :</strong> ${scheme.gender}</p>

        <p><strong>Age :</strong> ${scheme.minAge} - ${scheme.maxAge}</p>

        <p>
            <strong>Income Limit :</strong>
            ${
                scheme.incomeLimit === Number.MAX_SAFE_INTEGER
                    ? "No Income Limit"
                    : "₹" + scheme.incomeLimit.toLocaleString()
            }
        </p>

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

    new bootstrap.Modal(
        document.getElementById("schemeModal")
    ).show();

}

// =========================================================
// REQUIRED DOCUMENTS HTML (shared helper)
// =========================================================
function buildDocumentsHTML(scheme){

    if(scheme.documents && scheme.documents.length > 0){

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

// =========================================================
// DEADLINE HTML (shared helper)
// =========================================================
function buildDeadlineHTML(scheme){

    if(!scheme.deadline){
        return `<p class="deadline-note"><i class="bi bi-calendar3"></i> Check official website for application dates</p>`;
    }

    const state = getDeadlineState(scheme.deadline);

    return `<p class="deadline-badge deadline-${state}"><i class="bi bi-alarm-fill"></i> Apply before ${scheme.deadline}</p>`;
}

function getDeadlineState(deadlineStr){

    const parsed = new Date(deadlineStr);

    if(isNaN(parsed)){
        return "green";
    }

    const daysLeft = Math.ceil((parsed - new Date()) / (1000 * 60 * 60 * 24));

    if(daysLeft <= 7){
        return "red";
    }
    else if(daysLeft <= 30){
        return "orange";
    }

    return "green";
}