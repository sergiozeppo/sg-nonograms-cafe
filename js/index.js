import * as nono from './util/nono-utils.js';
import * as idParser from './util/id-parser.js';

const sketch = (p, id) => {
    const ACTION_TYPE = {
        MARK_CELL: 0,
        TOGGLE_HOR_HINT: 1,
        TOGGLE_VER_HINT: 2
    }
    
    const CELL_MARK = {
        EMPTY: 0,
        BLACK: 1,
        WHITE: 2
    };

    const EVENT = {
        MOUSE: 0,
        TOUCH: 1
    }

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

    let enc;
    let msgType;

    let grid;
    let gridHorHints;
    let gridVerHints;

    let cellColors;

    let actionEvent;
    let actions = [];

    let movesUndo = [];
    let movesRedo = [];
    let ended = false;

    p.setup = function() {
        const canvas = p.createCanvas(500, 300);
        canvas.parent(document.getElementById('nonoDiv'));

        initializeColors();

        loadPuzzle();

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

    function loadPuzzle() {
        if(!id) id = nono.generateNonogram(10, 10, null);
        document.getElementById('url').value = nono.getPageURL(id);

        let seed;
        ({numRows, numCols, seed, enc, msgType} = idParser.parseId(id));

        [horHints, verHints] = nono.getPuzzle(numRows, numCols, seed);
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
        
        actionEvent = null;
        movesUndo = [];
        movesRedo = [];
        ended = false;
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
            let numHints = horHints[mouseInfo.row].length;
            p.rect(-numHints * cellSize - 1, mouseInfo.row * cellSize - 1,
                (numHints + numCols) * cellSize + 2, cellSize + 2);
        }
        
        if(mouseInfo.inGridX && (mouseInfo.inGridY || mouseInfo.inHintsY)) {
            let numHints = verHints[mouseInfo.col].length
            p.rect(mouseInfo.col * cellSize - 1, -numHints * cellSize - 1,
                cellSize + 2, (numHints + numRows) * cellSize + 2);
        }
    }

    function getMouseInfo() {
        return getEventInfo(p.mouseX, p.mouseY, EVENT.MOUSE, p.mouseButton);
    }

    function getTouchInfo(touch) {
        return getEventInfo(touch.x, touch.y, EVENT.TOUCH);
    }

    function getEventInfo(x, y, type, button = -1) {
        let inCanvas = !(x < 0 || x >= p.width || y < 0 || y >= p.height);;

        let col = Math.floor((x/zoom - margin) / cellSize) - maxHorHints;
        let row = Math.floor((y/zoom - margin) / cellSize) - maxVerHints;

        let inGridX = (col >= 0 && col < numCols);
        let inHintsX = (col < 0 && col > (-1 - maxHorHints));
        let inGridY = (row >= 0 && row < numRows);
        let inHintsY = (row < 0 && row > (-1 - maxVerHints));

        return { type, button, col, row, inCanvas,
            inGridX, inGridY, inHintsX, inHintsY
        };
    }

    p.touchStarted = function() {
        if(touches.length == 1)
            handleEvent(getTouchInfo(touches[0]));
    }

    p.mousePressed = function() {
        handleEvent(getMouseInfo());
    }
    
    function handleEvent(eventInfo) {
        if(!eventInfo.inCanvas)
            return;

        if(eventInfo.inGridX && eventInfo.inGridY)
            clickInGrid(eventInfo);
        else if(eventInfo.inGridX || eventInfo.inGridY) {
            clickInHints(eventInfo);
        }
    }

    p.mouseReleased = function() {
        if(p.mouseButton == actionEvent?.button) {
            actionEvent = null;
        }
    }

    function mouseMoved() {
        if(!actionEvent || actions.length == 0)
            return;

        let action = actions[0];
        const mouseInfo = getMouseInfo();
        if(action.type == ACTION_TYPE.MARK_CELL) {
            if(mouseInfo.inGridX && mouseInfo.inGridY) {
                let currVal = grid[mouseInfo.row][mouseInfo.col];
                
                if((action.from == CELL_MARK.EMPTY && currVal == CELL_MARK.EMPTY) ||
                        (action.to == CELL_MARK.EMPTY && currVal == action.from) ||
                        (action.from != CELL_MARK.EMPTY && action.to != CELL_MARK.EMPTY && currVal != action.to))
                    addAction({type: ACTION_TYPE.MARK_CELL,
                        row: mouseInfo.row, col: mouseInfo.col,
                        from: currVal, to: action.to});
            }
        } /*else if(action.type == ACTION_TYPE.TOGGLE_HINT) {
            // TODO HINTS
        }*/
    }

    function clickInGrid(eventInfo) {
        const currVal = grid[eventInfo.row][eventInfo.col];
        let nextVal = CELL_MARK.EMPTY;

        if(eventInfo.type == EVENT.MOUSE) {
            if(eventInfo.button == p.LEFT)
                nextVal = currVal == CELL_MARK.BLACK ? CELL_MARK.EMPTY : CELL_MARK.BLACK;
            else if(eventInfo.button == p.RIGHT)
                nextVal = currVal == CELL_MARK.WHITE ? CELL_MARK.EMPTY : CELL_MARK.WHITE;
        } else if(eventInfo.type == EVENT.TOUCH) {
            nextVal = (currVal + 1) % 3;
        }

        if(currVal != nextVal)
            setAction({type: ACTION_TYPE.MARK_CELL, 
                row: eventInfo.row, col: eventInfo.col,
                from: currVal, to: nextVal}, eventInfo);
    }

    function clickInHints(eventInfo) {
        // TODO

        /*clickInHorHints(eventInfo.mouseRow, -1 - eventInfo.mouseCol);
        clickInVerHints(-1 - eventInfo.mouseRow, eventInfo.mouseCol);

        let hints = gridHorHints[mouseRow];
        let num = hints.length;
        if(mouseCol < num)
            doAction({type: ACTION_TYPE.HOR_HINT, row: mouseRow, num: num - mouseCol - 1});*/
    }

    /*function clickInVerHints(mouseRow, mouseCol) {
        let hints = gridVerHints[mouseCol];
        let num = hints.length;
        if(mouseRow < num)
            doAction({type: ACTION_TYPE.VER_HINT, col: mouseCol, num: num - mouseRow - 1});
    }*/

    function setAction(action, eventInfo = null) {
        clearActions();
        actionEvent = eventInfo;
        addAction(action);
    }

    function addAction(action) {
        apply(action);
        actions.push(action);
    }

    function clearActions() {
        actionEvent = null;
        if(actions && actions.length > 0) {
            movesUndo.push(actions);
            movesRedo = [];
        }
        actions = [];
    }

    function undo() {
        // TODO REM console.log(`Undo: %j`, movesUndo);
        if(movesUndo.length == 0)
            return;
        clearActions();

        let currActions = movesUndo.pop();
        for(let action of currActions)
            unapply(action);
        movesRedo.push(currActions);
    }

    function redo() {
        // TODO REM console.log(`Redo: %j`, movesRedo);
        if(movesRedo.length == 0)
            return;
        clearActions();
        
        let currActions = movesRedo.pop();
        for(let action of currActions)
            apply(action);
        movesUndo.push(currActions);
    }

    function apply(action) {
        if(action.type == ACTION_TYPE.MARK_CELL) {
            grid[action.row][action.col] = action.to;
            checkSolution();
        } else if(action.type == ACTION_TYPE.TOGGLE_HINT) {
            let hints = gridHorHints[action.row];
            hints[action.num] = 1 - hints[action.num];
        }
    }

    function unapply(action) {
        if(action.type == ACTION_TYPE.MARK_CELL) {
            grid[action.row][action.col] = action.from;
        } else if(action.type == ACTION_TYPE.TOGGLE_HINT) {
            let hints = gridHorHints[action.row];
            hints[action.num] = 1 - hints[action.num];
        }
    }

    function checkSolution() {
        if(!ended && isSolved()) {
            ended = true;
            displaySecretMessage();
        }
    }

    function displaySecretMessage() {
        let code = nono.decryptWithGrid(enc, msgType, grid);
        const msgPar = document.getElementById('message');
        if(msgType == 0) {
            msgPar.textContent = code;
        } else {
            msgPar.appendChild(getAnchor(nono.getSteamGiftsURL(code)));
        }
        document.getElementById("solvedDiv").style.display = 'block';
    }

    function getAnchor(link, text = null) {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', link);
        anchor.textContent = text || link;
        return anchor;
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
        } else if (p.key === 'r' && p.keyIsDown(p.CONTROL)) {
            resetGrid();
        }
    }
};

// Disable selection
document.getElementById('nonoDiv').addEventListener('mousedown', (event) => {
    event.preventDefault();
});

// Disable right click context menu
document.getElementById('nonoDiv').addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Load id
document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    
    if(!id) {
        document.getElementById('urlDiv').style.display = 'block';
    }

    new p5((p) => sketch(p, id));
});
