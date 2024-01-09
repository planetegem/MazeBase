class TriBacktracker extends TriangularMaze {
    constructor (radius: number){
        super(radius);

        this.field = this.generateField();
        this.animatedField = this.saveField(this.field, this.animatedField);

        // start recursion
        this.recursion();
    }
    
    protected recursion(): void {
        // Prep: create path array and choose start position
        let path: TriCell[] = [];

        function getStart(field: triField): TriCell {
            let randomY: number = Math.floor(field.length*Math.random()),
                randomX: number = Math.floor(field[randomY].length*Math.random());

            if (!field[randomY][randomX].mask){
                return field[randomY][randomX];
            } else {
                return getStart(field);
            }
        }
        
        let startCell: TriCell = getStart(this.field);
        path.push(startCell);

        // Prep: bind saveField method for use during recursion
        const quickSave = (field: triField, animatedField: triAnimation): triAnimation => {
            return this.saveField(field, animatedField);
        }

        function start(field: triField, animatedField: triAnimation): triField {
            // Select current cell
            let currentCell: TriCell = path[path.length - 1];
            currentCell.visited = true;
            currentCell.path = true;
            quickSave(field, animatedField);
            currentCell.path = false;

            // Collect unvisited neighbours
            let possibleLinks: CellLink[] = [];
            for (let link of currentCell.links){
                let neighbour: TriCell = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
                if (!neighbour.visited && !neighbour.mask){
                    possibleLinks.push(link);
                }
            }

            // Select random neighbour to jump to
            if (possibleLinks.length > 0){
                let randomIndex: number = Math.floor(Math.random()*possibleLinks.length),
                    link: CellLink = possibleLinks[randomIndex];
                link.wall = false;

                let neighbour: TriCell = (currentCell === field[link.y1][link.x1]) ? field[link.y2][link.x2] : field[link.y1][link.x1];
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