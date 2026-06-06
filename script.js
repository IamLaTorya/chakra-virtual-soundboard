/* FUNCTION: playSound()
This function handles everything that happens when a key is pressed or tapped.
It controls glow, toggle mode, looping, countdown, and fade-out. */
function playSound(key) {
   /* Finds the audio element that matches the key pressed.
      This lets the function know which sound to play. */
   const audio = document.querySelector(`audio[data-key="${key}"]`);
   /* Finds the visual button element that matches the key.
      This lets the function update the glow and countdown. */
   const keyItem = document.querySelector(`li[data-key="${key}"]`);
   /* Finds the countdown text inside the key.
      This is where the remaining seconds will appear. */
   const countdownDisplay = keyItem.querySelector('.countdown');

   /* Stops the function if the key pressed does not match a sound.
      This prevents errors when pressing unrelated keys. */
   if (!audio || !keyItem) return;
   /* GLOW EFFECT — visual feedback */
   /*clear any previous glow timeout so they do not stack*/
   // clearTimeout(keyItem.glowTimeout);
   /* Adds the glowing class to the key.
      This makes the key light up when pressed. */
   keyItem.classList.add('playing');
   /* Sets a timeout to remove the glow after 60 seconds.
   //    This ensures the glow does not stay on indefinitely. */
   // keyItem.glowTimeout = setTimeout(() => keyItem.classList.remove('playing'), 60000);
   keyItem.classList.add('playing');
   // /* Removes the glow after 60000ms.
   //    This keeps the glow quick and responsive. */
   // setTimeout(() => keyItem.classList.remove('playing'), 60000);

   /* TOGGLE MODE — turn sound off */
   /* Checks if the sound is already looping.
      If it is, pressing again will stop it. */
   if (audio.isLooping) {
      /* Stops the loop and clears the countdown.
         This turns the sound off immediately. */
      stopLoop(audio, countdownDisplay, keyItem);
      /* Exits the function so no new loop starts.
         This completes the toggle-off action. */
      return;
   }

   /* START LOOPING — turn sound on */
   /* Marks the audio as currently looping.
      This helps the toggle system know its state. */
   audio.isLooping = true;

   /* Resets the sound to the beginning.
      This ensures it starts cleanly every time. */
   audio.currentTime = 0;

   /* Sets the volume to full before playing.
      This ensures consistent sound each time. */
   audio.volume = 1;

   /* Starts playing the sound immediately.
      This begins the first loop cycle. */
   audio.play();

   /* REAL‑TIME COUNTDOWN — accurate timer with no drift */
   /* Calculates the exact time when the loop should end.
      This creates a precise 60-second timer. */
   const endTime = Date.now() + 60000;
   /* Updates the countdown text smoothly.
      Uses real time so it stays accurate. */
   function updateCountdown() {
      /* Stops updating if the sound was toggled off.
         This prevents the timer from running in the background. */
      if (!audio.isLooping) return;
      /* Calculates how much time is left in milliseconds.
         Math.max prevents negative numbers. */
      const remaining = Math.max(0, endTime - Date.now());
      /* Converts the remaining time into whole seconds.
         This is what the user sees on the key. */
      const seconds = Math.floor(remaining / 1000);
      /* Updates the countdown text on the key.
         Shows the user how much time is left. */
      countdownDisplay.textContent = `${seconds} s`;
      /* If time is still left, update again on the next animation frame.
         This keeps the countdown smooth and accurate. */
      if (remaining > 0) {
         requestAnimationFrame(updateCountdown);
         /* If time is up, clear the countdown text.
            This signals that the loop has finished. */
      } else {
         // Clear countdown text
         countdownDisplay.textContent = "";
         // Remove glow the instant the countdown hits zero
         keyItem.classList.remove('playing');
         // Stop looping immediately
         audio.isLooping = false;
         //Prevent loopAudio from restarting the sound
         audio.onended = null;
         // Begin fade-out smoothly
         fadeOut(audio);
      }
   }


   /* Starts the countdown timer.
      This begins the real-time updates. */
   updateCountdown();

   /* LOOP LOGIC — repeat sound until time runs out */
   /* Stores the end time on the audio object.
      This lets loopAudio() know when to stop. */
   audio.loopEndTime = endTime;

   /* Handles restarting the sound each time it finishes.
      This creates the looping effect. */
   function loopAudio() {
      /* Stops looping if the user toggled the sound off.
         This prevents unwanted repeats. */
      if (!audio.isLooping) return;
      /* Checks if the 60 seconds have passed.
         If so, the loop should end. */
      if (Date.now() >= audio.loopEndTime) {
         /* Starts a soft fade-out for a smooth ending.
            This avoids an abrupt stop. */
         fadeOut(audio);
         /* Marks the audio as no longer looping.
            This resets the toggle state. */
         audio.isLooping = false;
         //Stop any glow timeout and remove glow immediately
         audio.onended = null;
         /* Clears the countdown text.
            This visually shows the loop has ended. */
         countdownDisplay.textContent = "";
         // Remove glow when loop ends naturally
         keyItem.classList.remove('playing');
         // Clear the glow timeout
         return;
      }
      /* Restarts the sound from the beginning.
         This continues the loop cycle. */
      audio.currentTime = 0;
      audio.play();
      /* When the sound finishes, call loopAudio again.
         This keeps the loop going until time is up. */
      audio.onended = loopAudio;
   }
   /* Starts the looping process.
      This begins the repeated playback. */
   loopAudio();
}

/* FUNCTION: stopLoop()
Stops the sound immediately when toggled off */
function stopLoop(audio, countdownDisplay, keyItem) {
   /* Marks the audio as no longer looping.
      This tells the system the sound is off. */
   audio.isLooping = false;
   /* Removes any pending loop callback.
      This prevents the sound from restarting. */
   audio.onended = null;
   /* Clears the countdown text.
      This visually resets the key. */
   countdownDisplay.textContent = "";
   /* Pauses the audio instantly.
      This stops the sound right away. */
   audio.pause();
   /* Resets the audio position to the start.
      This prepares it for the next play. */
   audio.currentTime = 0;
   /* Optional fade-out can be used instead of instant stop.
      This creates a softer ending if enabled. */
   // fadeOut(audio);
   // Remove the glow immediately when stopping
   keyItem.classList.remove('playing');
}

/* FUNCTION: fadeOut()
   Gradually lowers volume for a smooth stop */
function fadeOut(audio) {
   /* Sets how long the fade-out lasts.
      This creates a gentle 8-second fade. */
   let fadeDuration = 8000;
   /* Sets how often the volume decreases.
      This creates small, smooth steps. */
   let fadeStep = 50;
   /* Calculates how much volume to remove each step.
      This ensures the fade is even. */
   let fadeAmount = audio.volume / (fadeDuration / fadeStep);
   /* Repeatedly lowers the volume until it reaches zero.
      This creates the fading effect. */
   let fadeInterval = setInterval(() => {
      /* If there is still volume left, reduce it.
         This slowly quiets the sound. */
      if (audio.volume - fadeAmount > 0) {
         audio.volume -= fadeAmount;
         /* If volume is at zero, stop the sound completely.
            This ends the fade-out cleanly. */
      } else {
         audio.volume = 0;
         audio.pause();
         clearInterval(fadeInterval);
      }
   }, fadeStep);
}

/* KEYBOARD SUPPORT — allows A–J keys to trigger sounds*/
window.addEventListener('keydown', function (event) {
   /* Converts the pressed key to lowercase.
      This ensures both "A" and "a" work the same. */
   playSound(event.key.toLowerCase());
});

/*CLICK SUPPORT — allows tapping keys on screen */
document.querySelector('.keys').addEventListener('click', function (event) {
   /* Finds the closest key element that was clicked.
      This allows clicking on text or the box itself. */
   const keyItem = event.target.closest('li[data-key]');
   /* If the click wasn’t on a valid key, do nothing.
      This prevents errors from clicking empty space. */
   if (!keyItem) return;
   /* Plays the sound for the clicked key.
      This makes the soundboard work with taps. */
   playSound(keyItem.dataset.key);
});
