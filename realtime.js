document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. INICIALIZACIÓN DE SUPABASE
    // ==========================================
    
    const SUPABASE_URL = 'https://eletrekvxjxaznfiumki.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZXRyZWt2eGp4YXpuZml1bWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTc4MTMsImV4cCI6MjA5OTI5MzgxM30.r01AQNZB2h1ezsCKiT-TrwjQR3fkIQYJrA-kAP5L-YI';

    // Inicializar cliente usando la variable global inyectada por el CDN
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ==========================================
    // 2. CONFIGURACIÓN DEL CANAL (SALA DE JUEGO)
    // ==========================================
    
    const currentPlayer = sessionStorage.getItem('currentPlayer') || `Invitado_${Math.floor(Math.random() * 1000)}`;
    
    // 🔥 CORRECCIÓN: El canal debe llamarse exactamente igual que en leaderboard.js
    const quizRoom = supabase.channel('cumple-susi-room', {
        config: {
            broadcast: { self: false } 
        }
    });

    // ==========================================
    // 3. ESCUCHAR EVENTOS EN TIEMPO REAL (RECEPCIÓN)
    // ==========================================
    
    quizRoom
        .on('broadcast', { event: 'score_update' }, (payload) => {
            const incomingData = payload.payload;
            console.log(`📡 Competencia en vivo: ${incomingData.nickname} alcanzó ${incomingData.score} puntos.`);
            
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
    
    window.broadcastScore = async function(currentScore) {
        const payload = {
            nickname: currentPlayer,
            score: currentScore,
            timestamp: new Date().toISOString()
        };

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
    // 5. FUNCIONES AUXILIARES DE UI (NOTIFICACIONES)
    // ==========================================
    
    function actualizarRankingVisual(jugador, puntaje) {
        const toast = document.createElement('div');
        // Diseño Glassmorphism Premium unificado
        toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-rose-500/30 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-[0_10px_30px_rgba(225,29,72,0.3)] z-50 transform transition-all duration-500 translate-y-[-150%] opacity-0 flex items-center gap-2';
        toast.innerHTML = `
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span class="text-rose-300">${jugador}</span> sumó puntos! 🔥
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translate(-50%, 0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translate(-50%, -150%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 2500);
    }

    // ==========================================
    // 6. GUARDAR PUNTAJE FINAL EN BASE DE DATOS
    // ==========================================
    
    window.guardarPuntajeFinal = async function(nickname, puntajeFinal) {
        const { data, error } = await supabase
            .from('jugadores')
            .insert([{ nickname: nickname, score: puntajeFinal }]);

        if (error) {
            console.error('❌ Error al guardar en la base de datos:', error);
        } else {
            console.log('✅ Puntaje guardado con éxito en la tabla jugadores:', puntajeFinal);
        }
    };
});
