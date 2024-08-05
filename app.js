document.addEventListener("DOMContentLoaded", function () {
    let totalSeconds = 300; // 5 minutes default
    let timerInterval;
    let isTracking = false;
    let lastDistractionTime = null;
    let distractionThreshold = 0.3;
    let lastTime = null;
    let isCalibrated = false;
    
    const timeDisplay = document.getElementById("timeDisplay");
    const startButton = document.getElementById("startButton");
    const resetButton = document.getElementById("resetButton");
    const calibrateButton = document.getElementById("calibrateButton");
    const toggleVideoCheckbox = document.getElementById("toggleVideoCheckbox");
    const toggleVideoLabel = document.getElementById("toggleVideoLabel");
    const focusIndicator = document.getElementById("focusIndicator");
    const lastDistraction = document.getElementById("lastDistraction");
    const calibrationArea = document.getElementById("calibrationArea");
    const calibrationDot = document.getElementById("calibrationDot");
    const chimeSound = document.getElementById("chimeSound");
    const thresholdSlider = document.getElementById("distractionThreshold");
    const thresholdValue = document.getElementById("thresholdValue");
    
    const toggleAdvancedSettingsButton = document.getElementById("toggleAdvancedSettings");
    const advancedSettingsContainer = document.getElementById("advancedSettingsContainer");

    function toggleAdvancedSettings() {
        toggleAdvancedSettingsButton.classList.toggle("active");
        advancedSettingsContainer.classList.toggle("visible");
    }

    toggleAdvancedSettingsButton.addEventListener("click", toggleAdvancedSettings);

    function updateTimeDisplay() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.textContent = timeString;
    }

    function adjustTime(seconds) {
        totalSeconds += seconds;
        if (totalSeconds < 60) totalSeconds = 60; // Minimum 1 minute
        if (totalSeconds > 3600) totalSeconds = 3600; // Maximum 1 hour
        updateTimeDisplay();
    }

    function startTracking() {
        lastTime = totalSeconds;
        if (!isTracking) {
            if (!isCalibrated) {
                startCalibration(() => {
                    isCalibrated = true;
                    startTrackingTimer();
                });
            } else {
                startTrackingTimer();
            }
        } else {
            stopTracking();
        }
    }

    function startTrackingTimer() {
        isTracking = true;
        startButton.textContent = "Stop";
        timerInterval = setInterval(() => {
            totalSeconds--;
            updateTimeDisplay();
            if (totalSeconds <= 0) {
                stopTracking();
            }
        }, 1000);
    }

    function stopTracking() {
        isTracking = false;
        startButton.textContent = "Start";
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTracking();
        totalSeconds = lastTime;
        updateTimeDisplay();
    }

    function toggleVideo() {
        const videoPreview = document.getElementById("webgazerVideoFeed");
        const faceOverlay = document.getElementById("webgazerFaceOverlay");
        const faceFeedbackBox = document.getElementById("webgazerFaceFeedbackBox");
        
        const isVisible = toggleVideoCheckbox.checked;
        
        [videoPreview, faceOverlay, faceFeedbackBox].forEach(element => {
            if (element) {
                element.style.display = isVisible ? "block" : "none";
            }
        });

        toggleVideoLabel.textContent = isVisible ? "Video Visible" : "Video Hidden";
    }

    function startCalibration(callback) {
        calibrationArea.style.display = "flex";
        const calibrationPoints = [
            { x: "10%", y: "10%" }, { x: "50%", y: "10%" }, { x: "90%", y: "10%" },
            { x: "10%", y: "50%" }, { x: "50%", y: "50%" }, { x: "90%", y: "50%" },
            { x: "10%", y: "90%" }, { x: "50%", y: "90%" }, { x: "90%", y: "90%" }
        ];
        let currentPoint = 0;

        function showNextPoint() {
            if (currentPoint < calibrationPoints.length) {
                calibrationDot.style.left = calibrationPoints[currentPoint].x;
                calibrationDot.style.top = calibrationPoints[currentPoint].y;
                currentPoint++;
                
                setTimeout(showNextPoint, 2000); // Move to next point after 2 seconds
            } else {
                endCalibration(callback);
            }
        }

        showNextPoint();
    }

    function endCalibration(callback) {
        calibrationArea.style.display = "none";
        webgazer.setGazeListener(gazeListener);
        if (callback) callback();
    }

    function gazeListener(data, elapsedTime) {
        if (data == null || !isTracking) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (
            data.x < screenWidth * distractionThreshold ||
            data.x > screenWidth * (1 - distractionThreshold) ||
            data.y < screenHeight * distractionThreshold ||
            data.y > screenHeight * (1 - distractionThreshold)
        ) {
            focusIndicator.textContent = "Distracted";
            focusIndicator.className = "distracted";
            if (!lastDistractionTime) {
                lastDistractionTime = new Date();
                lastDistraction.textContent = "Last Distraction: Just now";
                chimeSound.play();
            }
        } else {
            focusIndicator.textContent = "Focused";
            focusIndicator.className = "focused";
            if (lastDistractionTime) {
                const now = new Date();
                const timeSinceDistraction = Math.round((now - lastDistractionTime) / 1000);
                lastDistraction.textContent = `Last Distraction: ${timeSinceDistraction} seconds ago`;
                lastDistractionTime = null;
            }
        }
    }

    document.getElementById("decreaseTime").addEventListener("click", () => adjustTime(-60));
    document.getElementById("increaseTime").addEventListener("click", () => adjustTime(60));
    startButton.addEventListener("click", startTracking);
    resetButton.addEventListener("click", resetTimer);
    calibrateButton.addEventListener("click", () => startCalibration(() => { isCalibrated = true; }));
    toggleVideoCheckbox.addEventListener("change", toggleVideo);
    document.getElementById("exitCalibration").addEventListener("click", () => endCalibration(() => { isCalibrated = true; }));

    thresholdSlider.addEventListener("input", function() {
        distractionThreshold = this.value / 100;
        thresholdValue.textContent = this.value;
    });

    // Initialize WebGazer
    webgazer.setGazeListener(() => {}).begin();
    webgazer.showVideoPreview(true).showPredictionPoints(true).applyKalmanFilter(true);

    // Set initial states
    updateTimeDisplay();
    toggleVideoCheckbox.checked = true;
    toggleVideo(); // Set initial video state
    thresholdValue.textContent = thresholdSlider.value;

    // Show advanced settings by default
    toggleAdvancedSettings();
});