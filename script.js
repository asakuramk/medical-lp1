document.addEventListener('DOMContentLoaded', () => {
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

    const patientSprite = document.getElementById('patient-sprite');
    const patientDialogue = document.getElementById('patient-dialogue');
    const patientCount = document.getElementById('patient-count');
    const scoreDisplay = document.getElementById('score-display');
    const gameOverlay = document.getElementById('game-overlay');
    const restartBtn = document.getElementById('restart-btn');
    const actionBtns = document.querySelectorAll('.action-btn');

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

    function restartGame() {
        currentPatientIndex = 0;
        score = 0;
        updateScore();
        gameOverlay.classList.add('hidden');
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

    // Initialize
    if (patientSprite) {
        updatePatient();
    }
});
