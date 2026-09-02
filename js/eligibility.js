// ===============================================
// VARIABLES
// ===============================================

const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".nextBtn");
const prevBtns = document.querySelectorAll(".prevBtn");
const resetBtns = document.querySelectorAll(".resetBtn");

const progressBar = document.getElementById("progressBar");
const currentStepText = document.getElementById("currentStep");

const ageInput = document.getElementById("age");
const ageValueLabel = document.getElementById("ageValueLabel");
const disabilitySelect = document.getElementById("disabled");
const occupation = document.getElementById("occupation");
const studentSection = document.getElementById("studentSection");
const percentageBox = document.getElementById("percentageBox");
const percentageInputSlider = document.getElementById("percentage");
const percentageValueLabel = document.getElementById("percentageValueLabel");


let currentStep = 0;

// ===============================================
// GENDER SELECTION
// ===============================================

document.addEventListener("click", function (e) {

    const option = e.target.closest(".gender-option");

    if (!option) return;

    // Remove selection from all buttons
    document.querySelectorAll(".gender-option").forEach(item => {
        item.classList.remove("active");
    });

    // Highlight selected button
    option.classList.add("active");

    // Store selected gender
    const genderInput = document.getElementById("gender");

    if (genderInput) {
        genderInput.value = option.dataset.value;
    }

});

// =====================================
// OCCUPATION
// =====================================

occupation.addEventListener("change", () => {

    if (occupation.value === "Student") {

        studentSection.style.display = "block";

    }
    else {

        studentSection.style.display = "none";

    }

});

document.addEventListener("click", function (e) {

    const option = e.target.closest(".area-option");

    if (!option) return;

    // Remove selection from all area buttons
    document.querySelectorAll(".area-option").forEach(item => {
        item.classList.remove("active");
    });

    // Highlight selected area
    option.classList.add("active");

    // Store selected area
    const areaInput = document.getElementById("area");

    if (areaInput) {
        areaInput.value = option.dataset.value;
    }

});




// ===============================================
// INITIALIZE
// ===============================================

showStep(currentStep);


// ===============================================
// SHOW STEP
// ===============================================

function showStep(step) {

    steps.forEach((item, index) => {

        item.classList.remove("active");

        if (index === step) {

            item.classList.add("active");

        }

    });

    currentStepText.innerHTML = step + 1;

    progressBar.style.width = ((step + 1) / steps.length) * 100 + "%";

}


// ===============================================
// VALIDATION
// ===============================================

function validateStep(step) {

    // ==========================================
    // STEP 1 - GENDER + AGE
    // ==========================================

    if (step === 0) {

        const gender = document.getElementById("gender");
        const age = document.getElementById("age");

        // Gender validation
        if (!gender || gender.value === "") {

            alert("Please select your gender.");

            return false;
        }

        // Age validation
        if (!age || age.value === "") {

            alert("Please select your age.");

            return false;
        }

        const ageNumber = Number(age.value);

        if (ageNumber < 1 || ageNumber > 100) {

            alert("Age must be between 1 and 100.");

            age.focus();

            return false;
        }

        return true;
    }


    // ==========================================
    // STEP 2 - STATE + AREA
    // ==========================================

    if (step === 1) {

        const state = document.getElementById("state");
        const area = document.getElementById("area");

        // State validation
        if (!state || state.value === "Select State / UT") {

            alert("Please select your state.");

            return false;
        }

        // Area button validation
        if (!area || area.value === "") {

            alert("Please select Urban or Rural.");

            return false;
        }

        return true;
    }


    // ==========================================
    // STEP 3 - CATEGORY
    // ==========================================

    if (step === 2) {

        const category = document.getElementById("category");

        if (!category || category.value === "") {

            alert("Please select a category.");

            return false;
        }

        return true;
    }


    // ==========================================
    // STEP 4 - DISABILITY
    // ==========================================

    if (step === 3) {

        const disability = document.getElementById("disabled");

        if (!disability || disability.value === "") {

            alert("Please select whether you have a disability.");

            return false;
        }

        // If Yes, percentage is required
        if (disability.value === "Yes") {

            const percentage =
                document.getElementById("percentage");

            if (!percentage || percentage.value === "") {

                alert("Please select your disability percentage.");

                return false;
            }
        }

        return true;
    }


    // ==========================================
    // STEP 5 - OCCUPATION
    // ==========================================

    if (step === 4) {

        const occupation =
            document.getElementById("occupation");

        if (!occupation || occupation.value === "") {

            alert("Please select your occupation.");

            return false;
        }


        // ------------------------------
        // Student
        // ------------------------------

        if (occupation.value === "Student") {

            const studentType =
                document.getElementById("studentType");

            const academicLevel =
                document.getElementById("academicLevel");

            const course =
                document.getElementById("course");

            const institutionType =
                document.getElementById("institutionType");


            if (!studentType || studentType.value === "") {

                alert("Please select Student Type.");

                return false;
            }


            if (!academicLevel || academicLevel.value === "") {

                alert("Please select Academic Level.");

                return false;
            }


            if (!course || course.value.trim() === "") {

                alert("Please enter your Course.");

                course.focus();

                return false;
            }


            if (!institutionType ||
                institutionType.value === "") {

                alert("Please select Institution Type.");

                return false;
            }

        }

        return true;
    }


    // ==========================================
    // STEP 6 - INCOME
    // ==========================================

    if (step === 5) {

        const income =
            document.getElementById("income");

        if (!income || income.value.trim() === "") {

            alert("Please enter your annual income.");

            income.focus();

            return false;
        }

        if (Number(income.value) < 0) {

            alert("Income cannot be negative.");

            income.focus();

            return false;
        }

        return true;
    }


    return true;
}

// ===============================================
// AGE SLIDER LIVE UPDATE
// ===============================================

ageInput.addEventListener("input", function () {

    if (this.value > 100) {
        this.value = 100;
    }

    if (this.value < 1 && this.value !== "") {
        this.value = 1;
    }

    if (ageValueLabel) {
        ageValueLabel.textContent = this.value;
    }

});

// ===============================================
// DISABILITY PERCENTAGE SLIDER LIVE UPDATE
// ===============================================

if (percentageInputSlider) {

    percentageInputSlider.addEventListener("input", function () {

        if (percentageValueLabel) {
            percentageValueLabel.textContent = this.value;
        }

    });

}



// ===============================================
// NEXT BUTTON
// ===============================================

nextBtns.forEach(btn => {

    btn.addEventListener("click", () => {

        if (!validateStep(currentStep))
            return;



        if (currentStep < steps.length - 1) {

            currentStep++;

            showStep(currentStep);

        }

    });

});



// ===============================================
// PREVIOUS BUTTON
// ===============================================

prevBtns.forEach(btn => {

    btn.addEventListener("click", () => {


        if (currentStep > 0) {

            currentStep--;

            showStep(currentStep);

        }

    });

});



// ===============================================
// RESET BUTTON
// ===============================================

resetBtns.forEach(btn => {

    btn.addEventListener("click", () => {

        const inputs = steps[currentStep].querySelectorAll("input,select");

        inputs.forEach(input => {

            if (input.tagName === "SELECT") {

                input.selectedIndex = 0;

            }

            else if (input.type === "range") {

                input.value = input.id === "age" ? "18" : "1";

                if (input.id === "age" && ageValueLabel) {
                    ageValueLabel.textContent = input.value;
                }

                if (input.id === "percentage" && percentageValueLabel) {
                    percentageValueLabel.textContent = input.value;
                }

            }

            else if (input.type === "hidden") {

                input.value = "";

            }

            else {

                input.value = "";

            }

        });

        // Reset visual selection state for choice buttons in this step
        steps[currentStep]
            .querySelectorAll(".gender-option, .area-option, .disability-option, .institution-option")
            .forEach(opt => opt.classList.remove("active"));

    });

});



// ===============================================
// DISABILITY
// ===============================================

document.addEventListener("click", function (e) {

    const option = e.target.closest(".disability-option");

    if (!option) return;

    // Remove selection from all buttons
    document.querySelectorAll(".disability-option").forEach(item => {
        item.classList.remove("active");
    });

    // Highlight selected option
    option.classList.add("active");

    // Store selected value
    const disabilityInput = document.getElementById("disabled");

    if (disabilityInput) {
        disabilityInput.value = option.dataset.value;
    }

    // Show / hide percentage field
    const percentageBox = document.getElementById("percentageBox");

    if (option.dataset.value === "Yes") {

        percentageBox.style.display = "block";

    } else {

        percentageBox.style.display = "none";

        const percentageInput =
            percentageBox.querySelector("input");

        if (percentageInput) {
            percentageInput.value = "1";

            if (percentageValueLabel) {
                percentageValueLabel.textContent = "1";
            }
        }

    }

});


// =====================================
// OCCUPATION
// =====================================

occupation.addEventListener("change", () => {

    if (occupation.value === "Student") {

        studentSection.style.display = "block";

    }

    else {

        studentSection.style.display = "none";

    }

});

// ===============================================
// INSTITUTION TYPE SELECTION
// ===============================================

document.addEventListener("click", function (e) {

    const option = e.target.closest(".institution-option");

    if (!option) return;

    // Remove selection
    document.querySelectorAll(".institution-option").forEach(item => {
        item.classList.remove("active");
    });

    // Highlight selected option
    option.classList.add("active");

    // Store value
    const institutionInput =
        document.getElementById("institutionType");

    if (institutionInput) {
        institutionInput.value = option.dataset.value;
    }

});



// ===============================================
// SUBMIT
// ===============================================

document.querySelector(".btn-success").addEventListener("click", (e) => {

    e.preventDefault();

    if (!validateStep(currentStep))
        return;

    const user = {

        gender: document.getElementById("gender").value,

        age: Number(document.getElementById("age").value),

        state: document.getElementById("state").value,

        area: document.getElementById("area").value,

        category: document.getElementById("category").value,

        disabled: document.getElementById("disabled").value === "Yes",

        disabilityPercentage: Number(document.getElementById("percentage").value || 0),

        occupation: document.getElementById("occupation").value,

        studentType: document.getElementById("studentType").value,

        academicLevel: document.getElementById("academicLevel").value,

        course: document.getElementById("course").value,

        institutionType: document.getElementById("institutionType").value,

        income: Number(document.getElementById("income").value)

    };

    localStorage.setItem("userData", JSON.stringify(user));

    window.location.href = "pages/results.html";

});