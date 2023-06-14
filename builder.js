// Purpose: Contains the Builder class and DialogBuilder class
// The Builder class is used to create elements
// The DialogBuilder class is used to create a dialog for the user to input processes

//Builder class is used to create elements 
export class Builder {
    //create a input element with the specified type, placeholder, classes, and event function
    static createInput(type, placeholder, classes, eventFunction) {
        //create the input element
        const input = document.createElement('input');

        //set the attributes of the input element
        input.setAttribute('type', type);
        input.setAttribute('placeholder', placeholder);

        //add the classes to the input element
        input.classList.add(...classes);
        input.addEventListener('change', eventFunction)

        //return the input element
        return input;
    }

    //create a row for the dialog
    static createInputRow() {
        //create a unique id for the row
        const id = Date.now();

        //create a div element to contain the row
        const rowContainer = document.createElement('div');
        rowContainer.id = `id-${id}`;

        //create a process object to store the process information
        const process = {
            id: id,
            name: undefined,
            arrivalTime: undefined,
            burstTime: undefined,
        }


        //create the input elements for the row
        const inputName = this.createInput('text', 'Process Name', ['input-process'], (event) => {
            //get the value of the input element
            const { value } = event.target;
            //set the name of the process
            process.name = value;
        })

        //create the input elements for the row
        const inputArrival = this.createInput('number', 'Arrival Time', ['input-process'], (event) => {
            //get the value of the input element
            const { value } = event.target;
            //set the arrival time of the process
            process.arrivalTime = parseInt(value);
        })

        //create the input elements for the row
        const inputBurst = this.createInput('number', 'Burst Time', ['input-process'], (event) => {
            //get the value of the input element
            const { value } = event.target;
            //set the burst time of the process
            process.burstTime = parseInt(value);
        })

        //append the input elements to the row
        rowContainer.appendChild(inputName);
        rowContainer.appendChild(inputArrival);
        rowContainer.appendChild(inputBurst);

        //return the row and process
        return {
            rowContainer,
            process
        };
    }

    //create a div element with the specified classes
    static createEmptyRect(className) {
        //create the div element
        const rect = document.createElement('div');

        //add the classes to the div element
        if (className) {
            rect.classList.add(className);
        }

        //return the div element
        return rect;
    }
}

export class DialogBuilder {
    //dialogElement is the element that will be used as a dialog (it must be string or element)
    constructor(dialogElement = "#dialog", algorithm, render) {
        if (typeof dialogElement === 'string') {
            dialogElement = document.querySelector(dialogElement);
        }

        //set the properties of the class for later use
        this._algorithm = algorithm;
        this._render = render;
        this._dialogElement = dialogElement;
    }

    initialize() {
        //get the elements
        const processContainer = this._dialogElement.querySelector('#process');
        const addButton = this._dialogElement.querySelector('#add');
        const closeButton = this._dialogElement.querySelector('#close');
        const selectType = this._dialogElement.querySelector('#type');

        //add event listeners for the elements above
        addButton.addEventListener('click', () => {
            //create a new row
            const { rowContainer, process } = Builder.createInputRow();
            //add the row to the dialog
            processContainer.appendChild(rowContainer);

            //add the process to the algorithm
            this._algorithm.addProcess(process);
        });

        //add event listener for the close button
        closeButton.addEventListener('click', () => {
            //close the dialog
            this.close();
        });

        //add event listener for the select element
        selectType.addEventListener('change', (event) => {
            //get the value of the select element
            const { value } = event.target;
            //set the type of the algorithm (FCFS, SJF, etc.)
            this._algorithm.type = value;
        });
    }

    open() {
        //open the dialog
        this._dialogElement.showModal();
    }

    close() {
        //get id of the process to be removed
        const IDs = this._algorithm.removeEmptyProcesses();

        //remove the row from the dialog
        const processContainer = this._dialogElement.querySelector('#process');

        //remove the row from the dialog
        for (const id of IDs) {
            //get the row with the specified id
            const row = processContainer.querySelector(`#id-${id}`);

            //if the row exists, remove it
            if (row) {
                processContainer.removeChild(row);
            }
        }

        //add event for total time
        document.dispatchEvent(new CustomEvent('total-step', {
            detail: {
                totalTime: this._algorithm.totalTime
            }
        }))


        //load the render because the algorithm or processes have changed
        this._render.clear();
        this._render.load();

        //close the dialog
        this._dialogElement.close();
    }
}