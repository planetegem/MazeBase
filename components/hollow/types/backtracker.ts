// Hollow maze made with backtracker algorithm
// Method: randomly snake through the maze until a dead end is reached. Backtrack until no longer imprisoned.
// Step 1: Select a random starting cell and add it to a path array.
// Step 2: Select the last cell from the path array. Mark it as visited.
// Step 3: open wall to previous cell (if any)
// Step 4: Check neighbours: if unvisited options available, choose one and add it to path array.
// Step 5: if no unvisited neighbours available: remove last cell from path array.
// Step 6: return to step 2 recursively until path array is empty

class Backtracker extends HollowMaze {

    constructor(xLength: number, yLength: number){
        super(xLength, yLength);

        // Create blank field
        this.field = this.generateField(this.octoMask);
        this.animatedField = this.saveField(this.field, this.animatedField);

        // start recursion
        this.recursion();
    }

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
            
            // 3. EVALUATE NEIGHBOURS: IF VISITED, BUILD WALL; ELSE CONSIDER AS NEXT BLOCK
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