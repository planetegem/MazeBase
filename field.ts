// New coordinate field: field consists of blocks instead of cells.
// Each block track state of its border: walled or not
// Blocks can be masked to exclude them from maze generation

interface Block { // Basic building block, tracks:
    readonly x: number; // x-coordinate = index in top array
    readonly y: number; // y-coordinate = index in 2nd array
    up: boolean; right: boolean; down: boolean; left: boolean; // border status: wall or not
    mask: boolean; // if mask, block is excluded from maze
    visited: boolean; // visited by algorithm
    path: boolean; // part of path (used by backtracker)
}
class Block implements Block {
    public visited: boolean = false;
    public path: boolean = false;
    public up: boolean = false;
    public right: boolean = false;
    public down: boolean = false;
    public left: boolean = false;

    constructor (public readonly x: number, public readonly y: number, 
                public mask: boolean = false){}
}

type field2D = Block[][]; // field = 2D array, first index is x, 2nd index is y
type animation2D = field2D[]; // history of changes to the maze, for animations
type mask = (x: number, y: number, width: number, height: number) => Block; // passed as argument during field creation, determines mask

// Constructor
interface Maze2D {
    field: field2D;
    animatedField: animation2D;
    drawMaze: (canvas: HTMLCanvasElement, field: any, color: string, image: HTMLImageElement) => void;
}
interface MazeConstructor extends Maze2D {
    new (width: number, height: number): Maze2D;
}

// Field creation
class NewMaze implements Maze2D {
    public field: field2D;
    public animatedField: animation2D = [];

    constructor (protected readonly xLength: number, protected readonly yLength: number){
        this.field = this.newField();
    }

    // Creation of Coordinate field
    protected newField(mask: mask = this.standardMask): field2D {
        let width: number = this.xLength, height: number = this.yLength;
        let field: field2D = [];

        for (let x = 0; x < width; x++){
            let column: Block[] = [];
            for (let y = 0; y < height; y++){
                let block: Block = mask(x,y, width, height);
                column.push(block);
            }
            field.push(column);
        }
        return field;
    }
    // Standard mask: all blocks are part of maze, outside walls are created
    protected standardMask (x: number, y: number, width: number, height: number): Block {
        let block: Block = new Block(x, y);
        if (y === 0){
            block.up = true
        } else if (y === height - 1){
            block.down = true;
        }
        if (x === 0){
            block.left = true;
        } else if (x === width - 1){
            block.right = true;
        }
        return block;
    }
    // Octagon mask: diagonal lines at corners determine mask
    protected octoMask (x: number, y: number, width: number, height: number): Block {
        let block: Block = new Block(x, y);
        let cornerSize: number = Math.floor(width/3);

        if (x < cornerSize - y || x >= width - (cornerSize - y) || y >= height - (cornerSize - x) || y >= height - cornerSize + (height - x) - 1){
            block.mask = true;
        }
        // OUTSIDE WALLS
        if (x === cornerSize - y){
            block.up = true;
            block.left = true;
        } else if (x === width - (cornerSize - y) - 1){
            block.up = true;
            block.right = true;
        } else if (y === height - (cornerSize - x) - 1){
            block.down = true;
            block.left = true;
        } else if (y === height - cornerSize + (height - x) - 2){
            block.down = true;
            block.right = true;
        }
        if (x === 0 && y < height - cornerSize && y > cornerSize){
            block.left = true;
        } else if (x === width - 1 && y < height - cornerSize && y > cornerSize){
            block.right = true;
        } else if (y === 0 && x < width - cornerSize && x > cornerSize){
            block.up = true;
        } else if (y === height - 1 && x < width - cornerSize && x > cornerSize){
            block.down = true;
        }

        return block;
    }

    // Utility method: save current field to animation history
    protected saveField(field: field2D, target: animation2D): animation2D {
        let width: number = field.length, height: number = field[0].length;
        let copiedField: field2D = [];
        for (let x = 0; x < width; x++){
            let copiedY: Block[] = [];
            for (let y = 0; y < height; y++){
                let block: Block = JSON.parse(JSON.stringify(field[x][y]));
                copiedY.push(block);
            }
            copiedField.push(copiedY);
        }
        target.push(copiedField);
        return target;
    }

    // Draw function during animation: determines how field array is drawn on canvas
    public drawMaze(canvas: HTMLCanvasElement, field: field2D, color: string, image: HTMLImageElement): void {
        let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"),
            mazeWidth: number = field.length,
            mazeHeight: number = field[0].length,
            marginX: number = (canvas.width % mazeWidth)/2,
            marginY: number = (canvas.height % mazeHeight)/2,
            cellWidth: number = Math.floor(canvas.width/mazeWidth),
            cellHeight: number = Math.floor(canvas.height/mazeHeight);        
    
        if (ctx){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, marginX, marginY, canvas.width - 2*marginX, canvas.height - 2*marginY);
            for (let x = 0; x < mazeWidth; x++){
                for (let y = 0; y < mazeHeight; y++){
                    let currentBlock: Block = field[x][y];
                    // DRAW FOG
                    if (!currentBlock.visited){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);                                                            
                    }
                    // DRAW MASK
                    if (currentBlock.mask){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                    }
                    // DRAW PATH
                    if (currentBlock.path){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                    }
                    // DRAW WALLS
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = color;
                    if (currentBlock.up){
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight*0.25)
                    }
                    if (currentBlock.right){
                        ctx.fillRect(marginX + x*cellWidth + cellWidth*0.75, marginY + y*cellHeight, cellWidth*0.25, cellHeight);
                    }
                    if (currentBlock.down){
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight + cellHeight*0.75, cellWidth, cellHeight*0.25)
                    }
                    if (currentBlock.left){
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth*0.25, cellHeight);
                    }         
                    // DRAW CORNERS
                    let block1: Block, block2: Block, mask: Block;
                    if (x > 0 && y > 0 && !currentBlock.mask){
                        block1 = field[currentBlock.x - 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        mask = field[currentBlock.x - 1][currentBlock.y - 1];
                        
                        if(block1.up && block2.left && (mask.mask || currentBlock.visited)){                         
                            ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth*0.25, cellHeight*0.25);
                        }
                    }
                    if (x < mazeWidth - 1 && y > 0 && !currentBlock.mask){
                        block1 = field[currentBlock.x + 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y - 1];
                        mask = field[currentBlock.x + 1][currentBlock.y - 1];
                        
                        if(block1.up && block2.right && (mask.mask || currentBlock.visited)){
                            ctx.fillRect(marginX + x*cellWidth + cellWidth*0.75, marginY + y*cellHeight, cellWidth*0.25, cellHeight*0.25);
                        }
                    }
                    if (x < mazeWidth - 1 && y < mazeHeight - 1 && !currentBlock.mask){
                        block1 = field[currentBlock.x + 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y + 1];
                        mask = field[currentBlock.x + 1][currentBlock.y + 1];
                        
                        if(block1.down && block2.right && (mask.mask || currentBlock.visited)){
                            ctx.fillRect(marginX + x*cellWidth + cellWidth*0.75, marginY + y*cellHeight + cellHeight*0.75, cellWidth*0.25, cellHeight*0.25);
                        }
                    }
                    if (x > 0 && y < mazeHeight - 1 && !currentBlock.mask){
                        block1 = field[currentBlock.x - 1][currentBlock.y];
                        block2 = field[currentBlock.x][currentBlock.y + 1];
                        mask = field[currentBlock.x - 1][currentBlock.y + 1];
                        
                        if(block1.down && block2.left && (mask.mask || currentBlock.visited)){                            
                            ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight + cellHeight*0.75, cellWidth*0.25, cellHeight*0.25);
                        }
                    }        
                }
            }
        }
    }
}