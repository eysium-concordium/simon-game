var keys = ["red", "green", "yellow", "blue"];
var computerArrayRecord = [];
var userArrayRecord = [];
var buttons = document.querySelectorAll(".btn");
var startButton = document.querySelector(".s-btn");
var display = document.querySelector(".display");

var level = 0;
var isGameStarted = false;
var score = 0;
var lives = 3;

/* Start Game */
function startGame() {
  if (!isGameStarted) {
    document.body.style.backgroundColor = "#2A2550";
    display.innerHTML = "Remember the blinked colors and repeat them.";
    $(".lives").text("Lives: " + lives);
    $(".score").text("Score: 0");
  }

  isGameStarted = true;
  userArrayRecord = [];
  playSequence();
  startButton.style.display = "none";
}

/* Event Listeners for Buttons */
for (let i = 0; i < 4; i++) {
  buttons[i].addEventListener("click", function (e) {
    if (isGameStarted) {
      userArrayRecord.push(e.target.innerHTML);
      playSound(e.target.innerHTML);
      selectedAnimation(e.target.innerHTML);
      instantChecker();

      if (computerArrayRecord.length === userArrayRecord.length) {
        setTimeout(gameManager, 500);
      }
    }
  });
}

/* Game Logic */
function gameManager() {
  let isCorrect = true;

  for (let i = 0; i < userArrayRecord.length; i++) {
    if (computerArrayRecord[i] !== userArrayRecord[i]) {
      isCorrect = false;
      break;
    }
  }

  if (!isCorrect) {
    lives--;
    $(".lives").text("Lives: " + lives);

    if (lives > 0) {
      display.innerHTML = `Wrong move! ${lives} lives left. Try again.`;
      playSound("wrong");
      userArrayRecord = [];
    } else {
      gameOver();
    }
  } else {
    setTimeout(gameContinue, 1000);
  }
}

/* Game Over */
function gameOver() {
  computerArrayRecord = [];
  level = 0;
  isGameStarted = false;
  score = 0;
  lives = 3;

  playSound("wrong");
  display.innerHTML = "Game Over! You ran out of lives.";
  $("body").css("animation", "flicker 1s infinite alternate");

  setTimeout(() => {
    $("body").css("animation", "");
    document.body.style.backgroundColor = "#2A2550";
  }, 2000);

  startButton.style.display = "";
  startButton.innerHTML = "Restart Game!";
  $(".lives").text("Lives: " + lives);
}

/* Continue Game */
function gameContinue() {
  level++;
  display.innerHTML = "Level: " + level;
  setTimeout(playSequence, 1000);
}

/* Play Sequence with Glow Effect */
function playSequence() {
  var randomKey = Math.floor(Math.random() * 4);
  computerArrayRecord.push(keys[randomKey]);

  userArrayRecord = [];

  let i = 0;
  function blinkNextColor() {
    if (i < computerArrayRecord.length) {
      let color = computerArrayRecord[i];
      playSound(color);

      let button = $("." + color);
      button.addClass("glow-effect");
      setTimeout(() => {
        button.removeClass("glow-effect");
      }, 300);

      i++;
      setTimeout(blinkNextColor, 600);
    }
  }
  blinkNextColor();
}

/* Instant Check on User Click */
function instantChecker() {
  for (let i = 0; i < userArrayRecord.length; i++) {
    if (computerArrayRecord[i] !== userArrayRecord[i]) {
      lives--;
      $(".lives").text("Lives: " + lives);

      if (lives > 0) {
        display.innerHTML = `Wrong move! ${lives} lives left. Try again.`;
        playSound("wrong");
        userArrayRecord = [];
      } else {
        $(".score").text("Last Score: " + score);
        gameOver();
      }
      return;
    }
  }

  score++;
  $(".score").text("Score: " + score);
}

/* Play Sound */
function playSound(name) {
  var audio = new Audio(`sounds/${name}.mp3`);
  audio.play();
  audio.currentTime = 0;
}

/* Button Animation */
function selectedAnimation(colorName) {
  $("." + colorName).addClass("glow-effect");
  setTimeout(() => {
    $("." + colorName).removeClass("glow-effect");
  }, 100);
}
