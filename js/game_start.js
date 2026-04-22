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

        // Remove once fully off the left edge.
        // offsetWidth can be 0 before the image loads, so fall back to 64px
        // to prevent the obstacle being deleted prematurely.
         const elWidth = obstacle.el.offsetWidth || 64;
         if (obstacle.x + elWidth < -1000) {
             obstacle.el.remove();
             console.log(obstacle + " removed!");
             activeObstacles.splice(i, 1);
         }
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

// ─── Collision Detection ────────────────────────────────────────────────────

/**
 * Called once per frame to test whether the player's bounding box overlaps
 * any active obstacle's bounding box.
 *
 * Bottom cannonball (bottom: "0px")  → crouching avoids it  (player must duck)
 * Top cannonball    (bottom: "80px") → jumping avoids it    (player must jump)
 *
 * A small inset (HITBOX_SHRINK) is applied to each edge so the boxes are
 * slightly tighter than the raw sprite rectangles, keeping the feel fair.
 */
function checkCollisions() {
    const PLAYER_SHRINK = 70;
    const OBSTACLE_SHRINK = 20;

    const charRect = charStart.getBoundingClientRect();

    let playerLeft, playerRight, playerTop, playerBottom;

    if (isCrouching) {  
        // Smaller + lower hitbox when crouching
        playerLeft   = charRect.left + PLAYER_SHRINK;
        playerRight  = charRect.right - PLAYER_SHRINK;

        // Push the top DOWN so you can fit under obstacles
        playerTop    = charRect.top + PLAYER_SHRINK + 40;

        // Keep feet grounded (slight trim only)
        playerBottom = charRect.bottom - 10;
    } else {
           // Your original hitbox (unchanged)
        playerLeft   = charRect.left + PLAYER_SHRINK;
        playerRight  = charRect.right - PLAYER_SHRINK;
        playerTop    = charRect.top + PLAYER_SHRINK;
        playerBottom = charRect.bottom - PLAYER_SHRINK;
    }

    for (const obstacle of activeObstacles) {
        const obsRect = obstacle.el.getBoundingClientRect();

        if (obsRect.width === 0 || obsRect.height === 0) continue;

        const obsLeft   = obsRect.left + OBSTACLE_SHRINK;
        const obsRight  = obsRect.right - OBSTACLE_SHRINK;
        const obsTop    = obsRect.top + OBSTACLE_SHRINK;
        const obsBottom = obsRect.bottom - OBSTACLE_SHRINK;

        const overlapping =
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerBottom > obsTop &&
            playerTop < obsBottom;

        if (overlapping) {
            onPlayerHit(obstacle);
            return;
        }
    }
}

/**
 * Fires when the player collides with an obstacle.
 *
 * @param {Object} obstacle - The obstacle entry ({ el, x }) that was hit.
 *
 * TODO: Deduct a life from the player's life counter here.
 */
function onPlayerHit(obstacle) {
    const obstacleType = obstacle.el.alt || obstacle.el.id || "Unknown obstacle";
    console.log(`[Collision] Player was hit by: ${obstacleType}`);

    // ── PLACEHOLDER: life-loss logic ────────────────────────────────────────
    // Example future implementation:
    //
    //   playerLives -= 1;
    //   console.log(`[Lives] Lives remaining: ${playerLives}`);
    //
    //   if (playerLives <= 0) {
    //       gameOver();
    //   } else {
    //       triggerInvincibilityFrames();
    //   }
    // ────────────────────────────────────────────────────────────────────────
}

// ── Game loop (runs every frame) ─────────────────────────────────────────────
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
    checkCollisions();

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
