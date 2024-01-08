type polarField = PolarCell[][]; // field = 2D array, first index is x, 2nd index is y
type polarAnimation = polarField[]; // history of changes to the maze, for animations

// Field creation
class PolarMaze implements FieldInterface<polarField> {

    protected readonly yLength: number;
    public field: polarField = [];
    public animatedField: polarAnimation = [];
    protected linkCollection: CellLink[] = [];

    constructor (radius: number){
        this.yLength = radius;
    }

    // Creation of a polar field
    protected generateField(): polarField {
        let centralRadius: number = 0.9;
        let height: number = this.yLength, cellHeight: number = 1/(height + centralRadius);
        let field: polarField = [];

        // Add central cell
        let newCell: PolarCell = new PolarCell(0, 1, 0, 0, centralRadius);
        field.push([newCell]);

        // Determine number of cells in first ring
        let circumference: number = 2*centralRadius*cellHeight*Math.PI;
        let width: number = Math.floor(circumference/cellHeight);
        
        // Start building the maze ring by ring, inside to outside
        for (let y = 1; y <= height; y++){
            let ring: PolarCell[] = [];

            // Check if cells have not become too wide; if so, double the amount of cells per ring
            let r: number = y + centralRadius, nextAngle: number =  2*Math.PI/width;
            let distance: number = Math.sqrt(2*r*r - 2*r*r*Math.cos(nextAngle));

            if (distance > 2){
                width *= 2;
            }

            // Fill the ring: link every cell to the previous one
            for (let x = 0; x < width; x++){
                let newCell: PolarCell = new PolarCell(x, width, y, y - 1 + centralRadius, y + centralRadius);
                if (x > 0){
                    newCell.linkNeighbour(ring[x - 1]);
                    if (x == width - 1){
                        ring[0].linkNeighbour(newCell);
                    }
                }
                // Link new ring to previous ring
                if (y === 1){
                    newCell.linkNeighbour(field[0][0]);
                } else if (width > field[field.length - 1].length){
                    newCell.linkNeighbour(field[field.length - 1][Math.floor(x/2)]);
                } else {
                    newCell.linkNeighbour(field[field.length - 1][x]);
                }
                ring.push(newCell);
            }
            field.push(ring);
        }
        console.log(field);
        return field;
    }

    // Utility method: save current field to animation history
    // Because of circular data structure, we need to copy manually
    protected saveField(field: polarField, target: polarAnimation): polarAnimation {
        let copiedField: PolarCell[][] = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }

    // draw function
    public drawMaze(canvas: HTMLCanvasElement, field: polarField, color: string, image: HTMLImageElement): void {
        let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"),
            mazeHeight: number = field.length - (1 - field[0][0].maxY),
            radius: number = canvas.width*0.49,
            cellHeight: number = radius/mazeHeight,
            wallWidth: number = 0.05,
            wallHeight: number = 0.15,
            centerX = canvas.width/2,
            centerY = canvas.width/2;

        if (ctx){
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.width/2, radius, 0, 2*Math.PI);
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.7;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            for (let y = 0; y < field.length; y++){
                if (y > 1 && field[y].length > field[y-1].length){
                    wallWidth *= 2;
                }

                for (let x = 0; x < field[y].length; x++){
                    let currentCell: PolarCell = field[y][x];

                    if (currentCell.path){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentCell.maxY*cellHeight, currentCell.minX, currentCell.maxX, false);
                        ctx.arc(canvas.width/2, canvas.width/2, currentCell.minY*cellHeight, currentCell.maxX, currentCell.minX, true);
                        ctx.closePath();
                        ctx.fill();
                    }

                    if (currentCell.visited){
                        // draw walls
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;

                        for (let link of currentCell.links){
                            if (link.wall){
                                let neighbour: PolarCell = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                                let cellWidth:number = currentCell.maxX - currentCell.minX;
                                if (y === 0){
                                    cellWidth = field[1][0].maxX - field[1][0].minX;
                                }

                                ctx.beginPath();
                                // top wall
                                if (neighbour.minY === currentCell.maxY){
                                    ctx.arc(centerX, centerY, currentCell.maxY*cellHeight, neighbour.minX - cellWidth*wallWidth, neighbour.maxX + cellWidth*wallWidth, false);
                                    ctx.arc(centerX, centerY, currentCell.maxY*cellHeight - wallHeight*cellHeight, neighbour.maxX + cellWidth*wallWidth, neighbour.minX - cellWidth*wallWidth, true);
                                }

                                // bottom wall
                                else if (currentCell.minY === neighbour.maxY){
                                    ctx.arc(centerX, centerY, currentCell.minY*cellHeight + wallHeight*cellHeight, currentCell.minX - cellWidth*wallWidth, currentCell.maxX + cellWidth*wallWidth, false);
                                    ctx.arc(centerX, centerY, currentCell.minY*cellHeight, currentCell.maxX + cellWidth*wallWidth, currentCell.minX - cellWidth*wallWidth, true);
                                }

                                // left wall
                                else if (currentCell.minX === neighbour.maxX || (currentCell.minX === 0 && neighbour.maxX === Math.PI*2)){
                                    ctx.arc(centerX, centerY, currentCell.maxY*cellHeight, currentCell.minX, currentCell.minX + cellWidth*wallWidth, false);
                                    ctx.arc(centerX, centerY, currentCell.minY*cellHeight, currentCell.minX + cellWidth*wallWidth, currentCell.minX, true);
                                }

                                // right wall
                                else if (currentCell.maxX === neighbour.minX || (neighbour.minX === 0 && currentCell.maxX === Math.PI*2)){
                                    ctx.arc(centerX, centerY, currentCell.maxY*cellHeight, currentCell.maxX - cellWidth*wallWidth, currentCell.maxX, false);
                                    ctx.arc(centerX, centerY, currentCell.minY*cellHeight, currentCell.maxX, currentCell.maxX - cellWidth*wallWidth, true);
                                } 
                                ctx.closePath();
                                ctx.fill();
                            }
                        }     
                    } else {

                    }
                }
            }

            // overlay for unvisited cells
            for (let y = 0; y < field.length; y++){
                for (let x = 0; x < field[y].length; x++){
                    let currentCell: PolarCell = field[y][x];
                    if (!currentCell.visited){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentCell.maxY*cellHeight, currentCell.minX, currentCell.maxX, false);
                        ctx.arc(canvas.width/2, canvas.width/2, currentCell.minY*cellHeight, currentCell.maxX, currentCell.minX, true);
                        ctx.closePath();
                        ctx.fill();
                                
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentCell.maxY*cellHeight, currentCell.minX, currentCell.maxX, false);
                        ctx.arc(canvas.width/2, canvas.width/2, currentCell.minY*cellHeight, currentCell.maxX, currentCell.minX, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }

            // draw outside walls
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2*Math.PI, false);
            ctx.arc(centerX, centerY, radius - wallWidth*cellHeight, 2*Math.PI, 0, true);
            ctx.closePath();
            ctx.fill();
        }
    }
}