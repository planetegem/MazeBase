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

// Linked cells: each cell tracks who its neighbours are (for non-cartesian systems)
class CellLink {
    public wall: boolean = true;
    public readonly x1: number;
    public readonly x2: number;
    public readonly y1: number;
    public readonly y2: number;

    constructor (x1: number, x2: number, y1: number, y2: number){
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
}
class PolarCell {
    public visited: boolean = false;
    public path: boolean = false;
    
    public links: CellLink[] = [];

    public linkNeighbour(cell: PolarCell){
        let link: CellLink = new CellLink(this.x, cell.x, this.y, cell.y);
        this.links.push(link);
        cell.links.push(link);
    }

    // location variables
    public readonly x: number;
    public readonly y: number;
    public readonly minX: number;
    public readonly maxX: number;
    public readonly minY: number;
    public readonly maxY: number;

    constructor (x:number, width: number, y: number, innerY: number, outerY: number){
        this.x = x;
        this.y = y;
        this.minX = x*(2*Math.PI/width);
        this.maxX = (x + 1)*(2*Math.PI/width);
        this.minY = innerY;
        this.maxY = outerY;
    }
}

// Interface used for all maze types
interface FieldInterface<F> {
    field: F;
    animatedField: F[];
    drawMaze: (canvas: HTMLCanvasElement, field: F, color: string, image: HTMLImageElement) => void;
}

