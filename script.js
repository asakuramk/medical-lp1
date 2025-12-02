document.addEventListener('DOMContentLoaded', () => {
    // --- PASSWORD PROTECTION ---
    const CORRECT_PASSWORD = 'wakaayu';
    const passwordScreen = document.getElementById('password-screen');
    const mainContent = document.getElementById('main-content');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');

    // Check if password was previously entered in this session
    if (sessionStorage.getItem('authenticated') === 'true') {
        showMainContent();
    }

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value;

        if (enteredPassword === CORRECT_PASSWORD) {
            sessionStorage.setItem('authenticated', 'true');
            showMainContent();
        } else {
            passwordError.textContent = 'パスワードが正しくありません';
            passwordInput.value = '';
            passwordInput.focus();

            // Shake animation
            passwordInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
        }
    });

    function showMainContent() {
        passwordScreen.style.display = 'none';
        mainContent.classList.remove('hidden-content');
        mainContent.style.display = 'block';

        // ログイン通知を送信
        sendLoginNotification();
    }

    async function sendLoginNotification() {
        let userIP = '不明 (取得失敗)';
        try {
            // IPアドレスを取得
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    userIP = ipData.ip;
                }
            } catch (ipError) {
                console.warn('IP address fetch failed:', ipError);
            }

            // User Agentを取得
            const userAgent = navigator.userAgent;

            console.log('Sending login notification for IP:', userIP);

            // Google Apps Scriptに送信
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbznPIsFzJA9XE7Rq7Wp_lOBsUxqR8B2jV55lChwYOJoOyHC2UrFJpodrSLsWW9eW_YZ/exec';

            // URLパラメータを構築
            const params = new URLSearchParams({
                ip: userIP,
                userAgent: userAgent
            });

            await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
                method: 'GET',
                mode: 'no-cors'
            });

            console.log('Login notification request sent');
        } catch (error) {
            console.error('Failed to send login notification:', error);
        }
    }

    // --- EXISTING CODE BELOW ---
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Comic Viewer Interaction
    const comicViewer = document.querySelector('.comic-viewer');
    const comicImage = document.querySelector('.comic-image');
    let isZoomed = false;

    if (comicViewer) {
        comicViewer.addEventListener('click', () => {
            isZoomed = !isZoomed;
            if (isZoomed) {
                comicImage.style.transform = 'scale(1.02)';
                comicViewer.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.2)';
            } else {
                comicImage.style.transform = 'scale(1)';
                comicViewer.style.boxShadow = '';
            }
        });
    }

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // --- GAME LOGIC ---
    const patients = [
        {
            id: 'rabbit',
            name: 'うさぎさん',
            symptom: '「お腹が痛いんです...」',
            treatment: 'medicine',
            happyDialogue: '「治りました！ありがとう！」',
            // Sprite positions would normally be calculated, using simple background color/emoji for demo if image fails
            color: '#FFE4E1'
        },
        {
            id: 'bear',
            name: 'くまさん',
            symptom: '「胸の音が気になるの...」',
            treatment: 'stethoscope',
            happyDialogue: '「安心しました〜」',
            color: '#D2B48C'
        },
        {
            id: 'cat',
            name: 'ねこさん',
            symptom: '「転んで怪我しちゃった...」',
            treatment: 'bandage',
            happyDialogue: '「痛くない！すごい！」',
            color: '#FFD700'
        },
        {
            id: 'rabbit_tired',
            name: 'うさぎさん',
            symptom: '「なんだか疲れちゃって...」',
            treatment: 'tea',
            happyDialogue: '「ほっとしました...」',
            color: '#FFE4E1'
        },
        {
            id: 'bear_cough',
            name: 'くまさん',
            symptom: '「咳が出るんです...」',
            treatment: 'medicine',
            happyDialogue: '「楽になりました！」',
            color: '#D2B48C'
        }
    ];

    let currentPatientIndex = 0;
    let score = 0;
    let mistakes = 0;
    const MAX_MISTAKES = 3;

    const patientSprite = document.getElementById('patient-sprite');
    const patientDialogue = document.getElementById('patient-dialogue');
    const patientCount = document.getElementById('patient-count');
    const scoreDisplay = document.getElementById('score-display');
    const gameOverlay = document.getElementById('game-overlay');
    const restartBtn = document.getElementById('restart-btn');
    const actionBtns = document.querySelectorAll('.action-btn');

    // Sea of Blood elements
    const seaOfBloodScreen = document.getElementById('sea-of-blood-screen');
    const bloodRestartBtn = document.getElementById('blood-restart-btn');

    function updatePatient() {
        if (currentPatientIndex >= patients.length) {
            endGame();
            return;
        }

        const patient = patients[currentPatientIndex];
        patientDialogue.textContent = patient.symptom;
        patientCount.textContent = currentPatientIndex + 1;

        // For the demo, we'll just change background color/border to simulate sprite change
        // In a real implementation with the sprite sheet, we'd adjust background-position
        patientSprite.style.backgroundColor = patient.color;
        patientSprite.style.borderRadius = '50%';
        patientSprite.style.border = 'none';
        patientSprite.style.transform = 'scale(1)';
    }

    function handleTreatment(action) {
        const patient = patients[currentPatientIndex];

        if (action === patient.treatment) {
            // Success
            patientDialogue.textContent = patient.happyDialogue;
            patientSprite.style.transform = 'scale(1.2) rotate(10deg)';
            score++;
            updateScore();

            // Disable buttons temporarily
            actionBtns.forEach(btn => btn.disabled = true);

            setTimeout(() => {
                currentPatientIndex++;
                updatePatient();
                actionBtns.forEach(btn => btn.disabled = false);
            }, 1500);
        } else {
            // Wrong treatment
            mistakes++;

            if (mistakes >= MAX_MISTAKES) {
                triggerSeaOfBlood();
                return;
            }

            patientDialogue.textContent = '「それはちょっと違うかも...」';
            patientSprite.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                patientSprite.style.transform = 'translateX(10px)';
                setTimeout(() => {
                    patientSprite.style.transform = 'translateX(0)';
                }, 100);
            }, 100);
        }
    }

    function updateScore() {
        let hearts = '';
        for (let i = 0; i < score; i++) hearts += '❤️';
        scoreDisplay.textContent = hearts;
    }

    function endGame() {
        gameOverlay.classList.remove('hidden');
    }

    function triggerSeaOfBlood() {
        seaOfBloodScreen.classList.remove('hidden');
        // Force reflow
        void seaOfBloodScreen.offsetWidth;
        seaOfBloodScreen.classList.add('active');

        // Play sad music
        const music = document.getElementById('game-over-music');
        if (music) {
            music.currentTime = 0;
            music.play().catch(e => console.log('Audio play failed:', e));
        }

        // Create blood drips
        createBloodDrips();
    }

    function createBloodDrips() {
        const numberOfDrips = 20;
        for (let i = 0; i < numberOfDrips; i++) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip';
            drip.style.left = Math.random() * 100 + 'vw';
            drip.style.animationDuration = (Math.random() * 2 + 1) + 's';
            drip.style.animationDelay = Math.random() * 2 + 's';
            seaOfBloodScreen.appendChild(drip);
        }
    }

    function restartGame() {
        currentPatientIndex = 0;
        score = 0;
        mistakes = 0;
        updateScore();
        gameOverlay.classList.add('hidden');

        // Stop music
        const music = document.getElementById('game-over-music');
        if (music) {
            music.pause();
            music.currentTime = 0;
        }

        // Reset Sea of Blood
        seaOfBloodScreen.classList.remove('active');

        // Remove drips after fade out
        setTimeout(() => {
            seaOfBloodScreen.classList.add('hidden');
            // Remove all drips
            const drips = seaOfBloodScreen.querySelectorAll('.blood-drip');
            drips.forEach(drip => drip.remove());
        }, 2000); // Wait for fade out

        updatePatient();
    }

    // Event Listeners
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handleTreatment(btn.dataset.action);
        });
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }

    if (bloodRestartBtn) {
        bloodRestartBtn.addEventListener('click', restartGame);
    }

    // Initialize
    if (patientSprite) {
        updatePatient();
    }

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbznPIsFzJA9XE7Rq7Wp_lOBsUxqR8B2jV55lChwYOJoOyHC2UrFJpodrSLsWW9eW_YZ/exec';

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // ボタンを無効化
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            // フォームデータを取得
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            try {
                // Google Apps Scriptに送信
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Google Apps Scriptは no-cors が必要
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // 成功メッセージ（no-corsのため、レスポンスは読めない）
                formStatus.textContent = '✓ 送信完了しました。ありがとうございます！';
                formStatus.className = 'form-status success';
                contactForm.reset();

            } catch (error) {
                // エラーメッセージ
                formStatus.textContent = '✗ 送信に失敗しました。もう一度お試しください。';
                formStatus.className = 'form-status error';
            } finally {
                // ボタンを再有効化
                submitBtn.disabled = false;
                submitBtn.textContent = '送信する';
            }
        });
    }
});
