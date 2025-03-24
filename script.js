// I know that this code is not the best.
// But I created it from scratch. You can easily understand it.
// Enjoyed a lot while making the game.

/****************************************/
var keys = ["red", "green", "yellow", "blue"];
var computerArrayRecord = [];
var userArrayRecord = [];
var buttons = document.querySelectorAll(".btn");
var startButton = document.querySelector(".s-btn");
var display = document.querySelector(".display");
/**************/
var level = 0;
var isGameStarted = false;
var score = 0;
var counter = 0;
var lives = 3;

/**************/

function startGame() {
  if (!isGameStarted) {
    document.body.style.backgroundColor = "#2A2550";
    display.innerHTML =
      "Remember the blinked colors and repeat them from first blink.";
    $(".lives").text("Lives: " + lives);
  }

  while (counter === 0) {
    userArrayRecord = [];
    $(".score").text("Score: 0");
    counter++;
  }

  isGameStarted = true;
  userArrayRecord = []; // Ensure user input resets before new round starts
  playSequence();
  startButton.style.display = "none";
}

/*****************************************/

for (let i = 0; i < 4; i++) {
  buttons[i].addEventListener("click", function (e) {
    if (isGameStarted) {
      userArrayRecord.push(e.target.innerHTML);
      playSound(e.target.innerHTML);
      selectedAnimation(e.target.innerHTML);
      instantChecker();
      if (computerArrayRecord.length === userArrayRecord.length) {
        setTimeout(gameManager, 500); // Add delay before next level starts
      }
    }
  });
}

/****************************************/

function gameManager() {
  // changed the flag to boolean
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
      userArrayRecord = []; // Let the player retry the same sequence
    } else {
      gameOver();
    }
  } else {
    console.log("Level Up!");
    setTimeout(gameContinue, 1000);
  }
}

/**************************************/

function gameOver() {
  computerArrayRecord = [];
  level = 0;
  isGameStarted = false;
  counter = 0;
  score = 0;
  lives = 3; // Reset lives

  playSound("wrong");
  display.innerHTML = "Game Over! You ran out of lives.";
  document.body.style.backgroundColor = "red";
  startButton.style.display = "";
  startButton.innerHTML = "Restart Game!";
  $(".lives").text("Lives: " + lives);

  for (let i = 0; i < 4; i++) {
    buttons[i].style.background = "";
  }
}

/************************************/

function gameContinue() {
  level++;
  display.innerHTML = "Level: " + level;
  setTimeout(playSequence, 1000); // Ensure sequence blinks correctly
}

/************************************/

function playSequence() {
  var randomKey = Math.floor(Math.random() * 4);
  computerArrayRecord.push(keys[randomKey]); // Add new color to sequence
  console.log("computer", computerArrayRecord);

  userArrayRecord = []; // Reset user input before playing sequence

  let i = 0;
  function blinkNextColor() {
    if (i < computerArrayRecord.length) {
      let color = computerArrayRecord[i];
      playSound(color);
      $("." + color)
        .fadeIn(100)
        .fadeOut(100)
        .fadeIn(100);
      i++;
      setTimeout(blinkNextColor, 600); // Delay for next blink
    }
  }

  blinkNextColor(); // Start blinking sequence
}

/************************************/

function instantChecker() {
  for (let i = 0; i < userArrayRecord.length; i++) {
    if (computerArrayRecord[i] !== userArrayRecord[i]) {
      lives--;
      $(".lives").text("Lives: " + lives);

      if (lives > 0) {
        display.innerHTML = `Wrong move! ${lives} lives left. Try again.`;
        playSound("wrong");
        userArrayRecord = []; // Reset input for retry
      } else {
        $(".score").text("Last Score: " + score);
        gameOver();
      }
      return; // Stop checking further if a mistake is found
    }
  }

  // Update score if all inputs are correct
  score++;
  $(".score").text("Score: " + score);
}

/************************************/

function playSound(name) {
  var audio = new Audio(`sounds/${name}.mp3`);
  audio.play();
  audio.currentTime = 0;
}

/*************************************/

function selectedAnimation(colorName) {
  $("." + colorName).addClass("selected");
  setTimeout(function () {
    $("." + colorName).removeClass("selected");
  }, 100);
}
