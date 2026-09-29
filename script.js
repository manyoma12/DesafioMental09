// ==========================================
// 🧠 DESAFÍO MENTAL
// SCRIPT.JS - CORREGIDO
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
        window.scrollTo(0, 0);
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
// CATÁLOGO
// ==========================================

function openCatalog() {
    showScreen("categoryScreen");
}


// ==========================================
// NOMBRE
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

    document.querySelectorAll(".category-card").forEach(button => {
        button.classList.remove("selected");
    });

    document.querySelectorAll(".category-card").forEach(button => {

        const onclickText = button.getAttribute("onclick");

        if (
            onclickText &&
            onclickText.includes(`'${category}'`)
        ) {
            button.classList.add("selected");
        }
    });

    showScreen("amountScreen");
}


function openCategoryScreen() {
    showScreen("categoryScreen");
}


// ==========================================
// CANTIDAD
// ==========================================

function selectAmount(amount) {

    selectedAmount = Number(amount);

    document.querySelectorAll(".amount-grid button").forEach(button => {
        button.classList.remove("selected");
    });

    showScreen("difficultyScreen");
}


function openAmountScreen() {
    showScreen("amountScreen");
}


// ==========================================
// DIFICULTAD
// ==========================================

function selectDifficulty(difficulty) {

    selectedDifficulty = difficulty;

    document.querySelectorAll(".difficulty-card").forEach(button => {
        button.classList.remove("selected");
    });

    document.querySelectorAll(".difficulty-card").forEach(button => {

        const onclickText = button.getAttribute("onclick");

        if (
            onclickText &&
            onclickText.includes(`'${difficulty}'`)
        ) {
            button.classList.add("selected");
        }
    });

    startGame();
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

    updateScore();

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

    // FILTRAR CATEGORÍA
    if (
        selectedCategory &&
        selectedCategory !== "mixed"
    ) {

        filtered = bank.filter(question => {

            return question.category === selectedCategory;

        });
    }

    // FILTRAR DIFICULTAD
    if (selectedDifficulty) {

        const difficultyFiltered = filtered.filter(question => {

            return question.difficulty === selectedDifficulty;

        });

        if (difficultyFiltered.length > 0) {
            filtered = difficultyFiltered;
        }
    }

    // SI NO HAY PREGUNTAS, USAR TODO EL BANCO
    if (filtered.length === 0) {
        filtered = bank;
    }

    filtered = shuffleArray([...filtered]);

    gameQuestions = filtered.slice(
        0,
        Math.min(
            selectedAmount,
            filtered.length
        )
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
            Math.floor(
                Math.random() * (i + 1)
            );

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


    // PREGUNTA

    const questionText =
        document.getElementById(
            "questionText"
        );

    if (questionText) {

        questionText.textContent =
            question.question || "";
    }


    // CATEGORÍA

    const categoryLabel =
        document.getElementById(
            "currentCategory"
        );

    if (categoryLabel) {

        categoryLabel.textContent =
            (
                question.category ||
                selectedCategory ||
                "DESAFÍO"
            ).toUpperCase();
    }


    // ======================================
    // RESPUESTAS
    // ======================================

    const answerButtons =
        document.querySelectorAll(".answer");

    const answers =
        question.answers ||
        question.options ||
        [];


    answerButtons.forEach(
        (button, index) => {

            // LIMPIAR ESTADOS
            button.classList.remove(
                "correct",
                "wrong",
                "selected"
            );

            // LIMPIAR ESTILOS DIRECTOS
            button.style.removeProperty("background");
            button.style.removeProperty("background-color");
            button.style.removeProperty("border-color");
            button.style.removeProperty("color");
            button.style.removeProperty("box-shadow");

            button.disabled = false;


            // TEXTO
            const text =
                button.querySelector("strong");

            if (text) {

                text.textContent =
                    answers[index] || "";

                text.style.removeProperty("color");

            } else {

                button.textContent =
                    answers[index] || "";
            }


            // CLICK
            button.onclick = function() {

                selectAnswer(index);

            };
        }
    );


    // LETRAS A B C D

    const letters = [
        "A",
        "B",
        "C",
        "D"
    ];

    answerButtons.forEach(
        (button, index) => {

            const letter =
                button.querySelector("span");

            if (letter) {

                letter.textContent =
                    letters[index];

                letter.style.removeProperty("background");
                letter.style.removeProperty("background-color");
                letter.style.removeProperty("color");
            }
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
        document.getElementById("timer");

    if (timerElement) {

        timerElement.textContent =
            `⏱️ ${timeLeft}`;
    }
}


// ==========================================
// TIEMPO AGOTADO
// ==========================================

function timeOut() {

    if (answered) {
        return;
    }

    answered = true;

    clearInterval(timer);

    wrongAnswers++;

    currentStreak = 0;

    const question =
        gameQuestions[currentQuestion];

    // IMPORTANTE:
    // questions.js usa "correct"
    const correct =
        Number(question.correct);

    const buttons =
        document.querySelectorAll(".answer");


    buttons.forEach(
        (button, index) => {

            button.disabled = true;

            // LIMPIAR
            button.classList.remove(
                "correct",
                "wrong"
            );

            // 🟩 RESPUESTA CORRECTA
            if (index === correct) {

                button.classList.add("correct");

                button.style.setProperty(
                    "background",
                    "#22c55e",
                    "important"
                );

                button.style.setProperty(
                    "background-color",
                    "#22c55e",
                    "important"
                );

                button.style.setProperty(
                    "border-color",
                    "#16a34a",
                    "important"
                );

                button.style.setProperty(
                    "color",
                    "#ffffff",
                    "important"
                );

                button.style.setProperty(
                    "box-shadow",
                    "0 0 25px rgba(34,197,94,0.7)",
                    "important"
                );
            }
        }
    );

    updateScore();

    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1800);
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

    // ======================================
    // RESPUESTA CORRECTA
    // ======================================

    const correct =
        Number(question.correct);


    console.log(
        "Respuesta elegida:",
        index
    );

    console.log(
        "Respuesta correcta:",
        correct
    );


    const buttons =
        document.querySelectorAll(".answer");


    buttons.forEach(
        (button, buttonIndex) => {

            button.disabled = true;


            // LIMPIAR ESTADOS
            button.classList.remove(
                "correct",
                "wrong"
            );


            // ==================================
            // 🟩 CORRECTA
            // ==================================

            if (buttonIndex === correct) {

                button.classList.add("correct");

                button.style.setProperty(
                    "background",
                    "#22c55e",
                    "important"
                );

                button.style.setProperty(
                    "background-color",
                    "#22c55e",
                    "important"
                );

                button.style.setProperty(
                    "border-color",
                    "#16a34a",
                    "important"
                );

                button.style.setProperty(
                    "color",
                    "#ffffff",
                    "important"
                );

                button.style.setProperty(
                    "box-shadow",
                    "0 0 25px rgba(34,197,94,0.7)",
                    "important"
                );
            }


            // ==================================
            // 🟥 INCORRECTA
            // ==================================

            if (
                buttonIndex === index &&
                index !== correct
            ) {

                button.classList.add("wrong");

                button.style.setProperty(
                    "background",
                    "#ef4444",
                    "important"
                );

                button.style.setProperty(
                    "background-color",
                    "#ef4444",
                    "important"
                );

                button.style.setProperty(
                    "border-color",
                    "#dc2626",
                    "important"
                );

                button.style.setProperty(
                    "color",
                    "#ffffff",
                    "important"
                );

                button.style.setProperty(
                    "box-shadow",
                    "0 0 25px rgba(239,68,68,0.7)",
                    "important"
                );
            }

        }
    );


    // ======================================
    // PUNTUACIÓN
    // ======================================

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


        score +=
            100 +
            timeLeft * 5;


    } else {

        wrongAnswers++;

        currentStreak = 0;
    }


    updateScore();


    // ======================================
    // VIBRACIÓN
    // ======================================

    if (
        vibrationEnabled &&
        navigator.vibrate
    ) {

        navigator.vibrate(
            index === correct
                ? 50
                : [50, 50, 50]
        );
    }


    // ======================================
    // SIGUIENTE PREGUNTA
    // ======================================

    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1800);
}


// ==========================================
// PUNTUACIÓN
// ==========================================

function updateScore() {

    const scoreElement =
        document.getElementById(
            "gameScore"
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
        document.getElementById("finalScore");

    if (finalScore) {
        finalScore.textContent = score;
    }


    const bestScoreElement =
        document.getElementById("bestScore");

    if (bestScoreElement) {
        bestScoreElement.textContent = bestScore;
    }


    const bestStreakElement =
        document.getElementById("bestStreak");

    if (bestStreakElement) {
        bestStreakElement.textContent = bestStreak;
    }


    const correctElement =
        document.getElementById("correctAnswers");

    if (correctElement) {
        correctElement.textContent = correctAnswers;
    }


    const wrongElement =
        document.getElementById("wrongAnswers");

    if (wrongElement) {
        wrongElement.textContent = wrongAnswers;
    }


    const accuracyElement =
        document.getElementById("accuracy");

    if (accuracyElement) {

        const total =
            correctAnswers +
            wrongAnswers;

        const accuracy =
            total > 0
                ? Math.round(
                    (correctAnswers / total) * 100
                )
                : 0;

        accuracyElement.textContent =
            `${accuracy}%`;
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
    showScreen("multiplayerScreen");
}


function showJoinRoom() {

    const box =
        document.getElementById("joinRoomBox");

    if (box) {
        box.classList.remove("hidden");
    }
}


function createRoom() {

    const code =
        Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const roomCode =
        document.getElementById("roomCode");

    if (roomCode) {
        roomCode.value = code;
    }

    showScreen("roomScreen");

    const displayedCode =
        document.getElementById(
            "displayRoomCode"
        );

    if (displayedCode) {
        displayedCode.textContent = code;
    }
}


function joinRoom() {

    const input =
        document.getElementById("roomCode");

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
        displayedCode.textContent = code;
    }
}


function leaveRoom() {
    showScreen("multiplayerScreen");
}


function copyRoomCode() {

    const code =
        document.getElementById(
            "displayRoomCode"
        );

    if (!code) {
        return;
    }

    navigator.clipboard
        ?.writeText(code.textContent)
        .then(() => {

            alert("Código copiado.");

        })
        .catch(() => {

            alert(
                "No se pudo copiar el código."
            );

        });
}


function startMultiplayerGame() {

    alert(
        "El modo multijugador está preparado para conectarse al sistema online."
    );
}


// ==========================================
// CÓMO JUGAR
// ==========================================

function openHowToPlay() {

    const modal =
        document.getElementById(
            "howToPlay"
        );

    if (modal) {

        modal.classList.remove("hidden");

        modal.classList.add("active");

        return;
    }

    alert(
        "Responde las preguntas correctamente antes de que termine el tiempo."
    );
}


function closeHowToPlay() {

    const modal =
        document.getElementById(
            "howToPlay"
        );

    if (modal) {

        modal.classList.add("hidden");

        modal.classList.remove("active");
    }
}


// ==========================================
// MÚSICA
// ==========================================

function toggleMusic() {

    musicEnabled = !musicEnabled;

    const music =
        document.getElementById(
            "backgroundMusic"
        );

    const status =
        document.getElementById(
            "musicStatus"
        );

    if (status) {

        status.textContent =
            musicEnabled
                ? "ON"
                : "OFF";
    }

    if (!music) {
        return;
    }

    if (musicEnabled) {

        music.play().catch(() => {});

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

    const status =
        document.getElementById(
            "vibrationStatus"
        );

    if (status) {

        status.textContent =
            vibrationEnabled
                ? "ON"
                : "OFF";
    }

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

        menu.classList.remove("hidden");

        menu.classList.add("active");
    }
}


function closeGameMenu() {

    const menu =
        document.getElementById(
            "gameMenu"
        );

    if (menu) {

        menu.classList.add("hidden");

        menu.classList.remove("active");
    }
}


function exitGame() {

    closeGameMenu();

    clearInterval(timer);

    goHome();
}


// ==========================================
// PISTAS
// ==========================================

function usarPista() {

    const pistaActual =
        document.getElementById(
            "pistaActual"
        );

    if (pistaActual) {

        pistaActual.classList.remove("hidden");

        pistaActual.textContent =
            "💡 Pista: analiza cuidadosamente las opciones.";
    }
}


// ==========================================
// TIENDA
// ==========================================

function abrirTiendaPistas() {

    const tienda =
        document.getElementById(
            "tiendaPistas"
        );

    if (tienda) {

        tienda.classList.remove("hidden");

        tienda.classList.add("active");
    }
}


function cerrarTiendaPistas() {

    const tienda =
        document.getElementById(
            "tiendaPistas"
        );

    if (tienda) {

        tienda.classList.add("hidden");

        tienda.classList.remove("active");
    }
}


function cerrarPistas() {

    const panel =
        document.getElementById(
            "panelPistas"
        );

    if (panel) {

       