class PolarBacktracker extends PolarMaze {
    constructor (radius: number){
        super(radius);

        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);

        // start recursion
        this.recursion();
    }
    
    protected recursion(): void {
        // Prep: create path array and choose start position
        let path: PolarCell[] = [];

        let randomY: number = Math.floor(this.field.length*Math.random()),
            randomX: number = Math.floor(this.field[randomY].length*Math.random());
        
        path.push(this.field[randomY][randomX]);

        // Prep: bind saveField method for use during recursion
        const quickSave = (field: polarField, animatedField: polarAnimation): polarAnimation => {
            return this.saveField(field, animatedField);
        }

        function start(field: polarField, animatedField: polarAnimation): polarField {
            // Select current cell
            let currentCell: PolarCell = path[path.length - 1];
            currentCell.visited = true;
            currentCell.path = true;
            quickSave(field, animatedField);
            currentCell.path = false;

            // Collect unvisited neighbours
            let possibleLinks: CellLink[] = [];
            for (let link of currentCell.links){
                let neighbour: PolarCell = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                if (!neighbour.visited){
                    possibleLinks.push(link);
                }
            }

            // Select random neighbour to jump to
            if (possibleLinks.length > 0){
                let randomIndex: number = Math.floor(Math.random()*possibleLinks.length),
                    link: CellLink = possibleLinks[randomIndex];
                link.wall = false;

                let neighbour: PolarCell = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                path.push(neighbour);
                return field = start(field, animatedField);
            } else {
                path.splice(path.length - 1, 1);
                if (path.length > 0){
                    return field = start(field, animatedField);
                } else {
                    return field;
                }
            }
        }
        start(this.field, this.animatedField);
    }
}