let totalSeconds = 120;
let interval;
let timerInterval;
let secondsElapsed = 0;
let focusTime = 0;
let awayTime = 0;
let focusData = [];
let awayData = [];

function adjustTime(seconds) {
totalSeconds += seconds;
document.getElementById("timeAdjust").textContent = new Date(
    totalSeconds * 1000
)
    .toISOString()
    .substr(14, 5);
}

function startFocus() {
document.getElementById("startScreen").classList.add("hidden");
document.getElementById("focusScreen").classList.remove("hidden");
document.getElementById("goalDisplay").textContent =
    document.getElementById("goalInput").value;
secondsElapsed = 0;
focusTime = 0;
awayTime = 0;
focusData = [];
awayData = [];
interval = setInterval(() => {
    const currentTime = totalSeconds - secondsElapsed;
    document.getElementById("timer").textContent = new Date(
    currentTime * 1000
    )
    .toISOString()
    .substr(14, 5);
    secondsElapsed++;
    if (currentTime <= 0) {
    stopSession();
    }
}, 1000);

timerInterval = setInterval(() => {
    focusData.push(focusTime);
    awayData.push(awayTime);
    // Update focus and away times
    if (document.getElementById("focusIndicator").classList.contains("focus")) {
    focusTime++;
    } else {
    awayTime++;
    }
}, 1000);
}

function stopSession() {
clearInterval(interval);
clearInterval(timerInterval);
document.getElementById("focusScreen").classList.add("hidden");
document.getElementById("resultScreen").classList.remove("hidden");
document.getElementById(
    "resultText"
).textContent = `Total time: ${new Date(secondsElapsed * 1000)
    .toISOString()
    .substr(14, 5)}\nTime in focus: ${new Date(focusTime * 1000)
    .toISOString()
    .substr(14, 5)}\nTime away: ${new Date(awayTime * 1000)
    .toISOString()
    .substr(14, 5)}`;
renderChart();
}

function resetSession() {
document.getElementById("resultScreen").classList.add("hidden");
document.getElementById("startScreen").classList.remove("hidden");
document.getElementById("timer").textContent = "02:00";
totalSeconds = 120;
document.getElementById("timeAdjust").textContent = "2:00";
}

function renderChart() {
const ctx = document.getElementById('focusChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
    labels: ['Focus Time', 'Away Time'],
    datasets: [{
        label: 'Time (seconds)',
        data: [focusTime, awayTime],
        backgroundColor: ['#4caf50', '#f44336']
    }]
    },
    options: {
    scales: {
        y: {
        beginAtZero: true
        }
    }
    }
});
}