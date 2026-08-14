function googleTranslateElementInit() {

    new google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "hi",
        autoDisplay: false
    }, "google_translate_element");

}


// =========================================
// HINDI BUTTON
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const translateBtn = document.getElementById("translateBtn");
    const translateText = translateBtn.querySelector(".translate-text");

    if (!translateBtn) return;

    translateBtn.addEventListener("click", function () {

        const select = document.querySelector(".goog-te-combo");

        if (!select) return;


        // ================================
        // ENGLISH → HINDI
        // ================================

        if (translateBtn.dataset.language !== "hi") {

            select.value = "hi";
            select.dispatchEvent(new Event("change"));

            translateText.textContent = "English";

            translateBtn.dataset.language = "hi";

        }


        // ================================
        // HINDI → ENGLISH
        // ================================

        else {

            document.cookie =
                "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            document.cookie =
                "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
                window.location.hostname + ";";

            window.location.reload();

        }

    });

});


// =========================================
// HIDE GOOGLE TRANSLATE BAR
// =========================================

function hideGoogleBar() {

    // Google adds this class to the body
    document.body.style.top = "0px";

    // Hide banner frame
    const frames = document.querySelectorAll(
        ".goog-te-banner-frame, .skiptranslate"
    );

    frames.forEach(function (element) {

        if (element !== document.getElementById("google_translate_element")) {

            element.style.display = "none";
            element.style.visibility = "hidden";
            element.style.height = "0";
            element.style.minHeight = "0";
        }

    });

}


// Run after Google loads
setTimeout(hideGoogleBar, 500);
setTimeout(hideGoogleBar, 1000);
setTimeout(hideGoogleBar, 2000);
setTimeout(hideGoogleBar, 3000);
setTimeout(hideGoogleBar, 5000);