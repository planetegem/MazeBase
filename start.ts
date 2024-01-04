// Function to start animating maze: creates new maze object and animates it on canvas click
function startMaze<F>(
    clickedElement: any, // element is clicked to start function
    maze: FieldInterface<F>, // new maze
    speed: number, // determines number of ticks between each animation step
): void {
    console.log("started");
    if (!clickedElement.classList.contains("running")){
        clickedElement.classList.add("running"); // Blocks double execution
        clickedElement.getElementsByClassName("overlay")[0].classList.remove("clickable");
        clickedElement.getElementsByClassName("overlay")[0].classList.remove("clicked");

        let canvas: HTMLCanvasElement = clickedElement.getElementsByClassName("maze")[0],
            color: string = window.getComputedStyle(clickedElement).color,
            background: HTMLImageElement = clickedElement.getElementsByClassName("loadedImg")[0];
    
        let animationStart: number = Date.now(),
            steps: number = maze.animatedField.length;

        function animate(): void {
            let runtime: number = Date.now() - animationStart,
                currentStep: number = Math.max(0, Math.floor((runtime - 500)/speed));
                    
            if (maze.animatedField[currentStep]){
                maze.drawMaze(canvas, maze.animatedField[currentStep], color, background);
            } else {
                maze.drawMaze(canvas, maze.field, color, background);
            }
            if (runtime <= (steps*speed + 1500)){
                window.requestAnimationFrame(animate);
            } else {
                clickedElement.classList.remove("running");
                clickedElement.getElementsByClassName("overlay")[0].classList.add("clicked");
            }
        }
        window.requestAnimationFrame(animate);
    }
}

// Adds event listeners to the canvases
function addCanvasListeners(){
    // Solid mazes
    const canvas1 = document.getElementById("canvas-recDiv");
    if (canvas1){
        canvas1.addEventListener("click", () => startMaze<solidField>(canvas1, new RecursiveMaze(20, 20), 250));
    }
    const canvas2 = document.getElementById("canvas-primMaze");
    if (canvas2){
        canvas2.addEventListener("click", () => startMaze<solidField>(canvas2, new PrimsMaze(20, 20), 55));
    }
    const canvas3 = document.getElementById("canvas-simpleBacktrack");
    if (canvas3){
        canvas3.addEventListener("click", () => startMaze<solidField>(canvas3, new SimpleBacktrack(20, 20), 55));
    }
    // Hollow mazes
    const canvas4 = document.getElementById("canvas-hollowBacktrack");
    if (canvas4){
        canvas4.addEventListener("click", () => startMaze<hollowField>(canvas4, new Backtracker(20, 20), 55));
    }
    const canvas5 = document.getElementById("canvas-randomWalk");
    if (canvas5){
        canvas5.addEventListener("click", () => startMaze<hollowField>(canvas5, new AldousBroder(12, 12), 55));
    }
    const canvas6 = document.getElementById("canvas-tunneler");
    if (canvas6 != null){
        canvas6.addEventListener("click", () => startMaze<hollowField>(canvas6, new FrontierTunneler(24, 24), 40));
    }
}

// Function to draw play button on canvas (on page load)
function drawOverlay(canvas: HTMLCanvasElement, color: string): void {
    let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"),
        height: number = canvas.height*0.2,
        width: number = height;

    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(canvas.width*0.5, canvas.height*0.5, height*0.9, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(canvas.width*0.5, canvas.height*0.5, height*0.8, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(canvas.width*0.5 - width*0.4, canvas.height*0.5 - height*0.5);
        ctx.lineTo(canvas.width*0.5 - width*0.4, canvas.height*0.5 + height*0.5);
        ctx.lineTo(canvas.width*0.5 + height*0.6, canvas.height*0.5);
        ctx.lineTo(canvas.width*0.5 - width*0.4, canvas.height*0.5 - height*0.5);
        ctx.fill();
    }
}

// Prepare page on load
window.addEventListener("load", ():void => {
    // 1. Preload images
    let containers = document.getElementsByClassName("canvas-container"),
        loader: number = 0;

    for (let container of containers){
        // 1a. Retrieve background-image from css
        let url: string = window.getComputedStyle(container).backgroundImage;
        url = url.split("assets/")[1];
        url = (url) ? "assets/" + url.substring(0, url.length - 2) : "assets/cat.png"; // If no background image in css, default to cat
        let imgPreload: HTMLImageElement = document.createElement("img");
        
        // 1b. While image is loading, preset overlay
        let overlay = document.createElement("canvas");
        overlay.classList.add("overlay");
        container.appendChild(overlay);
        overlay.setAttribute("width", JSON.stringify(overlay.offsetWidth));
        overlay.setAttribute("height", JSON.stringify(overlay.offsetWidth));

        imgPreload.onload = ():void => {
            // 2a. Once image is loaded, create canvas elements: first the canvas where the maze will be drawn
            let canvas = document.createElement("canvas");
            canvas.classList.add("maze");
            container.appendChild(canvas);
            canvas.setAttribute("width", JSON.stringify(canvas.offsetWidth));
            canvas.setAttribute("height", JSON.stringify(canvas.offsetWidth));

            // 2b. then the overlay with play button
            overlay.classList.add("clickable");
            drawOverlay(overlay, window.getComputedStyle(container).color);

            // 2c. Everything created = element becomes clickable
            container.classList.remove("running");
            loader++;

            if (loader === containers.length){
                // 3a. When all images are loaded & canvases created, calculate their positions and store in array 
                // + retrieve theme color from CSS -> to be used on scroll
                let chapterCollection = document.getElementsByClassName("chapter");
                for (let chapter of chapterCollection){
                    let chapterOffset: number = chapter.getBoundingClientRect().top + window.scrollY,
                        canvas: any = chapter.getElementsByClassName("canvas-container")[0],
                        canvasColor: string = window.getComputedStyle(canvas).color;
                    
                    chapterColors.push({color: canvasColor, offset: chapterOffset});
                    
                    // 3b. Add theme color to headers
                    let header: HTMLHeadingElement | null = chapter.querySelector("h2");
                    if (header){
                        header.style.textShadow = "0.05em 0.05em 0.1em " + canvasColor;
                    }
                }
                addCanvasListeners();
            }
        }
        imgPreload.src = url;
        imgPreload.classList.add("loadedImg");
        container.appendChild(imgPreload);
    }
});

// On scroll, check which background-color applies
interface Chapter {
    color: string;
    offset: number;
}
let chapterColors: Chapter[] = [];

window.addEventListener("scroll", (e: Event): void => {
    // 1. Get screen height & scroll offset
    let scrollY: number = window.scrollY + screen.height*0.33,
        underlay: HTMLElement | null = document.getElementById("underlay");

    if (chapterColors.length > 0 && underlay){
        // 2. Loop through chapter array, front to back; apply background-color
        for (let chapter of chapterColors){
            if (scrollY >= chapter.offset){
                underlay.style.backgroundColor = chapter.color;
            } 
        }
        if (scrollY < chapterColors[0].offset){
            underlay.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        }
    }
});