## File: index.html
Issues:
- Complex UI with multiple screens and modes (timer/stopwatch)
- Lacks a toggle for video preview
- Calibration UI needs improvement

## File: app.js
### Issues:
- Complex timer logic with both countdown and stopwatch modes
- Calibration function exists but may need refinement
- No function to toggle video preview
- Contains unused functions (e.g., downloadCSV, drawGraph)

## File: style.css
### Issues:
- Styles for unused elements (e.g., coordinate table)
- May need adjustments for simplified UI

## Gaps to address:
1. Implement a simple countdown timer
2. Add a toggle for video preview
3. Improve and integrate calibration process
4. Simplify UI to focus on core functionality
5. Remove unused features and code

#### Iteration 1
### What Worked
- The app opens and functions
- Changing time on the timer is responsive and changes minutes as expected
- Video toggle works
- Timer works for countdown
- Calibration exercise functions as expected

### What Didn't
- Calibration instructions should tell you to move both your eyes and mouse to each dot
- Toggle video doesn't hide the faceoverlay or face feedback boxes
- The timer and timedisplay show the same time. this seems redundant
- The chime.mp3 doesn't play when user is distracted
- Start/calibrate/toggle buttons should be vertically stacked
- No way to reset time when it's stopped

--

#### Iteration 2
### What Worked
- Toggle video works across all related elements
- Start/Stop and Reset buttons works as intended
- Calibration looks better
- 

### What Didn't
- The onclick calibration didn't work, and stalled calibration
- There is no way to exit calibration mode once it starts
- Make the ToggleVideoButton look like a toggle on the screen
- The video feed, overlay, and container aren't centered on the screen

---

#### Iteration 3
### What Worked
- Video is centered on screen

### What Didn't
- Video and overlay and feedback should be 30% smaller
- When I said 'toggle' I meant a componetnt that looks like a switch on the screen
- Add a way for the user to adjust the threshold for distraction

---

#### Iteration 4
### What Worked
- Toggle components looks good
- Threshold management works as intended
- Core functionality works well

### What Didn't
- Toggle should be selected and in 'hide video' state by default
- The focus tracker should work even if calibration has not happened
- All fonts should be Nunito
- Improve the layout and spacing of teh buttons on the screen

---
#### Iteration 5
### What Worked
- looks really good
- functions as desired

### What Didn't
- if the user has not calibrated since opening the window, the first 'start' should first trigger a calbiration exercise, and then the trakcing should start after teh calibration ends.

---

#### Iteration 6
### What Worked
- looks really good
- functions as desired
- calibration triggers well

### What Didn't
- Allow usersd to show/hide the calibrate, video visible, and threshold components. unhide on default

#### Iteration 7
### What Worked
- show/hide works

### What Didn't
- Video hidden toggle is not correctly listed as active by default
- When teh advanced settings is open no other components should move on the screen. is this because of relative position?