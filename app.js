document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LUZ DEL CURSOR ---
    const glow = document.getElementById('mouse-glow');
    let isMouseIn = false;

    document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; isMouseIn = true; });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; isMouseIn = false; });
    document.addEventListener('mousemove', (e) => {
        if (!isMouseIn) { glow.style.opacity = '1'; isMouseIn = true; }
        requestAnimationFrame(() => {
            glow.style.transform = `translate(${e.clientX - 192}px, ${e.clientY - 192}px)`;
        });
    });

    // --- 2. GENERADOR DE CORAZONES BORDÓ FLOTANTES ---
    const heartsContainer = document.getElementById('floating-hearts-container');
    
    function spawnHeart() {
        if (!heartsContainer) return;
        
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        
        // SVG de corazón. Usamos un color rojo/bordó puro (#9f1239 - rose-800)
        heart.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#be123c" class="w-full h-full opacity-60">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
        `;

        // Aleatorizar tamaño, posición inicial y duración de la animación
        const size = Math.random() * 20 + 10; // Entre 10px y 30px
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.animationDuration = `${Math.random() * 6 + 6}s`; // Entre 6s y 12s en subir
        
        heartsContainer.appendChild(heart);

        // Limpiar el DOM eliminando el corazón cuando termina de subir
        setTimeout(() => {
            heart.remove();
        }, 13000);
    }

    // Generar unos cuantos corazones de golpe al cargar
    for(let i=0; i<8; i++) spawnHeart();
    
    // Continuar generando corazones suavemente
    setInterval(spawnHeart, 1200);

    // --- 3. LÓGICA DE INGRESO ---
    const startBtn = document.getElementById('btn-start');
    const nicknameInput = document.getElementById('nickname');

    startBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        if (nickname === "") {
            nicknameInput.classList.add('animate-pulse', 'border-red-500');
            setTimeout(() => nicknameInput.classList.remove('animate-pulse', 'border-red-500'), 500);
            return;
        }

        sessionStorage.setItem('currentPlayer', nickname);
        
        // Transición de salida suave
        document.querySelector('main').style.opacity = '0';
        document.querySelector('main').style.transform = 'translateY(-20px) scale(0.95)';
        document.querySelector('main').style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            console.log(`Jugador ${nickname} registrado. Siguiente pantalla...`);
        }, 600);
    });
});
