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
    let stateChangeBuffer = 1000; // 1 second buffer to make it more responsive
    let sessionActive = false;
    let csvGenerated = false; // To ensure only one CSV is generated
    let useStopwatch = false; // Added flag to use stopwatch


    // Load the chime sound
    const chime = new Audio('chime.mp3'); // Update this path

    // Setup to track the interval time between chimes
    let lastChimeTime = Date.now();

    // Take in the input from the timer adjuster to add to the totalSeconds time
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
        useStopwatch = document.getElementById("useStopwatch").checked; // Check if using stopwatch

        if (useStopwatch) {
            interval = setInterval(updateStopwatch, 1000);
        } else {
            interval = setInterval(updateTimer, 1000);
            updateTimer();
        }


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

    function updateStopwatch() {
        document.getElementById("timer").textContent = new Date(secondsElapsed * 1000).toISOString().substr(14, 5);
        secondsElapsed++;
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

/*
    // Calibrate WebGazer for increased accuracy
    function startCalibration() {
        const calibrationPoints = 9; // Number of calibration points
        const calibrationDelay = 1000; // Delay between calibration points in ms

        const calibrationContainer = document.createElement('div');
        calibrationContainer.style.position = 'absolute';
        calibrationContainer.style.top = '0';
        calibrationContainer.style.left = '0';
        calibrationContainer.style.width = '100%';
        calibrationContainer.style.height = '100%';
        calibrationContainer.style.display = 'flex';
        calibrationContainer.style.alignItems = 'center';
        calibrationContainer.style.justifyContent = 'center';
        calibrationContainer.style.zIndex = '1000';
        document.body.appendChild(calibrationContainer);

        let calibrationIndex = 0;

        function nextCalibrationPoint() {
            if (calibrationIndex < calibrationPoints) {
                const point = document.createElement('div');
                point.style.width = '10px';
                point.style.height = '10px';
                point.style.backgroundColor = 'red';
                point.style.position = 'absolute';
                point.style.borderRadius = '50%';

                const positions = [
                    { top: '10%', left: '10%' },
                    { top: '10%', left: '50%' },
                    { top: '10%', left: '90%' },
                    { top: '50%', left: '10%' },
                    { top: '50%', left: '50%' },
                    { top: '50%', left: '90%' },
                    { top: '90%', left: '10%' },
                    { top: '90%', left: '50%' },
                    { top: '90%', left: '90%' }
                ];

                point.style.top = positions[calibrationIndex].top;
                point.style.left = positions[calibrationIndex].left;

                calibrationContainer.innerHTML = '';
                calibrationContainer.appendChild(point);

                webgazer.addCalibrationPoint(point);

                calibrationIndex++;
                setTimeout(nextCalibrationPoint, calibrationDelay);
            } else {
                calibrationContainer.remove();
                webgazer.pause().then(() => webgazer.resume()); // Reinitialize after calibration
            }
        }

        nextCalibrationPoint();
    }
*/

    webgazer.setGazeListener(function (data, elapsedTime) {
        if (data == null || !sessionActive) {
            return;
        }
        const x = data.x;
        const y = data.y;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const thresholdX = 0.2; // Adjust the horizontal threshold to 25%
        const thresholdY = 0.2; // Adjust the vertical threshold to 25%

        const focusIndicator = document.getElementById("focusIndicator");
        const chimeIntervalDisplay = document.getElementById("chimeInterval");
        let newState = currentState;

        if (
            x < screenWidth * thresholdX ||
            x > screenWidth * (1 - thresholdX) ||
            y < screenHeight * thresholdY ||
            y > screenHeight * (1 - thresholdY)
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
                chimeIntervalDisplay.textContent = `You lasted: ${timeSinceLastChime} seconds in focus`;
                chime.play(); // Play chime sound
                lastChimeTime = now;
                focusIndicator.textContent = "You're NOT in Focus";
                
                focusIndicator.classList.add("away");
                focusIndicator.classList.remove("focus");
            } else {
                focusIndicator.textContent = "You are in Focus";
                focusIndicator.classList.add("focus");
                focusIndicator.classList.remove("away");
            }
        }

        if (currentState === "focus") {
            focusTime++;
        } else {
            awayTime++;
        }
    }).begin();

    
    webgazer.showVideoPreview(true)  // Show video preview
            .showPredictionPoints(true) // Show prediction points (gaze dots)
            .applyKalmanFilter(true);   // Apply Kalman filter to smoothen gaze prediction

    // Adjust video container size
    webgazer.setVideoViewerSize(320, 240); // Adjust these values as needed

    // Function to handle resizing
    function resizeVideoContainer() {
        var videoContainer = document.getElementById('webgazerVideoContainer');
        var overlay = document.getElementById('webgazerFaceOverlay');
        var width = 320; // Set your desired width
        var height = 240; // Set your desired height

        videoContainer.style.width = width + 'px';
        videoContainer.style.height = height + 'px';
        overlay.style.width = width + 'px';
        overlay.style.height = height + 'px';
    }

    resizeVideoContainer();

});
