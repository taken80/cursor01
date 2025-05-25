// 遊戲配置
/**
 * @typedef {object} GameConfig
 * @property {number} gridSize - The number of cells in one row/column of the game grid.
 * @property {number} initialSpeed - The initial speed of the snake in milliseconds (interval time).
 * @property {number} speedIncrease - The factor by which speed increases (e.g., 0.9 means 10% faster).
 * @property {number} initialSnakeLength - The starting length of the snake.
 * @property {number} canvasSize - The width and height of the game canvas in pixels.
 */

/** @type {GameConfig} */
const config = {
    gridSize: 20,
    initialSpeed: 200,
    speedIncrease: 0.9, // 每次加速時的速度倍數
    initialSnakeLength: 3,
    canvasSize: 400,
};

// 遊戲狀態
/**
 * @typedef {object} GameState
 * @property {Array<{x: number, y: number}>} snake - An array of objects representing the snake's segments. Each segment has x and y coordinates.
 * @property {{x: number, y: number} | null} food - An object representing the food's position. Null if no food.
 * @property {'up' | 'down' | 'left' | 'right'} direction - The current direction of the snake's movement.
 * @property {number} score - The player's current score.
 * @property {number | null} gameLoop - The ID of the interval timer for the game loop. Null if the game is not running.
 * @property {boolean} isPaused - True if the game is paused, false otherwise.
 * @property {number} currentSpeed - The current speed of the snake (interval time).
 */

/** @type {GameState} */
const gameState = {
    snake: [],
    food: null,
    direction: 'right',
    score: 0,
    gameLoop: null,
    isPaused: false,
    currentSpeed: config.initialSpeed,
};

// DOM 元素
/**
 * @typedef {object} GameElements
 * @property {HTMLCanvasElement} canvas - The main game canvas.
 * @property {HTMLElement} mainMenu - The main menu screen element.
 * @property {HTMLElement} gameScreen - The game play screen element.
 * @property {HTMLElement} gameOver - The game over screen element.
 * @property {HTMLButtonElement} startBtn - The button to start the game.
 * @property {HTMLButtonElement} pauseBtn - The button to pause/resume the game.
 * @property {HTMLButtonElement} restartBtn - The button to restart the game after game over.
 * @property {HTMLButtonElement} menuBtn - The button to return to the main menu from game over screen.
 * @property {HTMLElement} currentScore - The element displaying the current score during gameplay.
 * @property {HTMLElement} finalScore - The element displaying the final score on the game over screen.
 * @property {HTMLElement} highScore - The element displaying the highest score on the main menu.
 */

/** @type {GameElements} */
const elements = {
    canvas: document.getElementById('game-canvas'),
    mainMenu: document.getElementById('main-menu'),
    gameScreen: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    restartBtn: document.getElementById('restart-btn'),
    menuBtn: document.getElementById('menu-btn'),
    currentScore: document.getElementById('current-score'),
    finalScore: document.getElementById('final-score'),
    highScore: document.getElementById('high-score'),
};

/** @type {CanvasRenderingContext2D} */
const ctx = elements.canvas.getContext('2d');

// 初始化遊戲
/**
 * Initializes or resets the game state to start a new game.
 * Sets up the canvas, snake, food, score, and other game variables.
 */
function initGame() {
    // 設置畫布大小
    elements.canvas.width = config.canvasSize;
    elements.canvas.height = config.canvasSize;
    
    // 初始化蛇
    gameState.snake = [];
    for (let i = 0; i < config.initialSnakeLength; i++) {
        gameState.snake.push({
            x: Math.floor(config.gridSize / 2) - i,
            y: Math.floor(config.gridSize / 2)
        });
    }
    
    // 初始化其他遊戲狀態
    gameState.direction = 'right';
    gameState.score = 0;
    gameState.currentSpeed = config.initialSpeed;
    gameState.isPaused = false;
    
    // 生成第一個食物
    generateFood();
    
    // 更新分數顯示
    updateScore();
}

// 生成食物
/**
 * Generates a new piece of food at a random position on the grid.
 * Ensures that the food does not appear on the snake's body.
 */
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * config.gridSize),
            y: Math.floor(Math.random() * config.gridSize)
        };
    } while (isOnSnake(newFood));
    
    gameState.food = newFood;
}

// 檢查位置是否在蛇身上
/**
 * Checks if a given position is currently occupied by any part of the snake.
 * @param {{x: number, y: number}} position - The position to check (grid coordinates).
 * @returns {boolean} True if the position is on the snake, false otherwise.
 */
function isOnSnake(position) {
    return gameState.snake.some(segment => 
        segment.x === position.x && segment.y === position.y
    );
}

// 更新遊戲狀態
/**
 * Main game loop function. Called at regular intervals.
 * Updates the snake's position, checks for collisions and food consumption, and redraws the game.
 */
function updateGame() {
    if (gameState.isPaused) return;
    
    // 計算新的蛇頭位置
    const head = { ...gameState.snake[0] };
    switch (gameState.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // 檢查碰撞
    if (isCollision(head)) {
        endGame();
        return;
    }
    
    // 移動蛇
    gameState.snake.unshift(head);
    
    // 檢查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        updateScore();
        generateFood();
        increaseSpeed();
    } else {
        gameState.snake.pop();
    }
    
    // 繪製遊戲畫面
    drawGame();
}

// 檢查碰撞
/**
 * Checks if the snake has collided with the walls or itself.
 * @param {{x: number, y: number}} position - The position of the snake's head to check.
 * @returns {boolean} True if a collision occurred, false otherwise.
 */
function isCollision(position) {
    // 檢查牆壁碰撞
    if (position.x < 0 || position.x >= config.gridSize ||
        position.y < 0 || position.y >= config.gridSize) {
        return true;
    }
    
    // 檢查自身碰撞
    return isOnSnake(position);
}

// 繪製遊戲畫面
/**
 * Draws the entire game scene on the canvas.
 * This includes the grid, the snake, and the food.
 */
function drawGame() {
    // 清空畫布
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, config.canvasSize, config.canvasSize);
    
    // 繪製網格
    ctx.strokeStyle = '#eee';
    const cellSize = config.canvasSize / config.gridSize;
    for (let i = 0; i <= config.gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, config.canvasSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(config.canvasSize, i * cellSize);
        ctx.stroke();
    }
    
    // 繪製蛇
    const snakeLength = gameState.snake.length;
    const headColor = '#FFD700'; // Golden Yellow
    const bodyColor = '#FFD700'; // Golden Yellow
    const tailColor = '#DAA520'; // GoldenRod (darker yellow for tail)
    const eyeColor = '#000'; // Black

    gameState.snake.forEach((segment, index) => {
        if (index === 0) { // Head
            ctx.fillStyle = headColor;
        } else if (index === snakeLength - 1 && snakeLength > 1) { // Tail (only if snake has more than 1 segment)
            ctx.fillStyle = tailColor;
        } else { // Body
            ctx.fillStyle = bodyColor;
        }
        
        ctx.fillRect(
            segment.x * cellSize,
            segment.y * cellSize,
            cellSize - 1,
            cellSize - 1
        );
        
        // 繪製蛇眼睛（只在蛇頭上）
        if (index === 0) {
            ctx.fillStyle = eyeColor;
            const eyeSize = cellSize / 6;
            const eyeOffset = cellSize / 4;
            
            // 根據方向繪製眼睛
            switch (gameState.direction) {
                case 'right':
                    ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                    break;
                case 'left':
                    ctx.fillRect(segment.x * cellSize + eyeOffset - eyeSize, segment.y * cellSize + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * cellSize + eyeOffset - eyeSize, segment.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                    break;
                case 'up':
                    ctx.fillRect(segment.x * cellSize + eyeOffset, segment.y * cellSize + eyeOffset - eyeSize, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset - eyeSize, segment.y * cellSize + eyeOffset - eyeSize, eyeSize, eyeSize);
                    break;
                case 'down':
                    ctx.fillRect(segment.x * cellSize + eyeOffset, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset - eyeSize, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize);
                    break;
            }
            // No need to reset fillStyle to snake color here, as the next loop iteration or drawing step will set its own color.
        }
    });
    
    // 繪製食物
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * cellSize + cellSize / 2,
        gameState.food.y * cellSize + cellSize / 2,
        cellSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 更新分數
/**
 * Updates the score display on the screen.
 * Also updates the high score if the current score is higher.
 */
function updateScore() {
    elements.currentScore.textContent = gameState.score;
    const highScore = localStorage.getItem('highScore') || 0;
    if (gameState.score > highScore) {
        localStorage.setItem('highScore', gameState.score);
        elements.highScore.textContent = gameState.score;
    }
}

// 增加速度
/**
 * Increases the game speed by reducing the interval of the game loop.
 * Called when the snake eats food.
 */
function increaseSpeed() {
    gameState.currentSpeed *= config.speedIncrease;
    clearInterval(gameState.gameLoop);
    gameState.gameLoop = setInterval(updateGame, gameState.currentSpeed);
}

// 結束遊戲
/**
 * Ends the current game session.
 * Stops the game loop and displays the game over screen.
 */
function endGame() {
    clearInterval(gameState.gameLoop);
    elements.finalScore.textContent = gameState.score;
    elements.gameScreen.classList.add('hidden');
    elements.gameOver.classList.remove('hidden');
}

// 開始新遊戲
/**
 * Starts a new game.
 * Hides menu/game over screens, shows the game screen, initializes the game, and starts the game loop.
 */
function startNewGame() {
    elements.mainMenu.classList.add('hidden');
    elements.gameOver.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    initGame();
    gameState.gameLoop = setInterval(updateGame, gameState.currentSpeed);
}

// 暫停遊戲
/**
 * Toggles the pause state of the game.
 * Updates the pause button text accordingly.
 */
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    elements.pauseBtn.textContent = gameState.isPaused ? '繼續' : '暫停'; // Note: Text changes based on language
}

// 返回主菜單
/**
 * Returns the player to the main menu from the game over or game screen.
 * Stops the game loop and manages screen visibility.
 */
function returnToMenu() {
    clearInterval(gameState.gameLoop);
    elements.gameOver.classList.add('hidden');
    elements.gameScreen.classList.add('hidden');
    elements.mainMenu.classList.remove('hidden');
}

// 鍵盤控制
/**
 * Handles keyboard input for controlling the snake.
 * Allows arrow keys and W, A, S, D keys for movement.
 * Prevents the snake from reversing its direction directly.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleKeyPress(event) {
    if (gameState.isPaused) return;
    
    const key = event.key.toLowerCase();
    const newDirection = {
        'arrowup': 'up',
        'arrowdown': 'down',
        'arrowleft': 'left',
        'arrowright': 'right',
        'w': 'up',
        's': 'down',
        'a': 'left',
        'd': 'right'
    }[key];
    
    if (newDirection) {
        // 防止180度轉向
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (opposites[newDirection] !== gameState.direction) {
            gameState.direction = newDirection;
        }
    }
}

// 事件監聽器
/** Attaches event listeners to DOM elements and the document. */
document.addEventListener('keydown', handleKeyPress);
elements.startBtn.addEventListener('click', startNewGame);
elements.pauseBtn.addEventListener('click', togglePause);
elements.restartBtn.addEventListener('click', startNewGame);
elements.menuBtn.addEventListener('click', returnToMenu);

// 載入最高分數
/** Loads and displays the high score from local storage when the game starts. */
elements.highScore.textContent = localStorage.getItem('highScore') || 0; 