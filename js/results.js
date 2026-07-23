/* ===========================================
            COMPARE VARIABLES
=========================================== */
let compareMode = false;
let selectedSchemes = [];


// =====================================
// Get User Data
// =====================================
const user = JSON.parse(localStorage.getItem("userData"));
const resultContainer = document.getElementById("resultsContainer");


// No data

if(!user){

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

const eligibleSchemes=[];

const notEligible=[];



schemes.forEach(scheme=>{

    // Ignore schemes that don't match the user's occupation

    if(scheme.occupation !== user.occupation){

        return;

    }

    if(scheme.eligibility(user)){

        eligibleSchemes.push(scheme);

    }

    else{

        notEligible.push(scheme);

    }

});

console.log("Eligible Schemes:", eligibleSchemes);
console.log("User:", user);




// =====================================
// Display Results
// =====================================

let html="";



if(eligibleSchemes.length > 0){

    html += `<div class="row">`;

    eligibleSchemes.forEach(scheme => {

        html += `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="scheme-card">
                <input
                    type="checkbox"
                    class="compare-checkbox"
                    value="${scheme.id}"
                    onchange="toggleSchemeSelection(${scheme.id}, this)">

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

    html += `</div>`;
}



if(eligibleSchemes.length === 0){

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


function showDetails(id){
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

    <a
        href="${scheme.website}"
        target="_blank"
        class="btn btn-primary mt-3">
        Apply Now
    </a>
    `;

    new bootstrap.Modal(document.getElementById("schemeModal")).show();
}

resultContainer.innerHTML=html;

/* ===========================================
            SHOW/HIDE COMPARE OPTION
=========================================== */

const eligibleCards = document.querySelectorAll(".scheme-card");

if(eligibleCards.length <= 1){
    document.getElementById("toggleCompareBtn").style.display = "none";
}else{
    document.getElementById("toggleCompareBtn").style.display = "inline-block";
}

/* ===========================================
            ENABLE COMPARE MODE
=========================================== */

const toggleCompareBtn = document.getElementById("toggleCompareBtn");
const compareBtn = document.getElementById("compareBtn");
const compareCount = document.getElementById("compareCount");

toggleCompareBtn.addEventListener("click", function(){

    compareMode = !compareMode;

    const checkboxes = document.querySelectorAll(".compare-checkbox");

    if(compareMode){

        checkboxes.forEach(cb => {
            cb.style.display = "block";
        });

        toggleCompareBtn.innerHTML =
            '<i class="bi bi-x-circle"></i> Cancel Compare';

    }else{

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

function toggleSchemeSelection(id, checkbox){

    if(checkbox.checked){

        if(selectedSchemes.length >= 4){
            alert("You can compare a maximum of 4 schemes.");
            checkbox.checked = false;
            return;
        }

        selectedSchemes.push(id);

    }else{

        selectedSchemes = selectedSchemes.filter(x => x !== id);

    }

    compareCount.innerHTML = selectedSchemes.length;

    if(selectedSchemes.length >= 2){
        compareBtn.style.display = "inline-block";
    }else{
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



