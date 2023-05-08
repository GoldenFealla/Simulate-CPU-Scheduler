//Create rectangle based on the class name
rectBuilder = (className) => {
    const rect = document.createElement('div');
    rect.classList.add(className);
    return rect;
}


//Add empty rectangels after the process ends
addEmptyRect = (container, step, max) => {
    let time = step;

    while (time < max) {
        container.appendChild(rectBuilder('empty-rect'));
        time++;
    }
}

const sliderInput = document.querySelector('#slider-input')
sliderInput.min = 1;
sliderInput.max = 1;
sliderInput.value = 1;

let step = 1;

sliderInput.addEventListener('input', (event) => {
    const { value } = event.target;
    step = value - 1;

    updateSimulation(step)
    changeSlide(value)
})

changeSlide = (value) => {
    sliderInput.style.background = `
        linear-gradient(to right, var(--primary-color) ${Math.floor((value - 1) * 100 / max)}%, var(--background-color-light) ${Math.floor(value * 100 / max)}%)
    `;
}

const selectType = document.querySelector('#type');
const display = document.querySelector('#display');
const slider = document.querySelector('#slider');

selectType.addEventListener('change', (event) => {
    const { value } = event.target;
    updateResult(value);
    dialog.close();
});

const openDialog = document.querySelector('#open');
const closeDialog = document.querySelector('#close');
const dialog = document.querySelector('#dialog');

openDialog.addEventListener('click', () => {
    dialog.showModal();
});

closeDialog.addEventListener('click', () => {
    updateResult(selectType.value);
    updateSimulation(total - 1);

    max = total
    sliderInput.max = max;

    dialog.close();
});



//ruler
createRuler = (step, max) => {
    const ruler = document.createElement('div');
    ruler.classList.add('ruler');

    let time = 0;
    ruler.appendChild(rectBuilder('ruler-point-rect'));

    while (time < max - 1) {
        for (let i = 0; i < step; i++) {
            if (time + i >= max) break;
            ruler.appendChild(rectBuilder('ruler-line-rect'));
        }
        time += step;
        ruler.appendChild(rectBuilder('ruler-point-rect'));
    }

    return ruler;
}