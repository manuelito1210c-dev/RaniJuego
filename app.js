document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. EFECTOS GLOBALES (Ambas pantallas)
    // ==========================================

    // Generador de Corazones Flotantes
    const heartsContainer = document.getElementById('floating-hearts-container');
    if (heartsContainer) {
        function spawnHeart() {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');
            heart.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#be123c" class="w-full h-full opacity-60">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
            `;
            const size = Math.random() * 15 + 10; 
            heart.style.width = `${size}px`;
            heart.style.height = `${size}px`;
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.animationDuration = `${Math.random() * 5 + 7}s`; 
            
            heartsContainer.appendChild(heart);
            setTimeout(() => heart.remove(), 12000); 
        }

        for(let i=0; i<6; i++) spawnHeart(); 
        setInterval(spawnHeart, 1500); 
    }

    // Efecto Ripple Táctil Unificado
    const rippleButtons = document.querySelectorAll('.btn-border-beam, .quiz-option');
    rippleButtons.forEach(btn => {
        btn.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const ripple = this.querySelector('.ripple');
            if (ripple) {
                ripple.classList.remove('animate');
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x - size / 2}px`;
                ripple.style.top = `${y - size / 2}px`;
                ripple.style.opacity = '1';
                ripple.style.transform = 'scale(0)';

                window.requestAnimationFrame(() => ripple.classList.add('animate'));
            }
            if (navigator.vibrate) navigator.vibrate(15); 
        }, { passive: true });
    });


    // ==========================================
    // 2. LÓGICA: PANTALLA DE INGRESO (index.html)
    // ==========================================
    const btnStart = document.getElementById('btn-start');
    const nicknameInput = document.getElementById('nickname');

    // La condición 'if' asegura que esto solo corra en el index
    if (btnStart && nicknameInput) {
        btnStart.addEventListener('click', () => {
            const nickname = nicknameInput.value.trim();
            
            if (!nickname) {
                nicknameInput.style.transition = 'transform 0.1s ease-in-out';
                nicknameInput.classList.add('border-rose-500', 'bg-rose-950/40');
                
                setTimeout(() => nicknameInput.style.transform = 'translateX(-6px)', 0);
                setTimeout(() => nicknameInput.style.transform = 'translateX(6px)', 100);
                setTimeout(() => nicknameInput.style.transform = 'translateX(-3px)', 200);
                setTimeout(() => nicknameInput.style.transform = 'translateX(0)', 300);
                
                setTimeout(() => nicknameInput.classList.remove('border-rose-500', 'bg-rose-950/40'), 1500);
                return;
            }

            sessionStorage.setItem('currentPlayer', nickname);
            
            document.querySelector('main').style.opacity = '0';
            document.querySelector('main').style.transform = 'translateY(-20px) scale(0.95)';
            document.querySelector('main').style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            setTimeout(() => {
                window.location.href = 'quiz.html'; 
            }, 500);
        });
    }

    // ==========================================
    // 3. LÓGICA: PANTALLA DE JUEGO (quiz.html)
    // ==========================================
    const timerBar = document.getElementById('timer-bar');
    const options = document.querySelectorAll('.quiz-option');

    // La condición 'if' asegura que esto solo corra en el quiz
    if (timerBar && options.length > 0) {
        let timeRemaining = 15;
        let timerInterval;
        let hasAnswered = false;

        timerBar.classList.add('animate-timer');

        function startTimer() {
            timerInterval = setInterval(() => {
                timeRemaining--;
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    timerBar.style.animationPlayState = 'paused';
                    if (!hasAnswered) {
                        revealAnswers(); 
                    }
                }
            }, 1000);
        }

        startTimer();

        options.forEach(button => {
            button.addEventListener('click', function() {
                if (hasAnswered) return;
                hasAnswered = true;
                
                clearInterval(timerInterval);
                timerBar.style.animationPlayState = 'paused';

                this.classList.add('selected');
                options.forEach(opt => opt.classList.add('disabled'));

                setTimeout(() => {
                    revealAnswers(this);
                }, 1500);
            });
        });

        function revealAnswers(selectedButton = null) {
            options.forEach(opt => {
                opt.classList.remove('selected');
                
                if (opt.dataset.correct === "true") {
                    opt.classList.add('correct');
                    
                    if (selectedButton === opt) {
                        const scoreDisplay = document.getElementById('score-display');
                        let currentScore = parseInt(scoreDisplay.innerText);
                        scoreDisplay.innerText = currentScore + 100;
                        
                        scoreDisplay.classList.add('text-green-400', 'scale-125', 'transition-transform');
                        setTimeout(() => scoreDisplay.classList.remove('text-green-400', 'scale-125'), 500);
                    }
                } else {
                    opt.classList.add('incorrect');
                }
            });

            setTimeout(() => {
                console.log("Transición a la siguiente pregunta...");
            }, 3000);
        }
    }
});
