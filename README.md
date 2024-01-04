The Maze Base is a project where I play around with Maze Generation algorithms. 
A working version of this is hosted on https://www.planetegem.be/demo/the_maze_base.

Structure:
1) start.ts contains the main functions, most importantly:
    a) a preloader which prepares the canvases where mazes are drawn;
    b) the buildMaze function, which creates a maze object and animates it on the canvas.
2) components\cells.ts contains the different types of maze cells used to generate mazes. Each type of cell has a corresponding subfolder (i.e. the HollowCell class is used in 'hollow' components)
3) each subfolder contains:
    a) field.ts, which handles the generation of a blank field/set of coordinates
    b) types subfolder, which contains the actual maze generation algorithms. A maze generation algorithm is always an extension of an appropriate field type

All typescript files are compiled to a single js file
