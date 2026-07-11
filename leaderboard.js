document.addEventListener('DOMContentLoaded', () => {

    let playersRanking = [];

    // 1. Usar el cliente global de Supabase que definimos en realtime.js
    const supabase = window.supabaseClient;

    // 2. FUNCIÓN PRINCIPAL: Descargar la base de datos histórica
    async function cargarRankingHistorico() {
        try {
            const { data, error } = await supabase
                .from('jugadores')
                .select('nickname, score')
                .order('score', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                playersRanking = data;
                renderLeaderboard();
            } else {
                document.getElementById('leaderboard-list').innerHTML = '<li class="text-center text-zinc-500 text-sm mt-8">Aún no hay puntajes registrados.</li>';
            }
        } catch (error) {
            console.error('Error al cargar ranking:', error);
        }
    }

    // 3. Escuchar nuevos puntajes en vivo (Broadcast)
    const quizRoom = supabase.channel('cumple-susi-room');
    quizRoom.on('broadcast', { event: 'score_update' }, (payload) => {
        const data = payload.payload;
        // Si entra un puntaje nuevo, lo sumamos y re-ordenamos
        const existingIndex = playersRanking.findIndex(p => p.nickname === data.nickname);
        if (existingIndex !== -1) {
            playersRanking[existingIndex].score = data.score;
        } else {
            playersRanking.push(data);
        }
        playersRanking.sort((a, b) => b.score - a.score);
        renderLeaderboard();
    }).subscribe();

    // 4. Renderizar los datos en el HTML
    function renderLeaderboard() {
        // Renderizar Podio (Top 3)
        if (playersRanking[0]) {
            document.getElementById('player-1-name').innerText = playersRanking[0].nickname;
            document.getElementById('player-1-score').innerText = `${playersRanking[0].score} pts`;
        }
        if (playersRanking[1]) {
            document.getElementById('player-2-name').innerText = playersRanking[1].nickname;
            document.getElementById('player-2-score').innerText = `${playersRanking[1].score} pts`;
        }
        if (playersRanking[2]) {
            document.getElementById('player-3-name').innerText = playersRanking[2].nickname;
            document.getElementById('player-3-score').innerText = `${playersRanking[2].score} pts`;
        }

        // Renderizar Lista (4to lugar en adelante)
        const listContainer = document.getElementById('leaderboard-list');
        if (playersRanking.length > 3) {
            listContainer.innerHTML = ''; 
            for (let i = 3; i < playersRanking.length; i++) {
                const p = playersRanking[i];
                const li = document.createElement('li');
                li.className = 'ranking-item flex items-center justify-between';
                li.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="text-rose-500/50 font-black text-sm w-4">${i + 1}</span>
                        <span class="text-zinc-200 font-semibold text-sm">${p.nickname}</span>
                    </div>
                    <span class="text-rose-300 font-mono text-xs font-bold">${p.score} pts</span>
                `;
                listContainer.appendChild(li);
            }
        }
    }

    // 5. Iniciar la carga al abrir la pantalla
    cargarRankingHistorico();

    // 6. Botón de Reinicio
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }, 500);
        });
    }
});
                       
