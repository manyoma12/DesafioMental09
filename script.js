
"use strict";

// ==========================================
// 🧠 DESAFÍO MENTAL
// SCRIPT.JS
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
let bestStreak = Number(localStorage.getItem("bestStreak")) || 0;
let currentStreak = 0;

let musicEnabled = true;
let vibrationEnabled = true;

// ==========================================
// CAMBIAR PANTALLAS
// ==========================================

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = document.getElementById(screenId);

    if (!screen) {
        alert("No se encontró la pantalla: " + screenId);
        return;
    }

    screen.classList.add("active");
    window.scrollTo(0, 0);
}

function goHome() {
    clearInterval(timer);
    showScreen("homeScreen");
}

// ==========================================
// BOTÓN JUGAR
// ==========================================

function openPlayerScreen() {
    showScreen("playerScreen");

    const input = document.getElementById("playerName");

    if (input) {
        setTimeout(() => input.focus(), 100);
    }
}

// ==========================================
// NOMBRE Y CATEGORÍAS
// ==========================================

function continueToCategories() {
    const input = document.getElementById("playerName");

    if (!input || !input.value.trim()) {
        alert("Escribe tu nombre para continuar.");
        input?.focus();
        return;
    }

    playerName = input.value.trim().substring(0, 15);
    showScreen("categoryScreen");
}

function openCategoryScreen() {
    showScreen("categoryScreen");
}

function selectCategory(category) {
    selectedCategory = category;

    document.querySelectorAll(".category-card").forEach(button => {
        button.classList.toggle(
            "selected",
            button.getAttribute("onclick")?.includes("'" + category + "'")
        );
    });

    showScreen("amountScreen");
}

// ==========================================
// CANTIDAD Y DIFICULTAD
// ==========================================

function openAmountScreen() {
    showScreen("amountScreen");
}

function selectAmount(amount) {
    selectedAmount = Number(amount);

    document.querySelectorAll(".amount-grid button").forEach(button => {
        button.classList.remove("selected");
    });

    showScreen("difficultyScreen");
}

function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;

    document.querySelectorAll(".difficulty-card").forEach(button => {
        button.classList.toggle(
            "selected",
            button.getAttribute("onclick")?.includes("'" + difficulty + "'")
        );
    });

    startGame();
}

// ==========================================
// PREPARAR PREGUNTAS
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function prepareQuestions() {
    const bank = window.questionBank;

    if (!Array.isArray(bank) || bank.length === 0) {
        gameQuestions = [];
        return;
    }

    let filtered = bank.filter(question => {
        const categoryMatches =
            selectedCategory === "mixed" ||
            question.category === selectedCategory;

        return categoryMatches;
    });

    const difficultyFiltered = filtered.filter(question =>
        question.difficulty === selectedDifficulty
    );

    if (difficultyFiltered.length > 0) {
        filtered = difficultyFiltered;
    }

    if (filtered.length === 0) {
        filtered = bank;
    }

    gameQuestions = shuffleArray([...filtered]).slice(
        0,
        Math.min(selectedAmount, filtered.length)
    );
}

// ==========================================
// EMPEZAR JUEGO
// ==========================================

function startGame(amount) {
    if (amount) selectedAmount = Number(amount);

    clearInterval(timer);

    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    currentStreak = 0;
    answered = false;

    prepareQuestions();

    if (gameQuestions.length === 0) {
        alert("No hay preguntas. Revisa el archivo questions.js y su variable questionBank.");
        return;
    }

    updateScore();
    showScreen("gameScreen");
    showQuestion();
}

// ==========================================
// MOSTRAR PREGUNTA
// ==========================================

function showQuestion() {
    clearInterval(timer);
    answered = false;

    if (currentQuestion >= gameQuestions.length) {
        finishGame();
        return;
    }

    const question = gameQuestions[currentQuestion];
    const answers = question.answers || question.options || [];

    const counter = document.getElementById("questionCounter");
    if (counter) {
        counter.textContent =
            `Pregunta ${currentQuestion + 1} de ${gameQuestions.length}`;
    }

    const progress = document.getElementById("progressFill");
    if (progress) {
        progress.style.width =
            `${(currentQuestion / gameQuestions.length) * 100}%`;
    }

    const questionText = document.getElementById("questionText");
    if (questionText) {
        questionText.textContent = question.question || "";
    }

    const categoryLabel = document.getElementById("currentCategory");
    if (categoryLabel) {
        categoryLabel.textContent =
            (question.category || selectedCategory).toUpperCase();
    }

    document.querySelectorAll(".answer").forEach((button, index) => {
        button.classList.remove("correct", "wrong", "selected");
        button.style.removeProperty("background");
        button.style.removeProperty("background-color");
        button.style.removeProperty("border-color");
        button.style.removeProperty("color");
        button.style.removeProperty("box-shadow");

        button.disabled = false;

        const strong = button.querySelector("strong");
        if (strong) {
            strong.textContent = answers[index] || "";
        } else {
            button.textContent = answers[index] || "";
        }

        button.onclick = () => selectAnswer(index);
    });

    timeLeft = selectedDifficulty === "easy" ? 50 :
               selectedDifficulty === "medium" ? 35 :
               selectedDifficulty === "hard" ? 20 : 15;

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
    const element = document.getElementById("timer");
    if (element) element.textContent = `⏱️ ${timeLeft}`;
}

// ==========================================
// RESPUESTAS
// ==========================================

function markAnswer(button, type) {
    button.classList.add(type);

    const color = type === "correct" ? "#22c55e" : "#ef4444";
    const border = type === "correct" ? "#16a34a" : "#dc2626";

    button.style.setProperty("background-color", color, "important");
    button.style.setProperty("background", color, "important");
    button.style.setProperty("border-color", border, "important");
    button.style.setProperty("color", "#ffffff", "important");
}

function selectAnswer(index) {
    if (answered) return;

    answered = true;
    clearInterval(timer);

    const question = gameQuestions[currentQuestion];
    const correct = Number(question.correct);
    const buttons = document.querySelectorAll(".answer");

    buttons.forEach((button, buttonIndex) => {
        button.disabled = true;

        if (buttonIndex === correct) {
            markAnswer(button, "correct");
        } else if (buttonIndex === index) {
            markAnswer(button, "wrong");
        }
    });

    if (index === correct) {
        correctAnswers++;
        currentStreak++;

        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            localStorage.setItem("bestStreak", bestStreak);
        }

        score += 100 + timeLeft * 5;
    } else {
        wrongAnswers++;
        currentStreak = 0;
    }

    updateScore();

    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(index === correct ? 50 : [50, 50, 50]);
    }

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}

function timeOut() {
    if (answered) return;

    answered = true;
    wrongAnswers++;
    currentStreak = 0;

    const question = gameQuestions[currentQuestion];
    const correct = Number(question.correct);

    document.querySelectorAll(".answer").forEach((button, index) => {
        button.disabled = true;

        if (index === correct) {
            markAnswer(button, "correct");
        }
    });

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}

// ==========================================
// PUNTUACIÓN Y RESULTADOS
// ==========================================

function updateScore() {
    const element = document.getElementById("gameScore");
    if (element) element.textContent = score;
}

function finishGame() {
    clearInterval(timer);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    const values = {
        finalScore: score,
        bestScore: bestScore,
        bestStreak: bestStreak,
        correctAnswers: correctAnswers,
        wrongAnswers: wrongAnswers,
        resultPlayerName: playerName,
        accuracy: (correctAnswers + wrongAnswers)
            ? Math.round(correctAnswers / (correctAnswers + wrongAnswers) * 100) + "%"
            : "0%"
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    showScreen("resultScreen");
}

function restartGame() {
    startGame(selectedAmount);
}

// ==========================================
// MULTIJUGADOR BÁSICO
// ==========================================

function openMultiplayerScreen() {
    showScreen("multiplayerScreen");
}

function showJoinRoom() {
    document.getElementById("joinRoomBox")?.classList.remove("hidden");
}

function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const input = document.getElementById("roomCode");
    if (input) input.value = code;

    const display = document.getElementById("displayRoomCode");
    if (display) display.textContent = code;

    showScreen("roomScreen");
}

function joinRoom() {
    const input = document.getElementById("roomCode");
    const code = input?.value.trim().toUpperCase();

    if (!code || code.length < 4) {
        alert("Escribe un código de sala válido.");
        return;
    }

    const display = document.getElementById("displayRoomCode");
    if (display) display.textContent = code;

    showScreen("roomScreen");
}

function leaveRoom() {
    showScreen("multiplayerScreen");
}

function copyRoomCode() {
    const code = document.getElementById("displayRoomCode")?.textContent;
    if (!code) return;

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code)
            .then(() => alert("Código copiado."))
            .catch(() => alert("No se pudo copiar el código."));
    } else {
        alert("Código de sala: " + code);
    }
}

function startMultiplayerGame() {
    alert("El multijugador real requiere conectar y sincronizar las salas con Firebase.");
}

// ==========================================
// MODALES Y AJUSTES
// ==========================================

function openHowToPlay() {
    const modal = document.getElementById("howToPlay");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("active");
    }
}

function closeHowToPlay() {
    const modal = document.getElementById("howToPlay");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("active");
    }
}

function openGameMenu() {
    document.getElementById("gameMenu")?.classList.remove("hidden");
}

function closeGameMenu() {
    document.getElementById("gameMenu")?.classList.add("hidden");
}

function exitGame() {
    closeGameMenu();
    clearInterval(timer);
    goHome();
}

function toggleMusic() {
    musicEnabled = !musicEnabled;

    const music = document.getElementById("backgroundMusic");
    const status = document.getElementById("musicStatus");

    if (status) status.textContent = musicEnabled ? "ON" : "OFF";

    if (music) {
        if (musicEnabled) music.play().catch(() => {});
        else music.pause();
    }
}

function toggleVibration() {
    vibrationEnabled = !vibrationEnabled;

    const status = document.getElementById("vibrationStatus");
    if (status) status.textContent = vibrationEnabled ? "ON" : "OFF";
}

// ==========================================
// PISTAS Y TIENDA
// ==========================================

let pistasDisponibles = Number(localStorage.getItem("pistasDisponibles"));
if (!Number.isFinite(pistasDisponibles)) pistasDisponibles = 3;

function actualizarPistas() {
    ["cantidadPistas", "tiendaCantidadPistas", "pistasEnJuego"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = pistasDisponibles;
    });

    localStorage.setItem("pistasDisponibles", pistasDisponibles);
}

function usarPista() {
    if (pistasDisponibles <= 0) {
        alert("No tienes pistas disponibles. Visita la tienda.");
        return;
    }

    if (answered) return;

    pistasDisponibles--;
    actualizarPistas();

    const question = gameQuestions[currentQuestion];
    const hint = question?.hint || question?.pista ||
        "Lee cuidadosamente las opciones y piensa en la pregunta.";

    const element = document.getElementById("pistaActual");
    if (element) {
        element.textContent = "💡 Pista: " + hint;
        element.classList.remove("hidden");
    }
}

function abrirTiendaPistas() {
    actualizarPistas();

    const tienda = document.getElementById("tiendaPistas");
    if (tienda) {
        tienda.classList.remove("hidden");
        tienda.classList.add("active");
    }
}

function cerrarTiendaPistas() {
    const tienda = document.getElementById("tiendaPistas");
    if (tienda) {
        tienda.classList.add("hidden");
        tienda.classList.remove("active");
    }
}

function cerrarPistas() {
    const panel = document.getElementById("panelPistas");
    if (panel) {
        panel.classList.add("hidden");
        panel.classList.remove("active");
    }
}

function iniciarCompraPista(cantidad, precio) {
    alert(
        "Las compras reales todavía no están habilitadas. " +
        "El paquete de " + cantidad + " pistas cuesta $" +
        precio.toLocaleString("es-CO") + " COP."
    );
}

// ==========================================
// INICIO SEGURO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    actualizarPistas();

    console.log("Desafío Mental: script.js cargado correctamente.");

    // Permite que Enter avance desde el campo del nombre.
    const input = document.getElementById("playerName");

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                continueToCategories();
            }
        });
    }
});
