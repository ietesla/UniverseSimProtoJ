// ── Ripples ────────────────────────────────────────────────────────────────
const ripples = [];
const RIPPLE_SPEED  = 420;   // px per second
const RIPPLE_LIFE   = 3.2;   // seconds until fully faded
const RIPPLE_BAND   = 55;    // px width of the excitation band

window.addEventListener('click', e => {
  if (e.target.closest('#hover-zone')) return;
  if (!mouseHeld && optDrawing && optFlash) ripples.push({ x: e.clientX, y: e.clientY, age: 0 });
});

function tickRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    rp.age += DT;
    if (rp.age >= RIPPLE_LIFE) { ripples.splice(i, 1); continue; }

    const radius    = rp.age * RIPPLE_SPEED;
    const alpha     = Math.pow(1 - rp.age / RIPPLE_LIFE, 1.8) * 0.22;
    const thickness = RIPPLE_BAND * 0.4;

    ctx.save();
    const grad = ctx.createRadialGradient(rp.x, rp.y, Math.max(0, radius - thickness),
                                           rp.x, rp.y, radius + thickness * 0.5);
    grad.addColorStop(0,   `rgba(180,210,255,0)`);
    grad.addColorStop(0.4, `rgba(200,225,255,${alpha})`);
    grad.addColorStop(0.7, `rgba(220,235,255,${alpha * 0.5})`);
    grad.addColorStop(1,   `rgba(180,210,255,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(rp.x, rp.y, radius + thickness * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ── Held-star & drawing trail ──────────────────────────────────────────────
let mouseHeld = false;
let heldX = 0, heldY = 0;
let heldAge = 0;
const TRAIL_MAX = 270;
let TRAIL_LIFE = 4.2;

// Each stroke is an independent array of points; new mousedown = new stroke
const trailStrokes = [];
let activeStroke = null;

// Raw mouse position (used by scroll mode and held-star tracking)
let mouseX = 0, mouseY = 0;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX/W - 0.5;
  mouseY = e.clientY/H - 0.5;
  if (mouseHeld) {
    heldX = e.clientX;
    heldY = e.clientY;
  }
});
window.addEventListener('mouseleave', () => { mouseX=0; mouseY=0; });

window.addEventListener('mousedown', e => {
  if (e.target.closest('#hover-zone')) return;
  if (!optDrawing) return;
  mouseHeld = true;
  heldX = e.clientX;
  heldY = e.clientY;
  heldAge = 0;
  if (optConnect && trailStrokes.length > 0) {
    activeStroke = trailStrokes[trailStrokes.length - 1];
  } else {
    activeStroke = [];
    trailStrokes.push(activeStroke);
  }
  document.body.style.cursor = 'none';
});

window.addEventListener('mouseup', e => {
  if (!mouseHeld) return;
  mouseHeld = false;
  document.body.style.cursor = 'crosshair';
  activeStroke = null;
  if (optFlash) {
    ripples.push({ x: heldX, y: heldY, age: 0 });
    heldFlashes.push({ x: heldX, y: heldY, age: 0, intensity: Math.min(1, heldAge * 2) });
  }
  heldAge = 0;
});

// heldFlashes: the outward burst on mouse release
const heldFlashes = [];

function tickHeldStar(dt) {
  const TRAIL_SPEED = 3.0;

  // Age all points across all strokes; remove dead points and empty strokes
  for (let s = trailStrokes.length - 1; s >= 0; s--) {
    const stroke = trailStrokes[s];
    for (let i = stroke.length - 1; i >= 0; i--) {
      stroke[i].age += dt;
      const f = 1 - stroke[i].age / TRAIL_LIFE;
      if (f <= 0 || f * f * 0.75 < 0.005) stroke.splice(i, 1);
    }
    if (stroke.length === 0 && trailStrokes[s] !== activeStroke) {
      trailStrokes.splice(s, 1);
    }
  }

  const drawStroke = (stroke) => {
    if (stroke.length < 2) return;
    const resolved = stroke.map(pt => ({
      x: pt.x - (scrollX - pt.scrollXAtSpawn) * TRAIL_SPEED * W,
      y: pt.y,
      age: pt.age,
    }));

    const drawPass = (lineWidth, maxAlpha) => {
      for (let i = 1; i < resolved.length; i++) {
        const pt   = resolved[i];
        const prev = resolved[i - 1];
        const segLen = Math.hypot(pt.x - prev.x, pt.y - prev.y);
        if (segLen < 0.3) continue;
        const f = 1 - pt.age / TRAIL_LIFE;
        const alpha = f * f * maxAlpha;
        if (alpha < 0.005) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineWidth   = lineWidth * (0.3 + f * 0.7);
        ctx.lineCap     = 'butt';
        ctx.lineJoin    = 'round';
        const [tr2,tg2,tb2] = getCurrent('trail');
        ctx.strokeStyle = `rgba(${tr2},${tg2},${tb2},1)`;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.restore();
      }
    };

    drawPass(6,  0.75);
    drawPass(14, 0.12);
  };

  for (const stroke of trailStrokes) drawStroke(stroke);

  // Draw the held star and emit points into the active stroke
  if (mouseHeld) {
    heldAge += dt;
    if (activeStroke) {
      activeStroke.push({ x: heldX, y: heldY, age: 0, scrollXAtSpawn: scrollX });
      while (activeStroke.length > 1) {
        const f = 1 - activeStroke[0].age / TRAIL_LIFE;
        if (f * f * 0.75 < 0.005) activeStroke.shift();
        else break;
      }
    }

    const pulse = 1 + 0.18 * Math.sin(t * 6.5);
    const glow  = Math.min(1, heldAge * 3);
    const coreR = (3 + Math.min(heldAge, 0.6) * 5) * pulse;

    ctx.save();
    const halo = ctx.createRadialGradient(heldX, heldY, 0, heldX, heldY, coreR * 7);
    halo.addColorStop(0,   `rgba(200,225,255,${glow * 0.35})`);
    halo.addColorStop(0.4, `rgba(170,210,255,${glow * 0.15})`);
    halo.addColorStop(1,   `rgba(140,190,255,0)`);
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(heldX, heldY, coreR * 7, 0, Math.PI * 2); ctx.fill();

    const inner = ctx.createRadialGradient(heldX, heldY, 0, heldX, heldY, coreR * 2.5);
    inner.addColorStop(0,   `rgba(255,255,255,${glow * 0.95})`);
    inner.addColorStop(0.3, `rgba(220,235,255,${glow * 0.6})`);
    inner.addColorStop(1,   `rgba(180,215,255,0)`);
    ctx.fillStyle = inner;
    ctx.beginPath(); ctx.arc(heldX, heldY, coreR * 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = glow;
    ctx.beginPath(); ctx.arc(heldX, heldY, coreR, 0, Math.PI * 2); ctx.fill();

    ctx.globalAlpha = glow * 0.6;
    const spikeLen = coreR * 9 * pulse;
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx, dy]) => {
      const sg = ctx.createLinearGradient(
        heldX, heldY,
        heldX + dx * spikeLen, heldY + dy * spikeLen
      );
      sg.addColorStop(0,   'rgba(255,255,255,0.7)');
      sg.addColorStop(0.3, 'rgba(200,225,255,0.3)');
      sg.addColorStop(1,   'rgba(180,210,255,0)');
      ctx.strokeStyle = sg;
      ctx.lineWidth = coreR * 0.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(heldX, heldY);
      ctx.lineTo(heldX + dx * spikeLen, heldY + dy * spikeLen);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Draw release flashes
  for (let i = heldFlashes.length - 1; i >= 0; i--) {
    const fl = heldFlashes[i];
    fl.age += dt;
    const dur = 0.9 + fl.intensity * 0.6;
    if (fl.age >= dur) { heldFlashes.splice(i, 1); continue; }

    const f     = fl.age / dur;
    const r     = fl.age * 380 * (0.7 + fl.intensity * 0.5);
    const alpha = Math.pow(1 - f, 1.6) * (0.3 + fl.intensity * 0.3);

    ctx.save();
    const rg = ctx.createRadialGradient(fl.x, fl.y, Math.max(0, r - 40), fl.x, fl.y, r + 20);
    rg.addColorStop(0,   `rgba(200,225,255,0)`);
    rg.addColorStop(0.5, `rgba(220,238,255,${alpha * 1.4})`);
    rg.addColorStop(0.8, `rgba(255,255,255,${alpha * 0.8})`);
    rg.addColorStop(1,   `rgba(200,225,255,0)`);
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(fl.x, fl.y, r + 20, 0, Math.PI * 2); ctx.fill();

    if (f < 0.35) {
      const sf = 1 - f / 0.35;
      ctx.globalAlpha = sf * fl.intensity * 0.7;
      const spikeOut = 80 + fl.intensity * 60;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const sg = ctx.createLinearGradient(
          fl.x, fl.y,
          fl.x + Math.cos(ang) * spikeOut * sf,
          fl.y + Math.sin(ang) * spikeOut * sf
        );
        sg.addColorStop(0,   'rgba(255,255,255,0.9)');
        sg.addColorStop(0.5, 'rgba(200,230,255,0.4)');
        sg.addColorStop(1,   'rgba(180,215,255,0)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 2.5 * sf;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fl.x, fl.y);
        ctx.lineTo(fl.x + Math.cos(ang) * spikeOut * sf, fl.y + Math.sin(ang) * spikeOut * sf);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
