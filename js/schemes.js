// ===================================================
// Government & Private Scholarship Schemes Database
// ===================================================

const schemes = [

    //HDFC Bank Parivartan ECSS
    {
        id: 1,
        schemeName: "HDFC Bank Parivartan ECSS",
        occupation: "Student",
        organization: "HDFC Bank",
        schemeType: "CSR",
        category: "Education",
        state: "All",
        gender: "Any",
        minAge: 17,
        maxAge: 40,
        student: true,
        academicLevel: "Any",
        incomeLimit: 250000,
        disability: false,
        disabilityPercentage: 0,
        benefit: "₹15,000 - ₹75,000",
        applyMode: "Online",
        website: "https://www.parivartanecss.com/",
        eligibility(user){
            return(
                    user.occupation === "Student" &&
                    user.studentType === "College Student" &&
                    user.academicLevel === "Undergraduate" &&
                    user.course === "Engineering"&&
                    (
                        user.institutionType === "Government" ||
                        user.institutionType === "Private" ||
                        user.institutionType === "Aided"
                    ) &&
                    user.age >= 17 &&
                    user.age <= 40 &&
                    user.income <= 250000
            );
        }
    },


    //Reliance Foundation Undergraduate Scholarship
    {

        id:2,
        schemeName:"Reliance Foundation Undergraduate Scholarship",
        occupation: "Student",
        organization:"Reliance Foundation",
        schemeType:"Private",
        category:"Education",
        state:"All",
        gender:"Any",
        minAge:17,
        maxAge:25,
        student:true,
        academicLevel:"Undergraduate",
        incomeLimit:250000,
        disability:false,
        disabilityPercentage:0,
        benefit:"Up to ₹2,00,000",
        applyMode:"Online",
        website:"https://scholarships.reliancefoundation.org",
        eligibility(user){
            return(
                    user.occupation === "Student" &&
                    user.studentType === "College Student" &&
                    user.academicLevel === "Undergraduate" &&
                    user.course === "Engineering" &&
                    (
                        user.institutionType === "Government" ||
                        user.institutionType === "Private" ||
                        user.institutionType === "Aided"
                    )&&
                    user.age>=17 &&
                    user.age<=25 &&
                    user.income <= 250000
            );
        }

    },



    //Tata Capital Pankh Scholarship
    {

        id:3,
        schemeName:"Tata Capital Pankh Scholarship",
        occupation: "Student",
        organization:"Tata Capital",
        schemeType:"CSR",
        category:"Education",
        state:"All",
        gender:"Any",
        minAge:17,
        maxAge:25,
        student:true,
        academicLevel:"Any",
        incomeLimit:250000,
        disability:false,
        disabilityPercentage:0,
        benefit:"₹10,000 - ₹1,00,000",
        applyMode:"Online",
        website:"https://www.buddy4study.com/page/the-tata-capital-pankh-scholarship-programme",
        eligibility(user){
            return(
                    user.occupation === "Student"&&
                    user.studentType === "College Student"&&
                    user.academicLevel === "Any"&&
                    user.course === "All"&&
                    (
                        user.institutionType === "Government" ||
                        user.institutionType === "Private" ||
                        user.institutionType === "Aided"
                    ),
                    user.age>=17 &&
                    user.age<=25 &&
                    user.income <= 250000
                );
        }
    },


    //Infosys Foundation STEM Stars
    {

        id:4,
        schemeName:"Infosys Foundation STEM Stars",
        occupation: "Student",
        organization:"Infosys Foundation",
        schemeType:"CSR",
        category:"Education",
        state:"All",
        gender:"Female",
        minAge:17,
        maxAge:22,
        student:true,
        academicLevel:"Undergraduate",
        incomeLimit:800000,
        disability:false,
        disabilityPercentage:0,
        benefit:"₹50,000 - ₹1,00,000",
        applyMode:"Online",
        website:"https://www.buddy4study.com/page/infosys-stem-stars-scholarship",
        eligibility(user){
            return(
                user.gender==="Female" &&
                user.occupation==="Student" &&
                user.studentType==="College Student" &&
                user.academicLevel==="Undergraduate" &&
                user.course==="Engineering" &&
                (
                    user.institutionType === "Government" ||
                    user.institutionType === "Private" ||
                    user.institutionType === "Aided"
                ) &&
                user.age>=17 &&
                user.age<=22 &&
                user.income<=800000
            );
        }
    },


    //Siemens Scholarship Program
    {

        id:5,
        schemeName:"Siemens Scholarship Program",
        occupation: "Student",
        organization:"Siemens",
        schemeType:"CSR",
        category:"Education",
        state:"All",
        gender:"Any",
        minAge:17,
        maxAge:25,
        student:true,
        academicLevel:"Engineering",
        incomeLimit:200000,
        disability:false,
        disabilityPercentage:0,
        benefit:"Tuition Fees + Internship + Training",
        applyMode:"Online",
        website:"https://www.siemens.com/en-us/company/sustainability/corporate-citizenship-india/scholarship-program/",
        eligibility(user){
            return(
                user.occupation==="Student" &&
                user.studentType==="College Student" &&
                user.academicLevel==="Undergraduate" &&
                user.course==="Engineering" &&
                (
                    user.institutionType === "Government" ||
                    user.institutionType === "Private" ||
                    user.institutionType === "Aided"
                ) &&
                user.age>=17 &&
                user.age<=25 &&
                user.income<=200000
            );
        }
    },


    // PM-KISAN
    {
        id: 6,
        schemeName: "PM-KISAN",
        occupation: "Farmer",
        organization: "Ministry of Agriculture",
        schemeType: "Government",
        category: "Agriculture",
        state: "All",
        gender: "Any",
        minAge: 18,
        maxAge: 100,
        occupation: "Farmer",
        area: "Rural",
        incomeLimit: "No Limit",
        benefit: "₹6,000 per year (DBT)",
        applyMode: "Online",
        website: "https://pmkisan.gov.in",
        eligibility(user){
            return(
                user.age>=18 &&
                user.occupation==="Farmer" &&
                user.area==="Rural"
            );
        }
    },


    // PM KUSUM
    {
        id:7,
        schemeName:"PM KUSUM",
        occupation: "Farmer",
        organization:"MNRE",
        schemeType:"Government",
        category:"Agriculture",
        state:"All",
        gender:"Any",
        minAge:18,
        maxAge:100,
        occupation:"Farmer",
        area:"Rural",
        incomeLimit:"No Limit",
        benefit:"Solar Pump Subsidy",
        applyMode:"Online",
        website:"https://pmkusum.mnre.gov.in",
        eligibility(user){
            return(
                user.age>=18 &&
                user.occupation==="Farmer" &&
                user.area==="Rural"
            );
        }
    },


    // Prime Minister's Employment Generation Programme
    {
        id:8,
        schemeName:"PMEGP(Prime Minister's Employment Generation Programme)",
        occupation: "Business Owner",
        organization:"MSME",
        schemeType:"Government",
        category:"Employment",
        state:"All",
        gender:"Any",
        minAge:18,
        maxAge:100,
        occupation:"Business Owner",
        area:"Any",
        incomeLimit:"No Limit",
        benefit:"Loan Subsidy",
        applyMode:"Online",
        website:"https://xn--i1bn6adp9emg4dcbcajdeflxp1gua1n7bt10abief.xn--11b7cb3a6a.xn--h2brj9c/offerings/schemes-and-services/details/prime-minister-employment-generation-programme-and-other-credit-support-schemes-1-MDMzETMtQWa",
        eligibility(user){
            return(
                user.age>=18 &&
                user.occupation==="Business Owner"
            );
        }
    },


    // Mudra Loan
    {
        id:9,
        schemeName:"Pradhan Mantri Mudra Loan",
        occupation: "Business Owner",
        organization:"Ministry of Finance",
        schemeType:"Government",
        category:"Finance",
        state:"All",
        gender:"Any",
        minAge:18,
        maxAge:100,
        occupation:"Business Owner",
        area:"Any",
        incomeLimit:"No Limit",
        benefit:"Business Loan",
        applyMode:"Online",
        website:"https://www.mudra.org.in",
        eligibility(user){
            return(
                user.age>=18 &&
                user.occupation==="Business Owner"
            );
        }
    },


    // Startup India
    {
        id:10,
        schemeName:"Startup India",
        occupation: "Startup Founder",
        organization:"DPIIT",
        schemeType:"Government",
        category:"Startup",
        state:"All",
        gender:"Any",
        minAge:18,
        maxAge:100,
        occupation:"Startup Founder",
        area:"Any",
        incomeLimit:"200 crore for regular entities and ₹300 crore for deep-tech startups",
        benefit:"Funding & Recognition",
        applyMode:"Online",
        website:"https://www.startupindia.gov.in",
        eligibility(user){
            return(
                user.age>=18 &&
                user.occupation==="Startup Founder"
            );
        }
    },


    //MahaDBT(Maharashtra Direct Benefit Transfer) Scholarship
    {
        id:11,
        schemeName:"MahaDBT(Maharashtra Direct Benefit Transfer) Scholarship",
        occupation: "Student",
        organization:"Maharashtra State Government",
        schemeType:"Government",
        category:"Education",
        state:"Maharashtra",
        gender:"Any",
        minAge:17,
        maxAge:30,
        student:true,
        academicLevel:"Undergraduate",
        incomeLimit:800000,
        disability:false,
        disabilityPercentage:0,
        benefit:"Tuition Fee Reimbursement",
        applyMode:"Online",
        website:"https://mahadbt2.maharashtra.gov.in/",
        eligibility(user){
            return(
                user.occupation==="Student" &&
                user.studentType === "College Student" &&
                user.academicLevel==="Undergraduate" &&
                user.course === "Engineering" &&
                (
                        user.institutionType === "Government" ||
                        user.institutionType === "Private" ||
                        user.institutionType === "Aided"
                ) &&
                user.age>=17 &&
                user.age<=30 &&
                user.income<=800000
            );
        }

    },


    //Ayushman Bharat PM-JAY
    {
        id:12,
        schemeName:"Ayushman Bharat PM-JAY",
        occupation:"Any",
        organization:"Ministry of Health and Family Welfare",
        schemeType:"Government",
        category:"Healthcare",
        state:"All India",
        gender:"Any",
        minAge:0,
        maxAge:100,
        student:false,
        academicLevel:"Any",
        incomeLimit:"None",
        disability:false,
        disabilityPercentage:0,
        benefit:"Cashless Health Insurance Cover up to ₹5 Lakh per Family per Year",
        applyMode:"Online",
        website:"https://beneficiary.nha.gov.in/",
        eligibility(user){
            return(
                user.age>=0 &&
                user.age<=100
            );
        }
    },


    {
    id:13,
    schemeName:"Pradhan Mantri Matru Vandana Yojana",
    occupation:"Any",
    organization:"Ministry of Women and Child Development",
    schemeType:"Government",
    category:"Women",
    state:"All India",
    gender:"Female",
    minAge:19,
    maxAge:50,
    student:false,
    academicLevel:"Any",
    incomeLimit:800000,
    disability:false,
    disabilityPercentage:0,
    benefit:"Cash Assistance for Pregnant and Lactating Mothers",
    applyMode:"Online",
    website:"https://wcd.delhi.gov.in/wcd/pradhan-mantri-matru-vandana-yojana-pmmvy",
    eligibility(user){
        return(
            user.gender==="Female" &&
            user.age>=19 &&
            user.age<=50
        );
    }
},

];