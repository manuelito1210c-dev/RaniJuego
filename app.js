document.addEventListener('DOMContentLoaded', () => {
    // --- 1. EFECTO SPOTLIGHT DEL CURSOR ---
    const glow = document.getElementById('mouse-glow');
    let isMouseIn = false;

    document.addEventListener('mouseenter', () => {
        glow.style.opacity = '1';
        isMouseIn = true;
    });
    
    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
        isMouseIn = false;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseIn) {
            glow.style.opacity = '1';
            isMouseIn = true;
        }
        // Centrar el div del glow (w-96 = 384px, offset = 192px)
        requestAnimationFrame(() => {
            glow.style.transform = `translate(${e.clientX - 192}px, ${e.clientY - 192}px)`;
        });
    });

    // --- 2. BASE DE DATOS DE PREGUNTAS (Hardcodeada) ---
    // Estructuradas listas para ser inyectadas en la siguiente pantalla
    const quizData = [
        {
            type: "choice",
            question: "¿Cuál es su comida favorita absoluta?",
            options: ["Matambre a la pizza", "Empanadas de carne con limón", "Pizza", "Milanesas Napolitanas con Papas"],
            correctIndex: 1
        },
        {
            type: "choice",
            question: "¿Cuál es su color favorito?",
            options: ["Rosa", "Le gustan todos los colores", "Bordó", "Rojo"],
            correctIndex: 1
        },
        {
            type: "choice",
            question: "¿Qué es lo que más le gusta hacer en su tiempo libre?",
            options: ["Cocinar", "Salir a pasear y tomar fotos", "Conocer pueblitos, caminar por la naturaleza", "Salir de compras"],
            correctIndex: 2
        },
        {
            type: "choice",
            question: "Si pudiera viajar a cualquier lugar del mundo mañana mismo, ¿a dónde iría?",
            options: ["París", "Venecia", "Misiones (las Cataratas)", "Chaco"],
            correctIndex: 0
        },
        {
            type: "choice",
            question: "¿Qué bebida es su favorita?",
            options: ["Fernet", "Vino", "Gancia", "Gin Tonic"],
            correctIndex: 3
        },
        {
            type: "boolean",
            question: "Se dice que su serie y película favorita que vería una y otra vez son Breaking Bad (serie) y Orgullo y Prejuicio (película).",
            options: ["Verdadero", "Falso"],
            correctIndex: 0
        },
        {
            type: "boolean",
            question: "Cuando era niña su sueño era ser cantante cuando fuera grande.",
            options: ["Verdadero", "Falso"], // Querida ser abogada
            correctIndex: 1
        },
        {
            type: "choice",
            question: "¿Prefiere el dulce o el salado?",
            options: ["Dulce", "Salado", "Ambos"],
            correctIndex: 1
        },
        {
            type: "choice",
            question: "¿Cuál es tu cantante favorito?",
            options: ["Enrique Iglesias", "Ricardo Arjona", "Ricardo Montaner", "Cristian Castro"],
            correctIndex: 3
        },
        {
            type: "boolean",
            question: "Tik Tok es la app que tiene más tiempo abierta en su teléfono.",
            options: ["Verdadero", "Falso"], // Es WhatsApp
            correctIndex: 1
        },
        {
            type: "boolean",
            question: "Ganó un torneo de Newcom (un deporte alternativo).",
            options: ["Verdadero", "Falso"],
            correctIndex: 0
        },
        {
            type: "choice",
            question: "Frase que la define y que dice siempre:",
            options: [
                '"El éxito es la suma de pequeños esfuerzos diarios"', 
                '"Un café más y arranco, lo prometo."', 
                '"No sé qué hago, pero lo estoy haciendo con estilo."', 
                '"Mi plan es que todo salga bien por arte de magia."'
            ],
            correctIndex: 0
        },
        {
            type: "choice",
            question: "¿Qué prefiere consumir a la hora del desayuno?",
            options: ["Té con pan casero", "Mate con galletitas con dulce de leche", "Café con leche y 2 medialunas", "No desayuna nada"],
            correctIndex: 2
        },
        {
            type: "choice",
            question: "¿Estación favorita del año?",
            options: ["Invierno", "Otoño", "Verano", "Primavera"],
            correctIndex: 1
        },
        {
            type: "boolean",
            question: "Sus accesorios tienen que ser dorados siempre, siempre.",
            options: ["Verdadero", "Falso"], // Es team plateado
            correctIndex: 1
        }
    ];

    // --- 3. LÓGICA DE INGRESO ---
    const startBtn = document.getElementById('btn-start');
    const nicknameInput = document.getElementById('nickname');

    startBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        if (nickname === "") {
            // Micro-interacción: agitar el input si está vacío
            nicknameInput.classList.add('animate-pulse', 'border-red-500');
            setTimeout(() => nicknameInput.classList.remove('animate-pulse', 'border-red-500'), 500);
            return;
        }

        // Guardamos el jugador (luego esto se conecta a Supabase Realtime)
        sessionStorage.setItem('currentPlayer', nickname);
        
        // Transición de salida simulada
        document.querySelector('main').style.opacity = '0';
        document.querySelector('main').style.transform = 'translateY(-20px)';
        document.querySelector('main').style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            console.log(`Jugador ${nickname} registrado. Iniciando juego...`);
            console.log("Preguntas cargadas:", quizData.length);
            // Aquí iría la redirección o el cambio de DOM para mostrar la primera pregunta
            // window.location.href = 'quiz.html'; 
        }, 500);
    });
});

