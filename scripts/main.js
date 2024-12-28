// Access utilities from utils.js
const { getQueryParam, getPathSegment } = window.utils;

// Main logic
document.addEventListener("DOMContentLoaded", () => {
    const id = getQueryParam('id');
    const customPath = getPathSegment(2); // Split path segment

    const contentElement = document.getElementById('content');

    if (id) {
        contentElement.textContent = `ID Parameter: ${id}`;
    } else if (customPath) {
        contentElement.textContent = `Custom Path: ${customPath}`;
    } else {
        contentElement.textContent = 'No customization provided.';
    }
});