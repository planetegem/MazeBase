// Create empty field for solid maze
type solidField = SolidCell[][];
type solidAnimation = solidField[];

class SolidMaze implements FieldInterface<solidField> {
    
    protected xLength: number;
    protected yLength: number;
    public field: solidField = [];
    public animatedField: solidAnimation = [];

    constructor (width: number, height: number){
        this.xLength = 2*width + 1; // need uneven width & height to make walls work
        this.yLength = 2*height + 1; // need uneven width & height to make walls work
    }

    // Make empty field
    protected generateField(): solidField {
        let width: number = this.xLength, height: number = this.yLength;
        let xArray = [];
        
        for (let x = 0; x < width; x++){
            let yArray = [];
            for (let y = 0; y < height; y++){
                yArray.push(new SolidCell(x, y));
                if (x === 0 || y === 0 || x === this.xLength - 1 || y === this.yLength - 1){
                    yArray[y].visited = true;
                }
            }
            xArray.push(yArray);
        }
        return xArray;
    }

    // Helper function: return random coordinate between 2 points
    public getRandom(low: number, high: number){
        return Math.floor((Math.random()*(high - low)*0.5))*2 + low; 
    }

    // Helper function: save a copy of field to animated field
    public saveField(field: solidField, target: solidAnimation) {
        let copiedField: SolidCell[][] = JSON.parse(JSON.stringify(field));
        target.push(copiedField);
        return target;
    }

    // Gets passed to canvas during animation: determines how to interpret maze array
    public drawMaze(canvas: HTMLCanvasElement, field: solidField, color: string, image: HTMLImageElement): void {
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
                    if (field[x][y].wall && field[x][y].visited){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = color;
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                    } else if (field[x][y].path){
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "purple";
                        ctx.fillRect(marginX + x*cellWidth, marginY + y*cellHeight, cellWidth, cellHeight);
                    } else if (!field[x][y].visited){
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