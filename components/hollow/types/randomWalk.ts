// Random walk algorithm
// Method: randomly walk through the maze. If an unvisited cell is visited, connect this to the previous cell.
// Continue until all cells have been visited at least once.

class AldousBroder extends HollowMaze {
    constructor(xLength: number, yLength: number){
        super(xLength, yLength);

        // Create blank field
        this.field = this.generateField(this.snowflakeMask);
        this.animatedField = this.saveField(this.field, this.animatedField);

        // start recursion
        this.recursion();
    }

    protected recursion(): void {
        // Prep: choose start position
        let width: number = this.xLength - 1,
            height: number = this.yLength - 1,
            currentBlock: HollowCell = this.getFirst(this.field),
            previousBlock: HollowCell;

        // Prep: bind saveField method for use during recursion
        const quickSave = (field: hollowField, animatedField: hollowAnimation): hollowAnimation => {
            return this.saveField(field, animatedField);
        } 

        function start(field: hollowField, animatedField: hollowAnimation): hollowField {
            // 1. MAKE CURRENT BLOCK PART OF MAZE
            if (!currentBlock.visited){
                currentBlock.visited = true;
                currentBlock.up = true;
                currentBlock.right = true;
                currentBlock.down = true;
                currentBlock.left = true;

                // 2. IF PREVIOUS BLOCK EXISTS, OPEN WALL
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
            }
            currentBlock.path = true;
            animatedField = quickSave(field, animatedField);
            currentBlock.path = false;

            // 3. CHOOSE RANDOM DIRECTION
            let neighbours: HollowCell[] = [],
                neighbour: HollowCell;

            if (currentBlock.x > 0){
                neighbour = field[currentBlock.x - 1][currentBlock.y];
                if (!neighbour.mask){
                    neighbours.push(neighbour);
                }
            }
            if (currentBlock.x < width){
                neighbour = field[currentBlock.x + 1][currentBlock.y];
                if (!neighbour.mask){
                    neighbours.push(neighbour);
                }
            }
            if (currentBlock.y > 0){
                neighbour = field[currentBlock.x ][currentBlock.y - 1];
                if (!neighbour.mask){
                    neighbours.push(neighbour);
                }
            }
            if (currentBlock.y < height){
                neighbour = field[currentBlock.x][currentBlock.y + 1];
                if (!neighbour.mask){
                    neighbours.push(neighbour);
                }
            }

            let randomIndex: number = Math.floor(Math.random()*neighbours.length),
                nextBlock: HollowCell = neighbours[randomIndex];

            previousBlock = currentBlock;
            currentBlock = nextBlock;
            
            // 4. COUNT HOW MANY CELLS ARE UNVISITED
            let counter: number = 0;
            for (let row of field){
                for (let block of row){
                    if (!block.visited && !block.mask){
                        counter++;
                    }
                }
            }

            // 5. IF MORE THAN 0, RESTART
            if (counter > 0){
                return field = start(field, animatedField);
            } else {
                return field;
            }
        }
        start(this.field, this.animatedField);
    }
}