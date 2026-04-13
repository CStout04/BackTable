const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const charStart = document.getElementById("Bucky");

let gameStarted = false;
let isJumping = false;
let ignoreFirstJump = true;

// Start game
function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    menu.style.display = "none";
    gameScreen.style.display = "block";
}

// Start key
document.addEventListener("keydown", function (event) {
    const isStartKey = event.code === "Space" || event.code === "ArrowUp";

    if (!isStartKey) return;

    event.preventDefault();
    startGame();
});

// Jump logic
document.addEventListener("keydown", function (event) {
    const isJumpKey = event.code === "Space" || event.code === "ArrowUp";

    // Ignores first jump to avoid jumping right when screen changes for gameStart.
    if (ignoreFirstJump) {
        ignoreFirstJump = false;
        return;
    }

    if (!isJumpKey || !gameStarted || isJumping) return;

    isJumping = true;
    
    // Jump up
    charStart.style.paddingBottom = "200px";
    
    // Fall back down after a delay
    setTimeout(() => {
        charStart.style.paddingBottom = "0px";
    }, 500);

    // Reset jump state after landing
    setTimeout(() => {
        isJumping = false;
    }, 800);

    //console.log("Jump triggered");
});