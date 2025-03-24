// I know that this code is not the best.
// But I created it from scratch. You can easily understand it.
// Professional version: https://github.com/subhranshuchoudhury/My-Js-Notes/blob/main/Challenge/Simon%20Game%20jQuery%20JS/game.js
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
var flag = 0;
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
    $(".lives").text("Lives: " + lives); // Display lives
  }

  while (counter == 0) {
    userArrayRecord = [];
    $(".score").text("Score: 0");
    counter++;
  }

  isGameStarted = true;
  var randomKey = Math.floor(Math.random() * 4);
  playSound(keys[randomKey]);
  $("." + keys[randomKey])
    .fadeIn(100)
    .fadeOut(100)
    .fadeIn(100);
  computerArrayRecord.push(keys[randomKey]);
  console.log("computer", computerArrayRecord);
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
      if (computerArrayRecord.length == userArrayRecord.length) {
        gameManager();
      }
    } else {
      userArrayRecord = []; // Disable clicks before clicking start button.
    }
  });
}

/****************************************/

function gameManager() {
  flag = 0;

  for (let i = 0; i < computerArrayRecord.length; i++) {
    if (computerArrayRecord[i] !== userArrayRecord[i]) {
      flag++;
    }
  }

  if (flag > 0) {
    console.log("Incorrect move! Lives left: " + lives);
    lives--; // Deduct a life
    $(".lives").text("Lives: " + lives); // Update lives display

    if (lives > 0) {
      display.innerHTML = `Wrong move! You have ${lives} lives left.`;
      playSound("wrong");
      userArrayRecord = [];
      gameOver();
    }
  } else {
    console.log("Level Up!");
    gameContinue();
  }

  userArrayRecord = [];
}

/**************************************/

function gameOver() {
  computerArrayRecord = [];
  level = 0;
  flag = 0;
  isGameStarted = false;
  counter = 0;
  score = 0;

  playSound("wrong");
  display.innerHTML = "Game Over! You ran out of lives.";
  document.body.style.backgroundColor = "red";
  startButton.style.display = "";
  startButton.innerHTML = "Restart Game!";
  $(".lives").text("Lives: " + lives); // lives display

  for (let i = 0; i < 4; i++) {
    buttons[i].style.background = "";
  }
  lives = 3;
}

/************************************/

function gameContinue() {
  level++;
  display.innerHTML = "Level: " + level;

  setTimeout(function () {
    startGame();
  }, 1000);
}

/************************************/

function instantChecker() {
  for (let i = 0; i < userArrayRecord.length; i++) {
    if (computerArrayRecord[i] == userArrayRecord[i]) {
      score++;
      $(".score").text("Score: " + score);
      console.log("Correct entry!");
    } else {
      lives--; // Reduce lives on mistake
      $(".lives").text("Lives: " + lives); // Update display

      if (lives > 0) {
        console.log("Wrong move! Lives left: " + lives);
        display.innerHTML = `Wrong move! You have ${lives} lives left.`;
        playSound("wrong");
        userArrayRecord = []; // Clear input and let the player retry
      } else {
        console.log("Game Over!");
        $(".score").text("Last Score: " + score);
        gameOver();
      }
    }
  }
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
