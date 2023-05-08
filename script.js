const DEFAULT_MODE = 'fcfs';

const processes = [];

let result = [];
let mode = DEFAULT_MODE;

let min = 0;
let max;

const addProcess = document.querySelector('#add-process');
const addButton = document.querySelector('#add-btn');

addButton.addEventListener('click', () => {
    let divContainer = document.createElement('div');

    let process = {
        name: 'No Name',
        arrivalTime: 0,
        burstTime: 0,
    }

    let inputName = document.createElement('input');
    let inputArrival = document.createElement('input');
    let inputBurst = document.createElement('input');

    inputName.setAttribute('type', 'text');
    inputName.setAttribute('placeholder', 'Process Name');
    inputName.classList.add('input-process');
    inputName.addEventListener('change', (event) => {
        const { value } = event.target;
        process.name = value;
        total = totalTime(processes)
    })

    inputArrival.setAttribute('type', 'number');
    inputArrival.setAttribute('placeholder', 'Arrival Time');
    inputArrival.classList.add('input-process');
    inputArrival.addEventListener('change', (event) => {
        const { value } = event.target;
        process.arrivalTime = parseInt(value);
        total = totalTime(processes)
    })

    inputBurst.setAttribute('type', 'number');
    inputBurst.setAttribute('placeholder', 'Burst Time');
    inputBurst.classList.add('input-process');
    inputBurst.addEventListener('change', (event) => {
        const { value } = event.target;
        process.burstTime = parseInt(value);
        total = totalTime(processes)
    })

    divContainer.appendChild(inputName);
    divContainer.appendChild(inputArrival);
    divContainer.appendChild(inputBurst);

    addProcess.appendChild(divContainer);
    processes.push(process);
})

