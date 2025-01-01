import * as nono from './util/nono-utils.js';

const sketch = (p, id) => {
    const MOUSE_BTN = {
        NONE: 0,
        LEFT: 1,
        RIGHT: 2,
        MID: 3
    };

    const ACTION_TYPE = {
        CELL: 0,
        HOR_HINT: 1,
        VER_HINT: 2,
        GROUP: 3
    }
    
    const CELL_MARK = {
        EMPTY: 0,
        BLACK: 1,
        WHITE: 2
    };

    const ZOOM_FACTOR = 1.2;
    const FADED = 150; // TODO Put it in the color palette

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

    let mouseDown = MOUSE_BTN.NONE;
    let filling;
    let currAction;

    let movesUndo = [];
    let movesRedo = [];
    let ended = false;

    const PAGE_URL = `https://rosiminc.github.io/sg-nonograms/`;

    p.setup = function() {
        console.log('WAAH')
        const canvas = p.createCanvas(500, 300);
        canvas.parent(document.getElementById('nonoDiv'));

        initializeColors();

        loadHints();

        resetGrid();
        resize();
    }

    function initializeColors() {
        cellColors = [
            p.color(200,255,165),  // Yellow 1
            p.color(200,215,165),  // Yellow 2
            p.color(165,255,200),  // Green 1
            p.color(165,215,200)   // Green 2
        ];
    }

    function resize() {
        p.resizeCanvas(zoom * (2 * margin + (maxHorHints + numCols) * cellSize),
            zoom * (2 * margin + (maxVerHints + numRows) * cellSize));
    }

    function loadHints() {
        //console.log(`Id: ${id}`)
        //const infos = getPlayerFromId(id, numCols, numRows);
        numRows = 10;
        numCols = 10;
        let seed = 15;
        const g = nono.generateGrid(numRows, numCols, seed);
        [horHints, verHints] = nono.generateHints(g)

        //numRows = infos.numRows;
        //numCols = infos.numCols;
        //horHints = hints[0];
        //verHints = hints[1];

        maxHorHints = countMaxHints(horHints);
        maxVerHints = countMaxHints(verHints);
    }

    function resetGrid() {
        grid = nono.getEmptyGrid(numRows, numCols);

        gridHorHints = [];
        for(let hints of horHints)
            gridHorHints.push(Array(hints.length).fill(0));

        gridVerHints = [];
        for(let hints of verHints)
            gridVerHints.push(Array(hints.length).fill(0));
        
        movesUndo = [];
        movesRedo = [];
        ended = false;
        mouseDown = MOUSE_BTN.NONE;
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

    p.draw = function() {
        mouseMoved();

        p.scale(zoom);
        p.background(ended ? p.color(100, 200, 100) : p.color(225));

        p.translate(margin, margin);
        p.translate(maxHorHints * cellSize, maxVerHints * cellSize);
        
        drawHorHints();
        drawVerHints();
        drawGrid();
        drawPosHighlight();
    }

    function drawGrid() {
        p.stroke(0);
        for(let row = 0; row < numRows; row++) {
            for(let col = 0; col < numCols; col++) {
                let gridVal = grid[row][col];
                let cellColor = cellColors[2 * ((Math.floor(row/5) + Math.floor(col/5)) % 2) + (row + col) % 2];
                if(gridVal == CELL_MARK.BLACK) {
                    cellColor = p.lerpColor(cellColor, p.color('black'), 0.9);
                } else if(gridVal == CELL_MARK.WHITE) {
                    cellColor = p.lerpColor(cellColor, p.color('white'), 0.5);
                }

                p.strokeWeight(1);
                p.fill(cellColor);
                p.rect(col * cellSize, row * cellSize, cellSize, cellSize);

                p.strokeWeight(5);
                if(gridVal == CELL_MARK.WHITE)
                    p.point((col + 0.5) * cellSize, (row + 0.5) * cellSize);
            }
        }

        p.noFill();
        p.strokeWeight(3);
        for(let row = 0; row < numRows; row+=5) {
            let rowLen = Math.min(numRows - row, 5);

            for(let col = 0; col < numCols; col += 5) {
                let colLen = Math.min(numCols - col, 5);

                p.rect(col * cellSize, row * cellSize, colLen * cellSize, rowLen * cellSize);
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

                p.noStroke();
                p.fill(checked ? FADED : 0);
                p.textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(hint, -(numHints - i - 0.5) * cellSize, (row + 0.5) * cellSize + 2);
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

                p.noStroke();
                p.fill(checked ? FADED : 0);
                p.textSize(hint < 10 ? cellSize * 0.9 : cellSize * 0.7);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(hint, (col + 0.5) * cellSize, -(numHints - i - 0.5) * cellSize + 2);
            }
        }
    }

    function drawPosHighlight() {
        const mouseInfo = getMouseInfo();
        p.noStroke();
        p.fill(0, 70);
        
        if(mouseInfo.inGridY && (mouseInfo.inGridX || mouseInfo.inHintsX)) {
            let numHints = horHints[mouseInfo.mouseRow].length;
            p.rect(-numHints * cellSize - 1, mouseInfo.mouseRow * cellSize - 1,
                (numHints + numCols) * cellSize + 2, cellSize + 2);
        }
        
        if(mouseInfo.inGridX && (mouseInfo.inGridY || mouseInfo.inHintsY)) {
            let numHints = verHints[mouseInfo.mouseCol].length
            p.rect(mouseInfo.mouseCol * cellSize - 1, -numHints * cellSize - 1,
                cellSize + 2, (numHints + numRows) * cellSize + 2);
        }
    }

    function getMouseInfo() {
        let inCanvas = !(p.mouseX < 0 || p.mouseX >= p.width || p.mouseY < 0 || p.mouseY >= p.height);;

        let mouseCol = Math.floor((p.mouseX/zoom - margin)/cellSize) - maxHorHints;
        let mouseRow = Math.floor((p.mouseY/zoom - margin)/cellSize) - maxVerHints;

        let inGridX = (mouseCol >= 0 && mouseCol < numCols);
        let inHintsX = (mouseCol < 0 && mouseCol > (-1-maxHorHints));
        let inGridY = (mouseRow >= 0 && mouseRow < numRows);
        let inHintsY = (mouseRow < 0 && mouseRow > (-1-maxVerHints));

        return { mouseCol, mouseRow, inCanvas,
            inGridX, inGridY, inHintsX, inHintsY
        };
    }

    p.mousePressed = function() {
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

    p.mouseReleased = function() {
        let btn = MOUSE_BTN.NONE;
        if(p.mouseButton == p.LEFT)
            btn = MOUSE_BTN.LEFT;
        else if(p.mouseButton == p.RIGHT)
            btn = MOUSE_BTN.RIGHT;
        else if(p.mouseButton == p.CENTER)
            btn = MOUSE_BTN.MID;

        if(btn == mouseDown) {
            mouseDown = MOUSE_BTN.NONE;
        }
    }

    function mouseMoved() {
        if(mouseDown == MOUSE_BTN.NONE)
            return;

        const mouseInfo = getMouseInfo();
        if(mouseInfo.inGridX && mouseInfo.inGridY) {
            let currVal = grid[mouseInfo.mouseRow][mouseInfo.mouseCol];
            if(filling != currVal) {
                addSubAction({type: ACTION_TYPE.CELL, row: mouseInfo.mouseRow, col: mouseInfo.mouseCol,
                    from: currVal, to: filling});
            }
        }
    }

    function clickInGrid(mouseRow, mouseCol) {
        let currVal = grid[mouseRow][mouseCol];
        let nextVal = CELL_MARK.EMPTY;
        let btn = MOUSE_BTN.NONE;

        if(p.mouseButton == p.LEFT) {
            btn = MOUSE_BTN.LEFT;
            nextVal = currVal == CELL_MARK.BLACK ? CELL_MARK.EMPTY : CELL_MARK.BLACK;
        } else if(p.mouseButton == p.RIGHT) {
            btn = MOUSE_BTN.RIGHT;
            nextVal = currVal == CELL_MARK.WHITE ? CELL_MARK.EMPTY : CELL_MARK.WHITE;
        } else if(p.mouseButton == p.CENTER) {
            btn = MOUSE_BTN.MID;
        }

        if(nextVal != currVal) {
            mouseDown = btn;
            filling = nextVal;
            doAction({type: ACTION_TYPE.GROUP, subs: []});
            addSubAction({type: ACTION_TYPE.CELL, row: mouseRow, col: mouseCol,
                from: currVal, to: nextVal});
        }
    }

    function clickInHorHints(mouseRow, mouseCol) {
        let hints = gridHorHints[mouseRow];
        let num = hints.length;
        if(mouseCol < num)
            doAction({type: ACTION_TYPE.HOR_HINT, row: mouseRow, num: num - mouseCol - 1});
    }

    function clickInVerHints(mouseRow, mouseCol) {
        let hints = gridVerHints[mouseCol];
        let num = hints.length;
        if(mouseRow < num)
            doAction({type: ACTION_TYPE.VER_HINT, col: mouseCol, num: num - mouseRow - 1});
    }

    function addSubAction(action) {
        apply(action);
        currAction.subs.push(action);
    }

    function doAction(action) {
        if(action.type == ACTION_TYPE.GROUP) {
            currAction = action;
        } else {
            apply(action);
        }
        movesUndo.push(action);
        movesRedo = [];
    }

    function undo() {
        mouseDown = MOUSE_BTN.NONE;
        if(movesUndo.length == 0)
            return;
        let action = movesUndo.pop();
        unapply(action);
        movesRedo.push(action);
    }

    function redo() {
        mouseDown = MOUSE_BTN.NONE;
        if(movesRedo.length == 0)
            return;
        let action = movesRedo.pop();
        apply(action);
        movesUndo.push(action);
    }

    function apply(action) {
        if(action.type == ACTION_TYPE.CELL) {
            grid[action.row][action.col] = action.to;
            checkSolution();
        } else if(action.type == ACTION_TYPE.HOR_HINT) {
            let hints = gridHorHints[action.row];
            hints[action.num] = 1 - hints[action.num];
        } else if(action.type == ACTION_TYPE.VER_HINT) {
            let hints = gridVerHints[action.col];
            hints[action.num] = 1 - hints[action.num];
        } else if(action.type == ACTION_TYPE.GROUP) {
            for(let sub of action.subs)
                apply(sub);
        }
    }

    function unapply(action) {
        if(action.type == ACTION_TYPE.CELL) {
            grid[action.row][action.col] = action.from;
        } else if(action.type == ACTION_TYPE.HOR_HINT) {
            let hints = gridHorHints[action.row];
            hints[action.num] = 1 - hints[action.num];
        } else if(action.type == ACTION_TYPE.VER_HINT) {
            let hints = gridVerHints[action.col];
            hints[action.num] = 1 - hints[action.num];
        } else if(action.type == ACTION_TYPE.GROUP) {
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
                if(col == numCols || grid[row][col] != CELL_MARK.BLACK) { // White or after last cell
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
                if(row == numRows || grid[row][col] != CELL_MARK.BLACK) { // White or after last cell
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

    p.keyPressed = function() {
        if (p.keyCode === p.RIGHT_ARROW || (p.key === 'y' && p.keyIsDown(p.CONTROL))) {
            redo();
        } else if (p.keyCode === p.LEFT_ARROW || (p.key === 'z' && p.keyIsDown(p.CONTROL))) {
            undo();
        } else if (p.keyCode === p.UP_ARROW || p.key === '+' ) {
            zoomIn();
        } else if (p.keyCode === p.DOWN_ARROW || p.key === '-' ) {
            zoomOut();
        }
    }
};


// Remove right click menu
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Load id
document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    const numCols = parseInt(urlParams.get('w')) || 10;
    const numRows = parseInt(urlParams.get('h')) || 10;

    console.log('Hmm?')

    new p5((p) => sketch(p, id));
});
