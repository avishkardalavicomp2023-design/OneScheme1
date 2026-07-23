// =========================================================
// GLOBAL VARIABLES
// =========================================================
const schemeContainer = document.getElementById("schemeContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

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
        schemeContainer.innerHTML += `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="scheme-card">

                <span class="badge-category">
                    ${scheme.category}
                </span>

                <span class="badge-type">
                    ${scheme.schemeType}
                </span>

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

// =========================================================
// SEARCH
// =========================================================
searchInput.addEventListener("keyup", filterSchemes);
categoryFilter.addEventListener("change", filterSchemes);

function filterSchemes(){
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value || "All";

    const filtered = schemes.filter(scheme => {
        const matchSearch =
            scheme.schemeName.toLowerCase().includes(search);

        const matchCategory =
            category === "All" ||
            scheme.category === category;

        return matchSearch && matchCategory;
    });

    displaySchemes(filtered);
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