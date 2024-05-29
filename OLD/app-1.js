document.addEventListener("DOMContentLoaded", function () {
    let totalSeconds = 120;
    let interval;
    let timerInterval;
    let secondsElapsed = 0;
    let focusTime = 0;
    let awayTime = 0;
    let focusData = [];
    let awayData = [];
    let lastStateChange = Date.now();
    let currentState = "focus";
    let stateChangeBuffer = 2000; // 2 seconds buffer
    let sessionActive = false;
    let csvGenerated = false; // To ensure only one CSV is generated

    // Load the chime sound
    const chime = new Audio('chime.mp3'); // Update this path

    let lastChimeTime = Date.now();

    function adjustTime(seconds) {
        totalSeconds += seconds;
        if (totalSeconds < 0) totalSeconds = 0;
        document.getElementById("timeAdjust").textContent = new Date(totalSeconds * 1000).toISOString().substr(14, 5);
        document.getElementById("timer").textContent = new Date(totalSeconds * 1000).toISOString().substr(14, 5);
    }

    function startFocus() {
        const goalText = document.getElementById("goalInput").value;
        document.getElementById("goalDisplay").textContent = goalText;
        document.getElementById("startScreen").classList.remove("active");
        document.getElementById("startScreen").style.display = "none";
        document.getElementById("focusScreen").classList.add("active");
        document.getElementById("focusScreen").style.display = "flex";

        secondsElapsed = 0;
        focusTime = 0;
        awayTime = 0;
        focusData = [];
        awayData = [];
        sessionActive = true;
        csvGenerated = false; // Reset CSV generation flag

        interval = setInterval(updateTimer, 1000);
        updateTimer();

        timerInterval = setInterval(() => {
            const timestamp = new Date().toISOString();
            if (currentState === "focus") {
                focusData.push({ time: focusTime, timestamp });
            } else {
                awayData.push({ time: awayTime, timestamp });
            }
        }, 1000);
    }

    function updateTimer() {
        const currentTime = totalSeconds - secondsElapsed;
        document.getElementById("timer").textContent = new Date(currentTime * 1000).toISOString().substr(14, 5);
        secondsElapsed++;
        if (currentTime <= 0) {
            stopSession();
        }
    }

    function stopSession() {
        clearInterval(interval);
        clearInterval(timerInterval);
        sessionActive = false;
        document.getElementById("focusScreen").classList.remove("active");
        document.getElementById("focusScreen").style.display = "none";
        document.getElementById("resultScreen").classList.add("active");
        document.getElementById("resultScreen").style.display = "flex";
        document.getElementById("resultText").textContent = `Total time: ${new Date(secondsElapsed * 1000).toISOString().substr(14, 5)}\nTime in focus: ${new Date(focusTime * 1000).toISOString().substr(14, 5)}\nTime away: ${new Date(awayTime * 1000).toISOString().substr(14, 5)}`;
        if (!csvGenerated) {
            downloadCSV();
            csvGenerated = true;
        }
        drawGraph();
    }

    function resetSession() {
        document.getElementById("resultScreen").classList.remove("active");
        document.getElementById("resultScreen").style.display = "none";
        document.getElementById("startScreen").classList.add("active");
        document.getElementById("startScreen").style.display = "flex";
        document.getElementById("timer").textContent = new Date(totalSeconds * 1000).toISOString().substr(14, 5);
        totalSeconds = 120;
        document.getElementById("timeAdjust").textContent = "02:00";
    }

    function downloadCSV() {
        const data = [["State", "Time (s)", "Timestamp"]];
        focusData.forEach(entry => data.push(["Focus", entry.time, entry.timestamp]));
        awayData.forEach(entry => data.push(["Away", entry.time, entry.timestamp]));

        let csvContent = "data:text/csv;charset=utf-8," 
            + data.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "focus_away_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function drawGraph() {
        const ctx = document.getElementById('focusAwayChart').getContext('2d');
        const labels = focusData.concat(awayData).map(entry => entry.timestamp);
        labels.sort();

        const focusTimeData = focusData.map(entry => ({ x: entry.timestamp, y: entry.time }));
        const awayTimeData = awayData.map(entry => ({ x: entry.timestamp, y: entry.time }));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Focus Time',
                        data: focusTimeData,
                        borderColor: 'green',
                        fill: false
                    },
                    {
                        label: 'Away Time',
                        data: awayTimeData,
                        borderColor: 'red',
                        fill: false
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'second'
                        }
                    }
                }
            }
        });
    }

    document.getElementById("startFocusButton").addEventListener("click", startFocus);
    document.getElementById("decreaseTime").addEventListener("click", () => adjustTime(-120));
    document.getElementById("increaseTime").addEventListener("click", () => adjustTime(120));
    document.getElementById("stopSessionButton").addEventListener("click", stopSession);
    document.getElementById("resetSessionButton").addEventListener("click", resetSession);

    webgazer.setGazeListener(function (data, elapsedTime) {
        if (data == null || !sessionActive) {
            return;
        }
        const x = data.x;
        const y = data.y;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const threshold = 0.1; // 10% margin for determining focus

        const focusIndicator = document.getElementById("focusIndicator");
        let newState = currentState;

        if (
            x < screenWidth * threshold ||
            x > screenWidth * (1 - threshold) ||
            y < screenHeight * threshold ||
            y > screenHeight * (1 - threshold)
        ) {
            newState = "away";
        } else {
            newState = "focus";
        }

        const now = Date.now();
        if (newState !== currentState && now - lastStateChange >= stateChangeBuffer) {
            currentState = newState;
            lastStateChange = now;
            if (currentState === "away") {
                const timeSinceLastChime = ((now - lastChimeTime) / 1000).toFixed(1);
                console.log(`Looking away from the screen. Time since last chime: ${timeSinceLastChime} seconds.`);
                chime.play(); // Play chime sound
                lastChimeTime = now;
                focusIndicator.textContent = "Away";
                focusIndicator.className = "away";
            } else {
                console.log("Looking at the screen.");
                focusIndicator.textContent = "Focus";
                focusIndicator.className = "focus";
            }
        }

        if (currentState === "focus") {
            focusTime++;
        } else {
            awayTime++;
        }
    }).begin();

    webgazer.showVideoPreview(true)
        .showPredictionPoints(true)
        .applyKalmanFilter(true);

    // Remove the WebGazer comment box if it exists
    const webgazerCommentBox = document.getElementById('webgazerCommentBox');
    if (webgazerCommentBox) {
        webgazerCommentBox.style.display = 'none';
    }
});
