// ── Galaxies ───────────────────────────────────────────────────────────────
const GALAXY_TYPES = ['spiral','barred','elliptical','irregular'];
const GALAXY_CORE_COLORS  = [[255,240,200],[255,230,170],[255,245,210],[240,235,255],[255,250,220],[160,210,255],[255,220,160]];
const GALAXY_DISK_COLORS  = [[160,190,255],[180,210,255],[140,180,255],[150,170,255],[170,200,255],[120,180,255],[100,170,250]];
const GALAXY_HAZE_COLORS  = [[100,130,220],[120,150,230],[90,120,210],[100,120,220],[110,145,225],[80,140,230],[70,130,230]];

function bakeGalaxyArms(g) {
  if (g.type !== 'spiral' && g.type !== 'barred') return;
  const { rx, ry, a, coreColor: cc, diskColor: dc, type } = g;
  const isBarred = type === 'barred';
  const armStart = isBarred ? rx * 0.28 : rx * 0.10;
  const scatterW = rx * 0.09;
  g.armParticles = [];
  for (let arm = 0; arm < 2; arm++) {
    const baseAng = (arm / 2) * Math.PI * 2;
    for (let i = 0; i < 220; i++) {
      const f = Math.pow(Math.random(), 0.85);
      const theta = baseAng + f * Math.PI * 1.65;
      const r2 = armStart + f * (rx * 0.97 - armStart);
      const scatter = (Math.random() - 0.5) * 2 * scatterW * (0.5 + f * 0.8);
      const perpAngle = theta + Math.PI / 2;
      const px2 = Math.cos(theta) * r2 + Math.cos(perpAngle) * scatter;
      const py2 = (Math.sin(theta) * r2 + Math.sin(perpAngle) * scatter) * (ry / rx);
      const warmFrac = Math.max(0, 1 - f * 2.2);
      const pr = Math.round(dc[0]*(1-warmFrac)+cc[0]*warmFrac);
      const pg = Math.round(dc[1]*(1-warmFrac)+cc[1]*warmFrac);
      const pb = Math.round(dc[2]*(1-warmFrac)+cc[2]*warmFrac);
      const clump = 0.25 + 0.75 * Math.pow(Math.random(), 1.8);
      const pr2 = (0.8 + Math.random() * 1.8) * clump * (rx / 60);
      const pa = a * (0.15 + 0.55 * Math.random()) * clump * (0.4 + 0.6 * (1 - f));
      g.armParticles.push({ px2, py2, pr2, pa, color: `rgb(${pr},${pg},${pb})` });
    }
  }
}

function makeGalaxies() {
  return Array.from({ length: 12 }, () => {
    const type = pick(GALAXY_TYPES);
    const rx = rng(45, 105);
    const ry = rx * rng(0.28, 0.75);
    const g = {
      x: rng(0.03, 0.97), y: rng(0.03, 0.97),
      type, angle: rng(0, Math.PI * 2),
      rx, ry, speed: rng(0.03, 0.07),
      coreColor: pick(GALAXY_CORE_COLORS),
      diskColor:  pick(GALAXY_DISK_COLORS),
      hazeColor:  pick(GALAXY_HAZE_COLORS),
      a: rng(0.22, 0.40),
    };
    bakeGalaxyArms(g);
    return g;
  });
}
let galaxies = makeGalaxies();

function drawGalaxy(gx, gy, g) {
  const { rx, ry, a, coreColor: cc, diskColor: dc, hazeColor: hc, type, angle } = g;
  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(angle);

  if (type === 'elliptical') {
    ctx.save(); ctx.scale(1, ry / rx);
    let grad = ctx.createRadialGradient(0,0,0,0,0,rx);
    grad.addColorStop(0,    rgba(cc, a));
    grad.addColorStop(0.25, rgba(cc, a*0.75));
    grad.addColorStop(0.6,  rgba(hc, a*0.35));
    grad.addColorStop(1,    rgba(hc, 0));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.scale(1, (ry*0.5)/(rx*0.5));
    let cg = ctx.createRadialGradient(0,0,0,0,0,rx*0.18);
    cg.addColorStop(0,   rgba([255,255,240], a));
    cg.addColorStop(0.5, rgba(cc, a*0.8));
    cg.addColorStop(1,   rgba(cc, 0));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0,0,rx*0.18,0,Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (type === 'spiral' || type === 'barred') {
    const isBarred = type === 'barred';
    ctx.save(); ctx.scale(1, ry/rx);
    let dg = ctx.createRadialGradient(0,0,0,0,0,rx);
    dg.addColorStop(0,    rgba(dc, a*0.28));
    dg.addColorStop(0.45, rgba(dc, a*0.12));
    dg.addColorStop(0.75, rgba(hc, a*0.06));
    dg.addColorStop(1,    rgba(hc, 0));
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2); ctx.fill();
    ctx.restore();
    if (isBarred) {
      for (let bi=-3; bi<=3; bi++) {
        const bx = bi*rx*0.10;
        const bg = ctx.createRadialGradient(bx,0,0,bx,0,rx*0.12);
        bg.addColorStop(0, rgba(cc, a*0.38)); bg.addColorStop(1, rgba(cc,0));
        ctx.save(); ctx.scale(1, ry/rx*0.55); ctx.fillStyle=bg;
        ctx.beginPath(); ctx.arc(bx,0,rx*0.12,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
    }
    if (g.armParticles) {
      for (const p of g.armParticles) {
        ctx.globalAlpha = p.pa; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.px2,p.py2,p.pr2,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.scale(1, ry/rx);
    const coreR = rx*0.22;
    let cg2 = ctx.createRadialGradient(0,0,0,0,0,coreR);
    cg2.addColorStop(0,   rgba([255,255,245], Math.min(a*1.1,1)));
    cg2.addColorStop(0.3, rgba(cc, a*0.9));
    cg2.addColorStop(0.7, rgba(cc, a*0.45));
    cg2.addColorStop(1,   rgba(cc, 0));
    ctx.fillStyle = cg2;
    ctx.beginPath(); ctx.arc(0,0,coreR,0,Math.PI*2); ctx.fill(); ctx.restore();

  } else if (type === 'irregular') {
    const clumps = [
      [0,0,0.55],[rx*0.3,ry*0.15,0.35],[-rx*0.28,-ry*0.2,0.30],
      [rx*0.15,-ry*0.3,0.28],[-rx*0.4,ry*0.1,0.22],[rx*0.45,-ry*0.05,0.20],
    ];
    clumps.forEach(([cx2,cy2,str]) => {
      const r2=rx*str*0.9;
      const g2=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,r2);
      g2.addColorStop(0,   rgba(dc, a*str*1.3));
      g2.addColorStop(0.5, rgba(hc, a*str*0.6));
      g2.addColorStop(1,   rgba(hc, 0));
      ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(cx2,cy2,r2,0,Math.PI*2); ctx.fill();
    });
    const hg=ctx.createRadialGradient(0,0,0,0,0,rx*0.18);
    hg.addColorStop(0,   rgba([200,230,255], a*0.9));
    hg.addColorStop(0.5, rgba(dc, a*0.5));
    hg.addColorStop(1,   rgba(hc, 0));
    ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(0,0,rx*0.18,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

// ── Nebula clouds ──────────────────────────────────────────────────────────
const NEBULA_PALETTE = [
  'rgba(80,40,180,','rgba(20,80,160,','rgba(140,40,100,',
  'rgba(40,120,160,','rgba(90,20,140,','rgba(60,100,200,',
  'rgba(100,20,160,','rgba(30,90,180,',
];
function makeNebulaClouds() {
  return Array.from({ length: 6 }, () => ({
    x: rng(0,1), y: rng(0,1),
    rx: rng(130,260), ry: rng(80,150),
    color: pick(NEBULA_PALETTE),
    a: rng(0.04, 0.08),
    speed: rng(0.2, 1.4),
  }));
}
let nebulaClouds = makeNebulaClouds();
