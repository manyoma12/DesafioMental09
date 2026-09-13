// ==========================================
// 🧠 DESAFÍO MENTAL
// SCRIPT.JS - VERSIÓN NUEVA
// ==========================================

let playerName = "";
let selectedCategory = "mixed";
let selectedAmount = 10;
let selectedDifficulty = "easy";

let gameQuestions = [];
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;

let timeLeft = 15;
let timer = null;
let answered = false;

let bestScore = Number(localStorage.getItem("bestScore")) || 0;
let currentStreak = 0;
let bestStreak = Number(localStorage.getItem("bestStreak")) || 0;

let musicEnabled = true;
let vibrationEnabled = true;


// ==========================================
// CAMBIAR PANTALLA
// ==========================================

function showScreen(screenId) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = document.getElementById(screenId);

    if (screen) {
        screen.classList.add("active");
    }
}


// ==========================================
// INICIO
// ==========================================

function goHome() {
    showScreen("homeScreen");
}

function openPlayerScreen() {

    showScreen("playerScreen");

    const input = document.getElementById("playerName");

    if (input) {
        input.focus();
    }
}


// ==========================================
// NOMBRE DEL JUGADOR
// ==========================================

function continueToCategories() {

    const input = document.getElementById("playerName");

    if (!input) {
        alert("No se encontró el campo del nombre.");
        return;
    }

    const name = input.value.trim();

    if (name.length < 1) {
        alert("Escribe tu nombre para continuar.");
        input.focus();
        return;
    }

    playerName = name.substring(0, 15);

    showScreen("categoryScreen");
}


// ==========================================
// CATEGORÍAS
// ==========================================

function selectCategory(category) {

    selectedCategory = category;

    document.querySelectorAll(".category-btn").forEach(button => {
        button.classList.remove("selected");
    });

    const button = document.querySelector(
        `[data-category="${category}"]`
    );

    if (button) {
        button.classList.add("selected");
    }
}


// ==========================================
// CANTIDAD DE PREGUNTAS
// ==========================================

function selectAmount(amount) {

    selectedAmount = Number(amount);

    document.querySelectorAll(".amount-btn").forEach(button => {
        button.classList.remove("selected");
    });

    const button = document.querySelector(
        `[data-amount="${amount}"]`
    );

    if (button) {
        button.classList.add("selected");
    }
}


// ==========================================
// DIFICULTAD
// ==========================================

function selectDifficulty(difficulty) {

    selectedDifficulty = difficulty;

    document.querySelectorAll(".difficulty-btn").forEach(button => {
        button.classList.remove("selected");
    });

    const button = document.querySelector(
        `[data-difficulty="${difficulty}"]`
    );

    if (button) {
        button.classList.add("selected");
    }
}


// ==========================================
// COMENZAR JUEGO
// ==========================================

function startGame(amount) {

    if (amount) {
        selectedAmount = Number(amount);
    }

    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    currentStreak = 0;
    answered = false;

    prepareQuestions();

    if (gameQuestions.length === 0) {

        alert(
            "No hay preguntas disponibles. Revisa questions.js."
        );

        return;
    }

    showScreen("gameScreen");

    showQuestion();
}


// ==========================================
// PREPARAR PREGUNTAS
// ==========================================

function prepareQuestions() {

    const bank = window.questionBank || [];

    if (!Array.isArray(bank)) {

        gameQuestions = [];

        console.error(
            "❌ questionBank no existe o no es un arreglo."
        );

        return;
    }

    let filtered = bank;

    if (
        selectedCategory &&
        selectedCategory !== "mixed"
    ) {

        filtered = bank.filter(question => {

            return (
                question.category ===
                selectedCategory
            );

        });
    }

    if (filtered.length === 0) {
        filtered = bank;
    }

    filtered = shuffleArray([...filtered]);

    gameQuestions = filtered.slice(
        0,
        Math.min(selectedAmount, filtered.length)
    );
}


// ==========================================
// MEZCLAR
// ==========================================

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}


// ==========================================
// MOSTRAR PREGUNTA
// ==========================================

function showQuestion() {

    clearInterval(timer);

    answered = false;

    if (
        currentQuestion >=
        gameQuestions.length
    ) {

        finishGame();

        return;
    }

    const question =
        gameQuestions[currentQuestion];

    // CONTADOR

    const counter =
        document.getElementById(
            "questionCounter"
        );

    if (counter) {

        counter.textContent =
            `Pregunta ${currentQuestion + 1} de ${gameQuestions.length}`;
    }


    // PROGRESO

    const progress =
        document.getElementById(
            "progressFill"
        );

    if (progress) {

        const percentage =
            (currentQuestion /
            gameQuestions.length) * 100;

        progress.style.width =
            `${percentage}%`;
    }


    // TEXTO DE LA PREGUNTA

    const questionText =
        document.getElementById(
            "questionText"
        );

    if (questionText) {

        questionText.textContent =
            question.question || "";
    }


    // RESPUESTAS

    const answerButtons =
        document.querySelectorAll(
            ".answer-btn"
        );

    const answers =
        question.options ||
        question.answers ||
        [];


    answerButtons.forEach(
        (button, index) => {

            button.classList.remove(
                "correct",
                "wrong",
                "selected"
            );

            button.disabled = false;

            const text =
                button.querySelector(
                    ".answer-text"
                );

            if (text) {

                text.textContent =
                    answers[index] || "";
            } else {

                button.textContent =
                    answers[index] || "";
            }

            button.onclick = function () {

                selectAnswer(index);
            };
        }
    );


    // TEMPORIZADOR

    timeLeft = 15;

    updateTimer();

    startTimer();
}


// ==========================================
// TEMPORIZADOR
// ==========================================

function startTimer() {

    clearInterval(timer);

    timer = setInterval(() => {

        timeLeft--;

        updateTimer();

        if (timeLeft <= 0) {

            clearInterval(timer);

            timeOut();
        }

    }, 1000);
}


function updateTimer() {

    const timerElement =
        document.getElementById(
            "timer"
        );

    if (timerElement) {

        timerElement.textContent =
            `⏱️ ${timeLeft}`;
    }
}


function timeOut() {

    if (answered) {
        return;
    }

    answered = true;

    wrongAnswers++;

    currentStreak = 0;

    const question =
        gameQuestions[currentQuestion];

    const correct =
        question.answer;

    const buttons =
        document.querySelectorAll(
            ".answer-btn"
        );

    buttons.forEach(
        (button, index) => {

            button.disabled = true;

            if (index === correct) {

                button.classList.add(
                    "correct"
                );
            }
        }
    );

    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1200);
}


// ==========================================
// RESPONDER
// ==========================================

function selectAnswer(index) {

    if (answered) {
        return;
    }

    answered = true;

    clearInterval(timer);

    const question =
        gameQuestions[currentQuestion];

    const correct =
        Number(question.answer);

    const buttons =
        document.querySelectorAll(
            ".answer-btn"
        );

    buttons.forEach(
        (button, buttonIndex) => {

            button.disabled = true;

            if (buttonIndex === correct) {

                button.classList.add(
                    "correct"
                );
            }

            if (
                buttonIndex === index &&
                index !== correct
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        }
    );


    if (index === correct) {

        correctAnswers++;

        currentStreak++;

        if (
            currentStreak >
            bestStreak
        ) {

            bestStreak =
                currentStreak;

            localStorage.setItem(
                "bestStreak",
                bestStreak
            );
        }

        score += 100 + timeLeft * 5;

    } else {

        wrongAnswers++;

        currentStreak = 0;
    }


    updateScore();

    if (vibrationEnabled &&
        navigator.vibrate) {

        navigator.vibrate(
            index === correct
                ? 50
                : [50, 50, 50]
        );
    }


    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1000);
}


// ==========================================
// PUNTUACIÓN
// ==========================================

function updateScore() {

    const scoreElement =
        document.getElementById(
            "score"
        );

    if (scoreElement) {

        scoreElement.textContent =
            score;
    }
}


// ==========================================
// FINAL
// ==========================================

function finishGame() {

    clearInterval(timer);

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );
    }


    const finalScore =
        document.getElementById(
            "finalScore"
        );

    if (finalScore) {

        finalScore.textContent =
            score;
    }


    const correctElement =
        document.getElementById(
            "correctAnswers"
        );

    if (correctElement) {

        correctElement.textContent =
            correctAnswers;
    }


    const wrongElement =
        document.getElementById(
            "wrongAnswers"
        );

    if (wrongElement) {

        wrongElement.textContent =
            wrongAnswers;
    }


    const playerElement =
        document.getElementById(
            "resultPlayerName"
        );

    if (playerElement) {

        playerElement.textContent =
            playerName;
    }


    showScreen("resultScreen");
}


// ==========================================
// REINICIAR
// ==========================================

function restartGame() {

    clearInterval(timer);

    startGame(selectedAmount);
}


// ==========================================
// MULTIJUGADOR
// ==========================================

function openMultiplayerScreen() {

    showScreen(
        "multiplayerScreen"
    );
}


function createRoom() {

    const code =
        Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const roomCode =
        document.getElementById(
            "roomCode"
        );

    if (roomCode) {

        roomCode.value =
            code;
    }

    showScreen("roomScreen");

    const displayedCode =
        document.getElementById(
            "displayRoomCode"
        );

    if (displayedCode) {

        displayedCode.textContent =
            code;
    }

    console.log(
        "Sala creada:",
        code
    );
}


function joinRoom() {

    const input =
        document.getElementById(
            "joinRoomCode"
        );

    if (!input) {

        alert(
            "No se encontró el campo del código."
        );

        return;
    }

    const code =
        input.value
        .trim()
        .toUpperCase();

    if (code.length < 4) {

        alert(
            "Escribe un código válido."
        );

        return;
    }

    showScreen("roomScreen");

    const displayedCode =
        document.getElementById(
            "displayRoomCode"
        );

    if (displayedCode) {

        displayedCode.textContent =
            code;
    }
}


function leaveRoom() {

    showScreen(
        "multiplayerScreen"
    );
}


// ==========================================
// CÓMO JUGAR
// ==========================================

function openHowToPlay() {

    showScreen(
        "howToPlayScreen"
    );
}


// ==========================================
// MÚSICA
// ==========================================

function toggleMusic() {

    musicEnabled =
        !musicEnabled;

    const music =
        document.getElementById(
            "backgroundMusic"
        );

    if (!music) {
        return;
    }

    if (musicEnabled) {

        music.play().catch(
            () => {}
        );

    } else {

        music.pause();
    }
}


// ==========================================
// VIBRACIÓN
// ==========================================

function toggleVibration() {

    vibrationEnabled =
        !vibrationEnabled;

    if (
        vibrationEnabled &&
        navigator.vibrate
    ) {

        navigator.vibrate(100);
    }
}


// ==========================================
// MENÚ
// ==========================================

function openGameMenu() {

    const menu =
        document.getElementById(
            "gameMenu"
        );

    if (menu) {

        menu.classList.add(
            "active"
        );
    }
}


function closeGameMenu() {

    const menu =
        document.getElementById(
            "gameMenu"
        );

    if (menu) {

        menu.classList.remove(
            "active"
        );
    }
}


// ==========================================
// TECLADO A B C D
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            !document
            .getElementById(
                "gameScreen"
            )
            ?.classList
            .contains("active")
        ) {

            return;
        }

        const keys = [
            "a",
            "b",
            "c",
            "d"
        ];

        const index =
            keys.indexOf(
                event.key.toLowerCase()
            );

        if (index !== -1) {

            selectAnswer(index);
        }
    }
);


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "✅ Desafío Mental cargado correctamente."
        );

        const input =
            document.getElementById(
                "playerName"
            );

        if (input) {

            input.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        continueToCategories();
                    }
                }
            );
        }
    }
);
