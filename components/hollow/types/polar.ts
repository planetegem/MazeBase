class FakePolar extends HollowMaze {
    constructor(xLength: number, yLength: number){
        super(xLength, yLength);

        // Create blank field
        this.field = this.generateField(this.polarMask);
        this.animatedField = this.saveField(this.field, this.animatedField);

        this.recursion();
    }

    // Polar mask: doesn't draw walls on left or right side (to give illusion of continuity)
    protected polarMask (x: number, y: number, width: number, height: number): HollowCell {
        let block: HollowCell = new HollowCell(x, y);
        if (y === 0){
            block.down = true
        } else if (y === height - 1){
            block.up = true;
        }
        return block;
    }

    // Overwrite draw function to make circular maze with polar coordinates
    public drawMaze(canvas: HTMLCanvasElement, field: hollowField, color: string, image: HTMLImageElement): void {
        let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"),
            mazeWidth: number = field.length,
            mazeHeight: number = field[0].length,
            innerRadius: number = (canvas.width/2)*0.2,
            maxRadius: number = (canvas.width/2)*0.975,
            mazeRadius: number = maxRadius - innerRadius,
            cellWidth: number = 2*Math.PI/mazeWidth,
            cellHeight: number = mazeRadius/mazeHeight;        
    
        if (ctx){

            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.width/2, maxRadius, 0, 2*Math.PI);
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.7;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            for (let x = 0; x < mazeWidth; x++){
                for (let y = 0; y < mazeHeight; y++){
                    let currentBlock: HollowCell = field[x][y];

                    // DRAW FOG
                    if (!currentBlock.visited){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y + 1)*cellHeight, x*cellWidth, (x + 1)*cellWidth, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y)*cellHeight, (x + 1)*cellWidth, x*cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                        
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y + 1)*cellHeight, x*cellWidth, (x + 1)*cellWidth, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y)*cellHeight, (x + 1)*cellWidth, x*cellWidth, true);
                        ctx.closePath();
                        ctx.fill();                                                          
                    }
                    // DRAW MASK
                    if (currentBlock.mask){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y + 1)*cellHeight, x*cellWidth, (x + 1)*cellWidth, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y)*cellHeight, (x + 1)*cellWidth, x*cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    // DRAW PATH
                    if (currentBlock.path){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.beginPath();
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y + 1)*cellHeight, x*cellWidth, (x + 1)*cellWidth, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + (y)*cellHeight, (x + 1)*cellWidth, x*cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    // DRAW WALLS
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = color;
                    if (currentBlock.up){
                        ctx.beginPath();
                        let outerRing: number = (y + 1)*cellHeight,
                            innerRing: number = outerRing - cellHeight*0.25;
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, x*cellWidth, (x + 1)*cellWidth, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, (x + 1)*cellWidth, x*cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (currentBlock.down){
                        ctx.beginPath();
                        let innerRing: number = y*cellHeight,
                            outerRing: number = innerRing + cellHeight*0.25;
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, x*cellWidth, (x + 1)*cellWidth, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, (x + 1)*cellWidth, x*cellWidth, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    if (currentBlock.right){
                        ctx.beginPath();
                        let innerRing: number = y*cellHeight,
                            outerRing: number = (y + 1)*cellHeight,
                            rightExtreme: number = (x + 1)*cellWidth,
                            leftExtreme: number = rightExtreme - cellWidth*(0.25 - y*0.01);
                            
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    if (currentBlock.left){
                        ctx.beginPath();
                        let innerRing: number = y*cellHeight,
                            outerRing: number = (y + 1)*cellHeight,
                            leftExtreme: number = x*cellWidth,
                            rightExtreme: number = leftExtreme + cellWidth*(0.25 - y*0.01);
                            
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                        ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    // DRAW CORNERS
                    let block1: HollowCell, block2: HollowCell, mask: HollowCell;
                    if (y > 0 && !currentBlock.mask){
                        if (x === 0){
                            block1 = field[mazeWidth - 1][currentBlock.y];
                            mask = field[mazeWidth - 1][currentBlock.y - 1];
                        } else {
                            block1 = field[currentBlock.x - 1][currentBlock.y];
                            mask = field[currentBlock.x - 1][currentBlock.y - 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        
                        // bottom left corner
                        if(block1.down && block2.left && (mask.mask || currentBlock.visited)){
                            ctx.beginPath();
                            let innerRing: number = y*cellHeight,
                                outerRing: number = innerRing + cellHeight*0.25,
                                leftExtreme: number = x*cellWidth,
                                rightExtreme: number = leftExtreme + cellWidth*(0.25 - y*0.01);
                                
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();                 
                        }
                    }
                    if (y > 0 && !currentBlock.mask){
                        if (x === mazeWidth - 1){
                            block1 = field[0][currentBlock.y];
                            mask = field[0][currentBlock.y - 1];
                        } else {
                            block1 = field[currentBlock.x + 1][currentBlock.y];
                            mask = field[currentBlock.x + 1][currentBlock.y - 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        
                        // bottom right
                        if(block1.down && block2.right && (mask.mask || currentBlock.visited)){
                            ctx.beginPath();
                            let innerRing: number = y*cellHeight,
                                outerRing: number = innerRing + cellHeight*0.25,
                                rightExtreme: number = (x + 1)*cellWidth,
                                leftExtreme: number = rightExtreme - cellWidth*(0.25 - y*0.01);
                                
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    
                    if (y < mazeHeight - 1 && !currentBlock.mask){
                        if (x === mazeWidth - 1){
                            block1 = field[0][currentBlock.y];
                            mask = field[0][currentBlock.y + 1];
                        } else {
                            block1 = field[currentBlock.x + 1][currentBlock.y];
                            mask = field[currentBlock.x + 1][currentBlock.y + 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y + 1];

                        // top right
                        if(block1.up && block2.right && (mask.mask || currentBlock.visited)){
                            ctx.beginPath();
                            let outerRing: number = (y + 1)*cellHeight,
                                innerRing: number = outerRing - cellHeight*0.25,
                                rightExtreme: number = (x + 1)*cellWidth,
                                leftExtreme: number = rightExtreme - cellWidth*(0.25 - y*0.01);
                                
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    if (y < mazeHeight - 1 && !currentBlock.mask){
                        if (x === 0){
                            block1 = field[mazeWidth - 1][currentBlock.y];
                            mask = field[mazeWidth - 1][currentBlock.y + 1];
                        } else {
                            block1 = field[currentBlock.x - 1][currentBlock.y];
                            mask = field[currentBlock.x - 1][currentBlock.y + 1];
                        }
                        block2 = field[currentBlock.x][currentBlock.y + 1];

                        // top left
                        if(block1.up && block2.left && (mask.mask || currentBlock.visited)){                            
                            ctx.beginPath();
                            let outerRing: number = (y + 1)*cellHeight,
                                innerRing: number = outerRing - cellHeight*0.25,
                                leftExtreme: number = x*cellWidth,
                                rightExtreme: number = leftExtreme + cellWidth*(0.25 - y*0.01);
                                
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + outerRing, leftExtreme, rightExtreme, false);
                            ctx.arc(canvas.width/2, canvas.width/2, innerRadius + innerRing, rightExtreme, leftExtreme, true);
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
            ctx.arc(canvas.width/2, canvas.width/2, innerRadius, 0, 2*Math.PI);
            ctx.fill();
        }
    }

    // variation on the backtracker: same logic, but can move in a circle on the x-axis
    protected recursion(): void {
        // Prep: create path array and choose start position
        let path: HollowCell[] = [],
            width: number = this.xLength - 1,
            height: number = this.yLength - 1;

        let firstBlock: HollowCell = this.getFirst(this.field);
        path.push(firstBlock);

        // Prep: bind saveField method for use during recursion
        const quickSave = (field: hollowField, animatedField: hollowAnimation): hollowAnimation => {
            return this.saveField(field, animatedField);
        }

        function start(field: hollowField, animatedField: hollowAnimation): hollowField {
            // 1. TAKE LAST POSITION FROM PATH, MARK AS VISITED
            let currentBlock: HollowCell = path[path.length - 1];
            currentBlock.visited = true;
            currentBlock.path = true;
            
            // 2. BREAK DOWN WALL TO PREVIOUS CELL
            if (path[path.length - 2]){
                let previousBlock = path[path.length - 2];
                if (currentBlock.x - previousBlock.x === -width){
                    currentBlock.left = false;
                    previousBlock.right = false;
                } else if (currentBlock.x - previousBlock.x === width){
                    currentBlock.right = false;
                    previousBlock.left = false;
                } else if (currentBlock.x - previousBlock.x > 0){
                    currentBlock.left = false;
                    previousBlock.right = false;
                } else if (currentBlock.x - previousBlock.x < 0){
                    currentBlock.right = false;
                    previousBlock.left = false;
                } else if (currentBlock.y - previousBlock.y > 0){
                    currentBlock.down = false;
                    previousBlock.up = false;
                } else if (currentBlock.y - previousBlock.y < 0){
                    currentBlock.up = false;
                    previousBlock.down = false;
                }
            }
            
            // 3. EVALUATE NEIGHBOURS: IF VISITED, BUILD WALL; ELSE CONSIDER AS NEXT BLOCK
            let neighbours: HollowCell[] = [],
                neighbour: HollowCell;
            
            if (currentBlock.x === 0){
                neighbour = field[width][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.right)){
                    currentBlock.left = true;
                }
            } else {
                neighbour = field[currentBlock.x - 1][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.right)){
                    currentBlock.left = true;
                }
            }
            if (currentBlock.x === width){
                neighbour = field[0][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                } 
                if (!neighbour.visited || (neighbour.visited && neighbour.left)){
                    currentBlock.right = true;
                }
            } else {
                neighbour = field[currentBlock.x + 1][currentBlock.y];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                } 
                if (!neighbour.visited || (neighbour.visited && neighbour.left)){
                    currentBlock.right = true;
                }
            }
            if (currentBlock.y > 0){
                neighbour = field[currentBlock.x][currentBlock.y - 1];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                } 
                if (!neighbour.visited || (neighbour.visited && neighbour.up)){
                    currentBlock.down = true;
                }
            }
            if (currentBlock.y < height){
                neighbour = field[currentBlock.x][currentBlock.y + 1];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.down)){
                    currentBlock.up = true;
                }
            }
            animatedField = quickSave(field, animatedField);
            currentBlock.path = false;

            // 4. IF VALID NEIGHBOURS, JUMP TO RANDOM 1 AND CONTINUE
            if (neighbours.length > 0){
                let randomIndex: number = Math.floor(Math.random() * neighbours.length);
                let nextBlock: HollowCell = neighbours[randomIndex];
                                
                path.push(nextBlock);
                return field = start(field, animatedField);
            } else {
                // 5. IF NO VALID NEIGHBOURS, RETURN ALONG PATH UNTIL EMPTY
                path.splice(path.length - 1, 1);
                if (path.length > 0){
                    return field = start(field, animatedField);
                } else {
                    return field;
                }
            }
            return field;
        }
        start(this.field, this.animatedField);
    }
}

