// Description: Main file for the simulation.
// Import: algorithm.js, render.js, builder.js
import { Algorithm } from "./algorithm.js";
import { Render, Slider } from "./render.js";
import { DialogBuilder } from "./builder.js";

//default timeout for the simulation for each step
const DEFAULT_TIMEOUT = 300; // set it to change the speed of the simulation

//create the algorithm instance
const algorithm = new Algorithm();

// elements = {
//     rulerElement: "#ruler",
//     simulationElement: "#simulation",
//     queueElement: "#queue",
//     timeElement: "#time"
// }

//create the render instance and pass the algorithm instance
const render = new Render({}, algorithm, DEFAULT_TIMEOUT);
//create the slider instance and pass the render instance
const slider = new Slider(render, '#slider')

//create the dialog builder instance and pass the algorithm and render instances
const dialog = new DialogBuilder('#dialog', algorithm, render);
//initialize the dialog
dialog.initialize();

//add event listeners for the config
//when the config button is clicked, open the dialog
const config = document.querySelector('#config');
config.addEventListener('click', () => { dialog.open() });

//add event listeners for the buttons
//when the start button is clicked, start the simulation
const start = document.querySelector('#start');
start.addEventListener('click', () => { render.start() });

//add event listeners for the buttons
//when the stop button is clicked, stop the simulation
const end = document.querySelector('#end');
end.addEventListener('click', () => { render.stop() });




