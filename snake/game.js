const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 游戏状态
let snake = [{ x: 10, y: 10 }];
let dx = 0;
let dy = 0;
let foodX = 15;
let foodY = 15;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoop;

highScoreElement.textContent = highScore;

// 键盘控制
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    // 防止反向移动
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT && !goingRight) {
        dx = -1;
        dy = 0;
        if (!gameRunning) startGame();
    }
    if (keyPressed === UP && !goingDown) {
        dx = 0;
        dy = -1;
        if (!gameRunning) startGame();
    }
    if (keyPressed === RIGHT && !goingLeft) {
        dx = 1;
        dy = 0;
        if (!gameRunning) startGame();
    }
    if (keyPressed === DOWN && !goingUp) {
        dx = 0;
        dy = 1;
        if (!gameRunning) startGame();
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameOverElement.style.display = 'none';
        gameLoop = setInterval(updateGame, 1000);
    }
}

function updateGame() {
    if (!gameRunning) return;

    // 移动蛇
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 检查碰撞
    if (checkCollision(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        snake.pop();
    }

    drawGame();
}

function checkCollision(head) {
    // 撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // 撞自己
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function generateFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);

    // 确保食物不在蛇身上
    for (let i = 0; i < snake.length; i++) {
        if (foodX === snake[i].x && foodY === snake[i].y) {
            generateFood();
            return;
        }
    }
}

function drawGame() {
    // 清空画布
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身，渐变效果
            ctx.fillStyle = `rgba(76, 175, 80, ${1 - index / snake.length * 0.5})`;
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );

        // 添加蛇头的眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            const eyeOffset = 6;

            if (dx === 1) { // 向右
                ctx.fillRect(segment.x * gridSize + eyeOffset + 5, segment.y * gridSize + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + eyeOffset + 5, segment.y * gridSize + 12, eyeSize, eyeSize);
            } else if (dx === -1) { // 向左
                ctx.fillRect(segment.x * gridSize + eyeOffset - 2, segment.y * gridSize + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + eyeOffset - 2, segment.y * gridSize + 12, eyeSize, eyeSize);
            } else if (dy === 1) { // 向下
                ctx.fillRect(segment.x * gridSize + 5, segment.y * gridSize + eyeOffset + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + eyeOffset + 5, eyeSize, eyeSize);
            } else if (dy === -1) { // 向上
                ctx.fillRect(segment.x * gridSize + 5, segment.y * gridSize + eyeOffset - 2, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + eyeOffset - 2, eyeSize, eyeSize);
            }
        }
    });

    // 绘制食物
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        foodX * gridSize + gridSize / 2,
        foodY * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // 添加食物的光泽效果
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.arc(
        foodX * gridSize + gridSize / 2 - 3,
        foodY * gridSize + gridSize / 2 - 3,
        3,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    gameOverElement.style.display = 'block';
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    gameOverElement.style.display = 'none';
    generateFood();
    drawGame();
}

// 初始化游戏
generateFood();
drawGame();
