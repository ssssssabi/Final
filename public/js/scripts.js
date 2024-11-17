document.addEventListener("DOMContentLoaded", () => {
    console.log("Page Loaded");
    // Example: Alert on form submission
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
        form.addEventListener("submit", () => {
            alert("Form submitted successfully!");
        });
    });
});
