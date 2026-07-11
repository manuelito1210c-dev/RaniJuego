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
    

    // ==========================================
    // 3. LÓGICA: PANTALLA DE JUEGO (quiz.html)
    // ==========================================
    const timerBar = document.getElementById('timer-bar');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const scoreDisplay = document.getElementById('score-display');

    if (timerBar && questionText && optionsContainer) {
        
        // Base de datos local de preguntas
        const quizQuestions = [
            { question: "¿Cuál es su comida favorita absoluta?", options: ["Matambre a la pizza", "Empanadas de carne con limón", "Pizza", "Milanesas Napolitanas con Papas"], answer: 1 },
            { question: "¿Cuál es su color favorito?", options: ["Rosa", "Le gustan todos los colores", "Bordó", "Rojo"], answer: 1 },
            { question: "¿Qué es lo que más le gusta hacer en su tiempo libre?", options: ["Cocinar", "Salir a pasear y tomar fotos", "Conocer pueblitos, caminar por la naturaleza", "Salir de compras"], answer: 2 },
            { question: "Si pudiera viajar a cualquier lugar del mundo mañana mismo, ¿a dónde iría?", options: ["París", "Venecia", "Misiones (las Cataratas)", "Chaco"], answer: 0 },
            { question: "¿Qué bebida es su favorita?", options: ["Fernet", "Vino", "Gancia", "Gin Tonic"], answer: 3 },
            { question: "¿Prefiere el dulce o el salado?", options: ["Dulce", "Salado", "Ambos"], answer: 1 }
            // Puedes agregar el resto aquí...
        ];

        let currentQuestionIndex = 0;
        let currentScore = 0;
        let timeRemaining = 15;
        let timerInterval;
        let hasAnswered = false;
        let playerNickname = sessionStorage.getItem('currentPlayer') || 'Invitado';

        // 3.1 Algoritmo para barajar aleatoriamente (Fisher-Yates)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Barajamos las preguntas al entrar para que cada jugador tenga un orden único
        shuffleArray(quizQuestions);

        // 3.2 Inyección dinámica de la pregunta
        function loadQuestion() {
            if (currentQuestionIndex >= quizQuestions.length) {
                finishQuiz();
                return;
            }

            hasAnswered = false;
            timeRemaining = 15;
            
            const currentQ = quizQuestions[currentQuestionIndex];
            
            // Animación de entrada
            questionText.style.opacity = 0;
            optionsContainer.style.opacity = 0;

            setTimeout(() => {
                questionText.innerText = currentQ.question;
                optionsContainer.innerHTML = ''; // Limpiar opciones anteriores

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
                
                // Reiniciar animación del temporizador
                timerBar.classList.remove('animate-timer');
                void timerBar.offsetWidth; // Trigger reflow nativo
                timerBar.classList.add('animate-timer');
                timerBar.style.animationPlayState = 'running';
                
                startTimer();
            }, 300);
        }

        // 3.3 Control del Temporizador
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

        // 3.4 Interacciones táctiles dinámicas
        function attachTouchEvents() {
            const options = document.querySelectorAll('.quiz-option');
            options.forEach(button => {
                
                // Efecto Ripple
                button.addEventListener('touchstart', function(e) {
                    if (hasAnswered) return;
                    const touch = e.touches[0];
                    const rect = this.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    const ripple = this.querySelector('.ripple');
                    
                    ripple.classList.remove('animate');
                    ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
                    ripple.style.left = `${x - rect.width / 2}px`;
                    ripple.style.top = `${y - rect.height / 2}px`;
                    ripple.style.opacity = '1';
                    ripple.style.transform = 'scale(0)';

                    window.requestAnimationFrame(() => ripple.classList.add('animate'));
                    if (navigator.vibrate) navigator.vibrate(15);
                }, { passive: true });

                // Selección de respuesta
                button.addEventListener('click', function() {
                    if (hasAnswered) return;
                    processAnswer(this);
                });
            });
        }

        // 3.5 Procesamiento de la respuesta y actualización en tiempo real
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
                            // Sumar puntos por velocidad (estilo Kahoot) o fijos
                            const pointsEarned = 100 + (timeRemaining * 10);
                            currentScore += pointsEarned;
                            scoreDisplay.innerText = currentScore;
                            
                            scoreDisplay.classList.add('text-green-400', 'scale-125');
                            setTimeout(() => scoreDisplay.classList.remove('text-green-400', 'scale-125'), 500);

                            // AQUÍ CONECTAS CON SUPABASE:
                            // updateSupabaseScore(playerNickname, currentScore);
                        }
                    } else {
                        opt.classList.add('incorrect');
                    }
                });

                // Avanzar a la siguiente pregunta
                setTimeout(() => {
                    currentQuestionIndex++;
                    loadQuestion();
                }, 2500);
            }, 1000);
        }

        function finishQuiz() {
            questionText.innerText = "¡Completado!";
            optionsContainer.innerHTML = `<div class="text-rose-200 text-lg">Puntaje final: ${currentScore}</div>`;
            // Redirigir a leaderboard.html
        }

        // Inicializar la primera pregunta
        loadQuestion();
    }
});
    
