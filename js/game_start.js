const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const charStart = document.getElementById("Bucky");

let gameStarted = false;
let isJumping = false;
let ignoreFirstJump = true;

// Physics values
let velocityY = 0;
const GRAVITY = 0.3;
const JUMP_VELOCITY = 12.0;
const FALL_MULTIPLIER = 1.0;
let positionY = 0;

// Start game
function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    menu.style.display = "none";
    gameScreen.style.display = "block";

    requestAnimationFrame(gameLoop);
}

// Start key
document.addEventListener("keydown", function (event) {
    const isStartKey = event.code === "Space" || event.code === "ArrowUp";

    if (!isStartKey) return;

    event.preventDefault();
    startGame();
});

// Jump key
document.addEventListener("keydown", function (event) {
    const isJumpKey = event.code === "Space" || event.code === "ArrowUp";

    if (ignoreFirstJump) {
        ignoreFirstJump = false;
        return;
    }

    if (!isJumpKey || !gameStarted || isJumping) return;

    isJumping = true;
    velocityY = JUMP_VELOCITY;
});

// Crouch function (Non-functional yet)
function crouch(isCrouching) {
    console.log("Crouch:", isCrouching);
}

// Crouch key handling (ArrowDown + Shift)
document.addEventListener("keydown", function (event) {
    const isCrouchKey = event.code === "ArrowDown" || event.code === "ShiftLeft" || event.code === "ShiftRight";

    if (!isCrouchKey || !gameStarted) return;

    event.preventDefault();
    crouch(true);
});

document.addEventListener("keyup", function (event) {
    const isCrouchKey = event.code === "ArrowDown" || event.code === "ShiftLeft" || event.code === "ShiftRight";

    if (!isCrouchKey || !gameStarted) return;

    event.preventDefault();
    crouch(false);
});

// Game loop (runs every frame)
function gameLoop() {
    updatePhysics();
    requestAnimationFrame(gameLoop);
}

// Physics update
function updatePhysics() {
    // Apply gravity
    if (velocityY > 0) {
        velocityY -= GRAVITY; // going up
    } else {
        velocityY -= GRAVITY * FALL_MULTIPLIER; // faster fall
    }

    positionY += velocityY;

    // Ground collision
    if (positionY <= 0) {
        positionY = 0;
        velocityY = 0;
        isJumping = false;
    }

    // Apply movement
    charStart.style.transform = `translateY(${-positionY}px)`;
}
