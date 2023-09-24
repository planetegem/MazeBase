"use strict";
// Simple cell doesn't track coordinates (used to save simpliefied version of the maze for animations)
class SimpleCell {
    constructor(wall = true, visited = false, path = false) {
        this.wall = wall;
        this.visited = visited;
        this.path = path;
    }
}
// Cell tracks coordinates; used during maze generation to generate active field (= oldField)
class Cell extends SimpleCell {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class BlankMaze {
    constructor(width, height, depth = 1) {
        this.animatedField = [];
        this.xLength = 2 * width + 1;
        this.yLength = 2 * height + 1;
        this.zLength = 2 * depth + 1;
        this.field = this.generateField();
    }
    // Build empty field
    generateField() {
        let width = this.xLength, height = this.yLength, depth = this.zLength;
        let xArray = [];
        for (let x = 0; x < width; x++) {
            let yArray = [];
            for (let y = 0; y < height; y++) {
                let zArray = [];
                for (let z = 0; z < depth; z++) {
                    zArray.push(new Cell(x, y, z));
                    if (x === 0 || y === 0 || z === 0 ||
                        x === this.xLength - 1 || y === this.yLength - 1 || z === this.zLength - 1) {
                        zArray[z].wall = true;
                        zArray[z].visited = true;
                    }
                }
                yArray.push(zArray);
            }
            xArray.push(yArray);
        }
        return xArray;
    }
    // Save a copy of active field to animated field (in simplified form)
    saveField(field, target) {
        let width = field.length, height = field[0].length, depth = field[0][0].length;
        let copiedField = [];
        for (let x = 0; x < width; x++) {
            let copiedY = [];
            for (let y = 0; y < height; y++) {
                let copiedZ = [];
                for (let z = 0; z < depth; z++) {
                    copiedZ.push(new SimpleCell(field[x][y][1].wall, field[x][y][1].visited, field[x][y][1].path));
                }
                copiedY.push(copiedZ);
            }
            copiedField.push(copiedY);
        }
        target.push(copiedField);
        return target;
    }
    // Gets passed to canvas during animation: determines how to interpret maze array
    drawMaze(canvas, field, color, image) {
        let ctx = canvas.getContext("2d"), mazeWidth = field.length, mazeHeight = field[0].length, marginX = (canvas.width % mazeWidth) / 2, marginY = (canvas.height % mazeHeight) / 2, cellWidth = Math.floor(canvas.width / mazeWidth), cellHeight = Math.floor(canvas.height / mazeHeight);
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0 + marginX, 0 + marginY, canvas.width - marginX * 2, canvas.height - marginY * 2);
            for (let x = 0; x < mazeWidth; x++) {
                for (let y = 0; y < mazeHeight; y++) {
                    if (field[x][y][1].wall && field[x][y][1].visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    else if (field[x][y][1].path) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    else if (!field[x][y][1].visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                }
            }
        }
    }
}
