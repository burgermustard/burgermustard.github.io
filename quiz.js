let quizData = []; // Now only this array is used
let currentQuestionIndex = 0;
let allAnswers = [];
let currentStreak = 0;
let highestStreak = parseInt(getCookie("highestStreak")) || 0;
const csvFiles = ["quiz1.csv", "quiz2.csv", "quiz3.csv", "quiz4.csv", "quiz5.csv"];
let selectedQuizzes = [];

// Populate selectedQuizzes from localStorage
document.addEventListener("DOMContentLoaded", function () {
    const storedQuizzes = localStorage.getItem("selectedQuizzes");
    if (storedQuizzes) {
        selectedQuizzes = JSON.parse(storedQuizzes);
    }

    console.log("Selected quizzes:", selectedQuizzes);

    if (selectedQuizzes.length > 0) {
        fetchCSV();
    } else {
        console.error("No quizzes selected. Please return to the main menu.");
        document.getElementById("quiz-container").innerHTML = 
            '<p>No quizzes selected. <a href="index.html">Go back to the main menu</a>.</p>';
    }
});


function fetchCSV() {
    let fetchPromises = [];

    selectedQuizzes.forEach(filePath => {
        console.log(`Attempting to fetch ${filePath}...`);
        fetchPromises.push(
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(csv => {
                    console.log(`Successfully fetched ${filePath}`);
                    parseCSV(csv);
                })
                .catch(error => console.error(`Error fetching ${filePath}:`, error))
        );
    });

    // Wait for all fetch operations to complete
    Promise.all(fetchPromises)
        .then(() => {
            if (quizData.length > 0) {
                console.log("Quiz data loaded:", quizData);
                shuffleArray(quizData);
                loadQuestion();
            } else {
                console.error("No valid quiz data loaded. Using fallback data.");
                useFallbackData();
            }
        })
        .catch(error => console.error("Error during CSV fetching:", error));
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    lines.forEach(line => {
        const [question, correct, preteritum, partizip] = line.split(',');

        // Ensure valid data before processing
        if (question && correct && preteritum && partizip) {
            // Add data to the quizData array without the `type`
            quizData.push({
                question: question.trim(),
                correctAnswer: correct.trim(),
                preteritum: preteritum.trim(),
                partizip: partizip.trim()
            });
            allAnswers.push(correct.trim());
        }
    });
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
}

const generateFakeAnswers = (correctAnswer) => {
    const fakeAnswers = allAnswers.filter(answer => answer !== correctAnswer);
    const selectedFakeAnswers = [];
    while (selectedFakeAnswers.length < 3) {
        const randomIndex = Math.floor(Math.random() * fakeAnswers.length);
        const fakeAnswer = fakeAnswers[randomIndex];
        if (!selectedFakeAnswers.includes(fakeAnswer)) {
            selectedFakeAnswers.push(fakeAnswer);
        }
    }
    return selectedFakeAnswers;
};

function loadQuestion() {
    if (quizData.length === 0) {
        document.getElementById("result").textContent = "Quiz Completed!";
        return;
    }

    const questionData = quizData[currentQuestionIndex];
    const answersDiv = document.getElementById("answers");
    const resultDiv = document.getElementById("result");

    answersDiv.innerHTML = "";  // Clear previous answers
    resultDiv.textContent = "";  // Clear previous result text

    // Randomly decide the question type for this question
    const randomType = Math.floor(Math.random() * 5);  // Now 5 types: 0 to 4

    switch (randomType) {
        case 0: // typed
            document.getElementById("question").textContent = `Překlad: ${questionData.question}`;
            const inputField = document.createElement("input");
            inputField.type = "text";
            inputField.id = "typed-answer";
            const submitButton = document.createElement("button");
            submitButton.id = "submit-button";
            submitButton.textContent = "Submit Answer";
            submitButton.onclick = () => checkTypedAnswer(inputField.value);

            answersDiv.appendChild(inputField);
            answersDiv.appendChild(submitButton);
            break;

        case 1: // multiple-choice
            document.getElementById("question").textContent = `Překlad: ${questionData.question}`;
            const answers = [questionData.correctAnswer, ...generateFakeAnswers(questionData.correctAnswer)];
            shuffleArray(answers);

            answers.forEach((answer) => {
                const button = document.createElement("button");
                button.textContent = answer;
                button.onclick = () => checkAnswer(answer);
                answersDiv.appendChild(button);
            });
            break;

        case 2: // preteritum
            document.getElementById("question").textContent = `Napiš preteritum: ${questionData.question}`;
            const inputFieldPreteritum = document.createElement("input");
            inputFieldPreteritum.type = "text";
            inputFieldPreteritum.id = "typed-answer-preteritum";
            const submitButtonPreteritum = document.createElement("button");
            submitButtonPreteritum.id = "submit-button-preteritum";
            submitButtonPreteritum.textContent = "Submit Answer";
            submitButtonPreteritum.onclick = () => checkTypedPreteritumAnswer(inputFieldPreteritum.value);

            answersDiv.appendChild(inputFieldPreteritum);
            answersDiv.appendChild(submitButtonPreteritum);
            break;

        case 3: // partizip
            document.getElementById("question").textContent = `Napiš partizip perfekt: ${questionData.question}`;
            const inputFieldPartizip = document.createElement("input");
            inputFieldPartizip.type = "text";
            inputFieldPartizip.id = "typed-answer-partizip";
            const submitButtonPartizip = document.createElement("button");
            submitButtonPartizip.id = "submit-button-partizip";
            submitButtonPartizip.textContent = "Submit Answer";
            submitButtonPartizip.onclick = () => checkTypedPartizipAnswer(inputFieldPartizip.value);

            answersDiv.appendChild(inputFieldPartizip);
            answersDiv.appendChild(submitButtonPartizip);
            break;

        case 4: // multiple-choice (opposite) - Exactly 4 answers
            document.getElementById("question").textContent = `Překlad: "${questionData.correctAnswer}"?`;

            const correctAnswer = questionData.correctAnswer;
            const correctQuestion = questionData.question;

            // Find other questions to form incorrect options
            const incorrectQuestions = quizData
                .filter(q => q.correctAnswer !== correctAnswer)  // Exclude questions with the same answer
                .map(q => q.question)  // Get only the question texts
                .slice(0, 3);  // Get up to 3 incorrect questions

            // Combine the correct question with the 3 incorrect questions
            const allQuestions = [correctQuestion, ...incorrectQuestions];
            shuffleArray(allQuestions);  // Shuffle them to randomize the order

            // Display the questions as multiple-choice options
            allQuestions.forEach((q) => {
                const button = document.createElement("button");
                button.textContent = q;
                button.onclick = () => checkQuestionOpposite(q, correctQuestion);
                answersDiv.appendChild(button);
            });
            break;

        default:
            console.error('Unknown question type');
            break;
    }

    // Show the "Next Question" button after answering
    document.getElementById("next-button").style.display = "none";
    document.getElementById("next-button").onclick = () => {
        // Move to the next question, and loop back to 0 when currentQuestionIndex exceeds quizData.length
        currentQuestionIndex = (currentQuestionIndex + 1) % quizData.length;
        loadQuestion();
    };
}

const correctSound = document.getElementById("correct-sound");
const incorrectSound = document.getElementById("incorrect-sound");

function checkAnswer(selectedAnswer) {
    const correctAnswer = quizData[currentQuestionIndex].correctAnswer.trim().toLowerCase();
    const resultDiv = document.getElementById("result");

    if (selectedAnswer.trim().toLowerCase() === correctAnswer) {
        resultDiv.textContent = "Correct!";
        resultDiv.classList.remove("incorrect");
        resultDiv.classList.add("correct");
        correctSound.play();
        updateStreak(true);

    } else {
        resultDiv.textContent = `Wrong! The correct answer is: "${correctAnswer}"`;
        resultDiv.classList.remove("correct");
        resultDiv.classList.add("incorrect");
        incorrectSound.play();
        updateStreak(false);

    }

    // Disable all answer buttons after selection
    const buttons = document.querySelectorAll("#answers button");
    buttons.forEach(button => button.disabled = true);

    // Show the "Next Question" button
    document.getElementById("next-button").style.display = "block";
}

function checkTypedAnswer(userAnswer) {
    const correctAnswer = quizData[currentQuestionIndex].correctAnswer.trim().toLowerCase();
    const resultDiv = document.getElementById("result");

    const submitButton = document.getElementById("submit-button");
    const typedAnswerInput = document.getElementById("typed-answer");

    if (userAnswer.trim().toLowerCase() === correctAnswer) {
        resultDiv.textContent = "Correct!";
        resultDiv.classList.remove("incorrect");
        resultDiv.classList.add("correct");
        correctSound.play();
        updateStreak(true);

    } else {
        resultDiv.textContent = `Wrong! The correct answer is: "${correctAnswer}"`;
        resultDiv.classList.remove("correct");
        resultDiv.classList.add("incorrect");
        incorrectSound.play();
        updateStreak(false);

    }

    // Disable the submit button and input field
    submitButton.disabled = true;
    typedAnswerInput.disabled = true;

    // Show the "Next Question" button
    document.getElementById("next-button").style.display = "block";
}

function checkTypedPreteritumAnswer(userAnswer) {
    const correctAnswer = quizData[currentQuestionIndex].preteritum.trim().toLowerCase();
    const resultDiv = document.getElementById("result");

    const submitButton = document.getElementById("submit-button-preteritum");
    const typedAnswerInput = document.getElementById("typed-answer-preteritum");

    if (userAnswer.trim().toLowerCase() === correctAnswer) {
        resultDiv.textContent = "Correct!";
        resultDiv.classList.remove("incorrect");
        resultDiv.classList.add("correct");
        correctSound.play();
        updateStreak(true);
    } else {
        resultDiv.textContent = `Wrong! The correct answer is: "${correctAnswer}"`;
        resultDiv.classList.remove("correct");
        resultDiv.classList.add("incorrect");
        incorrectSound.play();
        updateStreak(false);
    }

    // Disable the submit button and input field
    submitButton.disabled = true;
    typedAnswerInput.disabled = true;

    // Show the "Next Question" button
    document.getElementById("next-button").style.display = "block";
}

function checkTypedPartizipAnswer(userAnswer) {
    const correctAnswer = quizData[currentQuestionIndex].partizip.trim().toLowerCase();
    const resultDiv = document.getElementById("result");

    const submitButton = document.getElementById("submit-button-partizip");
    const typedAnswerInput = document.getElementById("typed-answer-partizip");

    if (userAnswer.trim().toLowerCase() === correctAnswer) {
        resultDiv.textContent = "Correct!";
        resultDiv.classList.remove("incorrect");
        resultDiv.classList.add("correct");
        correctSound.play();
        updateStreak(true);

    } else {
        resultDiv.textContent = `Wrong! The correct answer is: "${correctAnswer}"`;
        resultDiv.classList.remove("correct");
        resultDiv.classList.add("incorrect");
        incorrectSound.play();
        updateStreak(false);

    }

    // Disable the submit button and input field
    submitButton.disabled = true;
    typedAnswerInput.disabled = true;

    // Show the "Next Question" button
    document.getElementById("next-button").style.display = "block";
}

function checkQuestionOpposite(selectedQuestion, correctAnswer) {
    const resultDiv = document.getElementById("result");

    const correctAnswerTrimmed = correctAnswer.trim().toLowerCase();

    if (selectedQuestion.trim().toLowerCase() === correctAnswerTrimmed) {
        resultDiv.textContent = "Correct!";
        resultDiv.classList.remove("incorrect");
        resultDiv.classList.add("correct");
        correctSound.play();
        updateStreak(true);

    } else {
        resultDiv.textContent = `Wrong! The correct answer is: "${correctAnswerTrimmed}"`;
        resultDiv.classList.remove("correct");
        resultDiv.classList.add("incorrect");
        incorrectSound.play();
        updateStreak(false);

    }

    // Disable all question buttons after selection
    const buttons = document.querySelectorAll("#answers button");
    buttons.forEach(button => button.disabled = true);

    // Show the "Next Question" button
    document.getElementById("next-button").style.display = "block";
}

function useFallbackData() {
    console.log("Using fallback data.");
    // Define fallback data if no valid CSV data is loaded
}

function updateStreak(isCorrect) {
    if (isCorrect) {
        currentStreak++;
    } else {
        currentStreak = 0;
    }
    document.getElementById("current-streak").textContent = currentStreak;
    if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
        setCookie("highestStreak", highestStreak, 365);  // Save the new highest streak for 1 year
        document.getElementById("highest-streak").textContent = highestStreak; // Update the UI
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById("back-button");

    // Go back to the previous page when the back button is clicked
    backButton.addEventListener("click", function () {
        if (document.referrer) {
            // If there is a previous page in the history, navigate back to it
            window.history.back();
        } else {
            // Otherwise, redirect to the main menu or any other fallback page
            window.location.href = "index.html"; // Change to your main menu page if necessary
        }
    });
});
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}
function getCookie(name) {
    const cookieArr = document.cookie.split("; ");
    for (let cookie of cookieArr) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return value;
        }
    }
    return null;
}
