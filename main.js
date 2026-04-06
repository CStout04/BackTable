
let selectedIndex = 0;
const options = document.querySelectorAll("#difficultyList li");

document.addEventListener("keydown", function (event) {

    if (event.code === "Space") {
        console.log("Game would start here");
    }

    if (event.code === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % options.length;
        updateSelection();
    }

    if (event.code === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        updateSelection();
    }
});

function updateSelection() {
    options.forEach(option => option.classList.remove("selected"));
    options[selectedIndex].classList.add("selected");
}