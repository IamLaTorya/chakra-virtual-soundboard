/* FUNCTION: playSound()
Handles: glow, toggle mode, looping, countdown, fade-out */
function playSound(key) {

    // Select the audio element that matches the pressed key
    const audio = document.querySelector(`audio[data-key="${key}"]`);

    // Select the visual <li> key element
    const keyItem = document.querySelector(`li[data-key="${key}"]`);

    // Select the countdown text inside the key
    const countdownDisplay = keyItem.querySelector('.countdown');

    // Stop if the key or audio doesn't exist
    if (!audio || !keyItem) return;

/* GLOW EFFECT — always flash when clicked */

    // Add the glowing "playing" class
    keyItem.classList.add('playing');

    // Remove the glow after the animation finishes
    setTimeout(() => keyItem.classList.remove('playing'), 100);

/* TOGGLE MODE — if already looping, stop it */
    if (audio.isLooping) {

        // Stop the loop and reset visuals
        stopLoop(audio, countdownDisplay);

        // Do not start a new loop
        return;
    }

/* START LOOPING — mark audio as active */

    // Mark this audio as currently looping
    audio.isLooping = true;

    // Reset audio to the beginning
    audio.currentTime = 0;

    // Ensure full volume at start
    audio.volume = 1;

    // Play the sound immediately
    audio.play();

/* 
REAL‑TIME COUNTDOWN (no drift, no lag)
Uses Date.now() + requestAnimationFrame() */

    // Set the exact time when the loop should end (60 seconds)
    const endTime = Date.now() + 60000;

    // Function that updates the countdown smoothly
    function updateCountdown() {

        // Stop updating if the user toggles the sound off
        if (!audio.isLooping) return;

        // Calculate how many milliseconds remain
        const remaining = Math.max(0, endTime - Date.now());

        // Convert remaining time to whole seconds
        const seconds = Math.floor(remaining / 1000);

        // Update the countdown text
        countdownDisplay.textContent = `${seconds}s`;

        // If time remains, keep updating every animation frame
        if (remaining > 0) {
            requestAnimationFrame(updateCountdown);

        // If time is up, clear the countdown
        } else {
            countdownDisplay.textContent = "";
        }
    }

    // Start the countdown loop
    updateCountdown();

/* LOOP LOGIC — repeat audio until 60 seconds is up */

    // Save the end time so loopAudio() can check it
    audio.loopEndTime = endTime;

    // Function that restarts the audio when it ends
    function loopAudio() {

        // Stop immediately if user toggled off
        if (!audio.isLooping) return;

        // If time is up, fade out and stop looping
        if (Date.now() >= audio.loopEndTime) {

            // Begin soft fade-out
            fadeOut(audio);

            // Mark as no longer looping
            audio.isLooping = false;

            // Remove countdown text
            countdownDisplay.textContent = "";

            return;
        }

        // Restart the sound from the beginning
        audio.currentTime = 0;
        audio.play();

        // When the sound ends, call loopAudio again
        audio.onended = loopAudio;
    }

    // Begin the looping process
    loopAudio();
}

/* FUNCTION: stopLoop()
Stops looping immediately when user toggles off */
function stopLoop(audio, countdownDisplay) {

    // Mark audio as no longer looping
    audio.isLooping = false;

    // Remove any pending loop callback
    audio.onended = null;

    // Clear countdown text
    countdownDisplay.textContent = "";

    // Stop audio instantly
    audio.pause();

    // Reset playback position
    audio.currentTime = 0;

    // Optional: fade out instead of instant stop
    // fadeOut(audio);
}

/* FUNCTION: fadeOut()
Softly reduces volume over time for a gentle stop */
function fadeOut(audio) {

    // Total fade-out duration (8 seconds)
    let fadeDuration = 8000;

    // How often to reduce volume (every 50ms)
    let fadeStep = 50;

    // Amount of volume to subtract each step
    let fadeAmount = audio.volume / (fadeDuration / fadeStep);

    // Interval that gradually lowers the volume
    let fadeInterval = setInterval(() => {

        // If volume is still above zero, reduce it
        if (audio.volume - fadeAmount > 0) {
            audio.volume -= fadeAmount;

        // Otherwise, stop completely
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeInterval);
        }

    }, fadeStep);
}

/* KEYBOARD SUPPORT — press A, S, D, etc. */
window.addEventListener('keydown', function (event) {

    // Convert key to lowercase so "A" and "a" both work
    playSound(event.key.toLowerCase());
});

/* CLICK SUPPORT — tap or click a chakra key */
document.querySelector('.keys').addEventListener('click', function (event) {

    // Find the closest <li> with a data-key attribute
    const keyItem = event.target.closest('li[data-key]');

    // If the click wasn't on a key, do nothing
    if (!keyItem) return;

    // Play the sound for that key
    playSound(keyItem.dataset.key);
});