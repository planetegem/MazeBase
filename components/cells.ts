// 'Solid' maze cells = walls are defined as a full cell
class SolidCell {
    // coordinates (fixed after assignment)
    public readonly x: number;
    public readonly y: number;

    // properties (mutable)
    public wall: boolean;
    public visited: boolean;
    public path: boolean;

    // constructor: only coordinates are obligatory
    constructor(x: number, y: number, wall: boolean = true, visited: boolean = false, path: boolean = false){
        this.x = x;
        this.y = y;
        this.wall = wall;
        this.visited = visited;
        this.path = path;
    }
}

// 'Hollow' cells: each cell tracks state of its 4 borders: walled or not
// cells can be masked to exclude them from maze generation
class HollowCell {
    // coordinates (fixed after assignment)
    public readonly x: number;
    public readonly y: number;

    // properties (mutable)
    public visited: boolean = false;
    public path: boolean = false;

    // border status: wall or not
    public up: boolean = false;
    public right: boolean = false;
    public down: boolean = false;
    public left: boolean = false;

    // cells can be masked to exclude them from the maze
    public mask: boolean; 

    // constructor: only coordinates are obligatory
    constructor (x: number, y: number, mask: boolean = false){
        this.x = x;
        this.y = y;
        this.mask = mask;
    }
}

// Interface used for all maze types
interface FieldInterface<F> {
    field: F;
    animatedField: F[];
    drawMaze: (canvas: HTMLCanvasElement, field: F, color: string, image: HTMLImageElement) => void;
}

