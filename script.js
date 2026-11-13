let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timerInterval;
let timeLeft = 10;
let lives = 3;

const DEV_PASSWORD = "OPEN_my-gamesDevMode";

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score');
const questionNumberDisplay = document.getElementById('question-number');
const finalScoreDisplay = document.getElementById('final-score');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

const devModeBtn = document.getElementById('dev-mode-btn');
const passwordModal = document.getElementById('password-modal');
const devPasswordInput = document.getElementById('dev-password');
const submitPasswordBtn = document.getElementById('submit-password');
const cancelPasswordBtn = document.getElementById('cancel-password');
const devScreen = document.getElementById('dev-screen');
const viewQuestionsBtn = document.getElementById('view-questions-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const questionsListScreen = document.getElementById('questions-list-screen');
const questionsListContainer = document.getElementById('questions-list-container');
const backToDevBtn = document.getElementById('back-to-dev-btn');

// --- مدیریت آهنگ‌ها ---
const audioQuiz = document.getElementById('bgm-quiz');
const audioDev = document.getElementById('bgm-dev');

// متغیرهای لوپ
const quizLoopStart = 1.2;
const quizLoopEnd = 118.9;
const devLoopStart = 34.598;
const devLoopEnd = 50.480;

// --- توابع کمکی ---
function updateLivesDisplay() {
    if (livesDisplay) livesDisplay.innerText = '❤️'.repeat(lives);
}

function loseLife() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        clearInterval(timerInterval);
        setTimeout(() => { endGame(); }, 1500);
    }
}

// پخش آهنگ کوییز
function playQuizMusic() {
    audioQuiz.pause();
    audioQuiz.currentTime = 0;
    audioQuiz.play().catch(e => console.log("پخش کوییز نیاز به تعامل دارد:", e));

    if (window.quizLoopInterval) clearInterval(window.quizLoopInterval);
    window.quizLoopInterval = setInterval(() => {
        if (audioQuiz.currentTime >= quizLoopEnd) {
            audioQuiz.currentTime = quizLoopStart;
        }
    }, 100);
}

// پخش آهنگ Developer Mode
function playDevMusic() {
    audioDev.currentTime = 0;
    audioDev.play().catch(e => console.log("پخش Dev نیاز به تعامل دارد:", e));

    if (window.devLoopInterval) clearInterval(window.devLoopInterval);
    window.devLoopInterval = setInterval(() => {
        if (audioDev.currentTime >= devLoopEnd) {
            audioDev.currentTime = devLoopStart;
        }
    }, 100);
}

// محو کردن آهنگ Developer Mode
function fadeOutDevMusic(callback) {
    let volume = audioDev.volume;
    const fadeInterval = setInterval(() => {
        if (volume > 0.05) {
            volume -= 0.05;
            audioDev.volume = volume;
        } else {
            clearInterval(fadeInterval);
            audioDev.pause();
            audioDev.volume = 1;
            if (callback) callback();
        }
    }, 50);
}

// Fade out کوییز
function fadeOutQuizMusic(callback) {
    let volume = audioQuiz.volume;
    const fadeInterval = setInterval(() => {
        if (volume > 0.05) {
            volume -= 0.05;
            audioQuiz.volume = volume;
        } else {
            clearInterval(fadeInterval);
            audioQuiz.pause();
            audioQuiz.volume = 1;
            if (callback) callback();
        }
    }, 50);
}

// --- شروع بازی ---
startBtn.addEventListener('click', () => startGame());
restartBtn.addEventListener('click', () => startGame());

function startGame() {
    startScreen.classList.remove('active');
    endScreen.classList.remove('active');
    devScreen.classList.remove('active');
    questionsListScreen.classList.remove('active');
    quizScreen.classList.add('active');

    document.body.classList.remove('developer-mode');
    audioDev.pause(); // مطمئن شو آهنگ Dev قطع شده

    score = 0;
    questionCounter = 0;
    lives = 3;
    updateLivesDisplay();
    scoreDisplay.innerText = `امتیاز: ${score}`;
    availableQuestions = [...geographyQuestions];

    playQuizMusic();
    showQuestion();
}

// --- منطق Developer Mode ---
devModeBtn.addEventListener('click', () => passwordModal.classList.add('active'));

cancelPasswordBtn.addEventListener('click', () => {
    passwordModal.classList.remove('active');
    devPasswordInput.value = '';
});

submitPasswordBtn.addEventListener('click', () => {
    if (devPasswordInput.value === DEV_PASSWORD) {
        passwordModal.classList.remove('active');
        startScreen.classList.remove('active');
        devScreen.classList.add('active');
        document.body.classList.add('developer-mode');
        devPasswordInput.value = '';

        // پخش آهنگ Developer Mode
        playDevMusic();
    } else {
        alert('رمز عبور اشتباه است!');
    }
});

// دکمه بازگشت از Developer Mode به منو
backToStartBtn.addEventListener('click', () => {
    // Fade out آهنگ Dev، بعد برگشت به منو
    fadeOutDevMusic(() => {
        devScreen.classList.remove('active');
        startScreen.classList.add('active');
        document.body.classList.remove('developer-mode');
    });
});

viewQuestionsBtn.addEventListener('click', () => {
    devScreen.classList.remove('active');
    questionsListScreen.classList.add('active');
    renderQuestionsList();
});

backToDevBtn.addEventListener('click', () => {
    questionsListScreen.classList.remove('active');
    devScreen.classList.add('active');
});

function renderQuestionsList() {
    questionsListContainer.innerHTML = '';
    geographyQuestions.forEach((q, index) => {
        const div = document.createElement('div');
        div.classList.add('question-item');
        const correctOption = q.options[q.correctAnswer];
        div.innerHTML = `
            <p><strong>سوال ${index + 1}:</strong> ${q.question}</p>
            <p>پاسخ صحیح: <span class="correct-answer">${correctOption}</span></p>
        `;
        questionsListContainer.appendChild(div);
    });
}

// --- نمایش سوال ---
function showQuestion() {
    clearInterval(timerInterval);

    if (availableQuestions.length === 0) {
        availableQuestions = [...geographyQuestions];
    }

    questionCounter++;
    questionNumberDisplay.innerText = `سوال ${questionCounter}`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentQuestion = availableQuestions[questionIndex];
    availableQuestions.splice(questionIndex, 1);

    questionText.innerText = currentQuestion.question;
    optionsContainer.innerHTML = "";
    nextBtn.classList.remove('show');

    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectAnswer(index, button, currentQuestion.correctAnswer));
        optionsContainer.appendChild(button);
    });

    timeLeft = 10;
    timerDisplay.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut(currentQuestion.correctAnswer);
        }
    }, 1000);
}

function handleTimeOut(correctAnswerIndex) {
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.disabled = true);
    allOptions[correctAnswerIndex].classList.add('correct');
    loseLife();
    nextBtn.classList.add('show');
}

function selectAnswer(selectedIndex, selectedButton, correctAnswerIndex) {
    clearInterval(timerInterval);
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctAnswerIndex) {
        selectedButton.classList.add('correct');
        score += 10;
        scoreDisplay.innerText = `امتیاز: ${score}`;
    } else {
        selectedButton.classList.add('wrong');
        allOptions[correctAnswerIndex].classList.add('correct');
        loseLife();
        score -= 5;
        if (score < 0) score = 0;
        scoreDisplay.innerText = `امتیاز: ${score}`;
    }

    if (audioQuiz.paused) {
        playQuizMusic();
    }

    nextBtn.classList.add('show');
}

nextBtn.addEventListener('click', () => showQuestion());

// --- پایان بازی ---
function endGame() {
    clearInterval(timerInterval);
    fadeOutQuizMusic(() => {
        playEndMusic();
    });
    quizScreen.classList.remove('active');
    endScreen.classList.add('active');
    finalScoreDisplay.innerText = score;
}

// --- دکمه برگشت به منو ---
backToMenuBtn.addEventListener('click', () => {
    endScreen.classList.remove('active');
    startScreen.classList.add('active');
    // ریست کردن فرم ثبت رکورد
    document.getElementById('record-form').style.display = 'flex';
    document.getElementById('player-name').value = '';
    document.getElementById('record-message').style.display = 'none';
});

// --- ثبت رکورد در SheetDB ---
const SHEETDB_URL = "https://sheetdb.io/api/v1/vrc427ka0tp2h";

document.getElementById('submit-score-btn').addEventListener('click', function () {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();
    const message = document.getElementById('record-message');

    if (name === "") {
        message.style.display = 'block';
        return;
    }

    message.style.display = 'none';

    const playerScore = score;
    const time = new Date().toLocaleString('fa-IR');

    const data = {
        "نام": name,
        "امتیاز": playerScore,
        "زمان": time
    };

    fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [data] })
    })
        .then(response => response.json())
        .then(() => {
            alert('رکوردت ثبت شد!');
            nameInput.value = '';
            document.getElementById('record-form').style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('متأسفانه ثبت نشد. دوباره تلاش کن!');
        });
});
