// State Machine and Navigation Configuration
let currentScreen = 'intro';
const screens = {
    intro: document.getElementById('screen-intro'),
    menu: document.getElementById('screen-menu'),
    lore: document.getElementById('screen-lore'),
    abilities: document.getElementById('screen-abilities'),
    quotes: document.getElementById('screen-quotes')
};
const backgroundVideo = document.getElementById('video-root');
const audio = document.getElementById('volibear-audio');

// Array of timestamps (in seconds) where Volibear spoken quotes occur
const QUOTE_TIMESTAMPS = [
  5, 15, 25, 45, 65, 80, 105, 125, 180, 220, 260, 310
];

// Initialize Navigation Event Listeners
document.getElementById('screen-intro').addEventListener('click', (e) => {
    // Show Background Video
    backgroundVideo.classList.remove('hidden');
    
    // Play Intro Audio
    playIntro();
    
    // Transition to Menu
    transitionScreens('intro', 'menu');
});

function transitionScreens(from, to) {
    const fromEl = screens[from];
    const toEl = screens[to];

    // Fade out first
    fromEl.classList.add('opacity-0');
    setTimeout(() => {
        fromEl.classList.add('hidden');
        toEl.classList.remove('hidden');
        // Trigger reflow to let browser register removal of hidden
        toEl.offsetHeight;
        toEl.classList.remove('opacity-0');
        toEl.classList.add('opacity-100');
        currentScreen = to;
    }, 500);
}

function navigateTo(targetState) {
    transitionScreens(currentScreen, targetState);
}

function navigateBack() {
    stopAudio();
    transitionScreens(currentScreen, 'menu');
}

// Audio Engine Functions
let quoteTimer = null;

function playIntro() {
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Interação com o usuário necessária do navegador para tocar áudio:", e));
    }
}

function playQuote() {
    if (audio) {
        // Clear any active stop timers
        if (quoteTimer) clearTimeout(quoteTimer);

        const randomIndex = Math.floor(Math.random() * QUOTE_TIMESTAMPS.length);
        const randomTime = QUOTE_TIMESTAMPS[randomIndex];
        
        audio.currentTime = randomTime;
        audio.play().catch(e => console.log("Erro de áudio:", e));

        // Stop the quote cleanly after ~6 seconds (to avoid continuous overlay of audio)
        quoteTimer = setTimeout(() => {
            stopAudio();
        }, 6000);
    }
}

function stopAudio() {
    if (audio) {
        audio.pause();
    }
}


// --- Lightning Canvas Canvas Drawing & Tracing Logic ---
const canvas = document.getElementById('lightning-canvas');
const ctx = canvas.getContext('2d');
const flashOverlay = document.getElementById('flash-overlay');
let isFlashing = false;

// Handle resize dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Recursive lightning tracer
function drawLightning(startX, startY, endX, endY, branches = 2, width = 3) {
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.9)'; // Gorgeous Purple hue
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f3e8ff';
    ctx.lineWidth = width + Math.random() * 2;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let currentX = startX;
    let currentY = startY;
    const segments = 15;
    const dx = (endX - startX) / segments;
    const dy = (endY - startY) / segments;

    for (let i = 1; i <= segments; i++) {
        const nextX = startX + dx * i + (Math.random() - 0.5) * 40;
        const nextY = startY + dy * i + (Math.random() - 0.5) * 40;
        
        ctx.lineTo(nextX, nextY);
        currentX = nextX;
        currentY = nextY;

        // Create branches on minimal random factor
        if (branches > 0 && Math.random() > 0.88) {
            const branchEndX = currentX + (Math.random() - 0.5) * 150;
            const branchEndY = currentY + Math.random() * 100;
            drawLightning(currentX, currentY, branchEndX, branchEndY, branches - 1, width * 0.6);
            ctx.moveTo(currentX, currentY); // reset coordinate back on principal path
        }
    }
    ctx.stroke();
}

// Triggers the lighting strike effect
function triggerStrike(x, y) {
    if (!ctx) return;

    // Fast screen camera vibration/glitch flash
    flashOverlay.style.opacity = '0.4';
    setTimeout(() => { flashOverlay.style.opacity = '0'; }, 80);
    setTimeout(() => { flashOverlay.style.opacity = '0.4'; }, 120);
    setTimeout(() => { flashOverlay.style.opacity = '0'; }, 200);

    // Apply minor camera shake directly to body wrapper
    const appBody = document.body;
    appBody.style.transform = 'translate(4px, 4px) scale(1.005)';
    setTimeout(() => { appBody.style.transform = 'none'; }, 150);

    // Render Canvas Storm Bolts
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate single main bolt starting from top down to the mouse coordinates
    const startX = x + (Math.random() - 0.5) * 200;
    const startY = 0;
    drawLightning(startX, startY, x, y, 2, 3);

    // Clean canvas after brief visual hold
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 200);
}

// Global click event to call forth Volibear's lightning anywhere
document.addEventListener('click', (e) => {
    // Avoid triggering if clicking direct buttons/anchors to prevent layout conflicts
    if (e.target.closest('button')) return;
    
    triggerStrike(e.clientX, e.clientY);
});
