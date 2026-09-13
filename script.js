```javascript
// ==========================================
// 🧠 DESAFÍO MENTAL - SCRIPT.JS
// ==========================================

// ==========================================
// VARIABLES
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

let timeLeft = 50;
let timer = null;

let bestScore =
    Number(localStorage.getItem("bestScore")) || 0;

let currentStreak = 0;

let bestStreak =
    Number(localStorage.getItem("bestStreak")) || 0;

let musicEnabled = true;
let vibrationEnabled = true;


// ==========================================
// 💡 SISTEMA DE PISTAS
// ==========================================

let dmPistas =
    Number(localStorage.getItem("desafioPistas"));

if (Number.isNaN(dmPistas)) {
    dmPistas = 0;
}


// 🎁 REGALO DE BIENVENIDA: 3 PISTAS

if (
    localStorage.getItem("desafioWelcome3") !== "true"
) {

    dmPistas += 3;

    localStorage.setItem(
        "desafioWelcome3",
        "true"
    );

    localStorage.setItem(
        "desafioPistas",
        dmPistas
    );
}


let dmMonedas =
    Number(localStorage.getItem("desafioMonedas"));

if (Number.isNaN(dmMonedas)) {

    dmMonedas = 500;

    localStorage.setItem(
        "desafioMonedas",
        dmMonedas
    );
}


let dmUltimaPista =
    Number(localStorage.getItem("desafioUltimaPista"));

if (
    Number.isNaN(dmUltimaPista) ||
    dmUltimaPista <= 0
) {

    dmUltimaPista = Date.now();

    localStorage.setItem(
        "desafioUltimaPista",
        dmUltimaPista
    );
}


const DM_TIEMPO_PISTA =
    50 * 60 * 1000;


// ==========================================
// 👥 MULTIJUGADOR
// ==========================================

let roomCode = "";
let isHost = false;
let roomListener = null;
let roomRef = null;


// ==========================================
// ⚙️ DIFICULTADES
// ==========================================

const difficultySettings = {

    easy: {
        name: "Fácil",
        time: 50
    },

    medium: {
        name: "Medio",
        time: 35
    },

    hard: {
        name: "Difícil",
        time: 20
    },

    god: {
        name: "Dios",
        time: 15
    }

};


// ==========================================
// 🎵 MÚSICA
// ==========================================

const music =
    document.getElementById("backgroundMusic");


// ==========================================
// 📱 PANTALLAS
// ==========================================

function showScreen(id) {

    document.querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");
            screen.classList.add("hidden");

        });


    const screen =
        document.getElementById(id);


    if (screen) {

        screen.classList.remove("hidden");
        screen.classList.add("active");

    }

}


// ==========================================
// 🏠 INICIO
// ==========================================

function openPlayerScreen() {

    showScreen("playerScreen");


    const input =
        document.getElementById("playerName");


    if (input) {

        setTimeout(() => {

            input.focus();

        }, 200);

    }

}


function continueToCategories() {

    const input =
        document.getElementById("playerName");


    if (!input) {

        return;

    }


    playerName =
        input.value.trim();


    if (playerName === "") {

        playerName = "Jugador";

    }


    showScreen("categoryScreen");

}


// ==========================================
// 🏠 VOLVER AL INICIO
// ==========================================

function goHome() {

    clearInterval(timer);

    stopMusic();


    if (roomCode) {

        cleanupRoomConnection(false);

    }


    roomCode = "";
    isHost = false;


    showScreen("homeScreen");

}


// ==========================================
// 🌎 CATEGORÍAS
// ==========================================

function selectCategory(category) {

    selectedCategory = category;


    document.querySelectorAll(".category-card")
        .forEach(card => {

            card.classList.remove("selected");

        });


    const selected =
        document.querySelector(
            `.category-card[onclick="selectCategory('${category}')"]`
        );


    if (selected) {

        selected.classList.add("selected");

    }


    showScreen("amountScreen");

}


function openCategoryScreen() {

    showScreen("categoryScreen");

}


// ==========================================
// 🔢 CANTIDAD
// ==========================================

function selectAmount(amount) {

    selectedAmount =
        Number(amount);


    showScreen("difficultyScreen");

}


function openAmountScreen() {

    showScreen("amountScreen");

}


// ==========================================
// 🎯 DIFICULTAD
// ==========================================

function selectDifficulty(difficulty) {

    if (!difficultySettings[difficulty]) {

        return;

    }


    selectedDifficulty =
        difficulty;


    startGame(selectedAmount);

}


// ==========================================
// 🎮 INICIAR PARTIDA
// ==========================================

function startGame(amount) {

    clearInterval(timer);


    selectedAmount =
        Number(amount);


    prepareQuestions();


    if (gameQuestions.length === 0) {

        alert(
            "No hay preguntas disponibles para esta categoría y dificultad."
        );


        showScreen("difficultyScreen");

        return;

    }


    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    wrongAnswers = 0;

    currentStreak = 0;


    const opponentBar =
        document.getElementById("opponentBar");


    if (opponentBar) {

        opponentBar.classList.add("hidden");

    }


    showScreen("gameScreen");

    updateScore();

    updateStreak();

    startMusic();

    showQuestion();

}


// ==========================================
// 🧠 PREPARAR PREGUNTAS
// ==========================================

function prepareQuestions(
    previousFirstQuestion = null
) {

    if (
        !window.questionBank ||
        !Array.isArray(window.questionBank)
    ) {

        console.error(
            "❌ No se encontró window.questionBank"
        );


        gameQuestions = [];

        return;

    }


    let available =
        [...window.questionBank];


    if (selectedCategory !== "mixed") {

        available =
            available.filter(question =>
                question.category === selectedCategory
            );

    }


    available =
        available.filter(question =>
            question.difficulty === selectedDifficulty
        );


    if (available.length === 0) {

        console.warn(
            "⚠️ No existen preguntas para:",
            selectedCategory,
            selectedDifficulty
        );


        gameQuestions = [];

        return;

    }


    if (
        previousFirstQuestion &&
        available.length > 1
    ) {

        const differentQuestions =
            available.filter(question =>
                question.question !== previousFirstQuestion
            );


        if (differentQuestions.length > 0) {

            available =
                differentQuestions;

        }

    }


    shuffleArray(available);

    gameQuestions = [];


    for (
        let i = 0;
        i < selectedAmount;
        i++
    ) {

        const originalQuestion =
            available[
                i % available.length
            ];


        const newQuestion = {

            category:
                originalQuestion.category,

            difficulty:
                originalQuestion.difficulty,

            question:
                originalQuestion.question,

            answers:
                [...originalQuestion.answers],

            correct:
                originalQuestion.correct,

            hint:
                originalQuestion.hint ||
                "Piensa cuidadosamente en la respuesta."

        };


        gameQuestions.push(
            newQuestion
        );

    }


    shuffleArray(gameQuestions);


    if (
        previousFirstQuestion &&
        gameQuestions.length > 1 &&
        gameQuestions[0].question === previousFirstQuestion
    ) {

        const differentIndex =
            gameQuestions.findIndex(question =>
                question.question !== previousFirstQuestion
            );


        if (differentIndex !== -1) {

            [
                gameQuestions[0],
                gameQuestions[differentIndex]
            ] =
            [
                gameQuestions[differentIndex],
                gameQuestions[0]
            ];

        }

    }


    console.log(
        "✅ Partida preparada:",
        gameQuestions.length,
        "preguntas"
    );

}


// ==========================================
// 🔀 MEZCLAR
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
        ] =
        [
            array[j],
            array[i]
        ];

    }


    return array;

}


// ==========================================
// ❓ MOSTRAR PREGUNTA
// ==========================================

function showQuestion() {

    clearInterval(timer);

    ocultarPistaActual();


    if (
        currentQuestion >=
        gameQuestions.length
    ) {

        finishGame();

        return;

    }


    const question =
        gameQuestions[currentQuestion];


    const counter =
        document.getElementById(
            "questionCounter"
        );


    if (counter) {

        counter.textContent =
            `Pregunta ${currentQuestion + 1} de ${gameQuestions.length}`;

    }


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


    const category =
        document.getElementById(
            "currentCategory"
        );


    if (category) {

        category.textContent =
            getCategoryName(
                question.category
            ).toUpperCase();

    }


    const questionText =
        document.getElementById(
            "questionText"
        );


    if (questionText) {

        questionText.textContent =
            question.question;

    }


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const answer =
            document.getElementById(
                `answer${i}`
            );


        const button =
            answer
                ? answer.closest(".answer")
                : null;


        if (answer) {

            answer.textContent =
                question.answers[i];

        }


        if (button) {

            button.disabled = false;

            button.classList.remove(
                "correct",
                "wrong",
                "disabled",
                "hint-correct"
            );

        }

    }


    actualizarPistasEnJuego();

    updateScore();

    updateStreak();

    startTimer();

}


// ==========================================
// 🏷️ NOMBRE DE CATEGORÍA
// ==========================================

function getCategoryName(category) {

    const names = {

        general: "Cultura General",
        colombia: "Colombia",
        science: "Ciencia",
        history: "Historia",
        sports: "Deportes",
        technology: "Tecnología",
        geography: "Geografía",
        entertainment: "Entretenimiento"

    };


    return (
        names[category] ||
        "Desafío Mixto"
    );

}


// ==========================================
// ⏱️ TEMPORIZADOR
// ==========================================

function startTimer() {

    clearInterval(timer);


    const difficulty =
        difficultySettings[
            selectedDifficulty
        ];


    timeLeft =
        difficulty
            ? difficulty.time
            : 50;


    updateTimer();


    timer = setInterval(() => {

        timeLeft--;

        updateTimer();


        if (timeLeft <= 0) {

            clearInterval(timer);

            timeOut();

        }

    }, 1000);

}


// ==========================================
// ⏱️ ACTUALIZAR TIEMPO
// ==========================================

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


// ==========================================
// ⌛ TIEMPO AGOTADO
// ==========================================

function timeOut() {

    if (
        currentQuestion >=
        gameQuestions.length
    ) {

        return;

    }


    const question =
        gameQuestions[currentQuestion];


    const buttons =
        document.querySelectorAll(
            ".answer"
        );


    buttons.forEach(button => {

        button.disabled = true;

        button.classList.add(
            "disabled"
        );

    });


    if (
        buttons[question.correct]
    ) {

        buttons[question.correct]
            .classList.add(
                "correct"
            );

    }


    wrongAnswers++;

    currentStreak = 0;

    updateStreak();


    vibrate([
        100,
        50,
        100
    ]);


    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1000);

}


// ==========================================
// ✅ RESPONDER
// ==========================================

function selectAnswer(index) {

    if (
        currentQuestion >=
        gameQuestions.length
    ) {

        return;

    }


    clearInterval(timer);


    const question =
        gameQuestions[currentQuestion];


    const buttons =
        document.querySelectorAll(
            ".answer"
        );


    buttons.forEach(button => {

        button.disabled = true;

    });


    if (
        index ===
        question.correct
    ) {

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
            (timeLeft * 5);


        if (
            currentStreak >= 3
        ) {

            score +=
                currentStreak * 10;

        }


        if (buttons[index]) {

            buttons[index]
                .classList.add(
                    "correct"
                );

        }


        vibrate([50]);

    }

    else {

        wrongAnswers++;

        currentStreak = 0;


        if (buttons[index]) {

            buttons[index]
                .classList.add(
                    "wrong"
                );

        }


        if (
            buttons[question.correct]
        ) {

            buttons[question.correct]
                .classList.add(
                    "correct"
                );

        }


        vibrate([
            100,
            50,
            100
        ]);

    }


    updateScore();

    updateStreak();


    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1000);

}


// ==========================================
// ⭐ PUNTUACIÓN
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
// 🔥 RACHA
// ==========================================

function updateStreak() {

    const streakElement =
        document.getElementById(
            "currentStreak"
        );


    if (streakElement) {

        streakElement.textContent =
            currentStreak;

    }

}


// ==========================================
// 🏆 FINAL
// ==========================================

function finishGame() {

    clearInterval(timer);

    stopMusic();


    showScreen(
        "resultScreen"
    );


    const total =
        gameQuestions.length;


    const accuracy =
        total > 0
            ? Math.round(
                (correctAnswers /
                total) * 100
            )
            : 0;


    let newRecord =
        false;


    if (
        score >
        bestScore
    ) {

        bestScore =
            score;


        localStorage.setItem(
            "bestScore",
            bestScore
        );


        newRecord = true;

    }


    const finalScore =
        document.getElementById(
            "finalScore"
        );


    const correct =
        document.getElementById(
            "correctAnswers"
        );


    const wrong =
        document.getElementById(
            "wrongAnswers"
        );


    const accuracyElement =
        document.getElementById(
            "accuracy"
        );


    const message =
        document.getElementById(
            "resultMessage"
        );


    if (finalScore) {

        finalScore.textContent =
            score;

    }


    if (correct) {

        correct.textContent =
            correctAnswers;

    }


    if (wrong) {

        wrong.textContent =
            wrongAnswers;

    }


    if (accuracyElement) {

        accuracyElement.textContent =
            `${accuracy}%`;

    }


    if (message) {

        if (newRecord) {

            message.textContent =
                "🏆 ¡NUEVO RÉCORD PERSONAL! 🔥";

        }

        else if (accuracy >= 90) {

            message.textContent =
                "🔥 ¡Excelente! Eres una máquina.";

        }

        else if (accuracy >= 70) {

            message.textContent =
                "👏 ¡Muy buen trabajo!";

        }

        else if (accuracy >= 50) {

            message.textContent =
                "💪 ¡Vas por buen camino!";

        }

        else {

            message.textContent =
                "🧠 ¡Sigue practicando!";

        }

    }


    const bestScoreElement =
        document.getElementById(
            "bestScore"
        );


    if (bestScoreElement) {

        bestScoreElement.textContent =
            bestScore;

    }


    const bestStreakElement =
        document.getElementById(
            "bestStreak"
        );


    if (bestStreakElement) {

        bestStreakElement.textContent =
            bestStreak;

    }

}


// ==========================================
// 🔄 REINICIAR
// ==========================================

function restartGame() {

    clearInterval(timer);

    closeGameMenu();


    const previousFirstQuestion =
        gameQuestions.length > 0
            ? gameQuestions[0].question
            : null;


    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    wrongAnswers = 0;

    currentStreak = 0;


    timeLeft =
        difficultySettings[selectedDifficulty]
            ? difficultySettings[selectedDifficulty].time
            : 50;


    prepareQuestions(
        previousFirstQuestion
    );


    if (gameQuestions.length === 0) {

        alert(
            "No hay preguntas disponibles para esta categoría y dificultad."
        );


        showScreen("difficultyScreen");

        return;

    }


    showScreen("gameScreen");

    updateScore();

    updateStreak();

    startMusic();

    showQuestion();

}


// ==========================================
// ⚙️ MENÚ DEL JUEGO
// ==========================================

function openGameMenu() {

    const menu =
        document.getElementById(
            "gameMenu"
        );


    if (menu) {

        menu.classList.remove(
            "hidden"
        );

    }

}


function closeGameMenu() {

    const menu =
        document.getElementById(
            "gameMenu"
        );


    if (menu) {

        menu.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// 🚪 SALIR DEL JUEGO
// ==========================================

function exitGame() {

    clearInterval(timer);

    stopMusic();

    closeGameMenu();


    showScreen(
        "homeScreen"
    );

}


// ==========================================
// 📖 CÓMO JUGAR
// ==========================================

function openHowToPlay() {

    const modal =
        document.getElementById(
            "howToPlay"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


function closeHowToPlay() {

    const modal =
        document.getElementById(
            "howToPlay"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// 🎵 MÚSICA
// ==========================================

function startMusic() {

    if (
        !musicEnabled ||
        !music
    ) {

        return;

    }


    music.volume =
        0.25;


    const promise =
        music.play();


    if (promise) {

        promise.catch(() => {});

    }

}


function stopMusic() {

    if (!music) {

        return;

    }


    music.pause();

    music.currentTime =
        0;

}


function toggleMusic() {

    musicEnabled =
        !musicEnabled;


    localStorage.setItem(
        "musicEnabled",
        musicEnabled
    );


    updateSettings();


    if (musicEnabled) {

        startMusic();

    }

    else {

        stopMusic();

    }

}


// ==========================================
// 📳 VIBRACIÓN
// ==========================================

function vibrate(pattern) {

    if (
        vibrationEnabled &&
        "vibrate" in navigator
    ) {

        navigator.vibrate(
            pattern
        );

    }

}


function toggleVibration() {

    vibrationEnabled =
        !vibrationEnabled;


    localStorage.setItem(
        "vibrationEnabled",
        vibrationEnabled
    );


    updateSettings();


    if (vibrationEnabled) {

        vibrate([50]);

    }

}


// ==========================================
// ⚙️ CONFIGURACIÓN
// ==========================================

function loadSettings() {

    const musicSetting =
        localStorage.getItem(
            "musicEnabled"
        );


    const vibrationSetting =
        localStorage.getItem(
            "vibrationEnabled"
        );


    if (
        musicSetting !== null
    ) {

        musicEnabled =
            musicSetting === "true";

    }


    if (
        vibrationSetting !== null
    ) {

        vibrationEnabled =
            vibrationSetting === "true";

    }


    updateSettings();

}


function updateSettings() {

    const musicStatus =
        document.getElementById(
            "musicStatus"
        );


    const vibrationStatus =
        document.getElementById(
            "vibrationStatus"
        );


    if (musicStatus) {

        musicStatus.textContent =
            musicEnabled
                ? "ON"
                : "OFF";

    }


    if (vibrationStatus) {

        vibrationStatus.textContent =
            vibrationEnabled
                ? "ON"
                : "OFF";

    }

}


// ==========================================
// 💡 GUARDAR PISTAS
// ==========================================

function guardarDatosPistas() {

    localStorage.setItem(
        "desafioPistas",
        dmPistas
    );


    localStorage.setItem(
        "desafioMonedas",
        dmMonedas
    );


    localStorage.setItem(
        "desafioUltimaPista",
        dmUltimaPista
    );

}


// ==========================================
// 🎁 PISTA GRATIS
// ==========================================

function revisarPistaGratis() {

    const ahora =
        Date.now();


    const transcurrido =
        ahora - dmUltimaPista;


    if (
        transcurrido >=
        DM_TIEMPO_PISTA
    ) {

        const nuevasPistas =
            Math.floor(
                transcurrido /
                DM_TIEMPO_PISTA
            );


        dmPistas +=
            nuevasPistas;


        dmUltimaPista +=
            nuevasPistas *
            DM_TIEMPO_PISTA;


        guardarDatosPistas();


        console.log(
            `💡 Ganaste ${nuevasPistas} pista(s) gratis.`
        );

    }

}


// ==========================================
// 💡 ACTUALIZAR PANEL
// ==========================================

function actualizarPanelPistas() {

    revisarPistaGratis();


    const cantidad =
        document.getElementById(
            "cantidadPistas"
        );


    const cantidadTienda =
        document.getElementById(
            "tiendaCantidadPistas"
        );


    const monedas =
        document.getElementById(
            "cantidadMonedas"
        );


    const contador =
        document.getElementById(
            "contadorPistas"
        );


    if (cantidad) {

        cantidad.textContent =
            dmPistas;

    }


    if (cantidadTienda) {

        cantidadTienda.textContent =
            dmPistas;

    }


    if (monedas) {

        monedas.textContent =
            dmMonedas;

    }


    if (contador) {

        const restante =
            Math.max(
                0,
                DM_TIEMPO_PISTA -
                (
                    Date.now() -
                    dmUltimaPista
                )
            );


        const minutos =
            Math.floor(
                restante / 60000
            );


        const segundos =
            Math.floor(
                (restante % 60000) /
                1000
            );


        contador.textContent =
            `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

    }

}


// ==========================================
// 💡 MIS PISTAS
// ==========================================

function abrirPistas() {

    const panel =
        document.getElementById(
            "panelPistas"
        );


    if (panel) {

        panel.classList.remove(
            "hidden"
        );

    }


    actualizarPanelPistas();

}


function cerrarPistas() {

    const panel =
        document.getElementById(
            "panelPistas"
        );


    if (panel) {

        panel.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// 🛒 TIENDA
// ==========================================

function abrirTiendaPistas() {

    cerrarPistas();


    const tienda =
        document.getElementById(
            "tiendaPistas"
        );


    if (tienda) {

        tienda.classList.remove(
            "hidden"
        );

    }


    actualizarPanelPistas();

}


function cerrarTiendaPistas() {

    const tienda =
        document.getElementById(
            "tiendaPistas"
        );


    if (tienda) {

        tienda.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// 🪙 COMPRAR PISTA
// ==========================================

function comprarPista() {

    revisarPistaGratis();


    if (
        dmMonedas < 100
    ) {

        alert(
            "❌ No tienes suficientes monedas."
        );

        return;

    }


    dmMonedas -= 100;

    dmPistas += 1;


    guardarDatosPistas();

    actualizarPanelPistas();


    alert(
        "💡 ¡Compraste 1 pista con monedas!"
    );

}


// ==========================================
// 🪙 COMPRAR 5 PISTAS
// ==========================================

function comprarCincoPistas() {

    revisarPistaGratis();


    if (
        dmMonedas < 400
    ) {

        alert(
            "❌ No tienes suficientes monedas."
        );

        return;

    }


    dmMonedas -= 400;

    dmPistas += 5;


    guardarDatosPistas();

    actualizarPanelPistas();


    alert(
        "💡 ¡Compraste 5 pistas con monedas!"
    );

}


// ==========================================
// 💳 COMPRA REAL
// ==========================================

function iniciarCompraPista(cantidad, precio) {

    console.log(
        "🛒 Compra solicitada:",
        cantidad,
        "pistas por",
        precio,
        "COP"
    );


    alert(
        "💳 La compra real estará disponible próximamente.\n\n" +
        "Paquete: " +
        cantidad +
        " pista(s)\n" +
        "Precio: $" +
        precio.toLocaleString("es-CO") +
        " COP"
    );

}


// ==========================================
// 💡 PISTAS DURANTE EL JUEGO
// ==========================================

function actualizarPistasEnJuego() {

    revisarPistaGratis();


    const elemento =
        document.getElementById(
            "pistasEnJuego"
        );


    const boton =
        document.getElementById(
            "usarPistaButton"
        );


    if (elemento) {

        elemento.textContent =
            dmPistas;

    }


    if (boton) {

        boton.disabled =
            dmPistas <= 0;

    }

}


// ==========================================
// 👁️ OCULTAR PISTA
// ==========================================

function ocultarPistaActual() {

    const pista =
        document.getElementById(
            "pistaActual"
        );


    if (pista) {

        pista.classList.add(
            "hidden"
        );


        pista.textContent =
            "";

    }

}


// ==========================================
// 💡 USAR PISTA
// ==========================================

function usarPista() {

    revisarPistaGratis();


    if (
        dmPistas <= 0
    ) {

        alert(
            "❌ No tienes pistas. Puedes conseguir una gratis cada 50 minutos o conseguir más desde la tienda."
        );

        return;

    }


    if (
        currentQuestion >=
        gameQuestions.length
    ) {

        return;

    }


    const question =
        gameQuestions[currentQuestion];


    dmPistas--;


    guardarDatosPistas();


    const respuestaCorrecta =
        question.answers[
            question.correct
        ];


    const pista =
        document.getElementById(
            "pistaActual"
        );


    if (pista) {

        pista.innerHTML =
            "💡 <strong>RESPUESTA CORRECTA:</strong><br>" +
            "<span>" +
            respuestaCorrecta +
            "</span>";


        pista.classList.remove(
            "hidden"
        );

    }


    const buttons =
        document.querySelectorAll(
            ".answer"
        );


    buttons.forEach(button => {

        button.classList.remove(
            "hint-correct"
        );

    });


    if (
        buttons[question.correct]
    ) {

        buttons[question.correct]
            .classList.add(
                "hint-correct"
            );

    }


    actualizarPistasEnJuego();


    vibrate([50]);


    console.log(
        "💡 Pista utilizada. Respuesta correcta:",
        respuestaCorrecta
    );

}


// ==========================================
// 👥 MULTIJUGADOR
// ==========================================

function openMultiplayerScreen() {

    showScreen(
        "multiplayerScreen"
    );

}


function showJoinRoom() {

    const box =
        document.getElementById(
            "joinRoomBox"
        );


    if (box) {

        box.classList.remove(
            "hidden"
        );


        const input =
            document.getElementById(
                "roomCode"
            );


        if (input) {

            input.focus();

        }

    }

}


// ==========================================
// 🏠 CREAR SALA
// ==========================================

function createRoom() {

    if (
        typeof firebase === "undefined" ||
        typeof db === "undefined"
    ) {

        alert(
            "❌ Firebase no está conectado. Revisa el index.html."
        );

        return;

    }


    const createButton =
        document.querySelector(
            "#multiplayerScreen .main-button"
        );


    if (createButton) {

        createButton.disabled = true;

        createButton.textContent =
            "⏳ Creando sala...";

    }


    roomCode =
        generateRoomCode();

    isHost = true;


    roomRef =
        db.ref(
            "rooms/" + roomCode
        );


    const roomData = {

        host: {

            name:
                playerName ||
                "Jugador 1",

            connected: true

        },

        guest: null,

        status: "waiting",

        createdAt:
            firebase.database.ServerValue.TIMESTAMP

    };


    roomRef
        .set(roomData)
        .then(() => {

            console.log(
                "✅ Sala creada:",
                roomCode
            );


            const display =
                document.getElementById(
                    "displayRoomCode"
                );


            if (display) {

                display.textContent =
                    roomCode;

            }


            const host =
                document.getElementById(
                    "hostName"
                );


            if (host) {

                host.textContent =
                    playerName ||
                    "Jugador 1";

            }


            resetRoomUI();

            showScreen(
                "roomScreen"
            );


            listenToRoom();

        })
        .catch(error => {

            console.error(
                "❌ Error creando sala:",
                error
            );


            roomCode = "";

            isHost = false;


            alert(
                "No se pudo crear la sala. Revisa la conexión con Firebase."
            );

        })
        .finally(() => {

            if (createButton) {

                createButton.disabled = false;

                createButton.textContent =
                    "🏠 Crear sala";

            }

        });

}


// ==========================================
// 🔑 UNIRSE A SALA
// ==========================================

function joinRoom() {

    if (
        typeof firebase === "undefined" ||
        typeof db === "undefined"
    ) {

        alert(
            "❌ Firebase no está conectado."
        );

        return;

    }


    const input =
        document.getElementById(
            "roomCode"
        );


    if (!input) {

        return;

    }


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (
        code.length !== 6
    ) {

        alert(
            "El código debe tener 6 caracteres."
        );

        return;

    }


    const joinButton =
        document.querySelector(
            "#joinRoomBox .main-button"
        );


    if (joinButton) {

        joinButton.disabled = true;

        joinButton.textContent =
            "⏳ Entrando...";

    }


    const joiningRef =
        db.ref(
            "rooms/" + code
        );


    joiningRef
        .once("value")
        .then(snapshot => {

            if (!snapshot.exists()) {

                throw new Error(
                    "NOT_FOUND"
                );

            }


            const room =
                snapshot.val();


            if (
                room.guest
            ) {

                throw new Error(
                    "FULL"
                );

            }


            roomCode =
                code;

            isHost = false;

            roomRef =
                joiningRef;


            return joiningRef
                .update({

                    guest: {

                        name:
                            playerName ||
                            "Jugador 2",

                        connected: true

                    }

                });

        })
        .then(() => {

            console.log(
                "✅ Entraste a la sala:",
                roomCode
            );


            const display =
                document.getElementById(
                    "displayRoomCode"
                );


            if (display) {

                display.textContent =
                    roomCode;

            }


            resetRoomUI();

            showScreen(
                "roomScreen"
            );


            listenToRoom();

        })
        .catch(error => {

            console.error(
                "❌ Error entrando:",
                error
            );


            if (
                error.message ===
                "NOT_FOUND"
            ) {

                alert(
                    "❌ Esa sala no existe."
                );

            }

            else if (
                error.message ===
                "FULL"
            ) {

                alert(
                    "❌ Esa sala ya tiene dos jugadores."
                );

            }

            else {

                alert(
                    "❌ No se pudo entrar a la sala."
                );

            }

        })
        .finally(() => {

            if (joinButton) {

                joinButton.disabled = false;

                joinButton.textContent =
                    "Entrar a la sala";

            }

        });

}


// ==========================================
// 👂 ESCUCHAR SALA
// ==========================================

function listenToRoom() {

    if (!roomCode) {

        return;

    }


    if (
        roomListener &&
        roomRef
    ) {

        roomRef.off(
            "value",
            roomListener
        );

    }


    roomRef =
        db.ref(
            "rooms/" + roomCode
        );


    roomListener =
        snapshot => {

            if (!snapshot.exists()) {

                alert(
                    "⚠️ La sala ya no existe."
                );


                stopRoomListener();

                roomCode = "";

                isHost = false;


                showScreen(
                    "multiplayerScreen"
                );


                return;

            }


            const room =
                snapshot.val();


            const guestNameElement =
                document.getElementById(
                    "guestName"
                );


            const waitingText =
                document.getElementById(
                    "waitingText"
                );


            const startButton =
                document.getElementById(
                    "startMultiplayerButton"
                );


            const opponentName =
                document.getElementById(
                    "opponentName"
                );


            if (room.guest) {

                const name =
                    room.guest.name ||
                    "Jugador 2";


                if (guestNameElement) {

                    guestNameElement.textContent =
                        name;

                }


                if (waitingText) {

                    if (isHost) {

                        waitingText.textContent =
                            "🟢 ¡Jugador 2 conectado!";

                    }

                    else {

                        waitingText.textContent =
                            "🟢 Conectado. Esperando al anfitrión...";

                    }

                }


                if (opponentName) {

                    opponentName.textContent =
                        name;

                }


                if (
                    isHost &&
                    room.status === "waiting"
                ) {

                    if (startButton) {

                        startButton.classList.remove(
                            "hidden"
                        );

                        startButton.disabled =
                            false;

                    }

                }

                else {

                    if (startButton) {

                        startButton.classList.add(
                            "hidden"
                        );

                    }

                }

            }

            else {

                if (guestNameElement) {

                    guestNameElement.textContent =
                        "Esperando...";

                }


                if (waitingText) {

                    waitingText.textContent =
                        "⏳ Esperando al otro jugador...";

                }


                if (startButton) {

                    startButton.classList.add(
                        "hidden"
                    );

                }

            }


            if (
                room.status ===
                "playing"
            ) {

                if (
                    room.settings
                ) {

                    selectedCategory =
                        room.settings.category ||
                        "mixed";


                    selectedAmount =
                        Number(
                            room.settings.amount
                        ) || 10;


                    selectedDifficulty =
                        room.settings.difficulty ||
                        "easy";

                }


                const game =
                    document.getElementById(
                        "gameScreen"
                    );


                if (
                    game &&
                    !game.classList.contains(
                        "active"
                    )
                ) {

                    startMultiplayerLocally();

                }

            }

        };


    roomRef.on(
        "value",
        roomListener
    );


    if (isHost) {

        roomRef
            .child("host")
            .onDisconnect()
            .update({
                connected: false
            });

    }

    else {

        roomRef
            .child("guest")
            .onDisconnect()
            .update({
                connected: false
            });

    }

}


// ==========================================
// 🎮 INICIAR MULTIJUGADOR
// ==========================================

function startMultiplayerGame() {

    if (!isHost) {

        alert(
            "Solo el anfitrión puede iniciar la partida."
        );

        return;

    }


    if (
        !roomCode ||
        !roomRef
    ) {

        alert(
            "No hay una sala activa."
        );

        return;

    }


    const startButton =
        document.getElementById(
            "startMultiplayerButton"
        );


    if (startButton) {

        startButton.disabled =
            true;

        startButton.textContent =
            "⏳ Iniciando...";

    }


    const settings = {

        category:
            selectedCategory || "mixed",

        amount:
            Number(selectedAmount) || 10,

        difficulty:
            selectedDifficulty || "easy"

    };


    roomRef
        .update({

            status: "playing",

            settings: settings,

            startedAt:
                firebase.database.ServerValue.TIMESTAMP

        })
        .then(() => {

            console.log(
                "🎮 Partida iniciada."
            );


            startMultiplayerLocally();

        })
        .catch(error => {

            console.error(
                "❌ Error iniciando partida:",
                error
            );


            alert(
                "No se pudo iniciar la partida."
            );


            if (startButton) {

                startButton.disabled =
                    false;

                startButton.textContent =
                    "🎮 Iniciar partida";

            }

        });

}


// ==========================================
// 🎮 MULTIJUGADOR LOCAL
// ==========================================

function startMultiplayerLocally() {

    clearInterval(timer);

    prepareQuestions();


    if (
        gameQuestions.length === 0
    ) {

        alert(
            "No hay suficientes preguntas para esta configuración."
        );

        return;

    }


    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    wrongAnswers = 0;

    currentStreak = 0;


    const opponentBar =
        document.getElementById(
            "opponentBar"
        );


    if (opponentBar) {

        opponentBar.classList.remove(
            "hidden"
        );

    }


    showScreen(
        "gameScreen"
    );


    updateScore();

    updateStreak();

    startMusic();

    showQuestion();


    console.log(
        "🎮 Multijugador iniciado."
    );

}


// ==========================================
// 🛑 DETENER ESCUCHADOR
// ==========================================

function stopRoomListener() {

    if (
        roomRef &&
        roomListener
    ) {

        roomRef.off(
            "value",
            roomListener
        );

    }


    roomListener = null;

}


// ==========================================
// 🧹 LIMPIAR CONEXIÓN
// ==========================================

function cleanupRoomConnection(
    removeRoom = false
) {

    if (!roomRef) {

        return;

    }


    stopRoomListener();


    if (removeRoom) {

        roomRef
            .remove()
            .catch(error => {

                console.error(
                    "Error eliminando sala:",
                    error
                );

            });

    }

    else {

        if (isHost) {

            roomRef
                .child("host")
                .update({
                    connected: false
                })
                .catch(() => {});

        }

        else {

            roomRef
                .child("guest")
                .remove()
                .catch(() => {});

        }

    }


    roomRef = null;

}


// ==========================================
// 🔢 GENERAR CÓDIGO
// ==========================================

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "";


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        code +=
            characters.charAt(
                Math.floor(
                    Math.random() *
                    characters.length
                )
            );

    }


    return code;

}


// ==========================================
// 🔄 REINICIAR SALA
// ==========================================

function resetRoomUI() {

    const guest =
        document.getElementById(
            "guestName"
        );


    const waiting =
        document.getElementById(
            "waitingText"
        );


    const startButton =
        document.getElementById(
            "startMultiplayerButton"
        );


    if (guest) {

        guest.textContent =
            "Esperando...";

    }


    if (waiting) {

        waiting.textContent =
            "⏳ Esperando al otro jugador...";

    }


    if (startButton) {

        startButton.classList.add(
            "hidden"
        );

        startButton.disabled =
            false;

        startButton.textContent =
            "🎮 Iniciar partida";

    }

}


// ==========================================
// 📋 COPIAR CÓDIGO
// ==========================================

function copyRoomCode() {

    if (!roomCode) {

        return;

    }


    if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(roomCode)
            .then(() => {

                alert(
                    "¡Código copiado! 📋"
                );

            })
            .catch(() => {

                alert(
                    "Código: " +
                    roomCode
                );

            });

    }

    else {

        alert(
            "Código: " +
            roomCode
        );

    }

}


// ==========================================
// 🚪 SALIR DE SALA
// ==========================================

function leaveRoom() {

    if (roomRef) {

        if (isHost) {

            cleanupRoomConnection(true);

        }

        else {

            cleanupRoomConnection(false);

        }

    }


    roomCode = "";

    isHost = false;

    roomRef = null;

    roomListener = null;


    resetRoomUI();


    showScreen(
        "multiplayerScreen"
    );

}


// ==========================================
// ⌨️ TECLADO A B C D
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        const game =
            document.getElementById(
                "gameScreen"
            );


        if (
            game?.classList.contains(
                "active"
            )
        ) {

            const keys = {

                a: 0,
                b: 1,
                c: 2,
                d: 3

            };


            const key =
                event.key.toLowerCase();


            if (
                key in keys
            ) {

                selectAnswer(
                    keys[key]
                );

            }

        }

    }
);


// ==========================================
// 🚀 INICIAR APLICACIÓN
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadSettings();

        revisarPistaGratis();

        actualizarPanelPistas();

        showScreen(
            "homeScreen"
        );


        console.log(
            "🧠 Desafío Mental cargado correctamente."
        );


        console.log(
            "🏆 Récord personal:",
            bestScore
        );


        console.log(
            "🔥 Mejor racha:",
            bestStreak
        );


        console.log(
            "💡 Pistas:",
            dmPistas
        );


        console.log(
            "🪙 Monedas:",
            dmMonedas
        );

    }
);


// ==========================================
// ⏰ ACTUALIZAR PISTAS
// ==========================================

setInterval(
    actualizarPanelPistas,
    1000
);
```
