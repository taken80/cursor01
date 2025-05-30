// 遊戲配置
const config = {
    gridSize: 20,
    initialSpeed: 200,
    speedIncrease: 0.9, // 每次加速時的速度倍數
    initialSnakeLength: 3,
    canvasSize: 400,
};

// 遊戲狀態
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

const ctx = elements.canvas.getContext('2d');

// 初始化遊戲
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
function isOnSnake(position) {
    return gameState.snake.some(segment => 
        segment.x === position.x && segment.y === position.y
    );
}

// 更新遊戲狀態
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
    ctx.fillStyle = '#4CAF50';
    gameState.snake.forEach((segment, index) => {
        ctx.fillRect(
            segment.x * cellSize,
            segment.y * cellSize,
            cellSize - 1,
            cellSize - 1
        );
        
        // 繪製蛇眼睛（只在蛇頭上）
        if (index === 0) {
            ctx.fillStyle = '#000';
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
            ctx.fillStyle = '#4CAF50';
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
function updateScore() {
    elements.currentScore.textContent = gameState.score;
    const highScore = localStorage.getItem('highScore') || 0;
    if (gameState.score > highScore) {
        localStorage.setItem('highScore', gameState.score);
        elements.highScore.textContent = gameState.score;
    }
}

// 增加速度
function increaseSpeed() {
    gameState.currentSpeed *= config.speedIncrease;
    clearInterval(gameState.gameLoop);
    gameState.gameLoop = setInterval(updateGame, gameState.currentSpeed);
}

// 結束遊戲
function endGame() {
    clearInterval(gameState.gameLoop);
    elements.finalScore.textContent = gameState.score;
    elements.gameScreen.classList.add('hidden');
    elements.gameOver.classList.remove('hidden');
}

// 開始新遊戲
function startNewGame() {
    elements.mainMenu.classList.add('hidden');
    elements.gameOver.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    initGame();
    gameState.gameLoop = setInterval(updateGame, gameState.currentSpeed);
}

// 暫停遊戲
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    elements.pauseBtn.textContent = gameState.isPaused ? '繼續' : '暫停';
}

// 返回主菜單
function returnToMenu() {
    clearInterval(gameState.gameLoop);
    elements.gameOver.classList.add('hidden');
    elements.gameScreen.classList.add('hidden');
    elements.mainMenu.classList.remove('hidden');
}

// 鍵盤控制
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
document.addEventListener('keydown', handleKeyPress);
elements.startBtn.addEventListener('click', startNewGame);
elements.pauseBtn.addEventListener('click', togglePause);
elements.restartBtn.addEventListener('click', startNewGame);
elements.menuBtn.addEventListener('click', returnToMenu);

// 載入最高分數
elements.highScore.textContent = localStorage.getItem('highScore') || 0; 