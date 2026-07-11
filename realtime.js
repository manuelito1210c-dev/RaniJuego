// ==========================================
// 1. INICIALIZACIÓN GLOBAL DE SUPABASE
// ==========================================
// Esto DEBE estar fuera del DOMContentLoaded para que otros archivos lo vean instantáneamente

const SUPABASE_URL = 'https://eletrekvxjxaznfiumki.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZXRyZWt2eGp4YXpuZml1bWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTc4MTMsImV4cCI6MjA5OTI5MzgxM30.r01AQNZB2h1ezsCKiT-TrwjQR3fkIQYJrA-kAP5L-YI';

// Inicializamos y exportamos a la ventana global
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. LÓGICA DE TIEMPO REAL (Protegida por DOM)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    const currentPlayer = sessionStorage.getItem('currentPlayer') || `Invitado_${Math.floor(Math.random() * 1000)}`;
    
    // Usamos el cliente global que acabamos de crear arriba
    const quizRoom = window.supabaseClient.channel('cumple-susi-room', {
        config: {
            broadcast: { self: false } 
        }
    });

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

        if (error) console.error('❌ Error al sincronizar:', error);
    };

    function actualizarRankingVisual(jugador, puntaje) {
        const toast = document.createElement('div');
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

    window.guardarPuntajeFinal = async function(nickname, puntajeFinal) {
        // Usamos la variable global
        const { error } = await window.supabaseClient
            .from('jugadores')
            .insert([{ nickname: nickname, score: puntajeFinal }]);

        if (error) console.error('❌ Error al guardar BD:', error);
    };
});
