let id = 0;

document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    id = urlParams.get('id');

    if(id) setupSolver(id);
    else setupCreator();
});

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

function setupSolver(id) {
    document.getElementById('solverDiv').style.display = 'block';
}

function setupCreator() {
    document.getElementById('creatorDiv').style.display = 'block';
}