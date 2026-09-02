/* =====================================================
                LOAD SELECTED SCHEMES
===================================================== */

const selectedIds =
    JSON.parse(localStorage.getItem("compareSchemes")) || [];

const selectedSchemes =
    schemes.filter(s => selectedIds.includes(s.id));

const compareTable = document.getElementById("compareTable");

/* =====================================================
                NO SCHEMES SELECTED
===================================================== */

if (selectedSchemes.length < 2) {

    compareTable.innerHTML = `
        <tr>
            <td colspan="100%" class="text-center py-5">
                <h3>No Schemes Selected</h3>

                <p>Please select at least two schemes to compare.</p>

                <a href="results.html" class="btn btn-primary mt-3">
                    Back to Results
                </a>
            </td>
        </tr>
    `;

} else {

    generateComparison();

}

/* =====================================================
                GENERATE TABLE
===================================================== */

function generateComparison() {

    const features = [
        {
            title: "Scheme Name",
            key: "schemeName"
        },
        {
            title: "Organization",
            key: "organization"
        },
        {
            title: "Category",
            key: "category"
        },
        {
            title: "Scheme Type",
            key: "schemeType"
        },
        {
            title: "Occupation",
            key: "occupation"
        },
        {
            title: "Benefit",
            key: "benefit"
        },
        {
            title: "State",
            key: "state"
        },
        {
            title: "Gender",
            key: "gender"
        },
        {
            title: "Age",
            custom: scheme => `${scheme.minAge} - ${scheme.maxAge}`
        },
        {
            title: "Income Limit",
            custom: scheme => {

                if (scheme.incomeLimit === Number.MAX_SAFE_INTEGER) {
                    return "No Income Limit";
                }

                return "₹" + scheme.incomeLimit.toLocaleString();

            }
        },
        {
            title: "Apply Mode",
            key: "applyMode"
        },
        {
            title: "Website",
            custom: scheme => `
                <a
                    href="${scheme.website}"
                    target="_blank"
                    class="btn btn-success btn-sm">
                    Apply
                </a>
            `
        }
    ];

    let html = "";

    /* ===============================
            HEADER
    ================================ */

    html += `
    <tr>
        <th>Feature</th>
    `;

    selectedSchemes.forEach(scheme => {

        html += `
        <th>
            ${scheme.schemeName}
        </th>
        `;

    });

    html += `</tr>`;

    /* ===============================
            BODY
    ================================ */

    features.forEach(feature => {

        html += `
        <tr>
            <td>
                <strong>${feature.title}</strong>
            </td>
        `;

        selectedSchemes.forEach(scheme => {

            let value = "";

            if (feature.key) {
                value = scheme[feature.key];
            } else {
                value = feature.custom(scheme);
            }

            html += `
            <td>
                ${value}
            </td>
            `;

        });

        html += `
        </tr>
        `;

    });

    compareTable.innerHTML = html;

}