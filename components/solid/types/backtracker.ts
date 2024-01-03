// Solid maze made with backtracker algorithm
// Method: randomly snake through the maze until a dead end is reached. Backtrack until no longer imprisoned.
// Step 1: Select a random starting cell and add it to a path array.
// Step 2: Select the last cell from the path array. Mark it as visited.
// Step 3: open wall to previous cell (if any)
// Step 4: Check neighbours: if unvisited options available, choose one and add it to path array.
// Step 5: if no unvisited neighbours available: remove last cell from path array.
// Step 6: return to step 2 recursively until path array is empty

class SimpleBacktrack extends SolidMaze {
    constructor (width: number, length: number){
        super(width, length);

        // Create blank field
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);

        // Start recursion
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }

    protected buildMaze(field: solidField, animatedField: solidAnimation): solidAnimation {
        // Prep: create path array and select start position
        let path: SolidCell[] = [],
            randomX: number = this.getRandom(1, this.xLength - 2),
            randomY: number = this.getRandom(1, this.yLength - 2);
        path.push(field[randomX][randomY]);

        // Prep: bind saveField method for use during recursion
        const quickSave = (field: solidField, animatedField: solidAnimation): solidAnimation => {
            return this.saveField(field, animatedField);
        }

        // Prep: bind getRandom method for use during recursion
        const quickRandom = (min: number, max: number): number => {
            return this.getRandom(min, max);
        }

        // Body: recursion function
        function startRecursion(field: solidField): solidField {
            // 1. TAKE LAST POSITION FROM PATH, MARK AS VISITED, NO WALL
            let currentCell: SolidCell = path[path.length - 1];
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
            let neighbours: SolidCell[] = [];
            if (field[currentCell.x - 2] && !field[currentCell.x - 2][currentCell.y].visited){
                neighbours.push(field[currentCell.x - 2][currentCell.y]);
            } 
            if (field[currentCell.x + 2] && !field[currentCell.x + 2][currentCell.y].visited){
                neighbours.push(field[currentCell.x + 2][currentCell.y]);
            }
            if (field[currentCell.x][currentCell.y - 2] && !field[currentCell.x][currentCell.y - 2].visited){
                neighbours.push(field[currentCell.x][currentCell.y - 2]);
            }
            if (field[currentCell.x][currentCell.y + 2] && !field[currentCell.x][currentCell.y + 2].visited){
                neighbours.push(field[currentCell.x][currentCell.y + 2]);
            }
            // 4. IF VALID NEIGHBOURS, JUMP TO RANDOM 1 AND CONTINUE
            if (neighbours.length > 0){
                let randomIndex: number = Math.floor(Math.random() * neighbours.length);
                let neighbour: SolidCell = neighbours[randomIndex],
                    diffX: number = (currentCell.x - neighbour.x)*0.5,
                    diffY: number = (currentCell.y - neighbour.y)*0.5;

                field[currentCell.x - diffX][currentCell.y - diffY].wall = false;
                path.push(field[neighbour.x][neighbour.y]);
                return field = startRecursion(field);
            } else {
                // 5. IF NO VALID NEIGHBOURS, RETURN ALONG PATH UNTIL EMPTY
                path.splice(path.length - 1, 1);
                if (path.length > 0){
                    return field = startRecursion(field);
                } else {
                    return field;
                }
            }
            return field;
        }
        field = startRecursion(field);
        return animatedField;
    }
}