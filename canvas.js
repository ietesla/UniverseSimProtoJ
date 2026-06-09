// ── Canvas & shared globals ────────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Animation clock
let t = 0;
const DT = 0.016;

// Smoothed parallax offsets (updated in draw.js)
let mx = 0, my = 0, smx = 0, smy = 0;

// Scroll state (updated in draw.js)
let scrollX = 0;
const BASE_SCROLL_RATE = 0.00006; // normalised units per frame at speed=1

// Shared helpers
const rng  = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
