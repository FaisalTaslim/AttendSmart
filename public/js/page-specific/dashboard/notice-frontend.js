document.addEventListener("DOMContentLoaded", () => {
    const dateTimeInput = document.getElementById("dateTime");

    const now = new Date();
    dateTimeInput.value = now.toISOString().slice(0, 16);
});