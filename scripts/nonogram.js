const MOUSE_NONE = 0;
const MOUSE_LEFT = 1;
const MOUSE_RIGHT = 2;
const MOUSE_MID = 3;

const TYPE_CELL = 0;
const TYPE_HOR_HINT = 1;
const TYPE_VER_HINT = 2;
const TYPE_GROUP = 3;

const CELL_EMPTY = 0;
const CELL_BLACK = 1;
const CELL_WHITE = 2;

const ZOOM_FACTOR = 1.2;

// TODO Put it in the color palette
const FADED = 150;

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
let currAction;

let movesUndo = [];
let movesRedo = [];
let ended = false;

let id = 0;

const URL = `https://rosiminc.github.io/sg-nonograms/`;

// Load id
document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    id = urlParams.get('id') || getRandomId();
    numCols = parseInt(urlParams.get('w')) || 10;
    numRows = parseInt(urlParams.get('h')) || 10;

    let urlField = document.getElementById('url')
    urlField.value = `${URL}?id=${id}&w=${numCols}&h=${numRows}`;
});

function getRandomId() {
    let str = '';
    for (let i = 0; i < 5; i++) {
        let num = Math.floor(Math.random() * 62);
        str += num < 26 ? String.fromCharCode('a'.charCodeAt(0) + num) : // a-z
            num < 52 ? String.fromCharCode('A'.charCodeAt(0) + num - 26) : // A-Z
            String.fromCharCode('0'.charCodeAt(0) + num - 52); // 0-9
    }
    return str;
}

// Remove right click menu
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

function setup() {
    const canvas = createCanvas(500, 300);
    canvas.parent(document.getElementById('nonoDiv'));

    // TODO Clean up
    //getSeedFromValues(15, 40, "abC14");
    //generateHints(4, 5, Math.random()*160000);
    
    // Initialize colors
    cellColors = [
        color(200,255,165),  // Yellow 1
        color(200,215,165),  // Yellow 2
        color(165,255,200),  // Green 1
        color(165,215,200)   // Green 2
    ];

    loadHints();

    createGrid();
    resize();
}

function resize() {
    resizeCanvas(zoom * (2 * margin + (maxHorHints + numCols) * cellSize),
        zoom * (2 * margin + (maxVerHints + numRows) * cellSize));
}

function loadHints() {
    console.log(`Id: ${id}`)
    const infos = getPlayerFromId(id, numCols, numRows);

    numRows = infos.numRows;
    numCols = infos.numCols;
    horHints = infos.horHints;
    verHints = infos.verHints;

    /*numRows = 8;
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
    ]*/

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
    mouseMoved();

    scale(zoom);
    background(ended ? color(100, 200, 100) : color(225));

    translate(margin, margin);
    translate(maxHorHints * cellSize, maxVerHints * cellSize);
    
    drawHorHints();
    drawVerHints();
    drawGrid();
    drawPosHighlight();
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
            let checked = gridHorHints[row][i] == 1;

            noStroke();
            fill(checked ? FADED : 0);
            textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
            textAlign(CENTER, CENTER);
            text(hint, -(numHints - i - 0.5) * cellSize, (row + 0.5) * cellSize + 2);

            /*if(checked) {
                strokeWeight(3);
                stroke(FADED, 200);
                line((i - numHints) * cellSize + 2, row * cellSize + 6,
                    (i - numHints + 1) * cellSize - 2, (row + 1) * cellSize - 6);
            }*/
        }
    }
}

function drawVerHints() {
    for(let col = 0; col < numCols; col++) {
        let colHints = verHints[col];
        let numHints = colHints.length;

        for(let i = 0; i < numHints; i++) {
            let hint = colHints[i];
            let checked = gridVerHints[col][i] == 1;

            noStroke();
            fill(checked ? FADED : 0);
            textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
            textAlign(CENTER, CENTER);
            text(hint, (col + 0.5) * cellSize, -(numHints - i - 0.5) * cellSize + 2);
            
            /*if(checked) {
                strokeWeight(3);
                stroke(0, 200);
                line(col * cellSize + 2, (i - numHints) * cellSize + 6,
                    (col + 1) * cellSize - 2, (i - numHints + 1) * cellSize - 6);
            }*/
        }
    }
}

function drawPosHighlight() {
    const mouseInfo = getMouseInfo();
    noStroke();
    fill(0, 70);
    
    if(mouseInfo.inGridY && (mouseInfo.inGridX || mouseInfo.inHintsX)) {
        let numHints = horHints[mouseInfo.mouseRow].length;
        rect(-numHints * cellSize - 1, mouseInfo.mouseRow * cellSize - 1,
            (numHints + numCols) * cellSize + 2, cellSize + 2);
    }
    
    if(mouseInfo.inGridX && (mouseInfo.inGridY || mouseInfo.inHintsY)) {
        let numHints = verHints[mouseInfo.mouseCol].length
        rect(mouseInfo.mouseCol * cellSize - 1, -numHints * cellSize - 1,
            cellSize + 2, (numHints + numRows) * cellSize + 2);
    }
}

function getMouseInfo() {
    let inCanvas = !(mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height);;

    let mouseCol = floor((mouseX/zoom - margin)/cellSize) - maxHorHints;
    let mouseRow = floor((mouseY/zoom - margin)/cellSize) - maxVerHints;

    let inGridX = (mouseCol >= 0 && mouseCol < numCols);
    let inHintsX = (mouseCol < 0 && mouseCol > (-1-maxHorHints));
    let inGridY = (mouseRow >= 0 && mouseRow < numRows);
    let inHintsY = (mouseRow < 0 && mouseRow > (-1-maxVerHints));

    return { mouseCol, mouseRow, inCanvas,
        inGridX, inGridY, inHintsX, inHintsY
    };
}

function mousePressed() {
    const mouseInfo = getMouseInfo();
    if(!mouseInfo.inCanvas)
        return;

    if(mouseInfo.inGridX) {
        if(mouseInfo.inGridY) { // Inside the grid
            clickInGrid(mouseInfo.mouseRow, mouseInfo.mouseCol);
        } else if(mouseInfo.inHintsY) { // Inside the ver hints
            clickInVerHints(-1 - mouseInfo.mouseRow, mouseInfo.mouseCol);
        }
    } else if(mouseInfo.inHintsX && mouseInfo.inGridY) { // Inside the hor hints
        clickInHorHints(mouseInfo.mouseRow, -1 - mouseInfo.mouseCol);
    }
}

function mouseReleased() {
    let btn = MOUSE_NONE;
    if(mouseButton == LEFT)
        btn = MOUSE_LEFT;
    else if(mouseButton == RIGHT)
        btn = MOUSE_RIGHT;
    else if(mouseButton == CENTER)
        btn = MOUSE_MID;

    if(btn == mouseDown) {
        mouseDown = MOUSE_NONE;
    }
}

function mouseMoved() {
    if(mouseDown == MOUSE_NONE)
        return;

    const mouseInfo = getMouseInfo();
    if(mouseInfo.inGridX && mouseInfo.inGridY) {
        let currVal = grid[mouseInfo.mouseRow][mouseInfo.mouseCol];
        if(filling != currVal) {
            addSubAction({type: TYPE_CELL, row: mouseInfo.mouseRow, col: mouseInfo.mouseCol,
                from: currVal, to: filling});
        }
    }
}

function clickInGrid(mouseRow, mouseCol) {
    let currVal = grid[mouseRow][mouseCol];
    let nextVal = 0;
    let btn = MOUSE_NONE;

    if(mouseButton == LEFT) {
        btn = MOUSE_LEFT;
        nextVal = currVal == CELL_BLACK ? CELL_EMPTY : CELL_BLACK;
    } else if(mouseButton == RIGHT) {
        btn = MOUSE_RIGHT;
        nextVal = currVal == CELL_WHITE ? CELL_EMPTY : CELL_WHITE;
    } else if(mouseButton == CENTER) {
        btn = MOUSE_MID;
    }

    if(nextVal != currVal) {
        mouseDown = btn;
        filling = nextVal;
        doAction({type: TYPE_GROUP, subs: []});
        addSubAction({type: TYPE_CELL, row: mouseRow, col: mouseCol,
            from: currVal, to: nextVal});
    }
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

function addSubAction(action) {
    apply(action);
    currAction.subs.push(action);
}

function doAction(action) {
    if(action.type == TYPE_GROUP) {
        currAction = action;
    } else {
        apply(action);
    }
    movesUndo.push(action);
    movesRedo = [];
}

function undo() {
    mouseDown = MOUSE_NONE;
    if(movesUndo.length == 0)
        return;
    let action = movesUndo.pop();
    unapply(action);
    movesRedo.push(action);
}

function redo() {
    mouseDown = MOUSE_NONE;
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
    } else if(action.type == TYPE_GROUP) {
        for(let sub of action.subs)
            apply(sub);
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
    } else if(action.type == TYPE_GROUP) {
        for(let sub of action.subs)
            unapply(sub);
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