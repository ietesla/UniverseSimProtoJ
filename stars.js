// ── Star palette ───────────────────────────────────────────────────────────
const STAR_COLORS = [
  '#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',
  '#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',
  '#fffef5','#fffef5','#fffef5','#fffef5',
  '#fff8e8','#fff8e8','#fff8e8',
  '#ffefc0','#ffefc0',
  '#cce0ff','#cce0ff',
  '#b8d4ff','#ffd090','#ffb870','#ff9060',
];

const LAYERS = [
  { count: 320, minR: 0.3, maxR: 0.7, speed: 0.4, alpha: 0.35 },
  { count: 220, minR: 0.5, maxR: 1.0, speed: 1.0, alpha: 0.55 },
  { count: 130, minR: 0.8, maxR: 1.5, speed: 1.8, alpha: 0.72 },
  { count: 70,  minR: 1.2, maxR: 2.2, speed: 3.0, alpha: 0.85 },
  { count: 32,  minR: 1.8, maxR: 3.0, speed: 5.0, alpha: 0.95 },
  { count: 12,  minR: 2.5, maxR: 4.5, speed: 8.0, alpha: 1.0  },
];

function makeStars() {
  return LAYERS.map(l => {
    const numClusters = 2 + Math.floor(Math.random() * 4);
    const clusters = Array.from({ length: numClusters }, () => ({
      cx: rng(0.05, 0.95),
      cy: rng(0.05, 0.95),
      spread: rng(0.03, 0.18),
      tint: Math.random() < 0.4 ? pick(['#cce0ff','#b8d4ff','#e8f0ff','#fff8e8','#ffefc0']) : null,
    }));

    return Array.from({ length: l.count }, () => {
      const inCluster = Math.random() < 0.35;
      let x, y, alphaBoost, rBoost;

      if (inCluster) {
        const cl = pick(clusters);
        const u1 = Math.random(), u2 = Math.random();
        const mag = cl.spread * Math.sqrt(-2 * Math.log(Math.max(u1, 1e-9)));
        const ang = 2 * Math.PI * u2;
        x = Math.min(1, Math.max(0, cl.cx + mag * Math.cos(ang)));
        y = Math.min(1, Math.max(0, cl.cy + mag * Math.sin(ang)));
        const coreness = Math.exp(-mag / cl.spread);
        alphaBoost = 1 + coreness * 0.4;
        rBoost     = 1 + coreness * 0.25;
        var starColor = (cl.tint && Math.random() < 0.6) ? cl.tint : pick(THEMES[activeTheme] ? THEMES[activeTheme].starPalette() : STAR_COLORS);
      } else {
        x = rng(0, 1);
        y = rng(0, 1);
        alphaBoost = 1;
        rBoost     = 1;
        var starColor = pick(THEMES[activeTheme] ? THEMES[activeTheme].starPalette() : STAR_COLORS);
      }

      const rgb = typeof starColor === 'string' ? hexToRGB(starColor) : starColor;
      return {
        x, y,
        r: rng(l.minR, l.maxR) * rBoost,
        color: starColor,
        colorFrom: [...rgb],
        colorTo:   [...rgb],
        alpha: Math.min(1, rng(l.alpha * 0.7, l.alpha) * alphaBoost),
        twinkle: rng(0, Math.PI * 2),
        twinkleSpeed: rng(0.3, 1.2),
        speed: l.speed,
      };
    });
  });
}
let stars = makeStars();

// ── Cosmic mist ────────────────────────────────────────────────────────────
function makeCosmicMist() {
  const palette = [
    [60,30,140],[20,60,160],[100,20,100],[30,80,130],[80,20,120],
    [40,20,160],[70,40,130],[20,50,140],[90,10,110],[50,60,150],
  ];
  return Array.from({ length: 5 }, () => ({
    x: rng(0,1), y: rng(0,1),
    rx: rng(380,650), ry: rng(220,350),
    color: pick(palette),
    a: rng(0.025, 0.055),
    speed: rng(0.05, 0.12),
  }));
}
let cosmicMist = makeCosmicMist();

// ── Ripple boost ───────────────────────────────────────────────────────────
// Returns the total ripple brightness boost for a star at screen position (px, py)
function rippleBoost(px, py) {
  if (ripples.length === 0) return 0;
  let boost = 0;
  for (const rp of ripples) {
    const dx = px - rp.x, dy = py - rp.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const waveFront = rp.age * RIPPLE_SPEED;
    const diff = Math.abs(dist - waveFront);
    if (diff < RIPPLE_BAND) {
      const norm = 1 - diff / RIPPLE_BAND;
      const envelope = Math.pow(1 - rp.age / RIPPLE_LIFE, 1.2);
      boost += norm * norm * envelope * 1.8;
    }
  }
  return boost;
}
