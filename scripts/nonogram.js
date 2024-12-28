let margin = 25;
let cellSize = 24;
let hintOffset = 8;

let numRows;
let horHints;
let maxHorHints;

let numCols;
let verHints;
let maxVerHints;

let grid;

let cellColors;
let hintColors;

let mouseDown = false;


function setup() {
    const canvas = createCanvas(500, 300);
    canvas.parent(document.getElementById('nonoDiv'));
    
    // Initialize colors
    cellColors = [
        color(200,255,165),  // Yellow 1
        color(200,215,165),  // Yellow 2
        color(165,255,200),  // Green 1
        color(165,215,200)   // Green 2
    ];

    hintColors = [
        color(230,230,230),  // Gray 1
        color(200,200,200)   // Gray 2
    ];

    loadHints();
    createGrid();
}

function loadHints() {
    numRows = 8;
    numCols = 10;

    horHints = [
        [2,2],
        [4,4],
        [1,2,2],
        [5,2,1],
        [1,2,4],
        [4,1,1],
        [1,1,3],
        [5,1],
    ]

    verHints = [
        [6],
        [2,1,1,1],
        [2,5],
        [5,1],
        [3,1],
        [1],
        [1,5],
        [2,2,1],
        [3,3],
        [3]
    ]

    maxHorHints = countMaxHints(horHints);
    maxVerHints = countMaxHints(verHints);

    console.log(maxVerHints);

    resizeCanvas(2 * margin + hintOffset + (maxHorHints + numCols) * cellSize,
        2 * margin + hintOffset + (maxVerHints + numRows) * cellSize);
}

function createGrid() {
    grid = Array.from({ length: numRows }, () => Array(numCols).fill(0));
    console.log(grid);
}

function countMaxHints(hints) {
    let max = 0;
    for(let h of hints) {
        let num = h.length;
        if(num > max)
            max = num;
    }
    return max;
}

function draw() {
    background(255);

    translate(margin, margin);
    translate(maxHorHints * cellSize, maxVerHints * cellSize);
    
    drawSolvingSection();
    drawHorHints();
    drawVerHints();

    noStroke();
}

function drawSolvingSection() {
    noStroke();
    strokeWeight(1);
    stroke(0,0,0);
    for(let row = 0; row < numRows; row++) {
        for(let col = 0; col < numCols; col++) {
            fill(cellColors[2 * ((floor(row/5) + floor(col/5)) % 2) + (row + col) % 2]);
            rect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    noFill();
    strokeWeight(3);
    for(let row = 0; row < numRows; row+=5) {
        let rowLen = min(numRows - row, 5);

        for(let col = 0; col < numCols; col += 5) {
            let colLen = min(numCols - col, 5);

            rect(col * cellSize, row * cellSize, colLen * cellSize, rowLen * cellSize);
        }
    }
}

function drawHorHints() {
    for(let row = 0; row < numRows; row++) {
        let rowHints = horHints[row];
        let numHints = rowHints.length;

        for(let i = 0; i < numHints; i++) {
            let hint = rowHints[i];

            noStroke();
            fill(hintColors[floor(floor(numHints - 1 - i) % 2 + row) % 2]);
            rect((i - numHints) * cellSize - hintOffset, row * cellSize, cellSize, cellSize);
            
            fill(0);
            textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
            textAlign(CENTER, CENTER);
            text(hint, -(numHints - i - 0.5) * cellSize - hintOffset, (row + 0.5) * cellSize + 2);
        }
    }
}

function drawVerHints() {
    for(let col = 0; col < numCols; col++) {
        let colHints = verHints[col];
        let numHints = colHints.length;

        for(let i = 0; i < numHints; i++) {
            let hint = colHints[i];

            noStroke();
            fill(hintColors[floor(floor(numHints - 1 - i) % 2 + col) % 2]);
            rect(col * cellSize, (i - numHints) * cellSize - hintOffset, cellSize, cellSize);

            noStroke();
            fill(0);
            textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
            textAlign(CENTER, CENTER);
            text(hint, (col + 0.5) * cellSize, -(numHints - i - 0.5) * cellSize - hintOffset + 2);
        }
    }
}

function mousePressed() {
    if(mouseX < 0 || mouseX < width ||
        mouseY > 0 || mouseY < height)
        return;

    document.querySelector('h1').textContent = "Wow!";
}
