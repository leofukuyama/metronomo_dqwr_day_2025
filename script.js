let interval = null;
let counter = 0;

// Áudio padrão (beep)
let beep = new Audio(
    "https://leofukuyama.github.io/metronomo_dqwr_day_2025/watshoy_beep.mp3"
);

// Atualiza relógio de Brasília
function updateClock() {
    const now = new Date();
    const options = { timeZone: "America/Sao_Paulo", hour12: false };
    const parts = now.toLocaleTimeString("pt-BR", options).split(":");
    document.getElementById("clock").textContent = parts.join(":");
}
setInterval(updateClock, 1000);

// Troca áudio se o usuário enviar um arquivo
document.getElementById("audioInput").addEventListener("change", function () {
    if (this.files.length > 0) {
        beep = new Audio(URL.createObjectURL(this.files[0]));
    }
});

// Iniciar
document.getElementById("startBtn").addEventListener("click", () => {
    const bpm = parseInt(document.getElementById("bpm").value);

    if (bpm < 1) return;

    if (interval) clearInterval(interval);

    const delay = 60000 / bpm;

    interval = setInterval(() => {
        beep.currentTime = 0;
        beep.play();
        counter++;
        document.getElementById("counter").textContent = counter;
    }, delay);
});

// Parar (não reseta contador)
document.getElementById("stopBtn").addEventListener("click", () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
});

// Reset (zera contador)
document.getElementById("resetBtn").addEventListener("click", () => {
    counter = 0;
    document.getElementById("counter").textContent = counter;
});
