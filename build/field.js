"use strict";
// New coordinate field: field consists of blocks instead of cells.
// Each block track state of its border: walled or not
// Blocks can be masked to exclude them from maze generation
class Block {
    constructor(x, y, mask = false) {
        this.x = x;
        this.y = y;
        this.mask = mask;
        this.visited = false;
        this.path = false;
        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;
    }
}
// Field creation
class NewMaze {
    constructor(xLength, yLength) {
        this.xLength = xLength;
        this.yLength = yLength;
        this.animatedField = [];
        this.field = this.newField();
    }
    // Creation of Coordinate field
    newField(mask = this.standardMask) {
        let width = this.xLength, height = this.yLength;
        let field = [];
        for (let x = 0; x < width; x++) {
            let column = [];
            for (let y = 0; y < height; y++) {
                let block = mask(x, y, width, height);
                column.push(block);
            }
            field.push(column);
        }
        return field;
    }
    // Standard mask: all blocks are part of maze, outside walls are created
    standardMask(x, y, width, height) {
        let block = new Block(x, y);
        if (y === 0) {
            block.up = true;
        }
        else if (y === height - 1) {
            block.down = true;
        }
        if (x === 0) {
            block.left = true;
        }
        else if (x === width - 1) {
            block.right = true;
        }
        return block;
    }
    // Octagon mask: diagonal lines at corners determine mask
    octoMask(x, y, width, height) {
        let block = new Block(x, y);
        let cornerSize = Math.floor(width / 3);
        if (x < cornerSize - y || x >= width - (cornerSize - y) || y >= height - (cornerSize - x) || y >= height - cornerSize + (height - x) - 1) {
            block.mask = true;
        }
        // OUTSIDE WALLS
        if (x === cornerSize - y) {
            block.up = true;
            block.left = true;
        }
        else if (x === width - (cornerSize - y) - 1) {
            block.up = true;
            block.right = true;
        }
        else if (y === height - (cornerSize - x) - 1) {
            block.down = true;
            block.left = true;
        }
        else if (y === height - cornerSize + (height - x) - 2) {
            block.down = true;
            block.right = true;
        }
        if (x === 0 && y < height - cornerSize && y > cornerSize) {
            block.left = true;
        }
        else if (x === width - 1 && y < height - cornerSize && y > cornerSize) {
            block.right = true;
        }
        else if (y === 0 && x < width - cornerSize && x > cornerSize) {
            block.up = true;
        }
        else if (y === height - 1 && x < width - cornerSize && x > cornerSize) {
            block.down = true;
        }
        return block;
    }
    // Utility method: save current field to animation history
    saveField(field, target) {
        let width = field.length, height = field[0].length;
        let copiedField = [];
        for (let x = 0; x < width; x++) {
            let copiedY = [];
            for (let y = 0; y < height; y++) {
                let block = JSON.parse(JSON.stringify(field[x][y]));
                copiedY.push(block);
            }
            copiedField.push(copiedY);
        }
        target.push(copiedField);
        return target;
    }
    // Draw function during animation: determines how field array is drawn on canvas
    drawMaze(canvas, field, color, image) {
        let ctx = canvas.getContext("2d"), mazeWidth = field.length, mazeHeight = field[0].length, marginX = (canvas.width % mazeWidth) / 2, marginY = (canvas.height % mazeHeight) / 2, cellWidth = Math.floor(canvas.width / mazeWidth), cellHeight = Math.floor(canvas.height / mazeHeight);
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, marginX, marginY, canvas.width - 2 * marginX, canvas.height - 2 * marginY);
            for (let x = 0; x < mazeWidth; x++) {
                for (let y = 0; y < mazeHeight; y++) {
                    let currentBlock = field[x][y];
                    // DRAW FOG
                    if (!currentBlock.visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    // DRAW MASK
                    if (currentBlock.mask) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    // DRAW PATH
                    if (currentBlock.path) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    // DRAW WALLS
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = color;
                    if (currentBlock.up) {
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight * 0.25);
                    }
                    if (currentBlock.right) {
                        ctx.fillRect(marginX + x * cellWidth + cellWidth * 0.75, marginY + y * cellHeight, cellWidth * 0.25, cellHeight);
                    }
                    if (currentBlock.down) {
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight + cellHeight * 0.75, cellWidth, cellHeight * 0.25);
                    }
                    if (currentBlock.left) {
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth * 0.25, cellHeight);
                    }
                    // DRAW CORNERS
                    let block1, block2, mask;
                    if (x > 0 && y > 0 && !currentBlock.mask) {
                        block1 = field[currentBlock.x - 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        mask = field[currentBlock.x - 1][currentBlock.y - 1];
                        if (block1.up && block2.left && (mask.mask || currentBlock.visited)) {
                            ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth * 0.25, cellHeight * 0.25);
                        }
                    }
                    if (x < mazeWidth - 1 && y > 0 && !currentBlock.mask) {
                        block1 = field[currentBlock.x + 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        mask = field[currentBlock.x + 1][currentBlock.y - 1];
                        if (block1.up && block2.right && (mask.mask || currentBlock.visited)) {
                            ctx.fillRect(marginX + x * cellWidth + cellWidth * 0.75, marginY + y * cellHeight, cellWidth * 0.25, cellHeight * 0.25);
                        }
                    }
                    if (x < mazeWidth - 1 && y < mazeHeight - 1 && !currentBlock.mask) {
                        block1 = field[currentBlock.x + 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y + 1];
                        mask = field[currentBlock.x + 1][currentBlock.y + 1];
                        if (block1.down && block2.right && (mask.mask || currentBlock.visited)) {
                            ctx.fillRect(marginX + x * cellWidth + cellWidth * 0.75, marginY + y * cellHeight + cellHeight * 0.75, cellWidth * 0.25, cellHeight * 0.25);
                        }
                    }
                    if (x > 0 && y < mazeHeight - 1 && !currentBlock.mask) {
                        block1 = field[currentBlock.x - 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y + 1];
                        mask = field[currentBlock.x - 1][currentBlock.y + 1];
                        if (block1.down && block2.left && (mask.mask || currentBlock.visited)) {
                            ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight + cellHeight * 0.75, cellWidth * 0.25, cellHeight * 0.25);
                        }
                    }
                }
            }
        }
    }
}
