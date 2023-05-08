updateResult = (mode) => {
    let tempResult;

    switch (mode) {
        case 'fcfs': tempResult = fcfs(processes, total); break;
        case 'sjf': tempResult = sjf(processes, total); break;
        case 'srtf': tempResult = srtf(processes, total); break;
        case 'rr': tempResult = rr(processes, total, 2); break;
    }

    result = tempResult.keyframes;
}


updateRow = (container, processKeyframes, step) => {
    let time = 0;

    while (time <= step) {
        if (processKeyframes[time] === undefined) {
            container.appendChild(rectBuilder('empty-rect'));
        } else if (processKeyframes[time] === -1) {
            if (processKeyframes[time - 1] === undefined) {
                container.appendChild(rectBuilder('border-left-rect'));
            }
            container.appendChild(rectBuilder('transparent-rect'));
            if (time === step) {
                container.appendChild(rectBuilder('border-right-rect'));
            }
        } else if (processKeyframes[time] === 0) {
            container.appendChild(rectBuilder('empty-rect'));
        } else if (processKeyframes[time] > 0) {
            container.appendChild(rectBuilder('filled-rect'));
        }
        time++;
    }
}

//draw the simulation based on the current step
const p = []
const simulation = document.querySelector('#simulation');

updateSimulation = (step) => {
    const container = document.createElement('div');

    for (const process of processes) {
        //Create a div for each process
        p[process.name] = document.createElement('div');
        p[process.name].className = 'line';

        //Get the keyframes for each process
        const processKeyframes = result.map((keyframe) => {
            return keyframe[process.name];
        });

        //Update the row for each process
        updateRow(p[process.name], processKeyframes, step);
        addEmptyRect(p[process.name], step + 1, max);
    }

    //Add the processes to the simulation
    ruler = createRuler(2, max);
    container.appendChild(ruler);

    for (const process of processes) {
        container.appendChild(p[process.name])
    }

    simulation.innerHTML = '';
    simulation.appendChild(container);
}