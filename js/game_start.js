const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");

let gameStarted = false;

// Main entry point for starting the game
function startGame() {
    if (gameStarted) {
        return;
    }

    gameStarted = true;
    menu.style.display = "none";
    gameScreen.style.display = "block";
}

// Listen for Space or Up Arrow key to start the game
document.addEventListener("keydown", function (event) {
    const isStartKey = event.code === "Space" || event.code === "ArrowUp";

    if (!isStartKey) {
        return;
    }

    event.preventDefault();
    startGame();
});
