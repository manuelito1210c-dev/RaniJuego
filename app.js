document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GENERADOR DE CORAZONES FLOTANTES MÓVIL ---
    const heartsContainer = document.getElementById('floating-hearts-container');
    
    function spawnHeart() {
        if (!heartsContainer) return;
        
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        
        heart.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#be123c" class="w-full h-full opacity-60">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
        `;

        const size = Math.random() * 15 + 10; // Corazones un poco más sutiles para móvil
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.animationDuration = `${Math.random() * 5 + 7}s`; 
        
        heartsContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove(); // Limpieza del DOM crítica para el rendimiento móvil
        }, 12000);
    }

    for(let i=0; i<6; i++) spawnHeart(); // Carga inicial
    setInterval(spawnHeart, 1500); // Generación continua fluida

    // --- 2. LÓGICA DEL BOTÓN Y EFECTO TÁCTIL ---
    const btnStart = document.getElementById('btn-start');
    const nicknameInput = document.getElementById('nickname');

    // Efecto Ripple al tocar
    btnStart.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        const rect = this.getBoundingClientRect();
        
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const ripple = this.querySelector('.ripple');
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

        // Vibración háptica en celulares
        if (navigator.vibrate) navigator.vibrate(15); 
    }, { passive: true });

    // Lógica de Ingreso
    btnStart.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        
        // Validación visual de error
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
        
        // Transición de salida de pantalla
        document.querySelector('main').style.opacity = '0';
        document.querySelector('main').style.transform = 'translateY(-20px) scale(0.95)';
        document.querySelector('main').style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            console.log(`Jugador ${nickname} registrado. Conectando a Supabase Realtime...`);
        }, 500);
    });
});
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN DEL TEMPORIZADOR ---
    const timerBar = document.getElementById('timer-bar');
    const options = document.querySelectorAll('.quiz-option');
    let timeRemaining = 15;
    let timerInterval;
    let hasAnswered = false;

    // Iniciar la animación CSS fluida
    timerBar.classList.add('animate-timer');

    // Control lógico del tiempo
    function startTimer() {
        timerInterval = setInterval(() => {
            timeRemaining--;
            
            // Cuando el tiempo llega a 0
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerBar.style.animationPlayState = 'paused';
                if (!hasAnswered) {
                    revealAnswers(); // Revelar si se quedó sin tiempo
                }
            }
        }, 1000);
    }

    startTimer();

    // --- 2. LÓGICA DE SELECCIÓN TÁCTIL ---
    options.forEach(button => {
        
        // Manejo del efecto Ripple y selección
        button.addEventListener('touchstart', function(e) {
            if (hasAnswered) return; // Si ya respondió, no hacer nada

            // Ripple Effect
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const ripple = this.querySelector('.ripple');
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

            if (navigator.vibrate) navigator.vibrate(15); 
        }, { passive: true });

        // Al soltar el dedo (Confirmar respuesta)
        button.addEventListener('click', function() {
            if (hasAnswered) return;
            hasAnswered = true;
            
            // Pausar el temporizador visual y lógico
            clearInterval(timerInterval);
            timerBar.style.animationPlayState = 'paused';

            // Marcar la opción seleccionada visualmente
            this.classList.add('selected');

            // Deshabilitar todos los botones
            options.forEach(opt => opt.classList.add('disabled'));

            // Esperar 1.5 segundos para crear suspenso y revelar la correcta
            setTimeout(() => {
                revealAnswers(this);
            }, 1500);
        });
    });

    // --- 3. REVELAR RESPUESTAS Y ACTUALIZAR ESTADO ---
    function revealAnswers(selectedButton = null) {
        options.forEach(opt => {
            // Limpiar la selección previa
            opt.classList.remove('selected');
            
            // Verificar si es la correcta (usando data-correct del HTML)
            if (opt.dataset.correct === "true") {
                opt.classList.add('correct');
                
                // Si el jugador eligió esta, sumar puntos
                if (selectedButton === opt) {
                    const scoreDisplay = document.getElementById('score-display');
                    // Simulación de puntos fijos
                    let currentScore = parseInt(scoreDisplay.innerText);
                    scoreDisplay.innerText = currentScore + 100;
                    
                    // Pequeña animación de victoria en el puntaje
                    scoreDisplay.classList.add('text-green-400', 'scale-110');
                    setTimeout(() => scoreDisplay.classList.remove('text-green-400', 'scale-110'), 500);
                }
            } else {
                opt.classList.add('incorrect');
            }
        });

        // Simular transición a la siguiente pregunta o al Ranking
        setTimeout(() => {
            console.log("Transición a la pantalla de Ranking/Siguiente Pregunta...");
            // Aquí enviarías los datos a Supabase y cambiarías el DOM
        }, 3000);
    }
});
