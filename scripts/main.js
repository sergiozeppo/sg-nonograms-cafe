document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let id = urlParams.get('id');

    if(id) setupSolver(id);
    else setupCreator();
});

function setupSolver(id) {
    document.getElementById('solverDiv').style.display = 'block';
}

function setupCreator() {
    document.getElementById('creatorDiv').style.display = 'block';
}