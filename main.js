document.addEventListener("DOMContentLoaded", function () {
    const playButton = document.getElementById("play-button");
    const checkboxes = [
        document.getElementById("checkbox1"),
        document.getElementById("checkbox2"),
        document.getElementById("checkbox3"),
        document.getElementById("checkbox4"),
        document.getElementById("checkbox5")
    ];

    if (playButton) {
        playButton.addEventListener("click", function () {
            const selectedQuizzes = [];

            // Loop through checkboxes to find selected quizzes
            checkboxes.forEach((checkbox, index) => {
                if (checkbox && checkbox.checked) {
                    selectedQuizzes.push(`quiz${index + 1}.csv`);
                }
            });

            if (selectedQuizzes.length === 0) {
                alert("Please select at least one quiz to start!");
                return;
            }

            // Save selected quizzes to localStorage
            localStorage.setItem("selectedQuizzes", JSON.stringify(selectedQuizzes));

            // Redirect to the quiz page
            window.location.href = "quiz.html";
        });
    } else {
        console.error("Play button not found. Check your HTML structure.");
    }
});