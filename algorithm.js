//Copy the processes array
copy = (processes) => {
    return processes.map((process) => {
        return { ...process };
    });
}

//Get the total burst time
totalBurstTime = (processes) => {
    return processes.reduce((total, process) => {
        return total + process.burstTime;
    }, 0);
}

totalTime = (processes) => {
    const minArrivalTime = processes.reduce((min, process) => {
        return process.arrivalTime < min ? process.arrivalTime : min;
    }, processes[0].arrivalTime)

    return totalBurstTime(processes) + minArrivalTime;
}

let total = 0;

//fcfs algorithm
fcfs = (processes, total) => {
    const copyProcesses = copy(processes);

    let keyframes = [];
    let queueKeyframes = [];

    let queue = [];

    for (let i = 0; i < total; i++) {
        let keyframe = {};

        //Add the processes with arrival time equal to i (time) to the queue
        for (const process of copyProcesses) {
            if (process.arrivalTime === i) {
                queue.push(process);
            }
        }

        //If the queue is not empty then execute the first process in the queue
        if (queue.length > 0) {
            const process = queue[0];
            keyframe[process.name] = process.burstTime;
            process.burstTime--;

            //If the queue has more than one process then add -1 (waiting) to the keyframe
            if (queue.length > 1) {
                for (let j = 1; j < queue.length; j++) {
                    const process = queue[j];
                    keyframe[process.name] = -1;
                }
            }

            //If the process is finished then remove it from the queue
            if (process.burstTime === 0) {
                queue.shift();
            }
        }

        queueKeyframes.push(queue.map((process) => process.name));
        keyframes.push(keyframe);
    }

    return {
        keyframes,
        queueKeyframes,
    };
}

//sjf algorithm
sjf = (processes, total) => {
    const copyProcesses = copy(processes);

    let keyframes = [];
    let queueKeyframes = [];

    let queue = [];

    for (let i = 0; i < total; i++) {
        let keyframe = {};

        //Add the processes with arrival time equal to i (time) to the queue
        for (const process of copyProcesses) {
            if (process.arrivalTime === i) {
                queue.push(process);
            }
        }

        //If the queue is not empty then execute the first process in the queue
        if (queue.length > 0) {
            const process = queue[0];
            keyframe[process.name] = process.burstTime;
            process.burstTime--;


            //If the queue has more than one process then add -1 (waiting) to the keyframe
            if (queue.length > 1) {
                for (let j = 1; j < queue.length; j++) {
                    const process = queue[j];
                    keyframe[process.name] = -1;
                }
            }

            //If the process is finished then remove it from the queue and sort the queue for shortest job first
            if (process.burstTime === 0) {
                queue.shift();
                queue.sort((a, b) => {
                    return a.burstTime - b.burstTime;
                });
            }
        }

        queueKeyframes.push(queue);
        keyframes.push(keyframe);
    }

    return {
        keyframes,
        queueKeyframes,
    };
}

//srjf algorithm
srtf = (processes, total) => {
    const copyProcesses = copy(processes);

    let keyframes = [];
    let queueKeyframes = [];

    let queue = [];

    for (let i = 0; i < total; i++) {
        let keyframe = {};

        //Add the processes with arrival time equal to i (time) to the queue
        for (const process of copyProcesses) {
            if (process.arrivalTime === i) {
                queue.push(process);
            }
        }

        //If the queue is not empty then execute the first process in the queue
        if (queue.length > 0) {
            //Sort the queue for shortest remaining time first
            queue.sort((a, b) => {
                return a.burstTime - b.burstTime;
            });

            const process = queue[0];
            keyframe[process.name] = process.burstTime;
            process.burstTime--;

            //If the queue has more than one process then add -1 (waiting) to the keyframe
            if (queue.length > 1) {
                for (let j = 1; j < queue.length; j++) {
                    const process = queue[j];
                    keyframe[process.name] = -1;
                }
            }

            //If the process is finished then remove it from the queue
            if (process.burstTime === 0) {
                queue.shift();
            }
        }

        queueKeyframes.push(queue);
        keyframes.push(keyframe);
    }

    return {
        keyframes,
        queueKeyframes,
    };
}

//rr algorithm
rr = (processes, total, quantum) => {
    const copyProcesses = copy(processes);

    let keyframes = [];
    let queueKeyframes = [];

    let queue = [];
    let count = 0;

    for (let i = 0; i < total; i++) {
        let keyframe = {};

        //Add the processes with arrival time equal to i (time) to the queue
        for (const process of copyProcesses) {
            if (process.arrivalTime === i) {
                queue.push(process);
            }
        }

        //If the queue is not empty then execute the first process in the queue and shift it to the end of the queue after quantum time
        if (queue.length > 0) {
            const process = queue[0];
            if (count % quantum === 0 && count !== 0) {
                queue.shift();
                queue.push(process);
            }
        }

        //If the queue is not empty then execute the first process in the queue
        if (queue.length > 0) {
            const process = queue[0];
            keyframe[process.name] = process.burstTime;
            process.burstTime--;
            count++;

            //If the queue has more than one process then add -1 (waiting) to the keyframe
            if (queue.length > 1) {
                for (let j = 1; j < queue.length; j++) {
                    const process = queue[j];
                    keyframe[process.name] = -1;
                }
            }

            //If the process is finished then remove it from the queue
            if (process.burstTime === 0) {
                count = 0;
                queue.shift();
            }
        }

        queueKeyframes.push(queue);
        keyframes.push(keyframe);
    }

    return {
        keyframes,
        queueKeyframes,
    };
}
