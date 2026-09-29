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

    // La respuesta correcta está en "correct"
    const correct =
        Number(question.correct);

    const buttons =
        document.querySelectorAll(".answer");

    buttons.forEach(
        (button, index) => {

            button.disabled = true;

            // 🟩 Mostrar respuesta correcta
            if (index === correct) {

                button.classList.add("correct");
            }
        }
    );

    updateScore();

    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1500);
}


// ==========================================
// RESPONDER PREGUNTA
// ==========================================

function selectAnswer(index) {

    if (answered) {
        return;
    }

    answered = true;

    clearInterval(timer);

    const question =
        gameQuestions[currentQuestion];

    // La respuesta correcta está en "correct"
    const correct =
        Number(question.correct);

    const buttons =
        document.querySelectorAll(".answer");


    buttons.forEach(
        (button, buttonIndex) => {

            button.disabled = true;


            // 🟩 RESPUESTA CORRECTA
            if (buttonIndex === correct) {

                button.classList.add("correct");
            }


            // 🟥 RESPUESTA INCORRECTA
            if (
                buttonIndex === index &&
                index !== correct
            ) {

                button.classList.add("wrong");
            }

        }
    );


    // ======================================
    // RESPUESTA CORRECTA
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

        // ==================================
        // RESPUESTA INCORRECTA
        // ==================================

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
    // PASAR A SIGUIENTE PREGUNTA
    // ======================================

    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1500);
}