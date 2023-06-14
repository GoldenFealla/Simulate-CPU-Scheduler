import { Builder } from "./builder.js";

//Render class is responsible for rendering the simulation
export class Render {
    constructor(element, algorithm, timeout = 500) {
        const {
            rulerElement = "#ruler",
            simulationElement = "#simulation",
            queueElement = "#queue",
            timeElement = "#time"
        } = element;

        //algorithm is the algorithm that will be used for the simulation
        this._algorithm = algorithm;

        //timeout is the time between each step
        this._timeout = timeout;
        this._timeoutInstances = [];

        //row is the row of rectangles for each process
        this._row = [];
        this._currentStep = 0;

        //rulerContainer is the element that will be used as a simulation (it must be string or element)
        if (typeof rulerElement === 'string') {
            this._rulerContainer = document.querySelector(rulerElement);
        } else {
            this._rulerContainer = rulerElement;
        }

        //container is the element that will be used as a simulation (it must be string or element)
        if (typeof simulationElement === 'string') {
            this._container = document.querySelector(simulationElement);
        } else {
            this._container = simulationElement;
        }

        //queueContainer is the element that will be used as a queue (it must be string or element)
        if (typeof queueElement === 'string') {
            this._queueContainer = document.querySelector(queueElement);
        } else {
            this._queueContainer = queueElement;
        }

        //timeContainer is the element that will be used as a time (it must be string or element)
        if (typeof timeElement === 'string') {
            this._timeContainer = document.querySelector(timeElement);
        } else {
            this._timeContainer = timeElement;
        }

        //set the timeout css variable
        document.documentElement.style.setProperty('--time-out', timeout + 'ms');

        //load the simulation
        this.load();
    }

    load() {
        //if total time is infinity, then there is no need to render
        if (this._algorithm.totalTime === Infinity) {
            return;
        }

        //get the total time and processes from the algorithm
        const totalTime = this._algorithm.totalTime;
        const processes = this._algorithm.cloneProcesses;

        //create the ruler
        this.createRuler(totalTime);

        //create empty rectangles for each process
        for (const process of processes) {
            //create a new row of rectangles
            this._row[process.name] = document.createElement('div');
            this._row[process.name].className = 'row';

            //create empty rectangles for each process
            for (let i = 0; i < totalTime; i++) {
                const rect = Builder.createEmptyRect('rect');
                this._row[process.name].appendChild(rect);
            }

            //add the row to the container
            this._container.appendChild(this._row[process.name]);
        }

        //create empty row of rectangles for the queue
        this._queueRow = document.createElement('div');
        this._queueRow.className = 'queue-row';

        //create empty rectangles for the queue
        for (let i = 0; i < totalTime; i++) {
            const rect = Builder.createEmptyRect('qe');
            this._queueRow.appendChild(rect);
        }

        //add the row to the container
        this._queueContainer.appendChild(this._queueRow);

        //create the ruler
    }

    start() {
        //get the keyframes, average waiting time and average turnaround time from the algorithm
        const { keyframes, averageWaitingTime, averageTurnaroundTime } = this._algorithm.keyframes;
        //get the current step
        const step = this._currentStep;

        //Run the simulation from the current step
        keyframes.forEach((_, index) => {
            //if the index is less than the current step, then skip
            if (index < step) return;
            //else run the simulation for each step
            this._timeoutInstances.push(
                setTimeout(() => {
                    //update the simulation
                    this.updateSimulation(index);
                    //update the current step
                    this._currentStep = index;
                    //dispatch an event to update the step
                    document.dispatchEvent(new CustomEvent('update-step', { detail: { step: this._currentStep } }))
                }, this._timeout * ((index - step) + 1))
            );
        })

        //update the average waiting time and average turnaround time
        this.updateTime(averageWaitingTime, averageTurnaroundTime);
    }

    stop() {
        //clear all the timeouts
        this._timeoutInstances.forEach((timeout) => {
            clearTimeout(timeout);
        });

        //clear the timeouts
        this._timeoutInstances = [];
    }

    clear() {
        //stop the simulation
        this.stop();
        //clear the simulation
        this._container.innerHTML = '';
        //clear the queue
        this._queueContainer.innerHTML = '';
        //clear the time
        this.updateTime(0, 0);
    }

    //create the ruler based on the total time and step
    createRuler(totalStep, mark = 2) {

        //clear the ruler
        this._rulerContainer.innerHTML = '';

        //create the new ruler
        for (let i = 0; i < totalStep; i++) {
            //if it is the first step, then create a mark ruler
            if (i % mark === 0) {
                const ruler = Builder.createMarkRuler();
                this._rulerContainer.appendChild(ruler);
            }

            //create a line ruler
            const ruler = Builder.createLineRuler();
            this._rulerContainer.appendChild(ruler);

            //if it is the last step, then create a mark ruler
            if (i === totalStep - 1) {
                const ruler = Builder.createMarkRuler();
                this._rulerContainer.appendChild(ruler);
            }
        }
    }

    updateRow(name, step) {
        let time = -1;

        //get the keyframes from the algorithm
        const { keyframes } = this._algorithm.keyframes;
        //get the keyframes for the process
        const processKeyframes = keyframes.map((keyframe) => { return keyframe[name] });

        //get the row
        const row = this._row[name];

        //update the row
        for (const element of row.children) {
            //if the time is equal to the step, then break. Because we don't need to update the row anymore
            if (time === step) {
                break;
            }

            time++;

            //-1 is the outline (the process is waiting)
            //0 is the empty, (the process is not arrived yet or the process is finished)
            //greater than 0 is the fill (the process is running)

            //if the process is -1, then add the outline class.
            if (processKeyframes[time] === -1) {
                //the process is waiting
                element.classList.add('outline')
                if (processKeyframes[time - 1] === undefined) element.classList.add('start')
            } else if (processKeyframes[time] === 0) {
                //the process is not arrived yet or the process is finished
                element.classList.remove('outline', 'fill', 'start')
            } else if (processKeyframes[time] > 0) {
                //the process is running
                element.classList.remove('outline')
                element.classList.add('fill')
            }
        }

        //add empty rectangles to the row
        for (let i = time + 1; i < row.children.length; i++) {
            row.children[i].classList.remove('outline', 'fill', 'start')
        }
    }

    //update the queue row
    updateQueueRow(step) {
        let time = -1;

        //get the keyframes from the algorithm
        const { queueKeyframes } = this._algorithm.keyframes;

        //update the queue row
        for (const element of this._queueRow.children) {
            if (time === step) {
                break;
            }

            time++;

            //get the queue keyframe at the current time
            const queueKeyframe = queueKeyframes[time];

            //reset the queue row before updating
            element.innerHTML = '';

            //if the queue keyframe is undefined, then skip
            for (const process of queueKeyframe) {
                //else add the process to the queue row
                //create a new span
                const span = document.createElement('span');
                span.innerHTML = process;

                //add the span to the queue row
                element.appendChild(span);
            }
        }

        //add empty rectangles to the queue row
        for (let i = time + 1; i < this._queueRow.children.length; i++) {
            this._queueRow.children[i].innerHTML = '';
        }
    }

    //update the average waiting time and average turnaround time
    updateTime(averageWaitingTime, averageTurnaroundTime) {
        //create a new span for the average waiting time 
        const spanWaitingTime = document.createElement('span');
        spanWaitingTime.className = 'waiting-time';

        //create a new span for the average turnaround time
        const spanTurnaroundTime = document.createElement('span');
        spanTurnaroundTime.className = 'turnaround-time';

        //update the average waiting time and average turnaround time
        spanWaitingTime.innerText = `Average Waiting Time: ${averageWaitingTime}`;
        spanTurnaroundTime.innerText = `Average Turnaround Time: ${averageTurnaroundTime}`;

        //clear the time container
        this._timeContainer.innerHTML = '';

        //add the average waiting time and average turnaround time to the time container
        this._timeContainer.appendChild(spanWaitingTime);
        this._timeContainer.appendChild(spanTurnaroundTime);
    }

    //update the simulation
    updateSimulation(step) {
        //get the processes from the algorithm
        const processes = this._algorithm.cloneProcesses;

        //update the queue row
        this.updateQueueRow(step);

        //update the row for each process
        for (const process of processes) {
            this.updateRow(process.name, step);
        }
    }
}


//Slider class to control the simulation
export class Slider {
    constructor(render, sliderElement = "#slider") {
        //if the slider element is a string, then get the element from the document
        if (typeof sliderElement === 'string') {
            this._sliderElement = document.querySelector(sliderElement);
        } else {
            this._sliderElement = sliderElement;
        }

        //get the render instance from the simulation
        this._render = render;

        //initialize the slider
        this.initialize();
    }

    initialize() {
        //set the min and max value of the slider
        this._sliderElement.min = -1;
        this._sliderElement.max = 1;

        //add an event listener to the slider to update the simulation
        this._sliderElement.addEventListener('input', (event) => {
            const { value } = event.target;

            //update the simulation
            this._render._currentStep = value;
            this._render.updateSimulation(parseInt(value));
        });

        //add an event listener to the document to update the slider
        document.addEventListener('update-step', (event) => {
            //get the step from the event
            const { step } = event.detail;
            //update the slider value
            this._sliderElement.value = step;
        })

        //add an event listener to the document to update the slider
        document.addEventListener('total-step', (event) => {
            //get the total time from the event
            const { totalTime } = event.detail;
            //update the slider max value
            this._sliderElement.max = totalTime - 1;
        })
    }
}