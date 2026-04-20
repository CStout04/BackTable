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
let randTime = 0;
let randSpawnMax = 250; // Sets max number for random value for obstacle spawn (Higher number = slower spawn rate)

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
const JUMP_VELOCITY = 700; // pixels per second
const FALL_MULTIPLIER = 2.0;
let positionY = 0;
let lastTime = 0;

// Start game
function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    menu.style.display = "none";
    gameScreen.style.display = "block";
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

function spawnObstacles() {
    if (randTime == 7) {
        console.log("Spawned Top Cannonball");
        const topObj = document.createElement("img");

        topObj.src = "images/Cannonball obstacle.png";
        topObj.alt = "Top Cannonball";
        topObj.id = "topCannonball";
        gameScreen.appendChild(topObj);
    }
    else if (randTime == 10) {
        console.log("Spawned Bottom Cannonball");
        const topObj = document.createElement("img");

        topObj.src = "images/Cannonball obstacle.png";
        topObj.alt = "Bottom Cannonball";
        topObj.id = "bottomCannonball";
        gameScreen.appendChild(topObj);
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
    
    randTime = Math.floor((Math.random() * randSpawnMax) + 1);
    // console.log(randTime);
    spawnObstacles();
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
