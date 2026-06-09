// ── Comets ─────────────────────────────────────────────────────────────────
const COMET_COLORS = [
  [255,255,255],[220,235,255],[200,220,255],[255,250,230],[180,210,255]
];
const comets = [];
let nextCometTime = rng(1.5, 5);

function spawnComet() {
  const edge = Math.floor(Math.random()*4);
  let x, y, angle;
  if      (edge===0) { x=rng(0,W); y=-10;    angle=rng(Math.PI*0.25, Math.PI*0.75); }
  else if (edge===1) { x=W+10;     y=rng(0,H); angle=rng(Math.PI*0.75, Math.PI*1.25); }
  else if (edge===2) { x=rng(0,W); y=H+10;   angle=rng(Math.PI*1.25, Math.PI*1.75); }
  else               { x=-10;      y=rng(0,H); angle=rng(-Math.PI*0.25, Math.PI*0.25); }
  const speed  = rng(420, 780);
  const life   = (Math.max(W,H)*1.8) / speed;
  return { x, y, angle, speed, color: pick(COMET_COLORS),
           tailLen: rng(120,280), headR: rng(1.2,2.2), age: 0, life };
}

function drawComet(comet) {
  const { x, y, angle, tailLen, headR, color, age, life } = comet;
  const fadeIn  = Math.min(1, age/0.3);
  const fadeOut = age > life*0.8 ? 1-(age-life*0.8)/(life*0.2) : 1;
  const alpha   = fadeIn * fadeOut;
  const dx = -Math.cos(angle), dy = -Math.sin(angle);
  const tx2=x+dx*tailLen, ty2=y+dy*tailLen;
  const [r,g2,b] = color;
  ctx.save();
  const grad = ctx.createLinearGradient(x,y,tx2,ty2);
  grad.addColorStop(0,    `rgba(${r},${g2},${b},${0.85*alpha})`);
  grad.addColorStop(0.15, `rgba(${r},${g2},${b},${0.55*alpha})`);
  grad.addColorStop(0.5,  `rgba(${r},${g2},${b},${0.18*alpha})`);
  grad.addColorStop(1,    `rgba(${r},${g2},${b},0)`);
  ctx.strokeStyle=grad; ctx.lineWidth=headR*1.6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(tx2,ty2); ctx.stroke();
  const gg = ctx.createLinearGradient(x,y,tx2,ty2);
  gg.addColorStop(0,   `rgba(${r},${g2},${b},${0.12*alpha})`);
  gg.addColorStop(0.4, `rgba(${r},${g2},${b},${0.05*alpha})`);
  gg.addColorStop(1,   `rgba(${r},${g2},${b},0)`);
  ctx.strokeStyle=gg; ctx.lineWidth=headR*7;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(tx2,ty2); ctx.stroke();
  const hg=ctx.createRadialGradient(x,y,0,x,y,headR*3);
  hg.addColorStop(0,   `rgba(255,255,255,${0.95*alpha})`);
  hg.addColorStop(0.3, `rgba(${r},${g2},${b},${0.7*alpha})`);
  hg.addColorStop(1,   `rgba(${r},${g2},${b},0)`);
  ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(x,y,headR*3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// ── Supernovae ─────────────────────────────────────────────────────────────
// Phases: 'flash' → 'expand' → 'ring' → 'fade'
const supernovae = [];

function spawnSupernova() {
  const nx = rng(0.1, 0.9);
  const ny = rng(0.1, 0.9);
  const speed = pick([1.0, 1.8, 3.0, 5.0]);
  const warmTint = Math.random() < 0.35;
  return {
    nx, ny,
    speed,
    phase: 'flash',
    age: 0,
    flashDur:  0.35,
    expandDur: 1.8,
    ringDur:   2.5,
    fadeDur:   3.0,
    maxR: rng(60, 130),
    coreColor: warmTint ? [255,180,80] : [200,230,255],
    ringColor: warmTint ? [255,120,40] : [140,190,255],
  };
}

function drawSupernova(sn) {
  const { nx, ny, speed, phase, age, flashDur, expandDur, ringDur, fadeDur,
          maxR, coreColor: cc, ringColor: rc } = sn;
  const ox = smx * speed * W * 0.04 - scrollX * speed * W;
  const oy = smy * speed * H * 0.04;
  const x = ((nx * W + ox) % W + W) % W;
  const y = ((ny * H + oy) % H + H) % H;
  ctx.save();

  if (phase === 'flash') {
    const f = age / flashDur;
    const r = 2 + f * 18;
    const alpha = f < 0.5 ? f*2 : 1-(f-0.5)*2;
    const g1 = ctx.createRadialGradient(x,y,0,x,y,r*6);
    g1.addColorStop(0,   `rgba(255,255,255,${alpha*0.95})`);
    g1.addColorStop(0.2, `rgba(${cc[0]},${cc[1]},${cc[2]},${alpha*0.7})`);
    g1.addColorStop(0.6, `rgba(${cc[0]},${cc[1]},${cc[2]},${alpha*0.2})`);
    g1.addColorStop(1,   `rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
    ctx.fillStyle = g1;
    ctx.beginPath(); ctx.arc(x,y,r*6,0,Math.PI*2); ctx.fill();

  } else if (phase === 'expand') {
    const f = age / expandDur;
    const ease = 1 - Math.pow(1-f, 2.5);
    const r = ease * maxR * 0.55;
    const alpha = 1 - f*0.3;
    const g2 = ctx.createRadialGradient(x,y,r*0.4,x,y,r);
    g2.addColorStop(0,   `rgba(255,255,255,${alpha*0.6})`);
    g2.addColorStop(0.35,`rgba(${cc[0]},${cc[1]},${cc[2]},${alpha*0.45})`);
    g2.addColorStop(0.7, `rgba(${rc[0]},${rc[1]},${rc[2]},${alpha*0.2})`);
    g2.addColorStop(1,   `rgba(${rc[0]},${rc[1]},${rc[2]},0)`);
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    const coreR = Math.max(1, 8*(1-f*0.7));
    const cg = ctx.createRadialGradient(x,y,0,x,y,coreR*3);
    cg.addColorStop(0,   `rgba(255,255,255,${alpha*0.9})`);
    cg.addColorStop(0.4, `rgba(${cc[0]},${cc[1]},${cc[2]},${alpha*0.5})`);
    cg.addColorStop(1,   `rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,y,coreR*3,0,Math.PI*2); ctx.fill();

  } else if (phase === 'ring') {
    const f = age / ringDur;
    const r = maxR * 0.55 + f * maxR * 0.45;
    const thickness = maxR * 0.12 * (1-f*0.5);
    const alpha = (1-f) * 0.7;
    const innerR = Math.max(0, r - thickness);
    const g3 = ctx.createRadialGradient(x,y,innerR,x,y,r+thickness*0.5);
    g3.addColorStop(0,   `rgba(${rc[0]},${rc[1]},${rc[2]},0)`);
    g3.addColorStop(0.3, `rgba(${rc[0]},${rc[1]},${rc[2]},${alpha})`);
    g3.addColorStop(0.6, `rgba(${cc[0]},${cc[1]},${cc[2]},${alpha*0.6})`);
    g3.addColorStop(1,   `rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
    ctx.fillStyle = g3;
    ctx.beginPath(); ctx.arc(x,y,r+thickness*0.5,0,Math.PI*2); ctx.fill();
    const cg2 = ctx.createRadialGradient(x,y,0,x,y,6);
    cg2.addColorStop(0, `rgba(${cc[0]},${cc[1]},${cc[2]},${(1-f)*0.5})`);
    cg2.addColorStop(1, `rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
    ctx.fillStyle=cg2; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill();

  } else if (phase === 'fade') {
    const f = age / fadeDur;
    const alpha = (1-f) * 0.25;
    const r = maxR + f*maxR*0.3;
    const g4 = ctx.createRadialGradient(x,y,r*0.7,x,y,r);
    g4.addColorStop(0,   `rgba(${rc[0]},${rc[1]},${rc[2]},${alpha})`);
    g4.addColorStop(0.5, `rgba(${rc[0]},${rc[1]},${rc[2]},${alpha*0.4})`);
    g4.addColorStop(1,   `rgba(${rc[0]},${rc[1]},${rc[2]},0)`);
    ctx.fillStyle=g4; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

// ── Satellites ─────────────────────────────────────────────────────────────
const satellites = [];

function spawnSatellite() {
  const speed = pick([1.0, 1.8, 3.0]);
  const edge = Math.floor(Math.random()*4);
  let nx, ny, angle;
  if      (edge===0) { nx=rng(0,1); ny=-4/H;    angle=rng(Math.PI*0.3, Math.PI*0.7); }
  else if (edge===1) { nx=(W+4)/W;  ny=rng(0,1); angle=rng(Math.PI*0.8, Math.PI*1.2); }
  else if (edge===2) { nx=rng(0,1); ny=(H+4)/H; angle=rng(Math.PI*1.3, Math.PI*1.7); }
  else               { nx=-4/W;    ny=rng(0,1); angle=rng(-Math.PI*0.2, Math.PI*0.2); }
  const pixelSpeed = rng(55, 120);
  const life  = (Math.max(W,H)*1.6) / pixelSpeed;
  return {
    nx, ny,
    speed,
    angle, pixelSpeed, age: 0, life,
    blinkPhase: rng(0, Math.PI*2),
    blinkSpeed: rng(1.5, 3.5),
    brightness: rng(0.55, 0.95),
  };
}

function drawSatellite(sat) {
  const { nx, ny, speed, age, life, blinkPhase, blinkSpeed, brightness } = sat;
  const ox = smx * speed * W * 0.04 - scrollX * speed * W;
  const oy = smy * speed * H * 0.04;
  const x = ((nx * W + ox) % W + W) % W;
  const y = ((ny * H + oy) % H + H) % H;
  const fadeIn  = Math.min(1, age/0.8);
  const fadeOut = age > life-1 ? (life-age) : 1;
  const blink   = 0.45 + 0.55 * Math.abs(Math.sin(age*blinkSpeed + blinkPhase));
  const alpha   = fadeIn * fadeOut * brightness * blink;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#e8f0ff';
  ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = alpha * 0.3;
  const hg = ctx.createRadialGradient(x,y,0,x,y,4);
  hg.addColorStop(0, 'rgba(200,220,255,1)');
  hg.addColorStop(1, 'rgba(200,220,255,0)');
  ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// ── Event scheduler ────────────────────────────────────────────────────────
let nextEventTime = rng(5, 15);

function tickEvents(dt) {
  nextEventTime -= dt;
  if (nextEventTime <= 0) {
    const canSat = optSatellites, canSn = optSupernovae;
    if (canSat && canSn) {
      if (Math.random() < 0.6) {
        satellites.push(spawnSatellite());
        nextEventTime = rng(8, 20);
      } else {
        supernovae.push(spawnSupernova());
        nextEventTime = rng(18, 45);
      }
    } else if (canSat) {
      satellites.push(spawnSatellite());
      nextEventTime = rng(8, 20);
    } else if (canSn) {
      supernovae.push(spawnSupernova());
      nextEventTime = rng(18, 45);
    } else {
      nextEventTime = rng(5, 10);
    }
  }

  if (optSupernovae) {
    for (let i = supernovae.length-1; i>=0; i--) {
      const sn = supernovae[i];
      sn.age += dt;
      const dur = { flash: sn.flashDur, expand: sn.expandDur, ring: sn.ringDur, fade: sn.fadeDur };
      if (sn.age >= dur[sn.phase]) {
        sn.age = 0;
        const next = { flash:'expand', expand:'ring', ring:'fade', fade:null };
        if (!next[sn.phase]) { supernovae.splice(i,1); continue; }
        sn.phase = next[sn.phase];
      }
      drawSupernova(sn);
    }
  }

  if (optSatellites) {
    for (let i = satellites.length-1; i>=0; i--) {
      const sat = satellites[i];
      sat.age += dt;
      sat.nx += Math.cos(sat.angle)*sat.pixelSpeed*dt / W;
      sat.ny += Math.sin(sat.angle)*sat.pixelSpeed*dt / H;
      if (sat.age >= sat.life) { satellites.splice(i,1); continue; }
      drawSatellite(sat);
    }
  }
}
