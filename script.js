let intervalId = null;
let counter = 0;

// Áudio padrão (beep)
const defaultBeepUrl =
    "https://leofukuyama.github.io/metronomo_dqwr_day_2025/watshoy_beep.mp3";

let beep = new Audio(defaultBeepUrl);
beep.preload = "auto";

// 🔒 LIMITA CARACTERES DO INPUT BPM (máx. 3 dígitos)
const bpmInput = document.getElementById("bpm");

bpmInput.addEventListener("input", function () {
    // remover tudo que não é número
    this.value = this.value.replace(/\D/g, "");

    if (this.value === "") return;

    // Se tiver 4 dígitos ou mais → força para 240
    if (this.value.length >= 4) {
        this.value = "240";
        return;
    }

    let bpm = Number(this.value);

    // limite superior
    if (bpm > 240) {
        this.value = "240";
        return;
    }

    // limite inferior
    if (bpm < 1) {
        this.value = "1";
        return;
    }
});

bpmInput.addEventListener("blur", function () {
    if (!this.value) this.value = "1";

    let bpm = Number(this.value);

    if (bpm > 240) this.value = "240";
    if (bpm < 1) this.value = "1";
});

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

// 🔒 PROTEÇÃO DO INPUT DE ÁUDIO (melhores práticas)
document
    .getElementById("audioInput")
    .addEventListener("change", async function () {
        if (!this.files || this.files.length === 0) return;

        const file = this.files[0];

        // 1️⃣ Verificar tipo de arquivo
        if (!file.type.startsWith("audio/")) {
            alert("Por favor, selecione um arquivo de áudio válido.");
            this.value = "";
            return;
        }

        // 2️⃣ Limitar tamanho (EXEMPLO: 2MB)
        const maxSizeMB = 2;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            alert(`O áudio deve ter no máximo ${maxSizeMB} MB.`);
            this.value = "";
            return;
        }

        // 3️⃣ Criar objeto de áudio seguro
        const newAudio = new Audio();
        newAudio.preload = "auto";

        const fileURL = URL.createObjectURL(file);
        newAudio.src = fileURL;

        // 4️⃣ Testar se o áudio carrega corretamente
        const validateAudio = new Promise((resolve, reject) => {
            let erro = () => reject("Arquivo de áudio inválido ou corrompido.");
            let ok = () => resolve(true);

            newAudio.addEventListener("loadedmetadata", ok, { once: true });
            newAudio.addEventListener("error", erro, { once: true });

            // Timeout para evitar travas
            setTimeout(() => reject("Falha ao carregar áudio."), 3000);
        });

        try {
            await validateAudio;
            beep = newAudio;
            console.log("Áudio carregado com sucesso!");
        } catch (e) {
            alert(e);
            beep = new Audio(defaultBeepUrl); // volta ao beep padrão
            this.value = ""; // limpa input
        }
    });

// 🔊 Função que começa o metrônomo
async function startMetronomeWithFullPlayback() {
    const bpm = parseInt(document.getElementById("bpm").value, 10);
    if (!bpm || bpm < 1 || bpm > 240) return;

    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    const intervalMs = 60000 / bpm;

    const duration = await ensureDuration(beep);
    const audioDurationMs = Math.max(1, duration * 1000);

    let requiredRate = audioDurationMs / intervalMs;
    if (requiredRate < 1) requiredRate = 1;

    beep.playbackRate = requiredRate;

    try {
        beep.currentTime = 0;
        await beep.play();
    } catch (e) {}

    counter++;
    document.getElementById("counter").textContent = counter;

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
        } catch (e) {}

        counter++;
        document.getElementById("counter").textContent = counter;
    }, intervalMs);
}

// ▶ INICIAR
document.getElementById("startBtn").addEventListener("click", () => {
    const bpm = parseInt(document.getElementById("bpm").value);

    if (isNaN(bpm) || bpm < 1 || bpm > 240) {
        alert("Por favor, insira um BPM entre 1 e 240.");
        return;
    }

    startMetronomeWithFullPlayback();
});

// ⏹ Parar
document.getElementById("stopBtn").addEventListener("click", () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});

// 🔄 Reset contador
document.getElementById("resetBtn").addEventListener("click", () => {
    counter = 0;
    document.getElementById("counter").textContent = counter;
});
