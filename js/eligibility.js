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
const disabilitySelect = document.getElementById("disabled");
const occupation = document.getElementById("occupation");
const studentSection = document.getElementById("studentSection");
const percentageBox = document.getElementById("percentageBox");

let currentStep = 0;


// ===============================================
// INITIALIZE
// ===============================================

showStep(currentStep);


// ===============================================
// SHOW STEP
// ===============================================

function showStep(step){

    steps.forEach((item,index)=>{

        item.classList.remove("active");

        if(index===step){

            item.classList.add("active");

        }

    });

    currentStepText.innerHTML = step+1;

    progressBar.style.width=((step+1)/steps.length)*100+"%";

}



// ===============================================
// VALIDATION
// ===============================================

function validateStep(step){

    const inputs = steps[step].querySelectorAll("input,select");

    for(let input of inputs){

        // Skip hidden fields
        if(input.offsetParent === null){
        continue;
        }

        if(input.tagName === "SELECT"){

            if(input.value === ""){

                alert("Please complete all required fields.");

                input.focus();

                return false;

            }

        }
        else{

            if(input.value.trim() === ""){

                alert("Please complete all required fields.");

                input.focus();

                return false;

            }

        }

    }

    // Age Validation
    if(step === 0){

        const age = Number(ageInput.value);

        if(age < 1 || age > 100){

            alert("Age must be between 1 and 100.");

            ageInput.focus();

            return false;

        }

    }

    if(step===4){

        if(occupation.value === "Student"){

            const studentType = document.getElementById("studentType");
            const academicLevel = document.getElementById("academicLevel");
            const course = document.getElementById("course");

            if(studentType.value === ""){
                alert("Please select Student Type.");
                studentType.focus();
                return false;
            }

            if(academicLevel.value === ""){
                alert("Please select Academic Level.");
                academicLevel.focus();
                return false;
            }

            if(course.value.trim() === ""){
                alert("Please enter your Course.");
                course.focus();
                return false;
            }

        }
    }

    return true;

}

ageInput.addEventListener("input", function () {

    if (this.value > 100) {
        this.value = 100;
    }

    if (this.value < 1 && this.value !== "") {
        this.value = 1;
    }

});



// ===============================================
// NEXT BUTTON
// ===============================================

nextBtns.forEach(btn=>{

    btn.addEventListener("click",()=>{

        if(!validateStep(currentStep))
            return;



        if(currentStep<steps.length-1){

            currentStep++;

            showStep(currentStep);

        }

    });

});



// ===============================================
// PREVIOUS BUTTON
// ===============================================

prevBtns.forEach(btn=>{

    btn.addEventListener("click",()=>{


        if(currentStep>0){

            currentStep--;

            showStep(currentStep);

        }

    });

});



// ===============================================
// RESET BUTTON
// ===============================================

resetBtns.forEach(btn=>{

    btn.addEventListener("click",()=>{

        const inputs=steps[currentStep].querySelectorAll("input,select");

        inputs.forEach(input=>{

            if(input.tagName==="SELECT"){

                input.selectedIndex=0;

            }

            else{

                input.value="";

            }

        });

    });

});



// ===============================================
// DISABILITY
// ===============================================

disabilitySelect.addEventListener("change",()=>{

    if(disabilitySelect.value==="Yes"){

        percentageBox.style.display="block";

    }

    else{

        percentageBox.style.display="none";

        percentageBox.querySelector("input").value="";

    }

});


// =====================================
// OCCUPATION
// =====================================

occupation.addEventListener("change",()=>{

    if(occupation.value==="Student"){

        studentSection.style.display="block";

    }

    else{

        studentSection.style.display="none";

    }

});



// ===============================================
// SUBMIT
// ===============================================

document.querySelector(".btn-success").addEventListener("click",(e)=>{

    e.preventDefault();

    if(!validateStep(currentStep))
        return;

    const user={

        gender:document.getElementById("gender").value,

        age:Number(document.getElementById("age").value),

        state:document.getElementById("state").value,

        area:document.getElementById("area").value,

        category:document.getElementById("category").value,

        disabled:document.getElementById("disabled").value==="Yes",

        disabilityPercentage:Number(document.getElementById("percentage").value||0),

        occupation: document.getElementById("occupation").value,

        studentType: document.getElementById("studentType").value,

        academicLevel: document.getElementById("academicLevel").value,

        course: document.getElementById("course").value,

        income: Number(document.getElementById("income").value)

    };

    localStorage.setItem("userData",JSON.stringify(user));

    window.location.href="results.html";

});