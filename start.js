const startButton = document.querySelector('#start');

startSimulate = (start) => {
    for (let i = start; i < max; i++) {
        setTimeout(() => {
            updateSimulation(i);
            sliderInput.value = i + 1;
        }, 200 * (i - start));
    }
}

startButton.addEventListener('click', () => {
    startSimulate(step);
});