The Maze Base is a project where I play around with Maze Generation algorithms. 
A working version of this is hosted on https://www.planetegem.be/demo/the_maze_base.

Structure:
1) components\cells.ts contains the different types of maze cells used to generate mazes. Each type of cell has a corresponding subfolder (i.e. the HollowCell class is used in 'hollow' components). There are 3 types of cells:
    a) solid: cells are identified as either wall or not wall. Their location & neighbours are identified as x/y coordinates on a cartesian grid.
    b) hollow: every cell is identified as a set of walls (top, bottom, left or right). The location & neighbours of each cell are identified as x/y coordinates on a cartesian grid.
    c) linked: every cell contains a reference to its neighbours. It can be extended with specific coordinates to be used when drawing the cells. These cells can have any shape and don't rely on a cartesian grid.
2) Each subfolder contains a field class, which is a grid of the cells in questions. The hollow field contains mask algorithms (which cells to simulate a specific shade). The linked subfolder is further subidived into geometries (polar vs. triangular).
3) The types subfolder then contains the actual maze generation algorithms. A maze generation algorithm is always an extension of an appropriate field type
4) start.ts contains the main functions which call the maze generation algorithms, most importantly:
    a) a preloader which prepares the canvases where mazes are drawn;
    b) the buildMaze function, which creates a maze object and animates it on the canvas.

All typescript files are compiled to a single js file.
