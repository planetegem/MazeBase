"use strict";
class Backtracker extends NewMaze {
    constructor(xLength, yLength) {
        super(xLength, yLength);
        this.xLength = xLength;
        this.yLength = yLength;
        this.field = this.newField(this.octoMask);
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.recursion();
    }
    recursion() {
        // PREP: CREATE PATH ARRAY, CHOOSE START POSITION, BIND SAVEFIELD
        let path = [], width = this.xLength - 1, height = this.yLength - 1;
        function getFirst(field) {
            let randomX = Math.floor(Math.random() * (width + 1)), randomY = Math.floor(Math.random() * (height + 1)), block;
            if (field[randomX][randomY].mask) {
                // TRY AGAIN
                return block = getFirst(field);
            }
            else {
                block = field[randomX][randomY];
                return block;
            }
        }
        let firstBlock = getFirst(this.field);
        path.push(firstBlock);
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        function start(field, animatedField) {
            // 1. TAKE LAST POSITION FROM PATH, MARK AS VISITED
            let currentBlock = path[path.length - 1];
            currentBlock.visited = true;
            currentBlock.path = true;
            // 2. BREAK DOWN WALL TO PREVIOUS CELL
            if (path[path.length - 2]) {
                let previousBlock = path[path.length - 2];
                if (currentBlock.x - previousBlock.x > 0) {
                    currentBlock.left = false;
                    previousBlock.right = false;
                }
                else if (currentBlock.x - previousBlock.x < 0) {
                    currentBlock.right = false;
                    previousBlock.left = false;
                }
                else if (currentBlock.y - previousBlock.y > 0) {
                    currentBlock.up = false;
                    previousBlock.down = false;
                }
                else if (currentBlock.y - previousBlock.y < 0) {
                    currentBlock.down = false;
                    previousBlock.up = false;
                }
            }
            // 3. EVALUATE NEIGHBOURS: IF VISITED, BUILD WALL; ELSE CONSIDER AS NEXT BLOCK
            let neighbours = [], neighbour;
            if (currentBlock.x > 0) {
                neighbour = field[currentBlock.x - 1][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.right)) {
                    currentBlock.left = true;
                }
            }
            if (currentBlock.x < width) {
                neighbour = field[currentBlock.x + 1][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.left)) {
                    currentBlock.right = true;
                }
            }
            if (currentBlock.y > 0) {
                neighbour = field[currentBlock.x][currentBlock.y - 1];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.down)) {
                    currentBlock.up = true;
                }
            }
            if (currentBlock.y < height) {
                neighbour = field[currentBlock.x][currentBlock.y + 1];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.up)) {
                    currentBlock.down = true;
                }
            }
            animatedField = quickSave(field, animatedField);
            currentBlock.path = false;
            // 4. IF VALID NEIGHBOURS, JUMP TO RANDOM 1 AND CONTINUE
            if (neighbours.length > 0) {
                let randomIndex = Math.floor(Math.random() * neighbours.length);
                let nextBlock = neighbours[randomIndex];
                path.push(nextBlock);
                return field = start(field, animatedField);
            }
            else {
                // 5. IF NO VALID NEIGHBOURS, RETURN ALONG PATH UNTIL EMPTY
                path.splice(path.length - 1, 1);
                if (path.length > 0) {
                    return field = start(field, animatedField);
                }
                else {
                    return field;
                }
            }
            return field;
        }
        start(this.field, this.animatedField);
    }
}
class AldousBroder extends NewMaze {
    constructor(xLength, yLength) {
        super(xLength, yLength);
        this.xLength = xLength;
        this.yLength = yLength;
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.recursion();
    }
    recursion() {
        // PREP: CREATE PATH ARRAY, CHOOSE START POSITION, BIND SAVEFIELD
        let width = this.xLength - 1, height = this.yLength - 1;
        function getFirst(field) {
            let randomX = Math.floor(Math.random() * (width + 1)), randomY = Math.floor(Math.random() * (height + 1)), block;
            if (field[randomX][randomY].mask) {
                // TRY AGAIN
                return block = getFirst(field);
            }
            else {
                block = field[randomX][randomY];
                return block;
            }
        }
        let currentBlock = getFirst(this.field), previousBlock;
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        function start(field, animatedField) {
            // 1. MAKE CURRENT BLOCK PART OF MAZE
            if (!currentBlock.visited) {
                currentBlock.visited = true;
                currentBlock.up = true;
                currentBlock.right = true;
                currentBlock.down = true;
                currentBlock.left = true;
                // 2. IF PREVIOUS BLOCK EXISTS, OPEN WALL
                if (previousBlock) {
                    if (currentBlock.x - previousBlock.x > 0) {
                        currentBlock.left = false;
                        previousBlock.right = false;
                    }
                    else if (currentBlock.x - previousBlock.x < 0) {
                        currentBlock.right = false;
                        previousBlock.left = false;
                    }
                    else if (currentBlock.y - previousBlock.y > 0) {
                        currentBlock.up = false;
                        previousBlock.down = false;
                    }
                    else if (currentBlock.y - previousBlock.y < 0) {
                        currentBlock.down = false;
                        previousBlock.up = false;
                    }
                }
            }
            currentBlock.path = true;
            animatedField = quickSave(field, animatedField);
            currentBlock.path = false;
            // 3. CHOOSE RANDOM DIRECTION
            let neighbours = [], neighbour;
            if (currentBlock.x > 0) {
                neighbour = field[currentBlock.x - 1][currentBlock.y];
                if (!neighbour.mask) {
                    neighbours.push(neighbour);
                }
            }
            if (currentBlock.x < width) {
                neighbour = field[currentBlock.x + 1][currentBlock.y];
                if (!neighbour.mask) {
                    neighbours.push(neighbour);
                }
            }
            if (currentBlock.y > 0) {
                neighbour = field[currentBlock.x][currentBlock.y - 1];
                if (!neighbour.mask) {
                    neighbours.push(neighbour);
                }
            }
            if (currentBlock.y < height) {
                neighbour = field[currentBlock.x][currentBlock.y + 1];
                if (!neighbour.mask) {
                    neighbours.push(neighbour);
                }
            }
            let randomIndex = Math.floor(Math.random() * neighbours.length), nextBlock = neighbours[randomIndex];
            previousBlock = currentBlock;
            currentBlock = nextBlock;
            // 4. COUNT HOW MANY CELLS ARE UNVISITED
            let counter = 0;
            for (let row of field) {
                for (let block of row) {
                    if (!block.visited && !block.mask) {
                        counter++;
                    }
                }
            }
            // 5. IF MORE THAN 0, RESTART
            if (counter > 0) {
                return field = start(field, animatedField);
            }
            else {
                return field;
            }
        }
        start(this.field, this.animatedField);
    }
}
class RoundRecursiveMaze extends SimpleBacktrack {
    constructor(width, length) {
        super(width, length);
    }
    drawMaze(canvas, field, color) {
        let ctx = canvas.getContext("2d"), mazeWidth = field.length - 1, mazeHeight = field[0].length, centerRadius = canvas.height * 0.05, cellWidth = Math.PI * 2 / mazeWidth, cellHeight = Math.round((canvas.height * 0.5 - centerRadius) * 1e6 / mazeHeight) / 1e6;
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let x = 0; x < mazeWidth; x++) {
                for (let y = 0; y < mazeHeight; y++) {
                    if (field[x][y][1].wall && field[x][y][1].visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, centerRadius + (y + 1) * cellHeight, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, centerRadius + y * cellHeight, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }
        }
    }
}
