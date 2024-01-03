// Frontier tunneler: tunnels like backtracker, but when stuck, choose random spot from forntier to start again
// Uses the frontier mechanic from prims instead of backtracking to get out of dead ends

class FrontierTunneler extends HollowMaze {
    constructor(protected readonly xLength: number, protected readonly yLength: number){
        super(xLength, yLength);

        // Create blank field
        this.field = this.generateField(this.brainMask);
        this.animatedField = this.saveField(this.field, this.animatedField);

        this.recursion();
    }
    protected recursion(): void {
        // Prep: create frontier array & choose start position & bind savefield method
        let frontier: HollowCell[] = [],
            width: number = this.xLength - 1,
            height: number = this.yLength - 1,
            currentBlock: HollowCell = this.getFirst(this.field),
            previousBlock: HollowCell;

        // Prep: bind saveField method for use during recursion
        const quickSave = (field: hollowField, animatedField: hollowAnimation): hollowAnimation => {
            return this.saveField(field, animatedField);
        } 

        function start(field: hollowField, animatedField: hollowAnimation): hollowField {
            // 1. Mark currentBlock as visited
            currentBlock.visited = true;
            currentBlock.path = true;
            
            // 2. Break down wall to previous block
            if (previousBlock){
                if (currentBlock.x - previousBlock.x > 0){
                    currentBlock.left = false;
                    previousBlock.right = false;
                } else if (currentBlock.x - previousBlock.x < 0){
                    currentBlock.right = false;
                    previousBlock.left = false;
                } else if (currentBlock.y - previousBlock.y > 0){
                    currentBlock.up = false;
                    previousBlock.down = false;
                } else if (currentBlock.y - previousBlock.y < 0){
                    currentBlock.down = false;
                    previousBlock.up = false;
                }
            }
            
            // 3. Evaluate neighbours & build walls
            let neighbours: HollowCell[] = [],
                neighbour: HollowCell;
            
            if (currentBlock.x > 0){
                neighbour = field[currentBlock.x - 1][currentBlock.y]
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.right)){
                    currentBlock.left = true;
                }
            }
            if (currentBlock.x < width){
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
                if (!neighbour.visited || (neighbour.visited && neighbour.down)){
                    currentBlock.up = true;
                }
            }
            if (currentBlock.y < height){
                neighbour = field[currentBlock.x][currentBlock.y + 1];
                if (!neighbour.visited && !neighbour.mask){
                    neighbours.push(neighbour);
                }
                if (!neighbour.visited || (neighbour.visited && neighbour.up)){
                    currentBlock.down = true;
                }
            }

            // 4. Quicksave before deciding on next step
            animatedField = quickSave(field, animatedField);
            currentBlock.path = false;

            // 5. If valid neighbours available, jump to random one 
            if (neighbours.length > 0){
                let randomIndex: number = Math.floor(Math.random() * neighbours.length);

                previousBlock = currentBlock;
                currentBlock = neighbours[randomIndex];

                return field = start(field, animatedField);

            } else {
                // 6. If no valid neighbours, loop through maze to build frontier
                frontier = [];
                for (let row of field){
                    row.forEach(block => {
                        if (!block.visited && !block.mask){
                            if ((block.x > 0 && field[block.x - 1][block.y].visited) ||
                                (block.x < width && field[block.x + 1][block.y].visited) ||
                                (block.y > 0 && field[block.x][block.y - 1].visited) ||
                                (block.y < height && field[block.x][block.y + 1].visited)
                            ){
                                frontier.push(block);
                            }
                        }
                    });
                }
                // 7. If frontier contains blocks, select new starting point
                if (frontier.length > 0){
                    let random = Math.floor(Math.random()*frontier.length);
                    currentBlock = frontier[random];

                    // Determine previousBlock
                    neighbours = [];
                    if (currentBlock.x > 0){
                        neighbour = field[currentBlock.x - 1][currentBlock.y]
                        if (neighbour.visited && !neighbour.mask){
                            neighbours.push(neighbour);
                        }
                    }
                    if (currentBlock.x < width){
                        neighbour = field[currentBlock.x + 1][currentBlock.y];
                        if (neighbour.visited && !neighbour.mask){
                            neighbours.push(neighbour);
                        } 
                    }
                    if (currentBlock.y > 0){
                        neighbour = field[currentBlock.x][currentBlock.y - 1];
                        if (neighbour.visited && !neighbour.mask){
                            neighbours.push(neighbour);
                        } 
                    }
                    if (currentBlock.y < height){
                        neighbour = field[currentBlock.x][currentBlock.y + 1];
                        if (neighbour.visited && !neighbour.mask){
                            neighbours.push(neighbour);
                        }
                    }
                    previousBlock = neighbours[Math.floor(Math.random()*neighbours.length)];

                    return field = start(field, animatedField);

                } else {
                    return field;
                }
            }
        }
        start(this.field, this.animatedField);
    }
}