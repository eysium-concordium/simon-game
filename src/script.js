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

    initializeAudio() {
        try {
            // Create audio context only when needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // Resume audio context on user interaction
                document.addEventListener('click', () => {
                    if (this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                }, { once: true });
            }
            this.loadSounds();
        } catch (error) {
            console.error('Audio initialization failed:', error);
            this.soundEnabled = false;
        }
    }

    loadSounds() {
        try {
            // Create oscillator for each color
            const colors = ['green', 'red', 'yellow', 'blue'];
            const frequencies = [440, 880, 660, 550]; // Different frequencies for each color

            colors.forEach((color, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequencies[index], this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Store the nodes
                this.sounds[color] = {
                    oscillator,
                    gainNode,
                    isPlaying: false
                };
            });

            // Create success sound
            const successOscillator = this.audioContext.createOscillator();
            const successGainNode = this.audioContext.createGain();
            
            successOscillator.type = 'sine';
            successOscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
            successGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            
            successOscillator.connect(successGainNode);
            successGainNode.connect(this.audioContext.destination);
            
            this.sounds.success = {
                oscillator: successOscillator,
                gainNode: successGainNode,
                isPlaying: false
            };

            // Create game over sound
            const gameOverOscillator = this.audioContext.createOscillator();
            const gameOverGainNode = this.audioContext.createGain();
            
            gameOverOscillator.type = 'sine';
            gameOverOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            gameOverGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            
            gameOverOscillator.connect(gameOverGainNode);
            gameOverGainNode.connect(this.audioContext.destination);
            
            this.sounds.gameOver = {
                oscillator: gameOverOscillator,
                gainNode: gameOverGainNode,
                isPlaying: false
            };

        } catch (error) {
            console.error('Sound loading failed:', error);
            this.soundEnabled = false;
        }
    }

    playSound(type) {
        if (!this.soundEnabled || !this.sounds[type]) return;

        try {
            const sound = this.sounds[type];
            if (sound.isPlaying) return;

            sound.isPlaying = true;
            const now = this.audioContext.currentTime;

            // Start the sound
            sound.oscillator.start(now);
            sound.gainNode.gain.setValueAtTime(0.3, now);

            // Stop the sound after a short duration
            sound.oscillator.stop(now + 0.1);
            sound.gainNode.gain.setValueAtTime(0, now + 0.1);

            // Reset the playing state after the sound finishes
            setTimeout(() => {
                sound.isPlaying = false;
            }, 100);

        } catch (error) {
            console.error('Sound playback failed:', error);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.querySelector('.sound-toggle');
        soundToggle.textContent = this.soundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
        localStorage.setItem('soundEnabled', this.soundEnabled);
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