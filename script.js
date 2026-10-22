
// ==========================================
// 🧠 DESAFÍO MENTAL - SCRIPT.JS
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
// CAMBIO DE PANTALLA
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
// JUGAR Y NOMBRE
// ==========================================

function openPlayerScreen() {
    showScreen("playerScreen");

    const input = document.getElementById("playerName");
    if (input) input.focus();
}

function continueToCategories() {
    const input = document.getElementById("playerName");

    if (!input) {
        alert("No se encontró el campo del nombre en index.html.");
        return;
    }

    const name = input.value.trim();

    if (!name) {
        alert("Escribe tu nombre para continuar.");
        input.focus();
        return;
    }

    playerName = name.substring(0, 15);
    showScreen("categoryScreen");
}

function openCategoryScreen() {
    showScreen("categoryScreen");
}

// ==========================================
// CATEGORÍAS
// ==========================================

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
// CANTIDAD
// ==========================================

function openAmountScreen() {
    showScreen("amountScreen");
}

function selectAmount(amount) {
    selectedAmount = Number(amount);
    showScreen("difficultyScreen");
}

// ==========================================
// DIFICULTAD
// ==========================================

function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    startGame();
}

// ==========================================
// PREGUNTAS
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

    let filtered = bank.filter(question =>
        selectedCategory === "mixed" ||
        question.category === selectedCategory
    );

    const byDifficulty = filtered.filter(question =>
        question.difficulty === selectedDifficulty
    );

    if (byDifficulty.length > 0) filtered = byDifficulty;
    if (filtered.length === 0) filtered = bank;

    gameQuestions = shuffleArray([...filtered]).slice(
        0,
        Math.min(selectedAmount, filtered.length)
    );
}

// ==========================================
// INICIAR PARTIDA
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
        alert("No se encontraron preguntas. Revisa questions.js y questionBank.");
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
            `${currentQuestion / gameQuestions.length * 100}%`;
    }

    const questionText = document.getElementById("questionText");
    if (questionText) questionText.textContent = question.question || "";

    const category = document.getElementById("currentCategory");
    if (category) {
        category.textContent =
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

        const text = button.querySelector("strong");
        if (text) text.textContent = answers[index] || "";

        button.onclick = () => selectAnswer(index);
    });

    timeLeft =
        selectedDifficulty === "easy" ? 50 :
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
    if (element) element.textContent = "⏱️ " + timeLeft;
}

// ==========================================
// MARCAR RESPUESTAS
// ==========================================

function paintAnswer(button, type) {
    const correct = type === "correct";
    const color = correct ? "#22c55e" : "#ef4444";

    button.classList.add(type);
    button.style.setProperty("background", color, "important");
    button.style.setProperty("background-color", color, "important");
    button.style.setProperty(
        "border-color",
        correct ? "#16a34a" : "#dc2626",
        "important"
    );
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
            paintAnswer(button, "correct");
        } else if (buttonIndex === index) {
            paintAnswer(button, "wrong");
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

        if (index === correct) paintAnswer(button, "correct");
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

    const results = {
        finalScore: score,
        bestScore,
        bestStreak,
        correctAnswers,
        wrongAnswers,
        resultPlayerName: playerName,
        accuracy: correctAnswers + wrongAnswers > 0
            ? Math.round(correctAnswers / (correctAnswers + wrongAnswers) * 100) + "%"
            : "0%"
    };

    Object.entries(results).forEach(([id, value]) => {
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
        alert("Escribe un código válido.");
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

    if (!navigator.clipboard?.writeText) {
        alert("Código de sala: " + code);
        return;
    }

    navigator.clipboard.writeText(code)
        .then(() => alert("Código copiado."))
        .catch(() => alert("Código de sala: " + code));
}

function startMultiplayerGame() {
    alert("El multijugador en tiempo real necesita conectar las salas con Firebase.");
}

// ==========================================
// MODALES
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

// ==========================================
// MÚSICA Y VIBRACIÓN
// ==========================================

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
    if (answered) return;

    if (pistasDisponibles <= 0) {
        alert("No tienes pistas disponibles.");
        return;
    }

    pistasDisponibles--;
    actualizarPistas();

    const question = gameQuestions[currentQuestion];
    const hint = question?.hint || question?.pista ||
        "Analiza cuidadosamente las opciones.";

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
        "Los pagos reales todavía no están habilitados. " +
        cantidad + " pistas cuestan $" +
        precio.toLocaleString("es-CO") + " COP."
    );
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    actualizarPistas();

    const input = document.getElementById("playerName");

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") continueToCategories();
        });
    }

    console.log("Desafío Mental cargado correctamente.");
});
