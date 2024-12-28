document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("timeButton");
    const urlText = document.getElementById("urlText");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let url = urlParams.get('id');

    urlText.textContent = `Wow: ${url ? url : "None..."}`;

    if (button) {
        const currentTime = new Date().toLocaleTimeString();
        button.textContent = `Current Time: ${currentTime}`;

        button.addEventListener("click", () => {
            const updatedTime = new Date().toLocaleTimeString();
            button.textContent = `Current Time: ${updatedTime}`;
        });
    }
});
