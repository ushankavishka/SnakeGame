const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = { x: 5, y: 5, dx: 0.05, dy: 0.05 };
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 100;
let gameLoop;
let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.alpha = 1;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT = 37;
    const RIGHT = 39;
    const UP = 38;
    const DOWN = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function drawGame() {
    clearCanvas();
    moveSnake();
    moveFood();
    drawFood();
    drawSnake();
    updateScore();
    updateAndDrawParticles();

    if (checkCollision()) {
        gameOver();
        return;
    }

    if (Math.round(food.x) === snake[0].x && Math.round(food.y) === snake[0].y) {
        createExplosion(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);
        score += 10;
        generateFood();
        growSnake();
        increaseSpeed();
        changeBackgroundColor();
    }

    gameLoop = setTimeout(drawGame, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    snake.pop();
}

function moveFood() {
    food.x += food.dx;
    food.y += food.dy;

    if (food.x < 0 || food.x >= tileCount - 1) {
        food.dx *= -1;
    }
    if (food.y < 0 || food.y >= tileCount - 1) {
        food.dy *= -1;
    }

    if (Math.random() < 0.02) {
        food.dx = (Math.random() - 0.5) * 0.1;
        food.dy = (Math.random() - 0.5) * 0.1;
    }
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.font = `${gridSize}px Arial`;
    ctx.fillText('🍎', Math.round(food.x) * gridSize, (Math.round(food.y) + 1) * gridSize);
}

function generateFood() {
    food.x = Math.floor(Math.random() * (tileCount - 2)) + 1;
    food.y = Math.floor(Math.random() * (tileCount - 2)) + 1;
    food.dx = (Math.random() - 0.5) * 0.1;
    food.dy = (Math.random() - 0.5) * 0.1;
}

function growSnake() {
    const tail = { ...snake[snake.length - 1] };
    snake.push(tail);
}

function checkCollision() {
    const head = snake[0];
    return (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    );
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 2;
    }
}

function gameOver() {
    clearTimeout(gameLoop);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 3, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space to Restart', canvas.width / 3.5, canvas.height / 1.7);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !gameLoop) {
        resetGame();
    }
});

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = { 
        x: 5, 
        y: 5, 
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1
    };
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 100;
    particles = [];
    document.body.style.backgroundColor = '#f0f0f0';
    drawGame();
}

function changeBackgroundColor() {
    const colors = [
        '#FFE5E5', '#E5FFE5', '#E5E5FF', 
        '#FFFFE5', '#FFE5FF', '#E5FFFF',
        '#F0E68C', '#98FB98', '#DDA0DD'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y));
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Start the game
drawGame();
