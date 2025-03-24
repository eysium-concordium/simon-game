class SimonGame {
    constructor() {
        this.colors = ["red", "green", "yellow", "blue"];
        this.computerSequence = [];
        this.playerSequence = [];
        this.level = 0;
        this.score = 0;
        this.isPlaying = false;
        this.highScore = localStorage.getItem('simonHighScore') || 0;
        this.currentMode = 'classic';
        this.currentSpeed = 'normal';
        this.playerColors = {
            player1: 'green',
            player2: 'red'
        };
        this.activePlayer = 'player1';
        this.eliminatedPlayers = new Set();
        this.soundEnabled = true;
        this.audioContext = null;
        this.sounds = {};
        
        // DOM Elements
        this.buttons = document.querySelectorAll(".btn");
        this.startButton = document.querySelector(".s-btn");
        this.display = document.querySelector(".display");
        this.scoreDisplay = document.querySelector(".score");
        this.modeButtons = document.querySelectorAll(".mode-btn");
        this.multiplayerSetup = document.querySelector(".multiplayer-setup");
        this.player1ColorSelect = document.querySelector(".player1-color");
        this.player2ColorSelect = document.querySelector(".player2-color");
        this.difficultyButtons = document.querySelectorAll(".difficulty-btn");
        this.soundToggle = document.querySelector(".sound-toggle");
        
        // Bind methods
        this.startGame = this.startGame.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleModeChange = this.handleModeChange.bind(this);
        this.handlePlayerColorChange = this.handlePlayerColorChange.bind(this);
        this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
        this.toggleSound = this.toggleSound.bind(this);
        
        // Initialize
        this.initializeGame();
        this.initializeAudio();
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
        } catch (error) {
            console.error('Audio initialization failed:', error);
            this.soundEnabled = false;
        }
    }

    async loadSounds() {
        const soundFiles = {
            green: 'green.mp3',
            red: 'red.mp3',
            yellow: 'yellow.mp3',
            blue: 'blue.mp3',
            wrong: 'wrong.mp3',
            success: 'success.mp3',
            gameOver: 'gameover.mp3'
        };

        for (const [key, file] of Object.entries(soundFiles)) {
            try {
                const response = await fetch(`sounds/${file}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sounds[key] = audioBuffer;
            } catch (error) {
                console.error(`Failed to load sound ${key}:`, error);
            }
        }
    }

    playSound(color) {
        if (!this.soundEnabled || !this.sounds[color]) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[color];
        source.connect(this.audioContext.destination);
        source.start(0);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
        localStorage.setItem('simonSoundEnabled', this.soundEnabled);
    }

    initializeGame() {
        this.startButton.addEventListener("click", this.startGame);
        this.buttons.forEach(button => {
            button.addEventListener("click", this.handleButtonClick);
        });
        this.modeButtons.forEach(button => {
            button.addEventListener("click", this.handleModeChange);
        });
        this.player1ColorSelect.addEventListener("change", this.handlePlayerColorChange);
        this.player2ColorSelect.addEventListener("change", this.handlePlayerColorChange);
        this.difficultyButtons.forEach(button => {
            button.addEventListener("click", this.handleDifficultyChange);
        });
        this.soundToggle.addEventListener("click", this.toggleSound);
        
        // Load saved settings
        this.soundEnabled = localStorage.getItem('simonSoundEnabled') !== 'false';
        this.soundToggle.textContent = this.soundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
        
        this.updateHighScore();
    }

    handleDifficultyChange(event) {
        const speed = event.target.dataset.speed;
        this.currentSpeed = speed;
        localStorage.setItem('simonDifficulty', speed);
        
        this.difficultyButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.speed === speed) {
                btn.classList.add('active');
            }
        });
    }

    handleModeChange(event) {
        const mode = event.target.dataset.mode;
        this.currentMode = mode;
        localStorage.setItem('simonGameMode', mode);
        
        this.modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        this.multiplayerSetup.style.display = mode === 'multiplayer' ? 'block' : 'none';
        this.resetGame();
    }

    handlePlayerColorChange(event) {
        const player = event.target.classList.contains('player1-color') ? 'player1' : 'player2';
        this.playerColors[player] = event.target.value;
        localStorage.setItem(`simonPlayer${player}Color`, event.target.value);
    }

    async startGame() {
        if (this.isPlaying) return;
        
        this.resetGame();
        this.isPlaying = true;
        this.startButton.style.display = "none";
        
        if (this.currentMode === 'create') {
            this.display.textContent = "Create your sequence!";
            return;
        }
        
        await this.nextLevel();
    }

    resetGame() {
        this.computerSequence = [];
        this.playerSequence = [];
        this.level = 0;
        this.score = 0;
        this.eliminatedPlayers.clear();
        this.activePlayer = 'player1';
        this.updateScore();
        document.body.style.backgroundColor = "#2A2550";
    }

    getSpeedDelay() {
        switch(this.currentSpeed) {
            case 'fast': return 200;
            case 'expert': return 100;
            default: return 300;
        }
    }

    async nextLevel() {
        this.level++;
        this.display.textContent = `Level ${this.level}`;
        
        if (this.currentMode === 'classic' || this.currentMode === 'multiplayer') {
            const nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.computerSequence.push(nextColor);
            await this.showSequence();
        }
    }

    async showSequence() {
        for (const color of this.computerSequence) {
            await this.playColor(color);
        }
    }

    async playColor(color) {
        return new Promise(resolve => {
            this.playSound(color);
            const button = document.querySelector(`.${color}`);
            button.classList.add('active');
            
            setTimeout(() => {
                button.classList.remove('active');
                resolve();
            }, this.getSpeedDelay());
        });
    }

    handleButtonClick(event) {
        if (!this.isPlaying) return;
        
        const color = event.target.classList[1];
        this.playerSequence.push(color);
        this.playSound(color);
        this.playColor(color);
        
        if (this.currentMode === 'create') {
            this.computerSequence = [...this.playerSequence];
            this.display.textContent = "Sequence saved! Press Start to play it back.";
            this.isPlaying = false;
            this.startButton.style.display = "block";
            this.startButton.textContent = "Play Sequence";
            return;
        }
        
        this.checkSequence();
    }

    checkSequence() {
        const currentIndex = this.playerSequence.length - 1;
        const isCorrect = this.computerSequence[currentIndex] === this.playerSequence[currentIndex];
        
        if (!isCorrect) {
            if (this.currentMode === 'multiplayer') {
                this.handleMultiplayerMistake();
            } else {
                this.gameOver();
            }
            return;
        }
        
        this.score++;
        this.updateScore();
        this.playSound('success');
        
        if (this.playerSequence.length === this.computerSequence.length) {
            setTimeout(() => this.nextLevel(), 1000);
        }
    }

    handleMultiplayerMistake() {
        const currentColor = this.playerSequence[this.playerSequence.length - 1];
        const currentPlayer = this.getPlayerByColor(currentColor);
        
        if (currentPlayer) {
            this.eliminatedPlayers.add(currentPlayer);
            this.display.textContent = `${currentPlayer} is eliminated!`;
            this.playSound('wrong');
            
            if (this.eliminatedPlayers.size === 2) {
                this.gameOver();
                return;
            }
            
            this.activePlayer = this.activePlayer === 'player1' ? 'player2' : 'player1';
            this.display.textContent = `${this.activePlayer}'s turn!`;
        }
    }

    getPlayerByColor(color) {
        if (color === this.playerColors.player1) return 'player1';
        if (color === this.playerColors.player2) return 'player2';
        return null;
    }

    gameOver() {
        this.isPlaying = false;
        this.playSound('gameOver');
        document.body.style.backgroundColor = 'red';
        
        let gameOverMessage = 'Game Over!';
        if (this.currentMode === 'multiplayer') {
            const remainingPlayers = ['player1', 'player2'].filter(p => !this.eliminatedPlayers.has(p));
            if (remainingPlayers.length === 1) {
                gameOverMessage = `${remainingPlayers[0]} wins!`;
            }
        }
        
        this.display.textContent = gameOverMessage;
        this.startButton.style.display = "block";
        this.startButton.textContent = "Play Again";
        this.updateHighScore();
    }

    updateScore() {
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('simonHighScore', this.highScore);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
}); 