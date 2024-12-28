// Function to get query parameter by name
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to extract path segments
function getPathSegment(index) {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments.length > index ? pathSegments[index] : null;
}

// Export functions (optional if you're not using ES6 modules)
window.utils = { getQueryParam, getPathSegment };
