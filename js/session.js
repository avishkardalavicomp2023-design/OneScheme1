(function () {
    "use strict";

    const SESSION_KEY = "oneScheme_session";

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("Unable to read session:", error);
            return null;
        }
    }

    function getRole(session) {
        if (!session) return null;

        // Old accounts without a role are treated as normal users
        if (!session.role) return "user";

        return String(session.role).toLowerCase().trim();
    }

    function isUser(session) {
        return getRole(session) === "user";
    }

    function updateSavedSchemesVisibility() {

        const session = getSession();

        // Only normal users can see Saved Schemes
        const showSavedSchemes = isUser(session);

        document
            .querySelectorAll("#viewSavedBtn, .saved-schemes-nav")
            .forEach(function (element) {

                element.style.display =
                    showSavedSchemes ? "" : "none";
            });

        // Update saved scheme count
        const countElement =
            document.getElementById("savedCount");

        if (countElement && showSavedSchemes) {

            try {

                const savedIds = JSON.parse(
                    localStorage.getItem("savedSchemes") || "[]"
                );

                countElement.textContent =
                    Array.isArray(savedIds)
                        ? savedIds.length
                        : 0;

            } catch (error) {

                countElement.textContent = "0";
            }
        }
    }

    window.OneSchemeSession = {
        getSession,
        getRole,
        isUser,
        updateSavedSchemesVisibility
    };

    document.addEventListener(
        "DOMContentLoaded",
        updateSavedSchemesVisibility
    );

})();