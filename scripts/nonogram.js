const MOUSE_NONE = 0;
const MOUSE_LEFT = 1;
const MOUSE_RIGHT = 2;
const MOUSE_MID = 3;

const TYPE_CELL = 0;
const TYPE_HOR_HINT = 1;
const TYPE_VER_HINT = 2;

const CELL_EMPTY = 0;
const CELL_BLACK = 1;
const CELL_WHITE = 2;

const ZOOM_FACTOR = 1.2;

let zoom = 1;

let margin = 12;
let cellSize = 30;

let numRows;
let horHints;
let maxHorHints;

let numCols;
let verHints;
let maxVerHints;

let grid;
let gridHorHints;
let gridVerHints;

let cellColors;

let mouseDown = MOUSE_NONE; // None, Left, Right, Mid
let filling;

let movesUndo = [];
let movesRedo = [];
let ended = false;


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

    loadHints();

    resize();
    createGrid();
}

function resize() {
    resizeCanvas(zoom * (2 * margin + (maxHorHints + numCols) * cellSize),
        zoom * (2 * margin + (maxVerHints + numRows) * cellSize));
}

function loadHints() {
    // TODO Load grid

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
}

function createGrid() {
    grid = Array.from({ length: numRows }, () => Array(numCols).fill(0));

    gridHorHints = [];
    for(let hints of horHints)
        gridHorHints.push(Array(hints.length).fill(0));

    gridVerHints = [];
    for(let hints of verHints)
        gridVerHints.push(Array(hints.length).fill(0));
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
    scale(zoom);
    background(225);

    translate(margin, margin);
    translate(maxHorHints * cellSize, maxVerHints * cellSize);
    
    drawHorHints();
    drawVerHints();
    drawGrid();

    noStroke();
}

function drawGrid() {
    stroke(0);
    for(let row = 0; row < numRows; row++) {
        for(let col = 0; col < numCols; col++) {
            let gridVal = grid[row][col];
            let cellColor = cellColors[2 * ((floor(row/5) + floor(col/5)) % 2) + (row + col) % 2];
            if(gridVal == CELL_BLACK) {
                cellColor = lerpColor(cellColor, color('black'), 0.9);
            } else if(gridVal == CELL_WHITE) {
                cellColor = lerpColor(cellColor, color('white'), 0.5);
            }

            strokeWeight(1);
            fill(cellColor);
            rect(col * cellSize, row * cellSize, cellSize, cellSize);

            strokeWeight(5);
            if(gridVal == CELL_WHITE)
                point((col + 0.5) * cellSize, (row + 0.5) * cellSize);
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
            fill(0);
            textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
            textAlign(CENTER, CENTER);
            text(hint, -(numHints - i - 0.5) * cellSize, (row + 0.5) * cellSize + 2);

            if(gridHorHints[row][i] == 1) {
                strokeWeight(3);
                stroke(0, 200);
                line((i - numHints) * cellSize + 2, row * cellSize + 6,
                    (i - numHints + 1) * cellSize - 2, (row + 1) * cellSize - 6);
            }
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
            fill(0);
            textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
            textAlign(CENTER, CENTER);
            text(hint, (col + 0.5) * cellSize, -(numHints - i - 0.5) * cellSize + 2);
            
            if(gridVerHints[col][i] == 1) {
                strokeWeight(3);
                stroke(0, 200);
                line(col * cellSize + 2, (i - numHints) * cellSize + 6,
                    (col + 1) * cellSize - 2, (i - numHints + 1) * cellSize - 6);
            }
        }
    }
}

function mousePressed() {
    if(mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height)
        return;

    let mouseCol = floor((mouseX/zoom - margin)/cellSize) - maxHorHints;
    let mouseRow = floor((mouseY/zoom - margin)/cellSize) - maxVerHints;

    let inGridX = (mouseCol >= 0 && mouseCol <= numCols);
    let inHintsX = (mouseCol < 0 && mouseCol >= (-1-maxHorHints));
    let inGridY = (mouseRow >= 0 && mouseRow <= numRows);
    let inHintsY = (mouseRow < 0 && mouseRow >= (-1-maxVerHints));

    if(inGridX) {
        if(inGridY) { // Inside the grid
            clickInGrid(mouseRow, mouseCol);
        } else if(inHintsY) { // Inside the ver hints
            clickInVerHints(-1-mouseRow, mouseCol);
        }
    } else if(inHintsX && inGridY) { // Inside the hor hints
        clickInHorHints(mouseRow, -1-mouseCol);
    }
}

function clickInGrid(mouseRow, mouseCol) {
    let currVal = grid[mouseRow][mouseCol];
    let nextVal = 0;

    if(mouseButton == LEFT) {
        nextVal = currVal == CELL_BLACK ? CELL_EMPTY : CELL_BLACK;
    } else if(mouseButton == RIGHT) {
        nextVal = currVal == CELL_WHITE ? CELL_EMPTY : CELL_WHITE;
    }

    if(nextVal != currVal)
        doAction({type: TYPE_CELL, row: mouseRow, col: mouseCol,
        from: currVal, to: nextVal});
}

function clickInHorHints(mouseRow, mouseCol) {
    let hints = gridHorHints[mouseRow];
    let num = hints.length;
    if(mouseCol < num)
        doAction({type: TYPE_HOR_HINT, row: mouseRow, num: num - mouseCol - 1});
}

function clickInVerHints(mouseRow, mouseCol) {
    let hints = gridVerHints[mouseCol];
    let num = hints.length;
    if(mouseRow < num)
        doAction({type: TYPE_VER_HINT, col: mouseCol, num: num - mouseRow - 1});
}

function doAction(action) {
    apply(action);
    movesUndo.push(action);
    movesRedo = [];
}

function undo() {
    if(movesUndo.length == 0)
        return;
    let action = movesUndo.pop();
    unapply(action);
    movesRedo.push(action);
}

function redo() {
    if(movesRedo.length == 0)
        return;
    let action = movesRedo.pop();
    apply(action);
    movesUndo.push(action);
}

function apply(action) {
    if(action.type == TYPE_CELL) {
        grid[action.row][action.col] = action.to;
        checkSolution();
    } else if(action.type == TYPE_HOR_HINT) {
        let hints = gridHorHints[action.row];
        hints[action.num] = 1 - hints[action.num];
    } else if(action.type == TYPE_VER_HINT) {
        let hints = gridVerHints[action.col];
        hints[action.num] = 1 - hints[action.num];
    }
}

function unapply(action) {
    if(action.type == TYPE_CELL) {
        grid[action.row][action.col] = action.from;
    } else if(action.type == TYPE_HOR_HINT) {
        let hints = gridHorHints[action.row];
        hints[action.num] = 1 - hints[action.num];
    } else if(action.type == TYPE_VER_HINT) {
        let hints = gridVerHints[action.col];
        hints[action.num] = 1 - hints[action.num];
    }
}

function checkSolution() {
    if(!ended && isSolved()) {
        ended = true;
        console.log("Solved!!");
    }
}

function isSolved() {
    // Check each row
    for(let row = 0; row < numRows; row++) {
        console.log(`Checking row ${row}`);
        let hints = horHints[row];
        let numHints = hints.length;

        let currCount = 0;
        let currGroup = 0;

        for(let col = 0; col <= numCols; col++) {
            if(col == numCols || grid[row][col] != CELL_BLACK) { // White or after last cell
                if(currCount > 0) {
                    if(currGroup >= numHints || hints[currGroup] != currCount) {
                        return false;
                    } else {
                        currCount = 0;
                        currGroup++;
                    }
                }
            } else { // Black cell
                currCount++;
            }
        }
        if(currGroup != numHints) {
            return false;
        }
    }

    // Check each col
    for(let col = 0; col < numCols; col++) {
        console.log(`Checking col ${col}`);
        let hints = verHints[col];
        let numHints = hints.length;

        let currCount = 0;
        let currGroup = 0;

        for(let row = 0; row <= numRows; row++) {
            if(row == numRows || grid[row][col] != CELL_BLACK) { // White or after last cell
                if(currCount > 0) {
                    if(currGroup >= numHints || hints[currGroup] != currCount) {
                        return false;
                    } else {
                        currCount = 0;
                        currGroup++;
                    }
                }
            } else { // Black cell
                currCount++;
            }
        }
        if(currGroup != numHints) {
            return false;
        }
    }

    return true;
}

function displayGrid() {
    let str = '';
    for(let row = 0; row < numRows; row++) {
        for(let col = 0; col < numCols; col++) {
            let val = grid[row][col];
            str += val == 0 ? '  ' : val == 1 ? ' X' : ' .';
        }
        str += '\n';
    }
    console.log(str);
}

function zoomIn() {
    zoom *= ZOOM_FACTOR;
    resize();
}

function zoomOut() {
    zoom /= ZOOM_FACTOR;
    resize();
}

function keyPressed() {
    if (keyCode === RIGHT_ARROW || (key === 'y' && keyIsDown(CONTROL))) {
        redo();
    } else if (keyCode === LEFT_ARROW || (key === 'z' && keyIsDown(CONTROL))) {
        undo();
    } else if (keyCode === UP_ARROW || key === '+' ) {
        zoomIn();
    } else if (keyCode === DOWN_ARROW || key === '-' ) {
        zoomOut();
    }
}
    //document.querySelector('h1').textContent = "Wow!";