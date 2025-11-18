let intervalId = null;
let counter = 0;

// Áudio padrão (beep) - preloaded
let beep = new Audio(
    "https://leofukuyama.github.io/metronomo_dqwr_day_2025/watshoy_beep.mp3"
);
beep.preload = "auto";

// Helper: garante que a duração do áudio esteja disponível
function ensureDuration(audio) {
    return new Promise((resolve) => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            return resolve(audio.duration);
        }

        const onLoaded = () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("canplaythrough", onLoaded);
            setTimeout(() => resolve(audio.duration || 0.001), 50);
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("canplaythrough", onLoaded);

        try {
            audio.load();
        } catch (e) {}
    });
}

// Atualiza relógio de Brasília
function updateClock() {
    const now = new Date();
    const options = { timeZone: "America/Sao_Paulo", hour12: false };
    document.getElementById("clock").textContent = now.toLocaleTimeString(
        "pt-BR",
        options
    );
}
setInterval(updateClock, 1000);
updateClock();

// Troca áudio se o usuário enviar um arquivo
document.getElementById("audioInput").addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
        const file = this.files[0];
        beep = new Audio(URL.createObjectURL(file));
        beep.preload = "auto";
    }
});

// 🔊 Função que começa o metrônomo com aceleração híbrida
async function startMetronomeWithFullPlayback() {
    const bpm = parseInt(document.getElementById("bpm").value, 10);

    // Segurança adicional (já validado antes, mas garantimos)
    if (!bpm || bpm < 1 || bpm > 240) return;

    // Limpa intervalos anteriores
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    const intervalMs = 60000 / bpm;

    const duration = await ensureDuration(beep);
    const audioDurationMs = Math.max(1, duration * 1000);

    // taxa mínima = 1 (normal)
    let requiredRate = audioDurationMs / intervalMs;
    if (requiredRate < 1) requiredRate = 1;

    beep.playbackRate = requiredRate;

    // Primeiro toque
    try {
        beep.currentTime = 0;
        await beep.play();
    } catch (e) {
        console.warn("Erro ao tocar o áudio imediatamente:", e);
    }

    counter++;
    document.getElementById("counter").textContent = counter;

    // Ciclos seguintes
    intervalId = setInterval(async () => {
        const dur =
            !isNaN(beep.duration) && beep.duration > 0
                ? beep.duration * 1000
                : audioDurationMs;

        let req = dur / intervalMs;
        if (req < 1) req = 1;

        beep.playbackRate = req;

        try {
            beep.currentTime = 0;
            await beep.play();
        } catch (e) {
            console.warn("Erro ao tocar o áudio:", e);
        }

        counter++;
        document.getElementById("counter").textContent = counter;
    }, intervalMs);
}

// ▶ INICIAR — validado com limite de BPM **antes** de chamar o metrônomo
document.getElementById("startBtn").addEventListener("click", () => {
    let bpm = parseInt(document.getElementById("bpm").value);

    // 🔒 Impede iniciar fora do intervalo
    if (isNaN(bpm) || bpm < 1 || bpm > 240) {
        alert("Por favor, insira um BPM entre 1 e 240.");
        return; // ⛔ OBRIGATÓRIO! Sem isso o metrônomo iniciava.
    }

    startMetronomeWithFullPlayback();
});

// ⏹ Parar (não reseta contador)
document.getElementById("stopBtn").addEventListener("click", () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});

// 🔄 Reset (zera contador)
document.getElementById("resetBtn").addEventListener("click", () => {
    counter = 0;
    document.getElementById("counter").textContent = counter;
});
