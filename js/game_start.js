const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const charStart = document.getElementById("Bucky");

let gameStarted = false;
let isJumping = false;
let isCrouching = false;
let ignoreFirstJump = true;
let bgPosition = 0;
let bgSpeed = 3;
let bgInterval;
let spawnTimer = 0;

// Obstacle tracking
let activeObstacles = []; // Each entry: { el, x }
const OBSTACLE_SPEED = 300; // pixels per second (tweak to match bgSpeed feel)

function startBackgroundScroll() {
    const background = document.getElementById("background");

    bgInterval = setInterval(() => {
        bgPosition -= bgSpeed;
        background.style.backgroundPositionX = bgPosition + "px";
    }, 16); // ~60 FPS
}

// Image paths
const STANDING_IMAGE = "images/Sprinter Bucky.png";
const CROUCH_IMAGE = "images/Crouched_Sprinter_Bucky.png";

// Physics values
let velocityY = 0;
const GRAVITY = 1400; // pixels per second squared
const JUMP_VELOCITY = 550; // pixels per second
const FALL_MULTIPLIER = 2.0;
let positionY = 0;
let lastTime = 0;

// Start game
function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    menu.style.display = "none";
    gameScreen.style.display = "block";

    //Force immediate obstacle spawn
    spawnTimer = 0;

    startBackgroundScroll();
    requestAnimationFrame(gameLoop);
}

function setStandingSprite() {
    charStart.src = STANDING_IMAGE;
}

function setCrouchSprite() {
    charStart.src = CROUCH_IMAGE;
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

    if (ignoreFirstJump && isJumpKey) {
        ignoreFirstJump = false;
        return;
    }

    // Prevent jumping while crouching
    if (!isJumpKey || !gameStarted || isJumping || isCrouching) return;

    event.preventDefault();
    isJumping = true;
    velocityY = JUMP_VELOCITY;
    setStandingSprite();
});

// Crouch function
function crouch(crouching) {
    // Prevent crouching while jumping
    if (isJumping) return;

    isCrouching = crouching;

    if (isCrouching) {
        setCrouchSprite();
    } else {
        setStandingSprite();
    }
}

// Helper: create and register an obstacle element
function createObstacle(id, alt, bottomOffset) {
    const el = document.createElement("img");
    el.src = "images/Cannonball obstacle.png";
    el.alt = alt;
    el.id = id;

    // Position off-screen to the right
    const startX = gameScreen.offsetWidth;
    el.style.position = "absolute";
    el.style.right = "auto";
    el.style.bottom = bottomOffset;
    el.style.left = startX + "px";

    gameScreen.appendChild(el);

    // Track it
    activeObstacles.push({ el, x: startX });
}

function spawnObstacles() {
    const isTop = Math.random() < 0.5;

    if (isTop) {
        console.log("Spawned Top Cannonball");
        createObstacle("topCannonball", "Top Cannonball", "80px");
    } else {
        console.log("Spawned Bottom Cannonball");
        createObstacle("bottomCannonball", "Bottom Cannonball", "0px");
    }
}

// Move all active obstacles left; remove any that have scrolled off screen
function updateObstacles(deltaTime) {
    const moveAmount = OBSTACLE_SPEED * deltaTime;

    for (let i = activeObstacles.length - 1; i >= 0; i--) {
        const obstacle = activeObstacles[i];
        obstacle.x -= moveAmount;
        obstacle.el.style.left = obstacle.x + "px";

        /*
        // Remove once fully off the left edge.
        // offsetWidth can be 0 before the image loads, so fall back to 64px
        // to prevent the obstacle being deleted prematurely.
         const elWidth = obstacle.el.offsetWidth || 64;
         if (obstacle.x + elWidth < 0) {
             obstacle.el.remove();
             activeObstacles.splice(i, 1);
         }
        */
    }
}

// Crouch key handling (ArrowDown + Shift)
document.addEventListener("keydown", function (event) {
    const isCrouchKey =
        event.code === "ArrowDown" ||
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight";

    if (!isCrouchKey || !gameStarted) return;

    event.preventDefault();
    crouch(true);
});

document.addEventListener("keyup", function (event) {
    const isCrouchKey =
        event.code === "ArrowDown" ||
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight";

    if (!isCrouchKey || !gameStarted) return;

    event.preventDefault();
    crouch(false);
});

// Game loop (runs every frame)
function gameLoop(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }

    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    // Controlled spawn timer
    spawnTimer -= deltaTime;

    if (spawnTimer <= 0) {
        spawnObstacles();

        // Random gap between spawns (in seconds)
        spawnTimer = Math.random() * 1.5 + 0.8;
    }

    updateObstacles(deltaTime);
    updatePhysics(deltaTime);

    requestAnimationFrame(gameLoop);
}

// Physics update
function updatePhysics(deltaTime) {
    // Apply gravity only while jumping
    if (isJumping) {
        if (velocityY > 0) {
            velocityY -= GRAVITY * deltaTime; // going up
        } else {
            velocityY -= GRAVITY * FALL_MULTIPLIER * deltaTime; // falling
        }

        positionY += velocityY * deltaTime;

        // Ground collision
        if (positionY <= 0) {
            positionY = 0;
            velocityY = 0;
            isJumping = false;

            if (isCrouching) {
                setCrouchSprite();
            } else {
                setStandingSprite();
            }
        }
    }

    // Apply movement
    charStart.style.transform = `translateY(${-positionY}px)`;
}
