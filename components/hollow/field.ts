type hollowField = HollowCell[][]; // field = 2D array, first index is x, 2nd index is y
type hollowAnimation = hollowField[]; // history of changes to the maze, for animations

type mask = (x: number, y: number, width: number, height: number) => HollowCell; // passed as argument during field creation, determines mask

// Field creation
class HollowMaze implements FieldInterface<hollowField> {

    protected xLength: number;
    protected yLength: number;
    public field: hollowField = [];
    public animatedField: hollowAnimation = [];

    constructor (xLength: number, yLength: number){
        this.xLength = xLength;
        this.yLength = yLength;
    }

    // Creation of Coordinate field
    protected generateField(mask: mask = this.standardMask): hollowField {
        let width: number = this.xLength, height: number = this.yLength;
        let field: hollowField = [];

        for (let x = 0; x < width; x++){
            let column: HollowCell[] = [];
            for (let y = 0; y < height; y++){
                let cell: HollowCell = mask(x, y, width, height);
                column.push(cell);
            }
            field.push(column);
        }
        return field;
    }

    // Standard mask: all blocks are part of maze, outside walls are created
    protected standardMask (x: number, y: number, width: number, height: number): HollowCell {
        let block: HollowCell = new HollowCell(x, y);
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
    protected octoMask (x: number, y: number, width: number, height: number): HollowCell {
        let block: HollowCell = new HollowCell(x, y);
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

    // Snowflake Mask
    protected snowflakeMask(x: number, y: number, width: number, height: number): HollowCell {
        let block: HollowCell = new HollowCell(x, y);
        // Minimum size = 10 blocks, else revert to standard mask
        if (width < 10 || height < 10){
            return block = this.standardMask(x, y, width, height)
        }
        let interval: number = Math.floor(width/5),
            step1: number = interval - 1,
            step2: number = interval*2,
            step3: number = width - interval*2 - 1,
            step4: number = width - interval;

        // Central protrusions
        if (y === 0 && x >= step2 && x <= step3){            
            block.up = true;
        } else if (y === height - 1 && x >= step2 && x <= step3){
            block.down = true;
        } else if (x === 0 && y >= step2 && y <= step3){
            block.left = true;
        } else if (x === width - 1 && y >= step2 && y <= step3){
            block.right = true;
        }
        if (x === step2 && (y < interval || y > height - interval - 1)){
            block.left = true;
        } else if (x === step3 && (y < interval || y > height - interval - 1)){
            block.right = true;
        } else if (y === step2 && (x < interval || x > width - interval - 1)){
            block.up = true;
        } else if (y === step3 && (x < interval || x > width - interval - 1)){
            block.down = true;
        } else if (y === interval && (x === step2 - 1 || x === step3 + 1)){
            block.up = true;
        } else if (y === height - (interval + 1) && (x === step2 - 1 || x === step3 + 1)){
            block.down = true;
        } else if (x === interval && (y === step2 - 1 || y === step3 + 1)){
            block.left = true;
        } else if (x === width - (interval + 1) && (y === step2 - 1 || y === step3 + 1)){
            block.right = true;
        }      
        // Corner appendages
        if (y < interval){
            if (y === 0 && (x < step1 || x > step4)){
                block.up = true;
            } else if (x === step1 + y){
                block.right = true;
                block.up = true;
            } else if (x === step4 - y){
                block.left = true;
                block.up = true;  
            } else if (x > step1 + y && x < step4 - y && !(x >= step2 && x <= step3)){ 
                block.mask = true;
            }
        } else if (y > height - (interval + 1)){
            if (y === height - 1 && (x < step1 || x > step4)){
                block.down = true;
            } else if (x === step1 + (height - y - 1)){
                block.right = true;
                block.down = true;
            } else if (x === step4 - (height - y - 1)){
                block.left = true;
                block.down = true;  
            } else if (x > step1 + (height - y - 1) && x < step4 - (height - y - 1) && !(x >= step2 && x <= step3)) {
                block.mask = true;
            }
        }
        if (x < interval){
            if (x === 0 && (y < step1 || y > step4)){
                block.left = true;
            } else if (y === step1 + x){
                block.down = true;
                block.left = true;
            } else if (y === step4 - x){
                block.up = true;
                block.left = true;  
            } else if (y > step1 + x && y < step4 - x && !(y >= step2 && y <= step3)) {
                block.mask = true;
            }
        } else if (x > width - (interval + 1)){
            if (x === width - 1 && (y < step1 || y > step4)){
                block.right = true;
            } else if (y === step1 + (width - x - 1)){
                block.down = true;
                block.right = true;
            } else if (y === step4 - (width - x - 1)){
                block.up = true;
                block.right = true;  
            } else if (y > step1 + (width - x - 1) && y < step4 - (width - x - 1) && !(y >= step2 && y <= step3)) {
                block.mask = true;
            }
        }
        return block;
    }

    // Brain mask
    protected brainMask(x: number, y: number, width: number, height: number): HollowCell {
        let block: HollowCell = new HollowCell(x, y);
        // Minimum size = 8 blocks, else revert to standard mask
        if (width < 8 || height < 8){
            return block = this.standardMask(x, y, width, height)
        }
        // First create standard walls
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
        // Brain is wider than it is tall, so mask top and bottom row
        let margin: number = Math.floor(height/8);
        if (y < margin || y >= height - margin) {
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if (y === margin){
            block.up = true;
        }
        if (y === height - margin -1){
            block.down = true;
        }
        // Round edges at top
        if ((y < margin*2 && x < margin*2) || (y < margin*2 && x >= width - margin*2)){
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        if ((y < margin*3 && x < margin) || (y < margin*3 && x >= width - margin)){
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if ((y < margin*2 && x === margin*2 && y >= margin) || (y < margin*3 && x === margin && y >= margin*2)){
            block.left = true;
        }
        if ((y === margin*2 && x < margin*2 && x >= margin) || (y === margin*3 && x < margin)){
            block.up = true;
        }
        if ((y < margin*2 && x === width - margin*2 - 1 && y >= margin) || (y < margin*3 && x === width - margin - 1 && y >= margin*2)){
            block.right = true;
        }
        if ((y === margin*2 && x >= width - margin*2 && x < width - margin) || (y === margin*3 && x >= width - margin)){
            block.up = true;
        }
        // Slope at bottom left
        if ((y >= height - margin*3 && x < margin*2) || (y >= height - margin*2 && x < margin*4)){
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if ((y >= height - margin*3 && x === margin*2 && y < height - margin*2) || (y >= height - margin*2 && x === margin*4 && y < height - margin)){
            block.left = true;
        }
        if ((y === height - margin*3 - 1 && x < margin*2) || (y === height - margin*2 - 1 && x < margin*4 && x >= margin*2)){
            block.down = true;
        }
        // Bottom right: single block
        if (y >= height - margin*2 && x >= width - margin){
            block.mask = true;
            block.up = false;
            block.right = false;
            block.down = false;
            block.left = false;
        }
        // Correct walls
        if (y >= height - margin*2 && y < height - margin && x === width - margin - 1){
            block.right = true;
        }
        if (y === height - margin*2 - 1 && x >= width - margin){
            block.down = true;
        } 
        return block;
    }

    // Utility method: save current field to animation history
    protected saveField(field: hollowField, target: hollowAnimation): hollowAnimation {
        let copiedField: HollowCell[][] = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }

    // Utility method: get random start position (and if masked, try again)
    protected getFirst(field: hollowField): HollowCell {
        let randomX: number = Math.floor(Math.random()*(field.length)),
            randomY: number = Math.floor(Math.random()*(field[0].length)),
            block: HollowCell;
        
        if (field[randomX][randomY].mask){
            // TRY AGAIN
            return block = this.getFirst(field);
        } else {
            block = field[randomX][randomY];
            return block;
        }
    }

    // Draw function during animation: determines how field array is drawn on canvas
    public drawMaze(canvas: HTMLCanvasElement, field: hollowField, color: string, image: HTMLImageElement): void {
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
                    let currentBlock: HollowCell = field[x][y];
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
                    let block1: HollowCell, block2: HollowCell, mask: HollowCell;
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