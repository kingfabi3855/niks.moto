/* ============================================
   LOADING → ENTER → CONTENT
   ============================================ */
const loader = document.getElementById('loader');
const enterOverlay = document.getElementById('enterOverlay');
const mainContent = document.getElementById('mainContent');
const bgMusic = document.getElementById('bgMusic');

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
    mainContent.classList.add('visible');
    enterOverlay.classList.add('show');
  }, 1600);
});

enterOverlay.addEventListener('click', () => {
  enterOverlay.classList.add('hidden');
  document.querySelector('.social').classList.add('entered');
  bgMusic.volume = 0;
  bgMusic.load();
  bgMusic.play().catch(() => {});
  let vol = 0;
  const targetVol = 0.5;
  const fadeInterval = setInterval(() => {
    vol += 0.04;
    if (vol >= targetVol) {
      vol = targetVol;
      clearInterval(fadeInterval);
    }
    bgMusic.volume = vol;
  }, 80);
});

function fadeMusic(toVol, duration = 400) {
  const start = bgMusic.volume;
  const diff = toVol - start;
  const steps = Math.max(1, Math.floor(duration / 40));
  let step = 0;
  const interval = setInterval(() => {
    step++;
    bgMusic.volume = start + diff * (step / steps);
    if (step >= steps) {
      bgMusic.volume = toVol;
      clearInterval(interval);
    }
  }, 40);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    fadeMusic(0, 300);
  } else if (enterOverlay.classList.contains('hidden')) {
    fadeMusic(0.5, 600);
  }
});

/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.matchMedia('(hover: hover)').matches) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.25;
    ringY += (mouseY - ringY) * 0.25;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverTargets = document.querySelectorAll('a, .glass-card, button');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

/* ============================================
   MOUSE GLOW
   ============================================ */
const mouseGlow = document.getElementById('mouseGlow');

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = `${e.clientX}px`;
    mouseGlow.style.top = `${e.clientY}px`;
    mouseGlow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
  });
}

/* ============================================
   PARTICLES
   ============================================ */
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrameId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.isBlue = Math.random() < 0.5;
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulse += 0.02;

    // Wrap around edges
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;

    // Subtle pulsing opacity
    this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const r = this.isBlue ? `59, 130, 246` : `249, 115, 22`;
    ctx.fillStyle = `rgba(${r}, ${this.currentOpacity})`;
    ctx.fill();
  }
}

// Initialize particles
const particleCount = Math.min(Math.floor(window.innerWidth * 0.06), 100);
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// Connection lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const opacity = (1 - dist / 120) * 0.06;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        const isBlue = particles[i].isBlue || particles[j].isBlue;
        ctx.strokeStyle = isBlue ? `rgba(59, 130, 246, ${opacity})` : `rgba(249, 115, 22, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.update();
    p.draw();
  }

  drawConnections();
  animFrameId = requestAnimationFrame(animateParticles);
}

animateParticles();

/* ============================================
   PARALLAX EFFECT
   ============================================ */
document.addEventListener('mousemove', (e) => {
  const xFactor = (e.clientX / window.innerWidth - 0.5) * 6;
  const yFactor = (e.clientY / window.innerHeight - 0.5) * 6;
});

/* ============================================
   BIKE POPUP
   ============================================ */
const bikeBtn = document.getElementById('bikeBtn');
const bikePopup = document.getElementById('bikePopup');
const popupClose = document.getElementById('popupClose');

bikeBtn.addEventListener('click', () => bikePopup.classList.add('show'));

function closePopup() {
  bikePopup.classList.remove('show');
}

popupClose.addEventListener('click', closePopup);
bikePopup.addEventListener('click', (e) => {
  if (e.target === bikePopup) closePopup();
});

/* ============================================
   OPTIONAL: Hover sound effect (subtle)
   ============================================ */
// Can be enabled by placing assets/hover.mp3
// const hoverSound = new Audio('assets/hover.mp3');
// hoverSound.volume = 0.1;
// cards.forEach(card => {
//   card.addEventListener('mouseenter', () => {
//     hoverSound.currentTime = 0;
//     hoverSound.play().catch(() => {});
//   });
// });

/* ============================================
   CLEANUP on page unload
   ============================================ */
window.addEventListener('beforeunload', () => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (bgMusic && !bgMusic.paused) bgMusic.pause();
});
