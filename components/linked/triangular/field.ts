// Extend LinkedCell to include some specifics for polar coordinates
class TriCell extends LinkedCell {
    
    

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
        let field: triField = [];
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
            
        if (ctx){
            
        }
    }
}