//The Algorithm class is responsible for generate keyframes 
//based on processes and type 
export class Algorithm {
    //Constructor for the algorithm class
    constructor(processes) {
        //If no processes are passed, initialize an empty array
        if (processes === undefined) {
            this._processes = [];
            this._totalTime = 0;
        } else {
            this._processes = processes;
            this._totalTime = this.calculateTotalTime();
        }

        //Initialize the totalTime and default type
        this._type = 'fcfs';
        this._result = {};
    }

    //Getters and setters
    //Getter for the processes
    get processes() {
        return this._processes;
    }

    //Getter for the type
    get type() {
        return this._type;
    }

    //Setter for the processes
    set processes(processes) {
        this._processes = processes;
        this._totalTime = this.calculateTotalTime();
    }

    //Setter for the type
    set type(type) {
        this._type = type;
    }

    //Getter for the totalTime
    get totalTime() {
        this._totalTime = this.calculateTotalTime();
        return this._totalTime;
    }

    //Clone the processes array
    get cloneProcesses() {
        return this._processes.map((process) => { return { ...process } });
    }

    //Get the total time of the processes
    calculateTotalTime() {
        //If there are no processes, return 0
        if (this._processes.length === 0) {
            return 0;
        }

        //Get the minimum arrival time 
        const minArrivalTime = Math.min(...this._processes.map((process) => { return process.arrivalTime }));
        //Get the total burst time
        const totalBurstTime = this._processes.reduce((total, process) => { return total + process.burstTime }, 0);
        //Total time is the minimum arrival time + total burst time
        return minArrivalTime + totalBurstTime;;
    }

    //Add a process to the processes array
    addProcess(process) {
        this._processes.push(process);
        this._totalTime = this.calculateTotalTime();
    }

    //remove a process which is empty
    removeEmptyProcesses() {
        let IDs = [];
        this._processes = this._processes.filter((process) => {
            let isEmpty = !(process.burstTime !== undefined && process.arrivalTime !== undefined && process.name !== undefined);

            if (isEmpty) {
                IDs.push(process.id);
            }

            return !isEmpty;
        });
        this._totalTime = this.calculateTotalTime();
        return IDs;
    }


    //get the keyframes of the algorithm
    get keyframes() {
        this._totalTime = this.calculateTotalTime();

        //prevent unnecessary calculations
        if (this._result.type === this._type) {
            return this._result;
        }

        //initialize the result object
        this._result = {
            type: this._type,
            keyframes: [],
            queueKeyframes: [],
            averageWaitingTime: 0,
            averageTurnaroundTime: 0
        };

        //call the appropriate algorithm based on the type
        switch (this._type) {
            //First Come First Serve
            case 'fcfs': {
                const tempResult = this.fcfs();
                Object.assign(this._result, tempResult);
                return this._result;
            }
            //Shortest Job First
            case 'sjf': {
                const tempResult = this.sjf();
                Object.assign(this._result, tempResult);
                return this._result;
            }
            //Shortest Remaining Time First
            case 'srtf': {
                const tempResult = this.srtf();
                Object.assign(this._result, tempResult);
                return this._result;
            }
            //Round Robin
            case 'rr': {
                const tempResult = this.rr(2);
                Object.assign(this._result, tempResult);
                return this._result;
            }
            //Invalid type
            default:
                return this._result;
        }
    }

    //fcfs algorithm
    fcfs() {
        const copyProcesses = this.cloneProcesses;

        const keyframes = [];
        const queueKeyframes = [];

        const queueCPU = [];

        for (let i = 0; i < this._totalTime; i++) {
            let keyframe = {};

            //Add the processes with arrival time equal to i (time) to the queueCPU
            for (const process of copyProcesses) {
                if (process.arrivalTime === i) {
                    process.originalBurstTime = process.burstTime;
                    queueCPU.push(process);
                }
            }


            //If the queueCPU is not empty then execute the first process in the queueCPU
            if (queueCPU.length > 0) {
                const process = queueCPU[0];
                keyframe[process.name] = process.burstTime;
                process.burstTime--;

                //If the queueCPU has more than one process then add -1 (waiting) to the keyframe
                if (queueCPU.length > 1) {
                    for (let j = 1; j < queueCPU.length; j++) {
                        const process = queueCPU[j];
                        keyframe[process.name] = -1;
                    }
                }

                //Add the queueCPU to the queueKeyframes
                queueKeyframes.push(queueCPU.map((process) => process.name));

                //If the process is finished then remove it from the queueCPU
                if (process.burstTime === 0) {
                    process.completionTime = i + 1;
                    queueCPU.shift();
                }
            }

            keyframes.push(keyframe);
        }

        //Calculate the waiting time and turnaround time
        let totalWaitingTime = 0; //declare total waiting time
        let totalTurnaroundTime = 0; //declare total turnaround time

        for (const process of copyProcesses) {
            process.turnaroundTime = process.completionTime - process.arrivalTime; //turn around time =  completion time - arrival time
            process.waitingTime = process.turnaroundTime - process.originalBurstTime; //waiting time = turnaround time - burst time

            totalWaitingTime += process.waitingTime; //total waiting time = total waiting time + waiting time
            totalTurnaroundTime += process.turnaroundTime; //total turnaround time = total turnaround time + turnaround time
        }

        const averageWaitingTime = totalWaitingTime / copyProcesses.length; //average waiting time = total waiting time / number of processes
        const averageTurnaroundTime = totalTurnaroundTime / copyProcesses.length; //average turnaround time = total turnaround time / number of processes

        return {
            keyframes,
            queueKeyframes,
            averageWaitingTime: averageWaitingTime,
            averageTurnaroundTime: averageTurnaroundTime
        };
    }

    //sjf algorithm
    sjf() {
        const copyProcesses = this.cloneProcesses;

        const keyframes = [];
        const queueKeyframes = [];

        const queueCPU = [];

        for (let i = 0; i < this._totalTime; i++) {
            let keyframe = {};

            //Add the processes with arrival time equal to i (time) to the queueCPU
            for (const process of copyProcesses) {
                if (process.arrivalTime === i) {
                    process.originalBurstTime = process.burstTime;
                    queueCPU.push(process);
                }
            }

            //If the queueCPU is not empty then execute the first process in the queueCPU
            if (queueCPU.length > 0) {
                const process = queueCPU[0];
                keyframe[process.name] = process.burstTime;
                process.burstTime--;


                //If the queueCPU has more than one process then add -1 (waiting) to the keyframe
                if (queueCPU.length > 1) {
                    for (let j = 1; j < queueCPU.length; j++) {
                        const process = queueCPU[j];
                        keyframe[process.name] = -1;
                    }
                }

                //Add the queueCPU to the queueKeyframes
                queueKeyframes.push(queueCPU.map((process) => process.name));

                //If the process is finished then remove it from the queueCPU and sort the queueCPU for shortest job first
                if (process.burstTime === 0) {
                    process.completionTime = i + 1;
                    queueCPU.shift();
                    queueCPU.sort((a, b) => {
                        return a.burstTime - b.burstTime;
                    });
                }
            }

            keyframes.push(keyframe);
        }


        //Calculate the waiting time and turnaround time
        let totalWaitingTime = 0; //declare total waiting time
        let totalTurnaroundTime = 0; //declare total turnaround time

        for (const process of copyProcesses) {
            process.turnaroundTime = process.completionTime - process.arrivalTime; //turn around time =  completion time - arrival time
            process.waitingTime = process.turnaroundTime - process.originalBurstTime; //waiting time = turnaround time - burst time

            totalWaitingTime += process.waitingTime; //total waiting time = total waiting time + waiting time
            totalTurnaroundTime += process.turnaroundTime; //total turnaround time = total turnaround time + turnaround time
        }

        const averageWaitingTime = totalWaitingTime / copyProcesses.length; //average waiting time = total waiting time / number of processes
        const averageTurnaroundTime = totalTurnaroundTime / copyProcesses.length; //average turnaround time = total turnaround time / number of processes

        return {
            keyframes,
            queueKeyframes,
            averageWaitingTime: averageWaitingTime,
            averageTurnaroundTime: averageTurnaroundTime
        };
    }

    //srjf algorithm
    srtf() {
        const copyProcesses = this.cloneProcesses;

        const keyframes = [];
        const queueKeyframes = [];

        const queueCPU = [];

        for (let i = 0; i < this._totalTime; i++) {
            let keyframe = {};

            //Add the processes with arrival time equal to i (time) to the queueCPU
            for (const process of copyProcesses) {
                if (process.arrivalTime === i) {
                    process.originalBurstTime = process.burstTime;
                    queueCPU.push(process);
                }
            }

            //If the queueCPU is not empty then execute the first process in the queueCPU
            if (queueCPU.length > 0) {
                //Sort the queueCPU for shortest remaining time first
                queueCPU.sort((a, b) => {
                    return a.burstTime - b.burstTime;
                });

                const process = queueCPU[0];
                keyframe[process.name] = process.burstTime;
                process.burstTime--;

                //If the queueCPU has more than one process then add -1 (waiting) to the keyframe
                if (queueCPU.length > 1) {
                    for (let j = 1; j < queueCPU.length; j++) {
                        const process = queueCPU[j];
                        keyframe[process.name] = -1;
                    }
                }

                //Add the queueCPU to the queueKeyframes
                queueKeyframes.push(queueCPU.map((process) => process.name));

                //If the process is finished then remove it from the queueCPU
                if (process.burstTime === 0) {
                    process.completionTime = i + 1;
                    queueCPU.shift();
                }
            }

            keyframes.push(keyframe);
        }

        //Calculate the waiting time and turnaround time
        let totalWaitingTime = 0; //declare total waiting time
        let totalTurnaroundTime = 0; //declare total turnaround time

        for (const process of copyProcesses) {
            process.turnaroundTime = process.completionTime - process.arrivalTime; //turn around time =  completion time - arrival time
            process.waitingTime = process.turnaroundTime - process.originalBurstTime; //waiting time = turnaround time - burst time

            totalWaitingTime += process.waitingTime; //total waiting time = total waiting time + waiting time
            totalTurnaroundTime += process.turnaroundTime; //total turnaround time = total turnaround time + turnaround time
        }

        const averageWaitingTime = totalWaitingTime / copyProcesses.length; //average waiting time = total waiting time / number of processes
        const averageTurnaroundTime = totalTurnaroundTime / copyProcesses.length; //average turnaround time = total turnaround time / number of processes

        return {
            keyframes,
            queueKeyframes,
            averageWaitingTime: averageWaitingTime,
            averageTurnaroundTime: averageTurnaroundTime
        };
    }

    //rr algorithm
    rr(quantum) {
        if (quantum <= 0) {
            return {
                keyframes: [],
                queueKeyframes: [],
            }
        }

        const copyProcesses = this.cloneProcesses;

        const keyframes = [];
        const queueKeyframes = [];

        const queueCPU = [];
        let count = 0;

        for (let i = 0; i < this._totalTime; i++) {
            let keyframe = {};

            //Add the processes with arrival time equal to i (time) to the queueCPU
            for (const process of copyProcesses) {
                if (process.arrivalTime === i) {
                    process.originalBurstTime = process.burstTime; //original burst time
                    queueCPU.push(process);
                }
            }

            //Shift queueCPU after quantum time
            if (queueCPU.length > 0) {
                const process = queueCPU[0];
                if (count % quantum === 0 && count !== 0) {
                    queueCPU.shift();
                    queueCPU.push(process);
                }
            }

            //If the queueCPU is not empty then execute the first process in the queueCPU
            if (queueCPU.length > 0) {
                const process = queueCPU[0];
                keyframe[process.name] = process.burstTime;
                process.burstTime--;
                count++;

                //If the queueCPU has more than one process then add -1 (waiting) to the keyframe
                if (queueCPU.length > 1) {
                    for (let j = 1; j < queueCPU.length; j++) {
                        const process = queueCPU[j];
                        keyframe[process.name] = -1;
                    }
                }

                //Add the queueCPU to the queueKeyframes
                queueKeyframes.push(queueCPU.map((process) => process.name));

                //If the process is finished then remove it from the queueCPU
                if (process.burstTime === 0) {
                    count = 0;
                    process.completionTime = i + 1;
                    queueCPU.shift();
                }
            }

            keyframes.push(keyframe);
        }

        //Calculate the waiting time and turnaround time
        let totalWaitingTime = 0; //declare total waiting time
        let totalTurnaroundTime = 0; //declare total turnaround time

        for (const process of copyProcesses) {
            process.turnaroundTime = process.completionTime - process.arrivalTime; //turn around time =  completion time - arrival time
            process.waitingTime = process.turnaroundTime - process.originalBurstTime; //waiting time = turnaround time - burst time

            totalWaitingTime += process.waitingTime; //total waiting time = total waiting time + waiting time
            totalTurnaroundTime += process.turnaroundTime; //total turnaround time = total turnaround time + turnaround time
        }

        const averageWaitingTime = totalWaitingTime / copyProcesses.length; //average waiting time = total waiting time / number of processes
        const averageTurnaroundTime = totalTurnaroundTime / copyProcesses.length; //average turnaround time = total turnaround time / number of processes

        return {
            keyframes,
            queueKeyframes,
            averageWaitingTime: averageWaitingTime,
            averageTurnaroundTime: averageTurnaroundTime
        };
    }
}
