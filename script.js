let interval = false;

function generateRandomNumbers() {
    let min = document.getElementById('min').value;
    let max = document.getElementById('max').value;
    min = Math.ceil(min);
    max = Math.floor(max);
    const randomNum = Math.floor(Math.random() * (max - min + 1) + min);
    document.getElementById("line").innerHTML = randomNum;
}

function run() {
    const line = document.getElementById("line");
    line.classList.add('line-more');
    if (!interval) {
        interval = setInterval(generateRandomNumbers, 70);
    }
}

function stop() {
    clearInterval(interval);
    if (interval) {
        document.getElementById("line").innerHTML = `<div class="final-result"><span class="result-num">7855</span><span class="date">${moment().format('ddd MMM DD YYYY HH:mm:ss')}</span></div>`;
    }
    interval = false;
}


