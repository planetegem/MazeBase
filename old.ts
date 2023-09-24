
// TEST GIT CHANGE

function getRandom(low: number, high: number){
    return Math.floor((Math.random()*(high - low)*0.5))*2 + low; 
}
class SimpleCell {
    constructor (public wall: boolean = true, public visited: boolean = false, public path: boolean = false){}
}
class Cell extends SimpleCell {
    constructor (public readonly x: number, public readonly y: number, public readonly z: number){
        super();
    }
}
type oldField = Cell[][][];
type animatedField = SimpleCell[][][][];
interface MazeClassConstructor extends MazeClass {
    new (width: number, height: number, depth?: number): MazeClass;
}
interface MazeClass {
    field: oldField;
    animatedField: animatedField;
    drawMaze: (canvas: HTMLCanvasElement, field: oldField | SimpleCell[][][], color: string, image: HTMLImageElement) => void;
}

class BlankMaze implements MazeClass { 
    protected xLength: number;
    protected yLength: number;
    protected zLength: number;
    public field: oldField;
    public animatedField: animatedField = [];
    
    constructor (width: number, height: number, depth: number = 1){
        this.xLength = 2*width + 1;
        this.yLength = 2*height + 1;
        this.zLength = 2*depth + 1;
        this.field = this.generateField();
    }
    // BUILD EMPTY FIELD
    protected generateField(): oldField {
        let width: number = this.xLength, height: number = this.yLength, depth: number = this.zLength;
        let xArray = [];
        
        for (let x = 0; x < width; x++){
            let yArray = [];
            for (let y = 0; y < height; y++){
                let zArray = [];
                for (let z = 0; z < depth; z++){
                    zArray.push(new Cell(x, y, z));
                    if (x === 0 || y === 0 || z === 0 || 
                        x === this.xLength - 1 || y === this.yLength - 1 || z === this.zLength - 1){
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
    // SAVE COPY OF FIELD FOR USE IN ANIMATIONS
    public saveField(field: oldField, target: animatedField): animatedField {
        let width: number = field.length, height: number = field[0].length, depth: number = field[0][0].length;
        let copiedField: SimpleCell[][][] = [];
        for (let x = 0; x < width; x++){
            let copiedY: SimpleCell[][] = [];
            for (let y = 0; y < height; y++){
                let copiedZ: SimpleCell[] = [];
                for (let z = 0; z < depth; z++){
                    copiedZ.push(new SimpleCell(field[x][y][1].wall, field[x][y][1].visited, field[x][y][1].path));
                }
                copiedY.push(copiedZ);
            }
            copiedField.push(copiedY);
        }
        target.push(copiedField);
        return target;
    }
    public drawMaze(canvas: HTMLCanvasElement, field: oldField | SimpleCell[][][], color: string, image: HTMLImageElement): void {
        let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"),
            mazeWidth: number = field.length,
            mazeHeight: number = field[0].length,
            marginX: number = (canvas.width % mazeWidth)/2,
            marginY: number = (canvas.height % mazeHeight)/2,
            cellWidth: number = Math.floor(canvas.width/mazeWidth),
            cellHeight: number = Math.floor(canvas.height/mazeHeight);        
    
        if (ctx){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0 + marginX, 0 + marginY, canvas.width - marginX*2, canvas.height - marginY*2);
            for (let x = 0; x < mazeWidth; x++){
                for (let y = 0; y < mazeHeight; y++){
                    if (field[x][y][1].wall && field[x][y][1].visited){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                    } else if (field[x][y][1].path){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                    } else if (!field[x][y][1].visited){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x*cellWidth, marginY +  y*cellHeight, cellWidth, cellHeight);
                    }
                }
            }
        }
    }
}
interface RecursiveZone {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
class RecursiveMaze extends BlankMaze {
    constructor (width: number, length: number){
        super(width, length);
        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.animatedField = this.buildMaze(this.field, this.animatedField);
    }
    protected buildMaze(field: oldField, animatedField: animatedField): animatedField {
        // PREP: CREATE ARRAY TO KEEP TRACK OF ZONES TO DIVIDE & BIND SAVEFIELD METHOD
        let zoneArray: RecursiveZone[] = [];
        zoneArray.push({minX: 0, maxX: this.xLength - 1, minY: 0, maxY: this.yLength - 1}); // FIRST ZONE = COMPLETE FIELD

        const quickSave = (field: oldField, animatedField: animatedField): animatedField => {
            return this.saveField(field, animatedField);
        }
        function startRecursion(field: oldField): oldField {
            // 1. SELECT ZONE TO DIVIDE & REMOVE IT FROM ZONE ARRAY
            let currentZone: RecursiveZone = zoneArray[zoneArray.length - 1];
            zoneArray.splice(zoneArray.length - 1, 1);
            
            // 2. GET INTERSECTION IN CURRENT ZONE
            let currentX: number = getRandom(currentZone.minX + 2, currentZone.maxX - 2),
                currentY: number = getRandom(currentZone.minY + 2, currentZone.maxY - 2);

            // 3. ADD NEW ZONES BASED ON INTERSECTION
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
            // 4. INSERT WALLS
            for (let x = currentZone.minX + 1; x < currentZone.maxX; x++){
                field[x][currentY][1].wall = true;
                field[x][currentY][1].visited = true;

                let top: Cell = field[x][currentY - 1][1];
                if (!top.visited){
                    top.visited = true;
                    top.wall = false;
                }
                let bottom: Cell = field[x][currentY + 1][1];
                if (!bottom.visited){
                    bottom.visited = true;
                    bottom.wall = false;
                }
            }
            for (let y = currentZone.minY + 1; y < currentZone.maxY; y++){
                field[currentX][y][1].wall = true;
                field[currentX][y][1].visited = true;

                let right: Cell = field[currentX + 1][y][1];
                if (!right.visited){
                    right.visited = true;
                    right.wall = false;
                }
                let left: Cell = field[currentX - 1][y][1];
                if (!left.visited){
                    left.visited = true;
                    left.wall = false;
                }      
            }
            // 5. MAKE 4 DOORS THEN SCRAP 1
            let randomIndex: number = Math.floor(Math.random()*4);
            let random: number, doors = [];

            random = getRandom(currentZone.minX + 1, currentX - 1);
            doors.push({x: random, y: currentY});
            random = getRandom(currentX + 1, currentZone.maxX - 1);
            doors.push({x: random, y: currentY});
            random = getRandom(currentY + 1, currentZone.maxY - 1);
            doors.push({x: currentX, y: random});
            random = getRandom(currentZone.minY + 1, currentY - 1);
            doors.push({x: currentX, y: random});

            doors.splice(randomIndex, 1);
            for (let door of doors){
                field[door.x][door.y][1].wall = false;
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
class PrimsMaze extends BlankMaze {
    constructor (width: number, length: number){
        super(width, length);
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.field = this.buildMaze(this.field, this.animatedField);
    }
    protected buildMaze(field: oldField, animatedField: animatedField): oldField {
        // PREP: CREATE FRONTIER, PUSH START CELL, BIND SAVEFIELD METHOD
        let frontier: Cell[] = [],
            randomX: number = getRandom(1, this.xLength - 2),
            randomY: number = getRandom(1, this.yLength - 2);
        frontier.push(new Cell(randomX, randomY, 1));

        const quickSave = (field: oldField, animatedField: animatedField): animatedField => {
            return this.saveField(field, animatedField);
        } 
        function startRecursion(field: oldField): oldField {
            // 1. TAKE RANDOM CELL FROM FRONTIER
            let randomIndex: number = Math.floor(Math.random() * frontier.length),
                currentCell: Cell = frontier[randomIndex];
            frontier.splice(randomIndex, 1);

            // 2. MARK CELL AND WALLS AS VISITED
            field[currentCell.x][currentCell.y][1].visited = true;
            field[currentCell.x][currentCell.y][1].wall = false;

            field[currentCell.x + 1][currentCell.y][1].visited = true;
            field[currentCell.x - 1][currentCell.y][1].visited = true;
            field[currentCell.x][currentCell.y + 1][1].visited = true;
            field[currentCell.x][currentCell.y - 1][1].visited = true;
            field[currentCell.x + 1][currentCell.y + 1][1].visited = true;
            field[currentCell.x - 1][currentCell.y + 1][1].visited = true;
            field[currentCell.x + 1][currentCell.y - 1][1].visited = true;
            field[currentCell.x - 1][currentCell.y - 1][1].visited = true;

            // 3. CONNECT TO EXISTING MAZE
            let neighbours: Cell[] = [];
            if (field[currentCell.x - 2]){
                if (field[currentCell.x - 2][currentCell.y][1].visited && !field[currentCell.x - 2][currentCell.y][1].wall){
                    neighbours.push(field[currentCell.x - 2][currentCell.y][1]);
                }
            } 
            if (field[currentCell.x + 2]){
                if (field[currentCell.x + 2][currentCell.y][1].visited && !field[currentCell.x + 2][currentCell.y][1].wall){
                    neighbours.push(field[currentCell.x + 2][currentCell.y][1]);
                }
            }
            if (field[currentCell.x][currentCell.y - 2]){
                if (field[currentCell.x][currentCell.y - 2][1].visited && !field[currentCell.x][currentCell.y - 2][1].wall){
                    neighbours.push(field[currentCell.x][currentCell.y - 2][1]);
                }
            }
            if (field[currentCell.x][currentCell.y + 2]){
                if (field[currentCell.x][currentCell.y + 2][1].visited && !field[currentCell.x][currentCell.y + 2][1].wall){
                    neighbours.push(field[currentCell.x][currentCell.y + 2][1]);
                }
            }
            if (neighbours.length > 0){
                randomIndex = Math.floor(Math.random() * neighbours.length);
                let neighbour: Cell = neighbours[randomIndex],
                    diffX: number = (currentCell.x - neighbour.x)*0.5,
                    diffY: number = (currentCell.y - neighbour.y)*0.5;

                field[currentCell.x - diffX][currentCell.y - diffY][1].wall = false;
            }
            // 4. UPDATE FRONTIER
            if (field[currentCell.x - 2] && !field[currentCell.x - 2][currentCell.y][1].visited){
                field[currentCell.x - 2][currentCell.y][1].visited = true;
                frontier.push(field[currentCell.x - 2][currentCell.y][1]);
            } 
            if (field[currentCell.x + 2] && !field[currentCell.x + 2][currentCell.y][1].visited){
                field[currentCell.x + 2][currentCell.y][1].visited = true;
                frontier.push(field[currentCell.x + 2][currentCell.y][1]);
            }
            if (field[currentCell.x][currentCell.y - 2] && !field[currentCell.x][currentCell.y - 2][1].visited){
                field[currentCell.x][currentCell.y - 2][1].visited = true;
                frontier.push(field[currentCell.x][currentCell.y - 2][1]);
            }
            if (field[currentCell.x][currentCell.y + 2] && !field[currentCell.x][currentCell.y + 2][1].visited){
                field[currentCell.x][currentCell.y + 2][1].visited = true;
                frontier.push(field[currentCell.x][currentCell.y + 2][1]);
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
        return field;
    }
}
class SimpleBacktrack extends BlankMaze {
    constructor (width: number, length: number){
        super(width, length);
        this.animatedField = this.saveField(this.field, this.animatedField);
        this.field = this.buildMaze(this.field, this.animatedField);
    }
    protected buildMaze(field: oldField, animatedField: animatedField): oldField {
        // PREP: CREATE PATH ARRAY, CHOOSE START POSITION, BIND SAVEFIELD
        let path: Cell[] = [],
            randomX: number = getRandom(1, this.xLength - 2),
            randomY: number = getRandom(1, this.yLength - 2);

        path.push(new Cell(randomX, randomY, 1));
        const quickSave = (field: oldField, animatedField: animatedField): animatedField => {
            return this.saveField(field, animatedField);
        } 
        function startRecursion(field: oldField): oldField {
            // 1. TAKE LAST POSITION FROM PATH, MARK AS VISITED, NO WALL
            let currentCell: Cell = path[path.length - 1];
            field[currentCell.x][currentCell.y][1].wall = false;
            field[currentCell.x][currentCell.y][1].visited = true;
            field[currentCell.x][currentCell.y][1].path = true;

            // 2. MARK WALLS AS VISITED
            field[currentCell.x + 1][currentCell.y][1].visited = true;
            field[currentCell.x - 1][currentCell.y][1].visited = true;
            field[currentCell.x][currentCell.y + 1][1].visited = true;
            field[currentCell.x][currentCell.y - 1][1].visited = true;
            field[currentCell.x + 1][currentCell.y + 1][1].visited = true;
            field[currentCell.x - 1][currentCell.y + 1][1].visited = true;
            field[currentCell.x + 1][currentCell.y - 1][1].visited = true;
            field[currentCell.x - 1][currentCell.y - 1][1].visited = true;

            animatedField = quickSave(field, animatedField);
            field[currentCell.x][currentCell.y][1].path = false;

            // 3. CHECK FOR VALID NEIGHBOURS (UNVISITED)
            let neighbours: Cell[] = [];
            if (field[currentCell.x - 2] && !field[currentCell.x - 2][currentCell.y][1].visited){
                neighbours.push(field[currentCell.x - 2][currentCell.y][1]);
            } 
            if (field[currentCell.x + 2] && !field[currentCell.x + 2][currentCell.y][1].visited){
                neighbours.push(field[currentCell.x + 2][currentCell.y][1]);
            }
            if (field[currentCell.x][currentCell.y - 2] && !field[currentCell.x][currentCell.y - 2][1].visited){
                neighbours.push(field[currentCell.x][currentCell.y - 2][1]);
            }
            if (field[currentCell.x][currentCell.y + 2] && !field[currentCell.x][currentCell.y + 2][1].visited){
                neighbours.push(field[currentCell.x][currentCell.y + 2][1]);
            }
            // 4. IF VALID NEIGHBOURS, JUMP TO RANDOM 1 AND CONTINUE
            if (neighbours.length > 0){
                let randomIndex: number = Math.floor(Math.random() * neighbours.length);
                let neighbour: Cell = neighbours[randomIndex],
                    diffX: number = (currentCell.x - neighbour.x)*0.5,
                    diffY: number = (currentCell.y - neighbour.y)*0.5;

                field[currentCell.x - diffX][currentCell.y - diffY][1].wall = false;
                path.push(new Cell(neighbour.x, neighbour.y, 1));
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
        return field;
    }
}
