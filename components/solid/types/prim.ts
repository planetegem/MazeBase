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
    constructor (width: number, length: number){
        super(width, length);

        // Create blank field
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);

        // Start recursion
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }
    protected buildMaze(field: solidField, animatedField: solidAnimation): solidAnimation {
        // Prep: create frontier and determine start location
        let frontier: SolidCell[] = [],
            randomX: number = this.getRandom(1, this.xLength - 2),
            randomY: number = this.getRandom(1, this.yLength - 2);
        frontier.push(field[randomX][randomY]);

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
            // 1. Take random cell from frontier
            let randomIndex: number = Math.floor(Math.random() * frontier.length),
                currentCell: SolidCell = frontier[randomIndex];
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
            let neighbours: SolidCell[] = [];
            if (field[currentCell.x - 2]){
                if (field[currentCell.x - 2][currentCell.y].visited && !field[currentCell.x - 2][currentCell.y].wall){
                    neighbours.push(field[currentCell.x - 2][currentCell.y]);
                }
            } 
            if (field[currentCell.x + 2]){
                if (field[currentCell.x + 2][currentCell.y].visited && !field[currentCell.x + 2][currentCell.y].wall){
                    neighbours.push(field[currentCell.x + 2][currentCell.y]);
                }
            }
            if (field[currentCell.x][currentCell.y - 2]){
                if (field[currentCell.x][currentCell.y - 2].visited && !field[currentCell.x][currentCell.y - 2].wall){
                    neighbours.push(field[currentCell.x][currentCell.y - 2]);
                }
            }
            if (field[currentCell.x][currentCell.y + 2]){
                if (field[currentCell.x][currentCell.y + 2].visited && !field[currentCell.x][currentCell.y + 2].wall){
                    neighbours.push(field[currentCell.x][currentCell.y + 2]);
                }
            }
            if (neighbours.length > 0){
                randomIndex = Math.floor(Math.random() * neighbours.length);
                let neighbour: SolidCell = neighbours[randomIndex],
                    diffX: number = (currentCell.x - neighbour.x)*0.5,
                    diffY: number = (currentCell.y - neighbour.y)*0.5;

                field[currentCell.x - diffX][currentCell.y - diffY].wall = false;
            }
            // 4. Update frontier
            if (field[currentCell.x - 2] && !field[currentCell.x - 2][currentCell.y].visited){
                field[currentCell.x - 2][currentCell.y].visited = true;
                frontier.push(field[currentCell.x - 2][currentCell.y]);
            } 
            if (field[currentCell.x + 2] && !field[currentCell.x + 2][currentCell.y].visited){
                field[currentCell.x + 2][currentCell.y].visited = true;
                frontier.push(field[currentCell.x + 2][currentCell.y]);
            }
            if (field[currentCell.x][currentCell.y - 2] && !field[currentCell.x][currentCell.y - 2].visited){
                field[currentCell.x][currentCell.y - 2].visited = true;
                frontier.push(field[currentCell.x][currentCell.y - 2]);
            }
            if (field[currentCell.x][currentCell.y + 2] && !field[currentCell.x][currentCell.y + 2].visited){
                field[currentCell.x][currentCell.y + 2].visited = true;
                frontier.push(field[currentCell.x][currentCell.y + 2]);
            }
            
            // 5. SAVE FIELD & CONSIDER RECURSION
            animatedField = quickSave(field, animatedField);
            if (frontier.length === 0){
                return field;
            } else {
                return field = startRecursion(field);
            }        
        }
        field = startRecursion(field);
        return animatedField;
    }
}