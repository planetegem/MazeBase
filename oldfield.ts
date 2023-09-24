// Simple cell doesn't track coordinates (used to save simpliefied version of the maze for animations)
class SimpleCell {
    constructor (public wall: boolean = true, public visited: boolean = false, public path: boolean = false){}
}
type animatedField = SimpleCell[][][][];

// Cell tracks coordinates; used during maze generation to generate active field (= oldField)
class Cell extends SimpleCell {
    constructor (public readonly x: number, public readonly y: number, public readonly z: number){
        super();
    }
}
type oldField = Cell[][][];

// Passed in arguments of start.js 
interface MazeClassConstructor extends MazeClass {
    new (width: number, height: number, depth?: number): MazeClass;
}

// Generate empty maze & base methods
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
    // Build empty field
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
    // Save a copy of active field to animated field (in simplified form)
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
    // Gets passed to canvas during animation: determines how to interpret maze array
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