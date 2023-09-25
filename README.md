The Maze Base is a project where I play around with Maze Generation algorithms. 
A working version of this is also hosted on https://www.planetegem.be/demo/the_maze_base.

Files:
1) start.ts contains preloader and start function. Start function is tied to onClick eventlistener attached to every canvas container element. Handles animation of maze.
2) oldfield.ts handles generation of a blank maze with a 'hollow' coordinate system (see comments at start of file for more info)
3) oldmazes.ts contains classes for first 3 mazes on the page (recursive division, prim's & simple backtracker)
4) field.ts handles generation of blank maze with internal border system (see comments at start of file)
5) mazes.ts contains classes for octagon & random walk
