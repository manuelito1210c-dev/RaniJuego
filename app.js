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

            setTimeout(() => {
                heart.remove(); 
            }, 12000);
        }

        for(let i=0; i<6; i++) spawnHeart(); 
        setInterval(spawnHeart, 1500); 
    }

    // Efecto Ripple Táctil
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

                window.requestAnimationFrame(() => {
                    ripple.classList.add('animate');
                });
            }

            if (navigator.vibrate) navigator.vibrate(15); 
        }, { passive: true });
    });
    // ==========================================
    // 2. LÓGICA: PANTALLA DE INGRESO (index.html)
    // ==========================================
    const loginForm = document.getElementById('login-form');
    const nicknameInput = document.getElementById('nickname');

    if (loginForm && nicknameInput) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Fundamental: Evita que la página se recargue al presionar "Enter" en el celular
            
            const nickname = nicknameInput.value.trim();
            
            // Validación visual de error (Efecto Shake) si está vacío
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

            // Guardamos el usuario en la sesión
            sessionStorage.setItem('currentPlayer', nickname);
            
            // Transición fluida de salida de pantalla
            document.querySelector('main').style.opacity = '0';
            document.querySelector('main').style.transform = 'translateY(-20px) scale(0.95)';
            document.querySelector('main').style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            // Redirección hacia la pantalla de preguntas
            setTimeout(() => {
                window.location.href = 'quiz.html'; 
            }, 500);
        });
    }
    
    // ==========================================
    // 3. LÓGICA: PANTALLA DE JUEGO (quiz.html)
    // ==========================================
    const timerBar = document.getElementById('timer-bar');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const scoreDisplay = document.getElementById('score-display');

    if (timerBar && questionText && optionsContainer) {
        
                const quizQuestions = [
            { 
                question: "¿Cuál es su comida favorita absoluta?", 
                options: ["Matambre a la pizza", "Empanadas de carne con limón", "Pizza", "Milanesas Napolitanas con Papas"], 
                answer: 1 
            },
            { 
                question: "¿Cuál es su color favorito?", 
                options: ["Rosa", "Le gustan todos los colores", "Bordó", "Rojo"], 
                answer: 1 
            },
            { 
                question: "¿Qué es lo que más le gusta hacer en su tiempo libre?", 
                options: ["Cocinar", "Salir a pasear y tomar fotos", "Conocer pueblitos, caminar por la naturaleza", "Salir de compras"], 
                answer: 2 
            },
            { 
                question: "Si pudiera viajar a cualquier lugar del mundo mañana mismo, ¿a dónde iría?", 
                options: ["París", "Venecia", "Misiones (las Cataratas)", "Chaco"], 
                answer: 0 
            },
            { 
                question: "¿Qué bebida es su favorita?", 
                options: ["Fernet", "Vino", "Gancia", "Gin Tonic"], 
                answer: 3 
            },
            { 
                question: "Se dice que su serie y película favorita que vería una y otra vez son Breaking Bad (serie) y Orgullo y Prejuicio (película). ¿Verdadero o falso?", 
                options: ["Verdadero", "Falso"], 
                answer: 0 
            },
            { 
                question: "¿Prefiere el dulce o el salado?", 
                options: ["Dulce", "Salado", "Ambos"], 
                answer: 1 
            },
            { 
                question: "¿Cuál es tu cantante favorito?", 
                options: ["Enrique Iglesias", "Ricardo Arjona", "Ricardo Montaner", "Cristian Castro"], 
                answer: 3 
            },
            { 
                question: "Tik Tok es la app que tiene más tiempo abierta en su teléfono 🤭. ¿Verdadero o Falso?", 
                options: ["Verdadero", "Falso"], 
                answer: 1 
            },
            { 
                question: "Ganó un torneo de Newcom (un deporte alternativo). ¿Verdadero o Falso?", 
                options: ["Verdadero", "Falso"], 
                answer: 0 
            },
            { 
                question: "Frase que la define y que dice siempre:", 
                options: ["El éxito es la suma de pequeños esfuerzos diarios", "Un café más y arranco, lo prometo.", "No sé qué hago, pero lo estoy haciendo con estilo.", "Mi plan es que todo salga bien por arte de magia."], 
                answer: 0 
            },
            { 
                question: "¿Qué prefiere consumir a la hora del desayuno?", 
                options: ["Té con pan casero", "Mate con galletitas con dulce de leche", "Café con leche y 2 medialunas", "No desayuna nada"], 
                answer: 2 
            },
            { 
                question: "¿Estación favorita del año?", 
                options: ["Invierno", "Otoño", "Verano", "Primavera"], 
                answer: 1 
            },
            { 
                question: "Sus accesorios tienen que ser dorados siempre, siempre. ¿Verdadero o falso?", 
                options: ["Verdadero", "Falso"], 
                answer: 1 
            }
        ];
        
        let currentQuestionIndex = 0;
        let currentScore = 0;
        let timeRemaining = 15;
        let timerInterval;
        let hasAnswered = false;
        let playerNickname = sessionStorage.getItem('currentPlayer') || 'Invitado';

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        shuffleArray(quizQuestions);

        function loadQuestion() {
            if (currentQuestionIndex >= quizQuestions.length) {
                finishQuiz();
                return;
            }

            hasAnswered = false;
            timeRemaining = 15;
            
            const currentQ = quizQuestions[currentQuestionIndex];
            
            questionText.style.opacity = 0;
            optionsContainer.style.opacity = 0;

            setTimeout(() => {
                questionText.innerText = currentQ.question;
                optionsContainer.innerHTML = ''; 

                currentQ.options.forEach((opt, index) => {
                    const isCorrect = index === currentQ.answer;
                    const btnHTML = `
                        <button class="quiz-option glass-btn relative overflow-hidden w-full py-5 px-6 rounded-2xl border border-white/10 bg-white/5 text-left font-semibold text-zinc-200 transition-all duration-200 active:scale-[0.98] flex justify-between items-center group" data-correct="${isCorrect}">
                            <span class="relative z-10 pointer-events-none">${opt}</span>
                            <div class="w-5 h-5 rounded-full border-2 border-white/20 group-active:border-rose-400 relative z-10 pointer-events-none"></div>
                            <span class="ripple absolute bg-white/20 rounded-full pointer-events-none transform scale-0"></span>
                        </button>
                    `;
                    optionsContainer.insertAdjacentHTML('beforeend', btnHTML);
                });

                questionText.style.opacity = 1;
                optionsContainer.style.opacity = 1;

                attachTouchEvents();
                
                timerBar.classList.remove('animate-timer');
                void timerBar.offsetWidth; 
                timerBar.classList.add('animate-timer');
                timerBar.style.animationPlayState = 'running';
                
                startTimer();
            }, 300);
        }

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeRemaining--;
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    timerBar.style.animationPlayState = 'paused';
                    if (!hasAnswered) processAnswer(null); 
                }
            }, 1000);
        }

        function attachTouchEvents() {
            const options = document.querySelectorAll('.quiz-option');
            options.forEach(button => {
                
                button.addEventListener('touchstart', function(e) {
                    if (hasAnswered) return;
                    const touch = e.touches[0];
                    const rect = this.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    const ripple = this.querySelector('.ripple');
                    
                    if (ripple) {
                        ripple.classList.remove('animate');
                        ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
                        ripple.style.left = `${x - rect.width / 2}px`;
                        ripple.style.top = `${y - rect.height / 2}px`;
                        ripple.style.opacity = '1';
                        ripple.style.transform = 'scale(0)';

                        window.requestAnimationFrame(() => ripple.classList.add('animate'));
                    }
                    if (navigator.vibrate) navigator.vibrate(15);
                }, { passive: true });

                button.addEventListener('click', function() {
                    if (hasAnswered) return;
                    processAnswer(this);
                });
            });
        }

        function processAnswer(selectedButton) {
            hasAnswered = true;
            clearInterval(timerInterval);
            timerBar.style.animationPlayState = 'paused';

            const options = document.querySelectorAll('.quiz-option');
            options.forEach(opt => opt.classList.add('disabled'));

            if (selectedButton) selectedButton.classList.add('selected');

            setTimeout(() => {
                options.forEach(opt => {
                    opt.classList.remove('selected');
                    if (opt.dataset.correct === "true") {
                        opt.classList.add('correct');
                        if (selectedButton === opt) {
                            const pointsEarned = 100 + (timeRemaining * 10);
                            currentScore += pointsEarned;
                            scoreDisplay.innerText = currentScore;
                            
                            scoreDisplay.classList.add('text-green-400', 'scale-125');
                            setTimeout(() => scoreDisplay.classList.remove('text-green-400', 'scale-125'), 500);

                            // Envío de broadcast en vivo
                            if (typeof window.broadcastScore === 'function') {
                                window.broadcastScore(currentScore);
                            }
                        }
                    } else {
                        opt.classList.add('incorrect');
                    }
                });

                setTimeout(() => {
                    currentQuestionIndex++;
                    loadQuestion();
                }, 2500);
            }, 1000);
        }

        function finishQuiz() {
            questionText.style.opacity = 0;
            optionsContainer.style.opacity = 0;
            
            setTimeout(() => {
                questionText.innerText = "¡Completado!";
                questionText.style.opacity = 1;
                
                optionsContainer.innerHTML = `
                    <div class="glass-card p-8 rounded-[2rem] text-center border border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                        <div class="text-rose-200 text-sm tracking-widest uppercase mb-2">Tu Puntaje Final</div>
                        <div class="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">${currentScore}</div>
                        <div class="w-10 h-10 mx-auto rounded-full border-t-2 border-rose-400 animate-spin"></div>
                    </div>
                `;
                optionsContainer.style.opacity = 1;
            }, 300);

            // 1. Último broadcast a la sala
            if (typeof window.broadcastScore === 'function') {
                window.broadcastScore(currentScore);
            }

            // 2. Persistencia en la Base de Datos
            if (typeof window.guardarPuntajeFinal === 'function') {
                window.guardarPuntajeFinal(playerNickname, currentScore);
            }

            // 3. Guardar localmente para la pantalla de Leaderboard
            sessionStorage.setItem('finalScore', currentScore);

            setTimeout(() => {
                window.location.href = 'leaderboard.html';
            }, 3000);
        }

        loadQuestion();
    }
});
        
