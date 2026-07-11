document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. INICIALIZACIÓN DE SUPABASE
    // ==========================================
    
    // Reemplaza estos valores con los de tu proyecto en Supabase (Settings -> API)
    const SUPABASE_URL = 'https://eletrekvxjxaznfiumki.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZXRyZWt2eGp4YXpuZml1bWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTc4MTMsImV4cCI6MjA5OTI5MzgxM30.r01AQNZB2h1ezsCKiT-TrwjQR3fkIQYJrA-kAP5L-YI';

    // Inicializar cliente usando la variable global inyectada por el CDN
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ==========================================
    // 2. CONFIGURACIÓN DEL CANAL (SALA DE JUEGO)
    // ==========================================
    
    // Obtenemos el nombre del jugador guardado en sessionStorage (definido en app.js)
    const currentPlayer = sessionStorage.getItem('currentPlayer') || `Invitado_${Math.floor(Math.random() * 1000)}`;
    
    // Creamos un canal único para el evento. Todos los celulares deben suscribirse aquí.
    const quizRoom = supabase.channel('sala-cumple-susi', {
        config: {
            broadcast: { self: false } // self: false evita que recibamos nuestros propios mensajes
        }
    });

    // ==========================================
    // 3. ESCUCHAR EVENTOS EN TIEMPO REAL (RECEPCIÓN)
    // ==========================================
    
    quizRoom
        .on('broadcast', { event: 'score_update' }, (payload) => {
            // Este bloque se ejecuta en milisegundos cuando OTRO jugador anota puntos
            const incomingData = payload.payload;
            console.log(`📡 Competencia en vivo: ${incomingData.nickname} acaba de alcanzar ${incomingData.score} puntos!`);
            
            // Aquí puedes llamar a una función para actualizar el Leaderboard visual en el DOM
            actualizarRankingVisual(incomingData.nickname, incomingData.score);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Conectado a la sala de juego en tiempo real.');
            }
        });

    // ==========================================
    // 4. EMISIÓN DE EVENTOS (ENVÍO)
    // ==========================================
    
    // Esta función se expone globalmente para que app.js pueda llamarla cuando el usuario acierte
    window.broadcastScore = async function(currentScore) {
        
        const payload = {
            nickname: currentPlayer,
            score: currentScore,
            timestamp: new Date().toISOString()
        };

        // Enviar el puntaje a todos los demás celulares conectados a la sala
        const { error } = await quizRoom.send({
            type: 'broadcast',
            event: 'score_update',
            payload: payload
        });

        if (error) {
            console.error('❌ Error al enviar el puntaje:', error);
        } else {
            console.log(`🚀 Puntaje enviado: ${currentScore}`);
        }
    };

    // ==========================================
    // 5. FUNCIONES AUXILIARES DE UI (Leaderboard)
    // ==========================================
    
    function actualizarRankingVisual(jugador, puntaje) {
        // Lógica de manipulación del DOM nativa para mostrar notificaciones o actualizar el ranking
        // Ejemplo de micro-interacción: Un toast notification que aparece brevemente
        
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-rose-500/30 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg z-50 transform transition-all duration-300 translate-y-[-100%] opacity-0';
        toast.innerHTML = `🔥 <span class="text-rose-400">${jugador}</span> tiene ${puntaje} pts!`;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        requestAnimationFrame(() => {
            toast.style.transform = 'translate(-50%, 0)';
            toast.style.opacity = '1';
        });

        // Animar salida y remover del DOM para mantener el rendimiento
        setTimeout(() => {
            toast.style.transform = 'translate(-50%, -100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});

