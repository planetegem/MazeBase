"use strict";
// Function to start animating maze: creates new maze object and animates it on canvas click
function start(clickedElement, // element is clicked to start function
mazeType, // Select constructor: MazeClassConstructor = old interface
speed, // Determines number of ticks between each animation step
width, // Maze width
height // Maze height
) {
    if (!clickedElement.classList.contains("running")) {
        clickedElement.classList.add("running"); // Blocks double execution
        clickedElement.getElementsByClassName("overlay")[0].classList.remove("clickable");
        clickedElement.getElementsByClassName("overlay")[0].classList.remove("clicked");
        let newMaze = new mazeType(width, height), canvas = clickedElement.getElementsByClassName("maze")[0], color = window.getComputedStyle(clickedElement).color, background = clickedElement.getElementsByClassName("loadedImg")[0];
        let animationStart = Date.now(), steps = newMaze.animatedField.length;
        function animate() {
            let runtime = Date.now() - animationStart, currentStep = Math.max(0, Math.floor((runtime - 500) / speed));
            if (newMaze.animatedField[currentStep]) {
                newMaze.drawMaze(canvas, newMaze.animatedField[currentStep], color, background);
            }
            else {
                newMaze.drawMaze(canvas, newMaze.field, color, background);
            }
            if (runtime <= (steps * speed + 1500)) {
                window.requestAnimationFrame(animate);
            }
            else {
                clickedElement.classList.remove("running");
                clickedElement.getElementsByClassName("overlay")[0].classList.add("clicked");
            }
        }
        window.requestAnimationFrame(animate);
    }
}
// Function to draw play button on canvas (on page load)
function drawOverlay(canvas, color) {
    let ctx = canvas.getContext("2d"), height = canvas.height * 0.2, width = height;
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, height * 0.9, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, height * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.5 - width * 0.4, canvas.height * 0.5 - height * 0.5);
        ctx.lineTo(canvas.width * 0.5 - width * 0.4, canvas.height * 0.5 + height * 0.5);
        ctx.lineTo(canvas.width * 0.5 + height * 0.6, canvas.height * 0.5);
        ctx.lineTo(canvas.width * 0.5 - width * 0.4, canvas.height * 0.5 - height * 0.5);
        ctx.fill();
    }
}
// Prepare page on load
window.addEventListener("load", () => {
    // 1. Preload images
    let containers = document.getElementsByClassName("canvas-container"), loader = 0;
    for (let container of containers) {
        // 1a. Retrieve background-image from css
        let url = window.getComputedStyle(container).backgroundImage;
        url = url.split("assets/")[1];
        url = (url) ? "assets/" + url.substring(0, url.length - 2) : "assets/cat.png"; // If no background image in css, default to cat
        let imgPreload = document.createElement("img");
        // 1b. While image is loading, preset loading message
        let overlay = document.createElement("canvas");
        overlay.classList.add("overlay");
        container.appendChild(overlay);
        overlay.setAttribute("width", JSON.stringify(overlay.offsetWidth));
        overlay.setAttribute("height", JSON.stringify(overlay.offsetWidth));
        imgPreload.onload = () => {
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
            if (loader === containers.length) {
                // 3a. When all images are loaded & canvases created, calculate their positions and store in array 
                // + retrieve theme color from CSS -> to be used on scroll
                let chapterCollection = document.getElementsByClassName("chapter");
                for (let chapter of chapterCollection) {
                    let chapterOffset = chapter.getBoundingClientRect().top + window.scrollY, canvas = chapter.getElementsByClassName("canvas-container")[0], canvasColor = window.getComputedStyle(canvas).color;
                    chapterColors.push({ color: canvasColor, offset: chapterOffset });
                    // 3b. Add theme color to headers
                    let header = chapter.querySelector("h2");
                    if (header) {
                        header.style.textShadow = "0.05em 0.05em 0.1em " + canvasColor;
                    }
                }
            }
        };
        imgPreload.src = url;
        imgPreload.classList.add("loadedImg");
        container.appendChild(imgPreload);
    }
});
let chapterColors = [];
window.addEventListener("scroll", (e) => {
    // 1. Get screen height & scroll offset
    let scrollY = window.scrollY + screen.height * 0.33, underlay = document.getElementById("underlay");
    if (chapterColors.length > 0 && underlay) {
        // 2. Loop through chapter array, front to back; apply background-color
        for (let chapter of chapterColors) {
            if (scrollY >= chapter.offset) {
                underlay.style.backgroundColor = chapter.color;
            }
        }
        if (scrollY < chapterColors[0].offset) {
            underlay.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        }
    }
});
