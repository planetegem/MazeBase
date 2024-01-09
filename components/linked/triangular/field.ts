// Extend LinkedCell to include some specifics for polar coordinates
class TriCell extends LinkedCell {
    public readonly dir: boolean;
    public mask: boolean = false;

    constructor (x: number, y: number, dir: boolean){
        super(x, y);
        this.dir = dir;
    }
}
type triField = TriCell[][]; // field = 2D array, first index is x, 2nd index is y
type triAnimation = triField[]; // history of changes to the maze, for animations

// Field creation
class TriangularMaze implements FieldInterface<triField> {

    protected readonly yLength: number;
    public field: triField = [];
    public animatedField: triAnimation = [];

    constructor (radius: number){
        this.yLength = radius;
    }

    // Creation of a triangular field
    protected generateField(): triField {
        let field: triField = [], height: number = this.yLength, width: number = height*2 - 1;

        for (let y = 0; y < height; y++){
            let row: TriCell[] = [];
            for (let x = 0; x < width; x++){
                let newCell: TriCell;
                if (x % 2 === 0){
                    newCell = new TriCell(x, y, false);
                } else {
                    newCell = new TriCell(x, y, true);
                }

                // link to x neighbours
                if (x > 0){
                    newCell.linkNeighbour(row[x - 1]);
                }
                row.push(newCell);
            }
            width -= 2;

            // link to y neighbours
            if (y > 0){
                for (let x = 0; x < row.length; x += 2){
                    row[x].linkNeighbour(field[y - 1][x + 1]);
                }
            }
            field.push(row);
        }

        // mask corners
        field[0][0].mask = true;
        field[0][field[0].length - 1].mask = true;
        field[field.length - 1][0].mask = true;

        return field;
    }

    // Utility method: save current field to animation history
    // Because of circular data structure, we need to copy manually
    protected saveField(field: triField, target: triAnimation): triAnimation {
        let copiedField: TriCell[][] = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }

    // draw function
    public drawMaze(canvas: HTMLCanvasElement, field: triField, color: string, image: HTMLImageElement): void {
        let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

        let margin: number = canvas.height * 0.05, mazeHeight: number = canvas.height - 2*margin,
            cellHeight: number = mazeHeight/field.length,
            topMargin: number = margin + cellHeight*0.75,
            bottomMargin: number = margin - cellHeight*0.75,
            wallWidth: number = cellHeight*0.175;
            
        if (ctx){
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(margin + cellHeight, topMargin);
            ctx.lineTo(canvas.width - margin - cellHeight, topMargin);
            ctx.lineTo(canvas.width - margin - cellHeight*0.5, topMargin + cellHeight);
            ctx.lineTo(canvas.width*0.5 + cellHeight*0.5, canvas.height - bottomMargin - cellHeight);
            ctx.lineTo(canvas.width*0.5 - cellHeight*0.5, canvas.height - bottomMargin - cellHeight);
            ctx.lineTo(margin + cellHeight*0.5, topMargin + cellHeight);
            ctx.closePath();
            ctx.clip();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            for (let y = 0; y < field.length; y++){
                for (let x = 0; x < field[y].length; x++){
                    let currentCell: TriCell = field[y][x];
                    let correction: number = cellHeight*0.5*y;
                    
                    if (currentCell.path){
                        ctx.beginPath();
                        if (!currentCell.dir){
                            ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                        } else {
                            ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                        }
                        ctx.closePath();
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fill();
                    }
                    if (currentCell.visited){
                        // Draw corners
                        if (!currentCell.dir){
                            ctx.beginPath();
                            ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction + wallWidth*0.5, topMargin + y*cellHeight);
                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction + wallWidth*0.25, topMargin + y*cellHeight + wallWidth*0.5);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            ctx.fill();
                            
                            ctx.beginPath();
                            ctx.moveTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction - wallWidth*0.5, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction - wallWidth*0.25, topMargin + y*cellHeight + wallWidth*0.5);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight - wallWidth*0.25 + correction, topMargin + (y + 1)*cellHeight - wallWidth*0.5);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + wallWidth*0.25 + correction, topMargin + (y + 1)*cellHeight - wallWidth*0.5);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            ctx.fill();

                        } else {
                            ctx.beginPath();
                            ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight - wallWidth/4 + correction, topMargin + y*cellHeight + wallWidth/2);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + wallWidth/4 + correction, topMargin + y*cellHeight + wallWidth/2);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction + wallWidth/2, topMargin + (y + 1)*cellHeight);
                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction + wallWidth/4, topMargin + (y + 1)*cellHeight - wallWidth/2);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            ctx.fill();
                            
                            ctx.beginPath();
                            ctx.moveTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction - wallWidth/2, topMargin + (y + 1)*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction - wallWidth/4, topMargin + (y + 1)*cellHeight - wallWidth/2);
                            ctx.closePath();
                            ctx.fillStyle = color;
                            ctx.fill();   
                        }
                        for (let link of currentCell.links){
                            if (link.wall){
                                let neighbour: TriCell = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                                
                                
                                ctx.beginPath();
                                // top or bottom wall
                                if (link.y1 != link.y2){
                                    if (!currentCell.dir && neighbour.y < currentCell.y){
                                        ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + y*cellHeight);
                                        ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + y*cellHeight);
                                        ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight - wallWidth*0.25 + correction, topMargin + y*cellHeight + wallWidth*0.5);
                                        ctx.lineTo(margin + currentCell.x*0.5*cellHeight + wallWidth*0.25 + correction, topMargin + y*cellHeight + wallWidth*0.5);
                                    } else {
                                        ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                                        ctx.lineTo(margin + (currentCell.x*0.5 +1)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                                        ctx.lineTo(margin + (currentCell.x*0.5 +1)*cellHeight - wallWidth*0.25 + correction, topMargin + (y + 1)*cellHeight - wallWidth*0.5);
                                        ctx.lineTo(margin + currentCell.x*0.5*cellHeight + wallWidth*0.25 + correction, topMargin + (y + 1)*cellHeight - wallWidth*0.5);
                                    }
                                } else {
                                    // left or right wall
                                    if (neighbour.x < currentCell.x){
                                        if (!currentCell.dir){
                                            ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + y*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + wallWidth*0.25 + correction, topMargin + (y + 1)*cellHeight - wallWidth*0.5);
                                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + wallWidth*0.5 + correction, topMargin + y*cellHeight);
                                        } else {
                                            ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + y*cellHeight);
                                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + wallWidth*0.5 + correction, topMargin + (y + 1)*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + wallWidth*0.25 + correction, topMargin + y*cellHeight + wallWidth*0.5);
                                        }
                                    } else {
                                        if (!currentCell.dir) {    
                                            ctx.moveTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + y*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight - wallWidth*0.25 + correction, topMargin + (y + 1)*cellHeight - wallWidth*0.5);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight - wallWidth*0.5 + correction, topMargin + y*cellHeight);
                                        } else {
                                            ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + y*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight - wallWidth*0.5 + correction, topMargin + (y + 1)*cellHeight);
                                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight - wallWidth*0.25 + correction, topMargin + y*cellHeight + wallWidth*0.5);
                                        }
                                    } 
                                }
                                ctx.closePath();
                                ctx.fillStyle = color;
                                ctx.fill(); 
                            }
                        }
                    }
                }
            }
            for (let y = 0; y < field.length; y++){
                for (let x = 0; x < field[y].length; x++){
                    let currentCell: TriCell = field[y][x];
                    let correction: number = cellHeight*0.5*y;

                    if (!currentCell.visited && !currentCell.dir){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + y*cellHeight);
                        ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + y*cellHeight);
                        ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                        ctx.closePath();
                        ctx.fill();
                        
                        if (!currentCell.mask){
                            ctx.globalAlpha = 0.2;
                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.moveTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.closePath();
                            ctx.fill();
                        }
                    } else if (!currentCell.visited && currentCell.dir){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + y*cellHeight);
                        ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                        ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                        ctx.closePath();
                        ctx.fill();
                        
                        if (!currentCell.mask){
                            ctx.globalAlpha = 0.2;
                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.moveTo(margin + (currentCell.x*0.5 + 0.5)*cellHeight + correction, topMargin + y*cellHeight);
                            ctx.lineTo(margin + (currentCell.x*0.5 + 1)*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.lineTo(margin + currentCell.x*0.5*cellHeight + correction, topMargin + (y + 1)*cellHeight);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                }
            }

            // outer walls
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveTo(margin + cellHeight, topMargin);
            ctx.lineTo(canvas.width - margin - cellHeight, topMargin);
            ctx.lineTo(canvas.width - margin - cellHeight*0.5, topMargin + cellHeight);
            ctx.lineTo(canvas.width*0.5 + cellHeight*0.5, canvas.height - bottomMargin - cellHeight);
            ctx.lineTo(canvas.width*0.5 - cellHeight*0.5, canvas.height - bottomMargin - cellHeight);
            ctx.lineTo(margin + cellHeight*0.5, topMargin + cellHeight);
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = wallWidth
            ctx.stroke();
        }
    }
}