// ── Constellations ─────────────────────────────────────────────────────────
function makeConstellations() {
  // Use layer index 3 (mid-foreground, speed 3.0) — visible, not too fast
  const layerIdx = 3;
  const layer = stars[layerIdx];
  const layerSpeed = LAYERS[layerIdx].speed;

  const numConstellations = 5 + Math.floor(Math.random() * 5);
  const usedIndices = new Set();
  const result = [];

  for (let c = 0; c < numConstellations; c++) {
    const candidates = layer.map((_, i) => i).filter(i => !usedIndices.has(i));
    if (candidates.length < 6) break;
    const seed = pick(candidates);
    const starCount = 4 + Math.floor(Math.random() * 5);

    const memberIdx = [seed];
    usedIndices.add(seed);
    for (let s = 1; s < starCount; s++) {
      const last = layer[memberIdx[memberIdx.length - 1]];
      let bestDist = Infinity, bestI = -1;
      for (let i = 0; i < layer.length; i++) {
        if (usedIndices.has(i)) continue;
        const dx = layer[i].x - last.x, dy = layer[i].y - last.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 0.28 && d < bestDist) { bestDist = d; bestI = i; }
      }
      if (bestI === -1) break;
      memberIdx.push(bestI);
      usedIndices.add(bestI);
    }
    if (memberIdx.length < 3) continue;

    // Build edge list: chain + one or two cross-links for shape variety
    const edges = [];
    for (let i = 0; i < memberIdx.length - 1; i++) edges.push([i, i+1]);
    if (memberIdx.length >= 5 && Math.random() < 0.6) {
      const a = Math.floor(Math.random() * (memberIdx.length - 2));
      const b = a + 2 + Math.floor(Math.random() * (memberIdx.length - a - 2));
      if (b < memberIdx.length) edges.push([a, b]);
    }

    result.push({
      memberIdx,
      edges,
      speed: layerSpeed,
      edgeIdx: 0,
      zipT: Math.random(),
      zipSpeed: rng(0.18, 0.38),
      trail: [],
      lineAlpha: rng(0.08, 0.16),
      glimmerPhase: rng(0, Math.PI * 2),
      glimmerSpeed: rng(0.4, 1.1),
    });
  }
  return result;
}

function drawConstellations() {
  constellations.forEach(con => {
    const layer = stars[3];

    // rawPts: unwrapped (can go outside 0..W) — used for zipper travel
    // pts:    wrapped (% W) — used for drawing star highlights only
    const rawPts = con.memberIdx.map(idx => {
      const s = layer[idx];
      const ox = smx*s.speed*W*0.04 - scrollX*s.speed*W;
      const oy = smy*s.speed*H*0.04;
      return { px: s.x*W + ox, py: s.y*H + oy };
    });
    const pts = rawPts.map(p => ({
      px: ((p.px % W) + W) % W,
      py: ((p.py % H) + H) % H,
    }));

    // ── Draw connecting lines with wrap-around support ─────────────────────
    const glimmer = 0.5 + 0.5 * Math.sin(t * con.glimmerSpeed + con.glimmerPhase);
    const lineBase  = 0.18 + glimmer * 0.22;
    const lineWhite = 0.10 + glimmer * 0.28;

    function drawWrappedLine(sx, sy, ex, ey) {
      const [cr,cg,cb] = getCurrent('constellation');
      const lg = ctx.createLinearGradient(sx, sy, ex, ey);
      lg.addColorStop(0,   `rgba(${cr},${cg},${cb},${lineBase * 0.9})`);
      lg.addColorStop(0.5, `rgba(${Math.min(255,cr+60)},${Math.min(255,cg+35)},${Math.min(255,cb+0)},${lineBase})`);
      lg.addColorStop(1,   `rgba(${cr},${cg},${cb},${lineBase * 0.9})`);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      if (glimmer > 0.15) {
        const wg = ctx.createLinearGradient(sx, sy, ex, ey);
        wg.addColorStop(0,   `rgba(255,255,255,0)`);
        wg.addColorStop(0.5, `rgba(255,255,255,${lineWhite})`);
        wg.addColorStop(1,   `rgba(255,255,255,0)`);
        ctx.strokeStyle = wg;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.lineWidth = 1;
    con.edges.forEach(([a, b]) => {
      const rA = rawPts[a], rB = rawPts[b];
      let dx = ((rB.px % W) + W) % W - ((rA.px % W) + W) % W;
      let dy = ((rB.py % H) + H) % H - ((rA.py % H) + H) % H;
      if (dx >  W * 0.5) dx -= W;
      if (dx < -W * 0.5) dx += W;
      if (dy >  H * 0.5) dy -= H;
      if (dy < -H * 0.5) dy += H;
      const startX = ((rA.px % W) + W) % W;
      const startY = ((rA.py % H) + H) % H;
      const endX = startX + dx;
      const endY = startY + dy;
      const crossesH = endX < 0 || endX > W;
      const crossesV = endY < 0 || endY > H;
      if (!crossesH && !crossesV) {
        drawWrappedLine(startX, startY, endX, endY);
      } else {
        // Draw both halves when crossing a screen boundary
        if (crossesH) {
          const tx = endX < 0 ? 0 : W;
          const ty = startY + dy * (tx - startX) / dx;
          drawWrappedLine(startX, startY, tx, ty);
          drawWrappedLine(tx - (endX < 0 ? -W : W), ty, endX + (endX < 0 ? W : -W), endY);
        } else {
          const ty = endY < 0 ? 0 : H;
          const tx = startX + dx * (ty - startY) / dy;
          drawWrappedLine(startX, startY, tx, ty);
          drawWrappedLine(tx, ty - (endY < 0 ? -H : H), endX, endY + (endY < 0 ? H : -H));
        }
      }
    });
    ctx.restore();

    // ── Zipper ─────────────────────────────────────────────────────────────
    const edge = con.edges[con.edgeIdx];
    const pA = rawPts[edge[0]], pB = rawPts[edge[1]];
    let edgeDx = ((pB.px % W) + W) % W - ((pA.px % W) + W) % W;
    let edgeDy = ((pB.py % H) + H) % H - ((pA.py % H) + H) % H;
    if (edgeDx >  W * 0.5) edgeDx -= W;
    if (edgeDx < -W * 0.5) edgeDx += W;
    if (edgeDy >  H * 0.5) edgeDy -= H;
    if (edgeDy < -H * 0.5) edgeDy += H;
    const edgeLen = Math.sqrt(edgeDx*edgeDx + edgeDy*edgeDy) || 1;
    con.zipT += (160 / edgeLen) * DT;
    if (con.zipT >= 1) {
      con.zipT -= 1;
      con.edgeIdx = (con.edgeIdx + 1) % con.edges.length;
      con.trail = [];
    }

    if (optZip) {
      const curEdge = con.edges[con.edgeIdx];
      const rpA = rawPts[curEdge[0]], rpB = rawPts[curEdge[1]];
      let _dx = ((rpB.px % W) + W) % W - ((rpA.px % W) + W) % W;
      let _dy = ((rpB.py % H) + H) % H - ((rpA.py % H) + H) % H;
      if (_dx >  W * 0.5) _dx -= W;
      if (_dx < -W * 0.5) _dx += W;
      if (_dy >  H * 0.5) _dy -= H;
      if (_dy < -H * 0.5) _dy += H;
      const _aEndX = ((rpA.px % W) + W) % W + _dx;
      const _aEndY = ((rpA.py % H) + H) % H + _dy;
      const crossScreen = _aEndX < 0 || _aEndX > W || _aEndY < 0 || _aEndY > H;
      if (!crossScreen) {
        const _startX = ((rpA.px % W) + W) % W;
        const _startY = ((rpA.py % H) + H) % H;
        const rawZipX = _startX + _dx * con.zipT;
        const rawZipY = _startY + _dy * con.zipT;
        const zipX = ((rawZipX % W) + W) % W;
        const zipY = ((rawZipY % H) + H) % H;

        con.trail.push({ x: zipX, y: zipY });
        if (con.trail.length > 22) con.trail.shift();

        ctx.save();
        for (let i = 1; i < con.trail.length; i++) {
          const f = i / con.trail.length;
          const tr = f * 3;
          const tg = ctx.createRadialGradient(
            con.trail[i].x, con.trail[i].y, 0,
            con.trail[i].x, con.trail[i].y, tr * 2.5
          );
          tg.addColorStop(0, `rgba(180,225,255,${f*f*0.7})`);
          tg.addColorStop(1, 'rgba(140,190,255,0)');
          ctx.fillStyle = tg;
          ctx.globalAlpha = f * f * 0.85;
          ctx.beginPath(); ctx.arc(con.trail[i].x, con.trail[i].y, tr*2.5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#d0eaff';
          ctx.globalAlpha = f * f * 0.9;
          ctx.beginPath(); ctx.arc(con.trail[i].x, con.trail[i].y, tr, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();

        ctx.save();
        const hg = ctx.createRadialGradient(zipX, zipY, 0, zipX, zipY, 12);
        hg.addColorStop(0,    'rgba(255,255,255,0.9)');
        hg.addColorStop(0.25, 'rgba(200,230,255,0.7)');
        hg.addColorStop(0.6,  'rgba(140,195,255,0.25)');
        hg.addColorStop(1,    'rgba(120,180,255,0)');
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(zipX, zipY, 12, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(zipX, zipY, 2.2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      } else {
        con.trail = [];
      }
    }

    // ── Member star highlights ─────────────────────────────────────────────
    ctx.save();
    pts.forEach(p => {
      ctx.globalAlpha = 0.45;
      const sg = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, 5);
      sg.addColorStop(0, 'rgba(200,225,255,0.6)');
      sg.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(p.px, p.py, 5, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();
  });
}

// ── Initialise ────────────────────────────────────────────────────────────
let constellations = makeConstellations();
