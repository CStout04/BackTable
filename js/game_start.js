let selectedIndex = 0;
let menuState = "controls"; // Track which screen we are on
const options = document.querySelectorAll("#difficultyList li");
const controlsDiv = document.querySelector('.controls');
const difficultyDiv = document.querySelector('.difficulty');

document.addEventListener("keydown", function (event) {
    // 1. Handle switching from Controls to Difficulty
    if ((event.key === ' ' || event.code === "Space") && menuState === "controls") {
        event.preventDefault(); // Stop page scroll
        controls.style.display = "none";
        startText.style.display = "none";
        difficulty.style.display = "block";
        menuState = "difficulty"; // Update state
        return; // Exit so it doesn't trigger the "Confirm" logic immediately
    }

    // 2. Handle Difficulty Selection (Arrow Keys)
    if (menuState === "difficulty") {
        if (event.code === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % options.length;
            updateSelection();
        }
        if (event.code === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            updateSelection();
        }

        // 3. Handle Confirm Selection (Pressing Space again)
        if (event.key === ' ' || event.code === "Space") {
            event.preventDefault();
            const selectedDifficulty = options[selectedIndex].innerText;
            console.log("Starting game on: " + selectedDifficulty);
            // startGame(selectedDifficulty); // Call your start function here
        }
    }
});

function updateSelection() {
    options.forEach(option => option.classList.remove("selected"));
    options[selectedIndex].classList.add("selected");
}
