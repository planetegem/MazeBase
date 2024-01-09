"use strict";
// Function to start animating maze: creates new maze object and animates it on canvas click
function startMaze(clickedElement, // element is clicked to start function
maze, // new maze
speed) {
    if (!clickedElement.classList.contains("running")) {
        clickedElement.classList.add("running"); // Blocks double execution
        clickedElement.getElementsByClassName("overlay")[0].classList.remove("clickable");
        clickedElement.getElementsByClassName("overlay")[0].classList.remove("clicked");
        let canvas = clickedElement.getElementsByClassName("maze")[0], color = window.getComputedStyle(clickedElement).color, background = clickedElement.getElementsByClassName("loadedImg")[0];
        let animationStart = Date.now(), steps = maze.animatedField.length;
        function animate() {
            let runtime = Date.now() - animationStart, currentStep = Math.max(0, Math.floor((runtime - 500) / speed));
            if (maze.animatedField[currentStep]) {
                maze.drawMaze(canvas, maze.animatedField[currentStep], color, background);
            }
            else {
                maze.drawMaze(canvas, maze.field, color, background);
            }
            if (runtime <= (steps * speed + 1500)) {
                window.requestAnimationFrame(animate);
            }
            else {
                clickedElement.classList.remove("running");
                clickedElement.getElementsByClassName("overlay")[0].classList.add("clicked");
            }
        }
        window.requestAnimationFrame(animate);
    }
}
// Adds event listeners to the canvases
function addCanvasListeners() {
    // Solid mazes
    const canvas1 = document.getElementById("canvas-recDiv");
    if (canvas1) {
        canvas1.addEventListener("click", () => startMaze(canvas1, new RecursiveMaze(20, 20), 250));
    }
    const canvas2 = document.getElementById("canvas-primMaze");
    if (canvas2) {
        canvas2.addEventListener("click", () => startMaze(canvas2, new PrimsMaze(20, 20), 55));
    }
    const canvas3 = document.getElementById("canvas-simpleBacktrack");
    if (canvas3) {
        canvas3.addEventListener("click", () => startMaze(canvas3, new SimpleBacktrack(20, 20), 55));
    }
    // Hollow mazes
    const canvas4 = document.getElementById("canvas-hollowBacktrack");
    if (canvas4) {
        canvas4.addEventListener("click", () => startMaze(canvas4, new Backtracker(20, 20), 55));
    }
    const canvas5 = document.getElementById("canvas-randomWalk");
    if (canvas5) {
        canvas5.addEventListener("click", () => startMaze(canvas5, new AldousBroder(12, 12), 55));
    }
    const canvas6 = document.getElementById("canvas-tunneler");
    if (canvas6 != null) {
        canvas6.addEventListener("click", () => startMaze(canvas6, new FrontierTunneler(24, 24), 40));
    }
    const canvas7 = document.getElementById("canvas-fakePolar");
    if (canvas7 != null) {
        canvas7.addEventListener("click", () => startMaze(canvas7, new FakePolar(25, 10), 60));
    }
    const canvas8 = document.getElementById("canvas-realPolar");
    if (canvas8 != null) {
        canvas8.addEventListener("click", () => startMaze(canvas8, new PolarBacktracker(6), 60));
    }
}
// Function to draw play button on canvas (on page load)
function drawOverlay(canvas, color) {
    let ctx = canvas.getContext("2d"), height = canvas.height * 0.2, width = height;
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, height * 0.9, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, height * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.5 - width * 0.4, canvas.height * 0.5 - height * 0.5);
        ctx.lineTo(canvas.width * 0.5 - width * 0.4, canvas.height * 0.5 + height * 0.5);
        ctx.lineTo(canvas.width * 0.5 + height * 0.6, canvas.height * 0.5);
        ctx.lineTo(canvas.width * 0.5 - width * 0.4, canvas.height * 0.5 - height * 0.5);
        ctx.fill();
    }
}
// Prepare page on load
window.addEventListener("load", () => {
    // 1. Preload images
    let containers = document.getElementsByClassName("canvas-container"), loader = 0;
    for (let container of containers) {
        // 1a. Retrieve background-image from css
        let url = window.getComputedStyle(container).backgroundImage;
        url = url.split("assets/")[1];
        url = (url) ? "assets/" + url.substring(0, url.length - 2) : "assets/cat.png"; // If no background image in css, default to cat
        let imgPreload = document.createElement("img");
        // 1b. While image is loading, preset overlay
        let overlay = document.createElement("canvas");
        overlay.classList.add("overlay");
        container.appendChild(overlay);
        overlay.setAttribute("width", JSON.stringify(overlay.offsetWidth));
        overlay.setAttribute("height", JSON.stringify(overlay.offsetWidth));
        imgPreload.onload = () => {
            // 2a. Once image is loaded, create canvas elements: first the canvas where the maze will be drawn
            let canvas = document.createElement("canvas");
            canvas.classList.add("maze");
            container.appendChild(canvas);
            canvas.setAttribute("width", JSON.stringify(canvas.offsetWidth));
            canvas.setAttribute("height", JSON.stringify(canvas.offsetWidth));
            // 2b. then the overlay with play button
            overlay.classList.add("clickable");
            drawOverlay(overlay, window.getComputedStyle(container).color);
            // 2c. Everything created = element becomes clickable
            container.classList.remove("running");
            loader++;
            if (loader === containers.length) {
                // 3a. When all images are loaded & canvases created, calculate their positions and store in array 
                // + retrieve theme color from CSS -> to be used on scroll
                let chapterCollection = document.getElementsByClassName("chapter");
                for (let chapter of chapterCollection) {
                    let chapterOffset = chapter.getBoundingClientRect().top + window.scrollY, canvas = chapter.getElementsByClassName("canvas-container")[0], canvasColor = window.getComputedStyle(canvas).color;
                    chapterColors.push({ color: canvasColor, offset: chapterOffset });
                    // 3b. Add theme color to headers
                    let header = chapter.querySelector("h2");
                    if (header) {
                        header.style.textShadow = "0.05em 0.05em 0.1em " + canvasColor;
                    }
                }
                addCanvasListeners();
            }
        };
        imgPreload.src = url;
        imgPreload.classList.add("loadedImg");
        container.appendChild(imgPreload);
    }
});
let chapterColors = [];
window.addEventListener("scroll", (e) => {
    // 1. Get screen height & scroll offset
    let scrollY = window.scrollY + screen.height * 0.33, underlay = document.getElementById("underlay");
    if (chapterColors.length > 0 && underlay) {
        // 2. Loop through chapter array, front to back; apply background-color
        for (let chapter of chapterColors) {
            if (scrollY >= chapter.offset) {
                underlay.style.backgroundColor = chapter.color;
            }
        }
        if (scrollY < chapterColors[0].offset) {
            underlay.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        }
    }
});
// 'Solid' maze cells = walls are defined as a full cell
class SolidCell {
    // constructor: only coordinates are obligatory
    constructor(x, y, wall = true, visited = false, path = false) {
        this.x = x;
        this.y = y;
        this.wall = wall;
        this.visited = visited;
        this.path = path;
    }
}
// 'Hollow' cells: each cell tracks state of its 4 borders: walled or not
// cells can be masked to exclude them from maze generation
class HollowCell {
    // constructor: only coordinates are obligatory
    constructor(x, y, mask = false) {
        // properties (mutable)
        this.visited = false;
        this.path = false;
        // border status: wall or not
        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;
        this.x = x;
        this.y = y;
        this.mask = mask;
    }
}
// Linked cells: each cell tracks who its neighbours are (for non-cartesian systems)
class CellLink {
    constructor(x1, x2, y1, y2) {
        this.wall = true;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
}
class LinkedCell {
    linkNeighbour(cell) {
        let link = new CellLink(this.x, cell.x, this.y, cell.y);
        this.links.push(link);
        cell.links.push(link);
    }
    constructor(x, y) {
        this.visited = false;
        this.path = false;
        this.links = [];
        this.x = x;
        this.y = y;
    }
}
// Field creation
class HollowMaze {
    constructor(xLength, yLength) {
        this.field = [];
        this.animatedField = [];
        this.xLength = xLength;
        this.yLength = yLength;
    }
    // Creation of Coordinate field
    generateField(mask = this.standardMask) {
        let width = this.xLength, height = this.yLength;
        let field = [];
        for (let x = 0; x < width; x++) {
            let column = [];
            for (let y = 0; y < height; y++) {
                let cell = mask(x, y, width, height);
                column.push(cell);
            }
            field.push(column);
        }
        return field;
    }
    // Standard mask: all blocks are part of maze, outside walls are created
    standardMask(x, y, width, height) {
        let block = new HollowCell(x, y);
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
        let block = new HollowCell(x, y);
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
    // Snowflake Mask
    snowflakeMask(x, y, width, height) {
        let block = new HollowCell(x, y);
        // Minimum size = 10 blocks, else revert to standard mask
        if (width < 10 || height < 10) {
            return block = this.standardMask(x, y, width, height);
        }
        let interval = Math.floor(width / 5), step1 = interval - 1, step2 = interval * 2, step3 = width - interval * 2 - 1, step4 = width - interval;
        // Central protrusions
        if (y === 0 && x >= step2 && x <= step3) {
            block.up = true;
        }
        else if (y === height - 1 && x >= step2 && x <= step3) {
            block.down = true;
        }
        else if (x === 0 && y >= step2 && y <= step3) {
            block.left = true;
        }
        else if (x === width - 1 && y >= step2 && y <= step3) {
            block.right = true;
        }
        if (x === step2 && (y < interval || y > height - interval - 1)) {
            block.left = true;
        }
        else if (x === step3 && (y < interval || y > height - interval - 1)) {
            block.right = true;
        }
        else if (y === step2 && (x < interval || x > width - interval - 1)) {
            block.up = true;
        }
        else if (y === step3 && (x < interval || x > width - interval - 1)) {
            block.down = true;
        }
        else if (y === interval && (x === step2 - 1 || x === step3 + 1)) {
            block.up = true;
        }
        else if (y === height - (interval + 1) && (x === step2 - 1 || x === step3 + 1)) {
            block.down = true;
        }
        else if (x === interval && (y === step2 - 1 || y === step3 + 1)) {
            block.left = true;
        }
        else if (x === width - (interval + 1) && (y === step2 - 1 || y === step3 + 1)) {
            block.right = true;
        }
        // Corner appendages
        if (y < interval) {
            if (y === 0 && (x < step1 || x > step4)) {
                block.up = true;
            }
            else if (x === step1 + y) {
                block.right = true;
                block.up = true;
            }
            else if (x === step4 - y) {
                block.left = true;
                block.up = true;
            }
            else if (x > step1 + y && x < step4 - y && !(x >= step2 && x <= step3)) {
                block.mask = true;
            }
        }
        else if (y > height - (interval + 1)) {
            if (y === height - 1 && (x < step1 || x > step4)) {
                block.down = true;
            }
            else if (x === step1 + (height - y - 1)) {
                block.right = true;
                block.down = true;
            }
            else if (x === step4 - (height - y - 1)) {
                block.left = true;
                block.down = true;
            }
            else if (x > step1 + (height - y - 1) && x < step4 - (height - y - 1) && !(x >= step2 && x <= step3)) {
                block.mask = true;
            }
        }
        if (x < interval) {
            if (x === 0 && (y < step1 || y > step4)) {
                block.left = true;
            }
            else if (y === step1 + x) {
                block.down = true;
                block.left = true;
            }
            else if (y === step4 - x) {
                block.up = true;
                block.left = true;
            }
            else if (y > step1 + x && y < step4 - x && !(y >= step2 && y <= step3)) {
                block.mask = true;
            }
        }
        else if (x > width - (interval + 1)) {
            if (x === width - 1 && (y < step1 || y > step4)) {
                block.right = true;
            }
            else if (y === step1 + (width - x - 1)) {
                block.down = true;
                block.right = true;
            }
            else if (y === step4 - (width - x - 1)) {
                block.up = true;
                block.right = true;
            }
            else if (y > step1 + (width - x - 1) && y < step4 - (width - x - 1) && !(y >= step2 && y <= step3)) {
                block.mask = true;
            }
        }
        return block;
    }
    // Brain mask
    brainMask(x, y, width, height) {
        let block = new HollowCell(x, y);
        // Minimum size = 8 blocks, else revert to standard mask
        if (width < 8 || height < 8) {
            return block = this.standardMask(x, y, width, height);
        }
        // First create standard walls
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
        // Brain is wider than it is tall, so mask top and bottom row
        let margin = Math.floor(height / 8);
        if (y < margin || y >= height - margin) {
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if (y === margin) {
            block.up = true;
        }
        if (y === height - margin - 1) {
            block.down = true;
        }
        // Round edges at top
        if ((y < margin * 2 && x < margin * 2) || (y < margin * 2 && x >= width - margin * 2)) {
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        if ((y < margin * 3 && x < margin) || (y < margin * 3 && x >= width - margin)) {
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if ((y < margin * 2 && x === margin * 2 && y >= margin) || (y < margin * 3 && x === margin && y >= margin * 2)) {
            block.left = true;
        }
        if ((y === margin * 2 && x < margin * 2 && x >= margin) || (y === margin * 3 && x < margin)) {
            block.up = true;
        }
        if ((y < margin * 2 && x === width - margin * 2 - 1 && y >= margin) || (y < margin * 3 && x === width - margin - 1 && y >= margin * 2)) {
            block.right = true;
        }
        if ((y === margin * 2 && x >= width - margin * 2 && x < width - margin) || (y === margin * 3 && x >= width - margin)) {
            block.up = true;
        }
        // Slope at bottom left
        if ((y >= height - margin * 3 && x < margin * 2) || (y >= height - margin * 2 && x < margin * 4)) {
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if ((y >= height - margin * 3 && x === margin * 2 && y < height - margin * 2) || (y >= height - margin * 2 && x === margin * 4 && y < height - margin)) {
            block.left = true;
        }
        if ((y === height - margin * 3 - 1 && x < margin * 2) || (y === height - margin * 2 - 1 && x < margin * 4 && x >= margin * 2)) {
            block.down = true;
        }
        // Bottom right: single block
        if (y >= height - margin * 2 && x >= width - margin) {
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if (y >= height - margin * 2 && y < height - margin && x === width - margin - 1) {
            block.right = true;
        }
        if (y === height - margin * 2 - 1 && x >= width - margin) {
            block.down = true;
        }
        return block;
    }
    // Utility method: save current field to animation history
    saveField(field, target) {
        let copiedField = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }
    // Utility method: get random start position (and if masked, try again)
    getFirst(field) {
        let randomX = Math.floor(Math.random() * (field.length)), randomY = Math.floor(Math.random() * (field[0].length)), block;
        if (field[randomX][randomY].mask) {
            // TRY AGAIN
            return block = this.getFirst(field);
        }
        else {
            block = field[randomX][randomY];
            return block;
        }
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
// Hollow maze made with backtracker algorithm
// Method: randomly snake through the maze until a dead end is reached. Backtrack until no longer imprisoned.
// Step 1: Select a random starting cell and add it to a path array.
// Step 2: Select the last cell from the path array. Mark it as visited.
// Step 3: open wall to previous cell (if any)
// Step 4: Check neighbours: if unvisited options available, choose one and add it to path array.
// Step 5: if no unvisited neighbours available: remove last cell from path array.
// Step 6: return to step 2 recursively until path array is empty
class Backtracker extends HollowMaze {
    constructor(xLength, yLength) {
        super(xLength, yLength);
        // Create blank field
        this.field = this.generateField(this.octoMask);
        this.animatedField = this.saveField(this.field, this.animatedField);
        // start recursion
        this.recursion();
    }
    recursion() {
        // Prep: create path array and choose start position
        let path = [], width = this.xLength - 1, height = this.yLength - 1;
        let firstBlock = this.getFirst(this.field);
        path.push(firstBlock);
        // Prep: bind saveField method for use during recursion
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
class FakePolar extends HollowMaze {
    constructor(xLength, yLength) {
        super(xLength, yLength);
        // Create blank field
        this.field = this.generateField(this.polarMask);
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.recursion();
    }
    // Polar mask: doesn't draw walls on left or right side (to give illusion of continuity)
    polarMask(x, y, width, height) {
        let block = new HollowCell(x, y);
        if (y === 0) {
            block.down = true;
        }
        else if (y === height - 1) {
            block.up = true;
        }
        return block;
    }
    // Overwrite draw function to make circular maze with polar coordinates
    drawMaze(canvas, field, color, image) {
        let ctx = canvas.getContext("2d"), mazeWidth = field.length, mazeHeight = field[0].length, innerRadius = (canvas.width / 2) * 0.2, maxRadius = (canvas.width / 2) * 0.975, mazeRadius = maxRadius - innerRadius, cellWidth = 2 * Math.PI / mazeWidth, cellHeight = mazeRadius / mazeHeight;
        if (ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.width / 2, maxRadius, 0, 2 * Math.PI);
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.7;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            ctx.restore();
            for (let x = 0; x < mazeWidth; x++) {
                for (let y = 0; y < mazeHeight; y++) {
                    let currentBlock = field[x][y];
                    // DRAW FOG
                    if (!currentBlock.visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y + 1) * cellHeight, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y) * cellHeight, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y + 1) * cellHeight, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y) * cellHeight, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    // DRAW MASK
                    if (currentBlock.mask) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y + 1) * cellHeight, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y) * cellHeight, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    // DRAW PATH
                    if (currentBlock.path) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.beginPath();
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y + 1) * cellHeight, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + (y) * cellHeight, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    // DRAW WALLS
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = color;
                    if (currentBlock.up) {
                        ctx.beginPath();
                        let outerRing = (y + 1) * cellHeight, innerRing = outerRing - cellHeight * 0.25;
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (currentBlock.down) {
                        ctx.beginPath();
                        let innerRing = y * cellHeight, outerRing = innerRing + cellHeight * 0.25;
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, x * cellWidth, (x + 1) * cellWidth, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, (x + 1) * cellWidth, x * cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (currentBlock.right) {
                        ctx.beginPath();
                        let innerRing = y * cellHeight, outerRing = (y + 1) * cellHeight, rightExtreme = (x + 1) * cellWidth, leftExtreme = rightExtreme - cellWidth * (0.25 - y * 0.01);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (currentBlock.left) {
                        ctx.beginPath();
                        let innerRing = y * cellHeight, outerRing = (y + 1) * cellHeight, leftExtreme = x * cellWidth, rightExtreme = leftExtreme + cellWidth * (0.25 - y * 0.01);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    // DRAW CORNERS
                    let block1, block2, mask;
                    if (y > 0 && !currentBlock.mask) {
                        if (x === 0) {
                            block1 = field[mazeWidth - 1][currentBlock.y];
                            mask = field[mazeWidth - 1][currentBlock.y - 1];
                        }
                        else {
                            block1 = field[currentBlock.x - 1][currentBlock.y];
                            mask = field[currentBlock.x - 1][currentBlock.y - 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        // bottom left corner
                        if (block1.down && block2.left && (mask.mask || currentBlock.visited)) {
                            ctx.beginPath();
                            let innerRing = y * cellHeight, outerRing = innerRing + cellHeight * 0.25, leftExtreme = x * cellWidth, rightExtreme = leftExtreme + cellWidth * (0.25 - y * 0.01);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    if (y > 0 && !currentBlock.mask) {
                        if (x === mazeWidth - 1) {
                            block1 = field[0][currentBlock.y];
                            mask = field[0][currentBlock.y - 1];
                        }
                        else {
                            block1 = field[currentBlock.x + 1][currentBlock.y];
                            mask = field[currentBlock.x + 1][currentBlock.y - 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        // bottom right
                        if (block1.down && block2.right && (mask.mask || currentBlock.visited)) {
                            ctx.beginPath();
                            let innerRing = y * cellHeight, outerRing = innerRing + cellHeight * 0.25, rightExtreme = (x + 1) * cellWidth, leftExtreme = rightExtreme - cellWidth * (0.25 - y * 0.01);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    if (y < mazeHeight - 1 && !currentBlock.mask) {
                        if (x === mazeWidth - 1) {
                            block1 = field[0][currentBlock.y];
                            mask = field[0][currentBlock.y + 1];
                        }
                        else {
                            block1 = field[currentBlock.x + 1][currentBlock.y];
                            mask = field[currentBlock.x + 1][currentBlock.y + 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y + 1];
                        // top right
                        if (block1.up && block2.right && (mask.mask || currentBlock.visited)) {
                            ctx.beginPath();
                            let outerRing = (y + 1) * cellHeight, innerRing = outerRing - cellHeight * 0.25, rightExtreme = (x + 1) * cellWidth, leftExtreme = rightExtreme - cellWidth * (0.25 - y * 0.01);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    if (y < mazeHeight - 1 && !currentBlock.mask) {
                        if (x === 0) {
                            block1 = field[mazeWidth - 1][currentBlock.y];
                            mask = field[mazeWidth - 1][currentBlock.y + 1];
                        }
                        else {
                            block1 = field[currentBlock.x - 1][currentBlock.y];
                            mask = field[currentBlock.x - 1][currentBlock.y + 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y + 1];
                        // top left
                        if (block1.up && block2.left && (mask.mask || currentBlock.visited)) {
                            ctx.beginPath();
                            let outerRing = (y + 1) * cellHeight, innerRing = outerRing - cellHeight * 0.25, leftExtreme = x * cellWidth, rightExtreme = leftExtreme + cellWidth * (0.25 - y * 0.01);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                }
            }
            // DRAW MASK (CENTRAL CIRCLE)
            ctx.globalAlpha = 1;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.width / 2, innerRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    // variation on the backtracker: same logic, but can move in a circle on the x-axis
    recursion() {
        // Prep: create path array and choose start position
        let path = [], width = this.xLength - 1, height = this.yLength - 1;
        let firstBlock = this.getFirst(this.field);
        path.push(firstBlock);
        // Prep: bind saveField method for use during recursion
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
                if (currentBlock.x - previousBlock.x === -width) {
                    currentBlock.left = false;
                    previousBlock.right = false;
                }
                else if (currentBlock.x - previousBlock.x === width) {
                    currentBlock.right = false;
                    previousBlock.left = false;
                }
                else if (currentBlock.x - previousBlock.x > 0) {
                    currentBlock.left = false;
                    previousBlock.right = false;
                }
                else if (currentBlock.x - previousBlock.x < 0) {
                    currentBlock.right = false;
                    previousBlock.left = false;
                }
                else if (currentBlock.y - previousBlock.y > 0) {
                    currentBlock.down = false;
                    previousBlock.up = false;
                }
                else if (currentBlock.y - previousBlock.y < 0) {
                    currentBlock.up = false;
                    previousBlock.down = false;
                }
            }
            // 3. EVALUATE NEIGHBOURS: IF VISITED, BUILD WALL; ELSE CONSIDER AS NEXT BLOCK
            let neighbours = [], neighbour;
            if (currentBlock.x === 0) {
                neighbour = field[width][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.right)) {
                    currentBlock.left = true;
                }
            }
            else {
                neighbour = field[currentBlock.x - 1][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.right)) {
                    currentBlock.left = true;
                }
            }
            if (currentBlock.x === width) {
                neighbour = field[0][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.left)) {
                    currentBlock.right = true;
                }
            }
            else {
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
                if (!neighbour.visited || (neighbour.visited && neighbour.up)) {
                    currentBlock.down = true;
                }
            }
            if (currentBlock.y < height) {
                neighbour = field[currentBlock.x][currentBlock.y + 1];
                if (!neighbour.visited && !neighbour.mask) {
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.down)) {
                    currentBlock.up = true;
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
// Random walk algorithm
// Method: randomly walk through the maze. If an unvisited cell is visited, connect this to the previous cell.
// Continue until all cells have been visited at least once.
class AldousBroder extends HollowMaze {
    constructor(xLength, yLength) {
        super(xLength, yLength);
        // Create blank field
        this.field = this.generateField(this.snowflakeMask);
        this.animatedField = this.saveField(this.field, this.animatedField);
        // start recursion
        this.recursion();
    }
    recursion() {
        // Prep: choose start position
        let width = this.xLength - 1, height = this.yLength - 1, currentBlock = this.getFirst(this.field), previousBlock;
        // Prep: bind saveField method for use during recursion
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
// Frontier tunneler: tunnels like backtracker, but when stuck, choose random spot from forntier to start again
// Uses the frontier mechanic from prims instead of backtracking to get out of dead ends
class FrontierTunneler extends HollowMaze {
    constructor(xLength, yLength) {
        super(xLength, yLength);
        this.xLength = xLength;
        this.yLength = yLength;
        // Create blank field
        this.field = this.generateField(this.brainMask);
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.recursion();
    }
    recursion() {
        // Prep: create frontier array & choose start position & bind savefield method
        let frontier = [], width = this.xLength - 1, height = this.yLength - 1, currentBlock = this.getFirst(this.field), previousBlock;
        // Prep: bind saveField method for use during recursion
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        function start(field, animatedField) {
            // 1. Mark currentBlock as visited
            currentBlock.visited = true;
            currentBlock.path = true;
            // 2. Break down wall to previous block
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
            // 3. Evaluate neighbours & build walls
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
            // 4. Quicksave before deciding on next step
            animatedField = quickSave(field, animatedField);
            currentBlock.path = false;
            // 5. If valid neighbours available, jump to random one 
            if (neighbours.length > 0) {
                let randomIndex = Math.floor(Math.random() * neighbours.length);
                previousBlock = currentBlock;
                currentBlock = neighbours[randomIndex];
                return field = start(field, animatedField);
            }
            else {
                // 6. If no valid neighbours, loop through maze to build frontier
                frontier = [];
                for (let row of field) {
                    row.forEach(block => {
                        if (!block.visited && !block.mask) {
                            if ((block.x > 0 && field[block.x - 1][block.y].visited) ||
                                (block.x < width && field[block.x + 1][block.y].visited) ||
                                (block.y > 0 && field[block.x][block.y - 1].visited) ||
                                (block.y < height && field[block.x][block.y + 1].visited)) {
                                frontier.push(block);
                            }
                        }
                    });
                }
                // 7. If frontier contains blocks, select new starting point
                if (frontier.length > 0) {
                    let random = Math.floor(Math.random() * frontier.length);
                    currentBlock = frontier[random];
                    // Determine previousBlock
                    neighbours = [];
                    if (currentBlock.x > 0) {
                        neighbour = field[currentBlock.x - 1][currentBlock.y];
                        if (neighbour.visited && !neighbour.mask) {
                            neighbours.push(neighbour);
                        }
                    }
                    if (currentBlock.x < width) {
                        neighbour = field[currentBlock.x + 1][currentBlock.y];
                        if (neighbour.visited && !neighbour.mask) {
                            neighbours.push(neighbour);
                        }
                    }
                    if (currentBlock.y > 0) {
                        neighbour = field[currentBlock.x][currentBlock.y - 1];
                        if (neighbour.visited && !neighbour.mask) {
                            neighbours.push(neighbour);
                        }
                    }
                    if (currentBlock.y < height) {
                        neighbour = field[currentBlock.x][currentBlock.y + 1];
                        if (neighbour.visited && !neighbour.mask) {
                            neighbours.push(neighbour);
                        }
                    }
                    previousBlock = neighbours[Math.floor(Math.random() * neighbours.length)];
                    return field = start(field, animatedField);
                }
                else {
                    return field;
                }
            }
        }
        start(this.field, this.animatedField);
    }
}
// Extend LinkedCell to include some specifics for polar coordinates
class PolarCell extends LinkedCell {
    constructor(x, width, y, innerY, outerY) {
        super(x, y);
        this.minX = x * (2 * Math.PI / width);
        this.maxX = (x + 1) * (2 * Math.PI / width);
        this.minY = innerY;
        this.maxY = outerY;
    }
}
// Field creation
class PolarMaze {
    constructor(radius) {
        this.field = [];
        this.animatedField = [];
        this.yLength = radius;
    }
    // Creation of a polar field
    generateField() {
        let centralRadius = 0.9;
        let height = this.yLength, cellHeight = 1 / (height + centralRadius);
        let field = [];
        // Add central cell
        let newCell = new PolarCell(0, 1, 0, 0, centralRadius);
        field.push([newCell]);
        // Determine number of cells in first ring
        let circumference = 2 * centralRadius * cellHeight * Math.PI;
        let width = Math.floor(circumference / cellHeight);
        // Start building the maze ring by ring, inside to outside
        for (let y = 1; y <= height; y++) {
            let ring = [];
            // Check if cells have not become too wide; if so, double the amount of cells per ring
            let r = y + centralRadius, nextAngle = 2 * Math.PI / width;
            let distance = Math.sqrt(2 * r * r - 2 * r * r * Math.cos(nextAngle));
            if (distance > 2) {
                width *= 2;
            }
            // Fill the ring: link every cell to the previous one
            for (let x = 0; x < width; x++) {
                let newCell = new PolarCell(x, width, y, y - 1 + centralRadius, y + centralRadius);
                if (x > 0) {
                    newCell.linkNeighbour(ring[x - 1]);
                    if (x == width - 1) {
                        ring[0].linkNeighbour(newCell);
                    }
                }
                // Link new ring to previous ring
                if (y === 1) {
                    newCell.linkNeighbour(field[0][0]);
                }
                else if (width > field[field.length - 1].length) {
                    newCell.linkNeighbour(field[field.length - 1][Math.floor(x / 2)]);
                }
                else {
                    newCell.linkNeighbour(field[field.length - 1][x]);
                }
                ring.push(newCell);
            }
            field.push(ring);
        }
        console.log(field);
        return field;
    }
    // Utility method: save current field to animation history
    // Because of circular data structure, we need to copy manually
    saveField(field, target) {
        let copiedField = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }
    // draw function
    drawMaze(canvas, field, color, image) {
        let ctx = canvas.getContext("2d"), mazeHeight = field.length - (1 - field[0][0].maxY), radius = canvas.width * 0.49, cellHeight = radius / mazeHeight, wallWidth = 0.05, wallHeight = 0.15, centerX = canvas.width / 2, centerY = canvas.width / 2;
        if (ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.width / 2, radius, 0, 2 * Math.PI);
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.7;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            ctx.restore();
            for (let y = 0; y < field.length; y++) {
                if (y > 1 && field[y].length > field[y - 1].length) {
                    wallWidth *= 2;
                }
                for (let x = 0; x < field[y].length; x++) {
                    let currentCell = field[y][x];
                    if (currentCell.path) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentCell.maxY * cellHeight, currentCell.minX, currentCell.maxX, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, currentCell.minY * cellHeight, currentCell.maxX, currentCell.minX, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (currentCell.visited) {
                        // draw walls
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;
                        for (let link of currentCell.links) {
                            if (link.wall) {
                                let neighbour = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                                let cellWidth = currentCell.maxX - currentCell.minX;
                                if (y === 0) {
                                    cellWidth = field[1][0].maxX - field[1][0].minX;
                                }
                                ctx.beginPath();
                                // top wall
                                if (neighbour.minY === currentCell.maxY) {
                                    ctx.arc(centerX, centerY, currentCell.maxY * cellHeight, neighbour.minX - cellWidth * wallWidth, neighbour.maxX + cellWidth * wallWidth, false);
                                    ctx.arc(centerX, centerY, currentCell.maxY * cellHeight - wallHeight * cellHeight, neighbour.maxX + cellWidth * wallWidth, neighbour.minX - cellWidth * wallWidth, true);
                                }
                                // bottom wall
                                else if (currentCell.minY === neighbour.maxY) {
                                    ctx.arc(centerX, centerY, currentCell.minY * cellHeight + wallHeight * cellHeight, currentCell.minX - cellWidth * wallWidth, currentCell.maxX + cellWidth * wallWidth, false);
                                    ctx.arc(centerX, centerY, currentCell.minY * cellHeight, currentCell.maxX + cellWidth * wallWidth, currentCell.minX - cellWidth * wallWidth, true);
                                }
                                // left wall
                                else if (currentCell.minX === neighbour.maxX || (currentCell.minX === 0 && neighbour.maxX === Math.PI * 2)) {
                                    ctx.arc(centerX, centerY, currentCell.maxY * cellHeight, currentCell.minX, currentCell.minX + cellWidth * wallWidth, false);
                                    ctx.arc(centerX, centerY, currentCell.minY * cellHeight, currentCell.minX + cellWidth * wallWidth, currentCell.minX, true);
                                }
                                // right wall
                                else if (currentCell.maxX === neighbour.minX || (neighbour.minX === 0 && currentCell.maxX === Math.PI * 2)) {
                                    ctx.arc(centerX, centerY, currentCell.maxY * cellHeight, currentCell.maxX - cellWidth * wallWidth, currentCell.maxX, false);
                                    ctx.arc(centerX, centerY, currentCell.minY * cellHeight, currentCell.maxX, currentCell.maxX - cellWidth * wallWidth, true);
                                }
                                ctx.closePath();
                                ctx.fill();
                            }
                        }
                    }
                    else {
                    }
                }
            }
            // overlay for unvisited cells
            for (let y = 0; y < field.length; y++) {
                for (let x = 0; x < field[y].length; x++) {
                    let currentCell = field[y][x];
                    if (!currentCell.visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentCell.maxY * cellHeight, currentCell.minX, currentCell.maxX, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, currentCell.minY * cellHeight, currentCell.maxX, currentCell.minX, true);
                        ctx.closePath();
                        ctx.fill();
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentCell.maxY * cellHeight, currentCell.minX, currentCell.maxX, false);
                        ctx.arc(canvas.width / 2, canvas.width / 2, currentCell.minY * cellHeight, currentCell.maxX, currentCell.minX, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }
            // draw outside walls
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.arc(centerX, centerY, radius - wallWidth * cellHeight, 2 * Math.PI, 0, true);
            ctx.closePath();
            ctx.fill();
        }
    }
}
class PolarBacktracker extends PolarMaze {
    constructor(radius) {
        super(radius);
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);
        // start recursion
        this.recursion();
    }
    recursion() {
        // Prep: create path array and choose start position
        let path = [];
        let randomY = Math.floor(this.field.length * Math.random()), randomX = Math.floor(this.field[randomY].length * Math.random());
        path.push(this.field[randomY][randomX]);
        // Prep: bind saveField method for use during recursion
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        function start(field, animatedField) {
            // Select current cell
            let currentCell = path[path.length - 1];
            currentCell.visited = true;
            currentCell.path = true;
            quickSave(field, animatedField);
            currentCell.path = false;
            // Collect unvisited neighbours
            let possibleLinks = [];
            for (let link of currentCell.links) {
                let neighbour = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                if (!neighbour.visited) {
                    possibleLinks.push(link);
                }
            }
            // Select random neighbour to jump to
            if (possibleLinks.length > 0) {
                let randomIndex = Math.floor(Math.random() * possibleLinks.length), link = possibleLinks[randomIndex];
                link.wall = false;
                let neighbour = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                path.push(neighbour);
                return field = start(field, animatedField);
            }
            else {
                path.splice(path.length - 1, 1);
                if (path.length > 0) {
                    return field = start(field, animatedField);
                }
                else {
                    return field;
                }
            }
        }
        start(this.field, this.animatedField);
    }
}
// Extend LinkedCell to include some specifics for polar coordinates
class TriCell extends LinkedCell {
}
// Field creation
class TriangularMaze {
    constructor(radius) {
        this.field = [];
        this.animatedField = [];
        this.yLength = radius;
    }
    // Creation of a triangular field
    generateField() {
        let field = [];
        return field;
    }
    // Utility method: save current field to animation history
    // Because of circular data structure, we need to copy manually
    saveField(field, target) {
        let copiedField = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }
    // draw function
    drawMaze(canvas, field, color, image) {
        let ctx = canvas.getContext("2d");
        if (ctx) {
        }
    }
}
class SolidMaze {
    constructor(width, height) {
        this.field = [];
        this.animatedField = [];
        this.xLength = 2 * width + 1; // need uneven width & height to make walls work
        this.yLength = 2 * height + 1; // need uneven width & height to make walls work
    }
    // Make empty field
    generateField() {
        let width = this.xLength, height = this.yLength;
        let xArray = [];
        for (let x = 0; x < width; x++) {
            let yArray = [];
            for (let y = 0; y < height; y++) {
                yArray.push(new SolidCell(x, y));
                if (x === 0 || y === 0 || x === this.xLength - 1 || y === this.yLength - 1) {
                    yArray[y].visited = true;
                }
            }
            xArray.push(yArray);
        }
        return xArray;
    }
    // Helper function: return random coordinate between 2 points
    getRandom(low, high) {
        return Math.floor((Math.random() * (high - low) * 0.5)) * 2 + low;
    }
    // Helper function: save a copy of field to animated field
    saveField(field, target) {
        let copiedField = JSON.parse(JSON.stringify(field));
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
                    if (field[x][y].wall && field[x][y].visited) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    else if (field[x][y].path) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fillRect(marginX + x * cellWidth, marginY + y * cellHeight, cellWidth, cellHeight);
                    }
                    else if (!field[x][y].visited) {
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
// Solid maze made with backtracker algorithm
// Method: randomly snake through the maze until a dead end is reached. Backtrack until no longer imprisoned.
// Step 1: Select a random starting cell and add it to a path array.
// Step 2: Select the last cell from the path array. Mark it as visited.
// Step 3: open wall to previous cell (if any)
// Step 4: Check neighbours: if unvisited options available, choose one and add it to path array.
// Step 5: if no unvisited neighbours available: remove last cell from path array.
// Step 6: return to step 2 recursively until path array is empty
class SimpleBacktrack extends SolidMaze {
    constructor(width, length) {
        super(width, length);
        // Create blank field
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);
        // Start recursion
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }
    buildMaze(field, animatedField) {
        // Prep: create path array and select start position
        let path = [], randomX = this.getRandom(1, this.xLength - 2), randomY = this.getRandom(1, this.yLength - 2);
        path.push(field[randomX][randomY]);
        // Prep: bind saveField method for use during recursion
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        // Prep: bind getRandom method for use during recursion
        const quickRandom = (min, max) => {
            return this.getRandom(min, max);
        };
        // Body: recursion function
        function startRecursion(field) {
            // 1. TAKE LAST POSITION FROM PATH, MARK AS VISITED, NO WALL
            let currentCell = path[path.length - 1];
            field[currentCell.x][currentCell.y].wall = false;
            field[currentCell.x][currentCell.y].visited = true;
            field[currentCell.x][currentCell.y].path = true;
            // 2. MARK WALLS AS VISITED
            field[currentCell.x + 1][currentCell.y].visited = true;
            field[currentCell.x - 1][currentCell.y].visited = true;
            field[currentCell.x][currentCell.y + 1].visited = true;
            field[currentCell.x][currentCell.y - 1].visited = true;
            field[currentCell.x + 1][currentCell.y + 1].visited = true;
            field[currentCell.x - 1][currentCell.y + 1].visited = true;
            field[currentCell.x + 1][currentCell.y - 1].visited = true;
            field[currentCell.x - 1][currentCell.y - 1].visited = true;
            animatedField = quickSave(field, animatedField);
            field[currentCell.x][currentCell.y].path = false;
            // 3. CHECK FOR VALID NEIGHBOURS (UNVISITED)
            let neighbours = [];
            if (field[currentCell.x - 2] && !field[currentCell.x - 2][currentCell.y].visited) {
                neighbours.push(field[currentCell.x - 2][currentCell.y]);
            }
            if (field[currentCell.x + 2] && !field[currentCell.x + 2][currentCell.y].visited) {
                neighbours.push(field[currentCell.x + 2][currentCell.y]);
            }
            if (field[currentCell.x][currentCell.y - 2] && !field[currentCell.x][currentCell.y - 2].visited) {
                neighbours.push(field[currentCell.x][currentCell.y - 2]);
            }
            if (field[currentCell.x][currentCell.y + 2] && !field[currentCell.x][currentCell.y + 2].visited) {
                neighbours.push(field[currentCell.x][currentCell.y + 2]);
            }
            // 4. IF VALID NEIGHBOURS, JUMP TO RANDOM 1 AND CONTINUE
            if (neighbours.length > 0) {
                let randomIndex = Math.floor(Math.random() * neighbours.length);
                let neighbour = neighbours[randomIndex], diffX = (currentCell.x - neighbour.x) * 0.5, diffY = (currentCell.y - neighbour.y) * 0.5;
                field[currentCell.x - diffX][currentCell.y - diffY].wall = false;
                path.push(field[neighbour.x][neighbour.y]);
                return field = startRecursion(field);
            }
            else {
                // 5. IF NO VALID NEIGHBOURS, RETURN ALONG PATH UNTIL EMPTY
                path.splice(path.length - 1, 1);
                if (path.length > 0) {
                    return field = startRecursion(field);
                }
                else {
                    return field;
                }
            }
            return field;
        }
        field = startRecursion(field);
        return animatedField;
    }
}
// Solid maze generated with Prim's algorithm
// Method: grow the maze organically by selecting random bordering cell and adding it to the maze
// Step 1: Select random starting cell; mark as visited and add it to the maze
// Step 2: add bordering cells to frontier array
// Step 3: select random cell from frontier array. Remove it from the frontier array and add it to the maze.
// Step 4: check which neighbouring cells are already part of the maze.
// Step 5: bridge to valid neighbour
// Step 6: add other, unvisited neighbours to frontier
// Step 7: return to step 3 recursively until frontier is empty
class PrimsMaze extends SolidMaze {
    constructor(width, length) {
        super(width, length);
        // Create blank field
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);
        // Start recursion
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }
    buildMaze(field, animatedField) {
        // Prep: create frontier and determine start location
        let frontier = [], randomX = this.getRandom(1, this.xLength - 2), randomY = this.getRandom(1, this.yLength - 2);
        frontier.push(field[randomX][randomY]);
        // Prep: bind saveField method for use during recursion
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        // Prep: bind getRandom method for use during recursion
        const quickRandom = (min, max) => {
            return this.getRandom(min, max);
        };
        // Body: recursion function
        function startRecursion(field) {
            // 1. Take random cell from frontier
            let randomIndex = Math.floor(Math.random() * frontier.length), currentCell = frontier[randomIndex];
            frontier.splice(randomIndex, 1);
            // 2. Mark cell + neighbours as visited
            field[currentCell.x][currentCell.y].visited = true;
            field[currentCell.x][currentCell.y].wall = false;
            field[currentCell.x + 1][currentCell.y].visited = true;
            field[currentCell.x - 1][currentCell.y].visited = true;
            field[currentCell.x][currentCell.y + 1].visited = true;
            field[currentCell.x][currentCell.y - 1].visited = true;
            field[currentCell.x + 1][currentCell.y + 1].visited = true;
            field[currentCell.x - 1][currentCell.y + 1].visited = true;
            field[currentCell.x + 1][currentCell.y - 1].visited = true;
            field[currentCell.x - 1][currentCell.y - 1].visited = true;
            // 3. Connect to existing maze
            let neighbours = [];
            if (field[currentCell.x - 2]) {
                if (field[currentCell.x - 2][currentCell.y].visited && !field[currentCell.x - 2][currentCell.y].wall) {
                    neighbours.push(field[currentCell.x - 2][currentCell.y]);
                }
            }
            if (field[currentCell.x + 2]) {
                if (field[currentCell.x + 2][currentCell.y].visited && !field[currentCell.x + 2][currentCell.y].wall) {
                    neighbours.push(field[currentCell.x + 2][currentCell.y]);
                }
            }
            if (field[currentCell.x][currentCell.y - 2]) {
                if (field[currentCell.x][currentCell.y - 2].visited && !field[currentCell.x][currentCell.y - 2].wall) {
                    neighbours.push(field[currentCell.x][currentCell.y - 2]);
                }
            }
            if (field[currentCell.x][currentCell.y + 2]) {
                if (field[currentCell.x][currentCell.y + 2].visited && !field[currentCell.x][currentCell.y + 2].wall) {
                    neighbours.push(field[currentCell.x][currentCell.y + 2]);
                }
            }
            if (neighbours.length > 0) {
                randomIndex = Math.floor(Math.random() * neighbours.length);
                let neighbour = neighbours[randomIndex], diffX = (currentCell.x - neighbour.x) * 0.5, diffY = (currentCell.y - neighbour.y) * 0.5;
                field[currentCell.x - diffX][currentCell.y - diffY].wall = false;
            }
            // 4. Update frontier
            if (field[currentCell.x - 2] && !field[currentCell.x - 2][currentCell.y].visited) {
                field[currentCell.x - 2][currentCell.y].visited = true;
                frontier.push(field[currentCell.x - 2][currentCell.y]);
            }
            if (field[currentCell.x + 2] && !field[currentCell.x + 2][currentCell.y].visited) {
                field[currentCell.x + 2][currentCell.y].visited = true;
                frontier.push(field[currentCell.x + 2][currentCell.y]);
            }
            if (field[currentCell.x][currentCell.y - 2] && !field[currentCell.x][currentCell.y - 2].visited) {
                field[currentCell.x][currentCell.y - 2].visited = true;
                frontier.push(field[currentCell.x][currentCell.y - 2]);
            }
            if (field[currentCell.x][currentCell.y + 2] && !field[currentCell.x][currentCell.y + 2].visited) {
                field[currentCell.x][currentCell.y + 2].visited = true;
                frontier.push(field[currentCell.x][currentCell.y + 2]);
            }
            // 5. SAVE FIELD & CONSIDER RECURSION
            animatedField = quickSave(field, animatedField);
            if (frontier.length === 0) {
                return field;
            }
            else {
                return field = startRecursion(field);
            }
        }
        field = startRecursion(field);
        return animatedField;
    }
}
// Solid maze generated with recursive division
// Method: continuously divide maze area in 4 connected zones until a minimum size is reached;
// Step 1: add maze area to an array of zones
// Step 2: choose random zone from array. Mark this as selected zone and remove from array.
// Step 3: draw random vertical and horizontal line in selected zone to make 4 new zones
// Step 4: connect the 4 zones to each other by drawing 3 doors
// Step 5: check the new zones: if not minimum size, add to array of zones
// Step 6: return to step 2 recursively until zone array is empty
class RecursiveMaze extends SolidMaze {
    constructor(width, length) {
        super(width, length);
        // Create blank field
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);
        // Start recursion
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }
    buildMaze(field, animatedField) {
        // Prep: create array to keep track of zones created by recursive division
        let zoneArray = [];
        zoneArray.push({ minX: 0, maxX: this.xLength - 1, minY: 0, maxY: this.yLength - 1 }); // FIRST ZONE = COMPLETE FIELD
        // Prep: bind saveField method for use during recursion
        const quickSave = (field, animatedField) => {
            return this.saveField(field, animatedField);
        };
        // Prep: bind getRandom method for use during recursion
        const quickRandom = (min, max) => {
            return this.getRandom(min, max);
        };
        // Body: recursion function
        function startRecursion(field) {
            // 1. Select zone to divide and remove from array
            let currentZone = zoneArray[zoneArray.length - 1];
            zoneArray.splice(zoneArray.length - 1, 1);
            // 2. Get intersection in current zone
            let currentX = quickRandom(currentZone.minX + 2, currentZone.maxX - 2), currentY = quickRandom(currentZone.minY + 2, currentZone.maxY - 2);
            // 3. Add new zones based on intersection
            if (currentX - currentZone.minX > 2 && currentY - currentZone.minY > 2) {
                zoneArray.push({ minX: currentZone.minX, maxX: currentX, minY: currentZone.minY, maxY: currentY }); // TOP LEFT
            }
            if (currentZone.maxX - currentX > 2 && currentY - currentZone.minY > 2) {
                zoneArray.push({ minX: currentX, maxX: currentZone.maxX, minY: currentZone.minY, maxY: currentY }); // TOP RIGHT
            }
            if (currentZone.maxX - currentX > 2 && currentZone.maxY - currentY > 2) {
                zoneArray.push({ minX: currentX, maxX: currentZone.maxX, minY: currentY, maxY: currentZone.maxY }); // BOTTOM RIGHT
            }
            if (currentX - currentZone.minX > 2 && currentZone.maxY - currentY > 2) {
                zoneArray.push({ minX: currentZone.minX, maxX: currentX, minY: currentY, maxY: currentZone.maxY }); // BOTTOM LEFT
            }
            // 4. Insert walls
            for (let x = currentZone.minX + 1; x < currentZone.maxX; x++) {
                field[x][currentY].wall = true;
                field[x][currentY].visited = true;
                let top = field[x][currentY - 1];
                if (!top.visited) {
                    top.visited = true;
                    top.wall = false;
                }
                let bottom = field[x][currentY + 1];
                if (!bottom.visited) {
                    bottom.visited = true;
                    bottom.wall = false;
                }
            }
            for (let y = currentZone.minY + 1; y < currentZone.maxY; y++) {
                field[currentX][y].wall = true;
                field[currentX][y].visited = true;
                let right = field[currentX + 1][y];
                if (!right.visited) {
                    right.visited = true;
                    right.wall = false;
                }
                let left = field[currentX - 1][y];
                if (!left.visited) {
                    left.visited = true;
                    left.wall = false;
                }
            }
            // 5. Make 4 doors then scrap 1
            let randomIndex = Math.floor(Math.random() * 4);
            let random, doors = [];
            random = quickRandom(currentZone.minX + 1, currentX - 1);
            doors.push({ x: random, y: currentY });
            random = quickRandom(currentX + 1, currentZone.maxX - 1);
            doors.push({ x: random, y: currentY });
            random = quickRandom(currentY + 1, currentZone.maxY - 1);
            doors.push({ x: currentX, y: random });
            random = quickRandom(currentZone.minY + 1, currentY - 1);
            doors.push({ x: currentX, y: random });
            doors.splice(randomIndex, 1);
            for (let door of doors) {
                field[door.x][door.y].wall = false;
            }
            animatedField = quickSave(field, animatedField);
            // IF ZONES LEFT, RESTART
            if (zoneArray.length === 0) {
                return field;
            }
            else {
                return field = startRecursion(field);
            }
        }
        field = startRecursion(field);
        return animatedField;
    }
}
