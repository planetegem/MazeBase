// Solid maze generated with recursive division
// Method: continuously divide maze area in 4 connected zones until a minimum size is reached;
// Step 1: add maze area to an array of zones
// Step 2: choose random zone from array. Mark this as selected zone and remove from array.
// Step 3: draw random vertical and horizontal line in selected zone to make 4 new zones
// Step 4: connect the 4 zones to each other by drawing 3 doors
// Step 5: check the new zones: if not minimum size, add to array of zones
// Step 6: return to step 2 recursively until zone array is empty

interface RecursiveZone {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

class RecursiveMaze extends SolidMaze {

    constructor (width: number, length: number){
        super(width, length);

        // Create blank field
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);

        // Start recursion
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }

    protected buildMaze(field: solidField, animatedField: solidAnimation): solidAnimation {
        // Prep: create array to keep track of zones created by recursive division
        let zoneArray: RecursiveZone[] = [];
        zoneArray.push({minX: 0, maxX: this.xLength - 1, minY: 0, maxY: this.yLength - 1}); // FIRST ZONE = COMPLETE FIELD

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
            // 1. Select zone to divide and remove from array
            let currentZone: RecursiveZone = zoneArray[zoneArray.length - 1];
            zoneArray.splice(zoneArray.length - 1, 1);
            
            // 2. Get intersection in current zone
            let currentX: number = quickRandom(currentZone.minX + 2, currentZone.maxX - 2),
                currentY: number = quickRandom(currentZone.minY + 2, currentZone.maxY - 2);

            // 3. Add new zones based on intersection
            if (currentX - currentZone.minX > 2 && currentY - currentZone.minY > 2){
                zoneArray.push({minX: currentZone.minX, maxX: currentX, minY: currentZone.minY, maxY: currentY}); // TOP LEFT
            }
            if (currentZone.maxX - currentX > 2 && currentY - currentZone.minY > 2){
                zoneArray.push({minX: currentX, maxX: currentZone.maxX, minY: currentZone.minY, maxY: currentY}); // TOP RIGHT
            }
            if (currentZone.maxX - currentX > 2 && currentZone.maxY - currentY > 2){
                zoneArray.push({minX: currentX, maxX: currentZone.maxX, minY: currentY, maxY: currentZone.maxY}); // BOTTOM RIGHT
            }
            if (currentX - currentZone.minX > 2 && currentZone.maxY - currentY > 2){
                zoneArray.push({minX: currentZone.minX, maxX: currentX, minY: currentY, maxY: currentZone.maxY}); // BOTTOM LEFT
            }

            // 4. Insert walls
            for (let x = currentZone.minX + 1; x < currentZone.maxX; x++){
                field[x][currentY].wall = true;
                field[x][currentY].visited = true;

                let top: SolidCell = field[x][currentY - 1];
                if (!top.visited){
                    top.visited = true;
                    top.wall = false;
                }
                let bottom: SolidCell = field[x][currentY + 1];
                if (!bottom.visited){
                    bottom.visited = true;
                    bottom.wall = false;
                }
            }
            for (let y = currentZone.minY + 1; y < currentZone.maxY; y++){
                field[currentX][y].wall = true;
                field[currentX][y].visited = true;

                let right: SolidCell = field[currentX + 1][y];
                if (!right.visited){
                    right.visited = true;
                    right.wall = false;
                }
                let left: SolidCell = field[currentX - 1][y];
                if (!left.visited){
                    left.visited = true;
                    left.wall = false;
                }      
            }
            // 5. Make 4 doors then scrap 1
            let randomIndex: number = Math.floor(Math.random()*4);
            let random: number, doors = [];

            random = quickRandom(currentZone.minX + 1, currentX - 1);
            doors.push({x: random, y: currentY});
            random = quickRandom(currentX + 1, currentZone.maxX - 1);
            doors.push({x: random, y: currentY});
            random = quickRandom(currentY + 1, currentZone.maxY - 1);
            doors.push({x: currentX, y: random});
            random = quickRandom(currentZone.minY + 1, currentY - 1);
            doors.push({x: currentX, y: random});

            doors.splice(randomIndex, 1);
            for (let door of doors){
                field[door.x][door.y].wall = false;
            }

            animatedField = quickSave(field, animatedField);      
            // IF ZONES LEFT, RESTART
            if (zoneArray.length === 0){
                return field;
            } else {
                return field = startRecursion(field);
            }
        }
        field = startRecursion(field);
        return animatedField;
    }
}