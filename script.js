// Function to handle the sound, toggle mode, glow, countdown, and looping
function playSound(key) {

    // Select the audio element using the semantic data-key
    const audio = document.querySelector(`audio[data-key="${key}"]`);

    // Select the <li> element for the visual key
    const keyItem = document.querySelector(`li[data-key="${key}"]`);

    // Select the countdown display inside the key
    const countdownDisplay = keyItem.querySelector('.countdown');

    // Guard Clause: Exit if no audio or key element exists
    if (!audio || !keyItem) return;

    // ---------------------------------------------------------
    // ALWAYS show the glow when the button is clicked
    // ---------------------------------------------------------

    // Add the visual "playing" class
    keyItem.classList.add('playing');

    // Remove the playing class after the animation
    setTimeout(() => keyItem.classList.remove('playing'), 100);

    // ---------------------------------------------------------
    // TOGGLE MODE: If this sound is already looping, stop it
    // ---------------------------------------------------------
    if (audio.isLooping) {

        // Stop the loop and fade out
        stopLoop(audio, countdownDisplay);

        // Do not start a new loop
        return;
    }

    // Mark this audio as looping
    audio.isLooping = true;

    // Reset audio so it can play instantly again
    audio.currentTime = 0;

    // Ensure the sound starts at full volume
    audio.volume = 1;

    // Play the sound immediately
    audio.play();

    // ---------------------------------------------------------
    // COUNTDOWN TIMER — show seconds remaining
    // ---------------------------------------------------------

    // Start at 60 seconds
    let secondsRemaining = 60;

    // Display the countdown immediately
    countdownDisplay.textContent = `${secondsRemaining}s`;

    // Update the countdown every second
    audio.countdownInterval = setInterval(() => {

        // Reduce the seconds
        secondsRemaining--;

        // Update the display
        countdownDisplay.textContent = `${secondsRemaining}s`;

        // When countdown hits 0, stop updating
        if (secondsRemaining <= 0) {
            clearInterval(audio.countdownInterval);
        }

    }, 1000);

    // ---------------------------------------------------------
    // LOOP LOGIC — play the sound repeatedly for 1 minute
    // ---------------------------------------------------------

    // Store the time when looping should stop (60 seconds from now)
    let loopEndTime = Date.now() + 60000;

    // Save the loopEndTime on the audio so stopLoop() can access it
    audio.loopEndTime = loopEndTime;

    // Function that handles repeating the sound
    function loopAudio() {

        // If looping was canceled manually, stop immediately
        if (!audio.isLooping) return;

        // If the current time has passed the loop end time...
        if (Date.now() >= audio.loopEndTime) {

            // Fade out gently
            fadeOut(audio);

            // Mark as stopped
            audio.isLooping = false;

            // Remove countdown
            countdownDisplay.textContent = "";

            return;
        }

        // Otherwise, restart the sound from the beginning
        audio.currentTime = 0;
        audio.play();

        // When the sound finishes, call loopAudio again
        audio.onended = loopAudio;
    }

    // Start the looping process
    loopAudio();
}

// ---------------------------------------------------------
// STOP LOOPING IMMEDIATELY (toggle off)
// ---------------------------------------------------------
function stopLoop(audio, countdownDisplay) {

    // Mark this audio as no longer looping
    audio.isLooping = false;

    // Stop the loop callback immediately
    audio.onended = null;

    // Stop the countdown timer
    clearInterval(audio.countdownInterval);

    // Remove countdown text
    countdownDisplay.textContent = "";

    // Pause the sound immediately
    audio.pause();

    // Reset playback position so fade-out starts cleanly
    audio.currentTime = 0;

    // Start a soft fade-out (sound will finish only the tiny buffered slice)
    // fadeOut(audio);
}

// ---------------------------------------------------------
// SOFT FADE-OUT FUNCTION
// ---------------------------------------------------------
function fadeOut(audio) {

    // How long the fade-out should last (8 seconds)
    let fadeDuration = 8000;

    // How often we reduce the volume (every 50ms)
    let fadeStep = 50;

    // How much volume to subtract each step
    let fadeAmount = audio.volume / (fadeDuration / fadeStep);

    // Repeatedly lower the volume until it reaches zero
    let fadeInterval = setInterval(() => {

        // If there's still volume left, reduce it
        if (audio.volume - fadeAmount > 0) {
            audio.volume -= fadeAmount;

        // Otherwise, stop the sound completely
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeInterval);
        }

    }, fadeStep);
}

// ---------------------------------------------------------
// KEYBOARD SUPPORT
// ---------------------------------------------------------
window.addEventListener('keydown', function (event) {

    // Convert key to lowercase so "A" and "a" both work
    playSound(event.key.toLowerCase());
});

// ---------------------------------------------------------
// CLICK SUPPORT
// ---------------------------------------------------------
document.querySelector('.keys').addEventListener('click', function (event) {

    // Find the closest <li> with a data-key attribute
    const keyItem = event.target.closest('li[data-key]');

    // If the click wasn't on a key, do nothing
    if (!keyItem) return;

    // Play the sound for that key
    playSound(keyItem.dataset.key);
});
