// ── Main draw loop ─────────────────────────────────────────────────────────
// Globals t, DT, mx, my, smx, smy, scrollX, BASE_SCROLL_RATE → canvas.js
// mouseX, mouseY, mouseHeld, heldX, heldY                    → interaction.js

function draw() {
  t += DT;

  if (optScroll) {
    scrollX += BASE_SCROLL_RATE * scrollSpeed;
    mx = 0;
    my = optMouseLook ? mouseY * 0.4 : 0;
  } else {
    mx = optMouseLook ? mouseX : 0;
    my = optMouseLook ? mouseY : 0;
  }

  smx += (mx - smx) * 0.06;
  smy += (my - smy) * 0.06;

  tickThemeTransition(DT);
  ctx.clearRect(0, 0, W, H);
  const [br, bg, bb] = getCurrent('bg');
  ctx.fillStyle = `rgb(${br},${bg},${bb})`;
  ctx.fillRect(0, 0, W, H);

  // 1. Cosmic mist
  cosmicMist.forEach(n => {
    const ox = smx * n.speed * W * 0.12 - scrollX * n.speed * W;
    const oy = smy * n.speed * H * 0.12;
    const cx = n.x * W + ox, cy = n.y * H + oy;
    const [r, g2, b] = getCurrent('mist');
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, n.rx);
    grad.addColorStop(0,   `rgba(${r},${g2},${b},${n.a})`);
    grad.addColorStop(0.5, `rgba(${r},${g2},${b},${n.a * 0.3})`);
    grad.addColorStop(1,   `rgba(${r},${g2},${b},0)`);
    ctx.save();
    ctx.scale(1, n.ry / n.rx);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 2. Galaxies
  if (optGalaxies) {
    ctx.globalAlpha = 0.55;
    galaxies.forEach(g => {
      const ox = smx * g.speed * W * 0.04 - scrollX * g.speed * W;
      const oy = smy * g.speed * H * 0.04;
      drawGalaxy(g.x * W + ox, g.y * H + oy, g);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(2,0,8,0.32)';
    ctx.fillRect(0, 0, W, H);
  }

  // 3. Nebula clouds
  if (optNebulas) nebulaClouds.forEach(n => {
    const ox = smx * n.speed * W * 0.12 - scrollX * n.speed * W;
    const oy = smy * n.speed * H * 0.12;
    const cx = n.x * W + ox, cy = n.y * H + oy;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, n.rx);
    grad.addColorStop(0,   n.color + n.a + ')');
    grad.addColorStop(0.5, n.color + (n.a * 0.4) + ')');
    grad.addColorStop(1,   n.color + '0)');
    ctx.save();
    ctx.scale(1, n.ry / n.rx);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 4. Stars
  stars.forEach(layer => {
    layer.forEach(s => {
      const ox = smx * s.speed * W * 0.04 - scrollX * s.speed * W;
      const oy = smy * s.speed * H * 0.04;
      const px = ((s.x * W + ox) % W + W) % W;
      const py = ((s.y * H + oy) % H + H) % H;
      const tw = 0.75 + 0.25 * Math.sin(t * s.twinkleSpeed + s.twinkle);
      const rb = rippleBoost(px, py);
      const finalTw = tw + rb;
      ctx.globalAlpha = Math.min(1, s.alpha * finalTw);
      const ease = themeT >= 1 ? 1 : 1 - Math.pow(1 - themeT, 3);
      const fr = s.colorFrom, to = s.colorTo;
      const sr  = Math.round(fr[0] + (to[0] - fr[0]) * ease);
      const sg2 = Math.round(fr[1] + (to[1] - fr[1]) * ease);
      const sb  = Math.round(fr[2] + (to[2] - fr[2]) * ease);
      ctx.fillStyle = `rgb(${sr},${sg2},${sb})`;
      ctx.beginPath();
      ctx.arc(px, py, s.r * Math.min(2.5, finalTw), 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 2.0 || rb > 0.3) {
        ctx.globalAlpha = Math.min(0.8, s.alpha * finalTw * 0.25);
        ctx.beginPath();
        ctx.arc(px, py, s.r * Math.min(4, finalTw * 2.8), 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });

  // 5. Ripples
  tickRipples();

  // 5b. Constellations
  if (optConstellations) drawConstellations();

  // 5c. Held star + trail + release flash
  tickHeldStar(DT);

  // 6. Comets
  if (optEvents && optComets) {
    nextCometTime -= DT;
    if (nextCometTime <= 0) {
      comets.push(spawnComet());
      nextCometTime = rng(3, 9);
    }
    for (let i = comets.length - 1; i >= 0; i--) {
      const cm = comets[i];
      cm.age += DT;
      cm.x += Math.cos(cm.angle) * cm.speed * DT;
      cm.y += Math.sin(cm.angle) * cm.speed * DT;
      if (cm.age >= cm.life) { comets.splice(i, 1); continue; }
      drawComet(cm);
    }
  }

  // 7. Events (supernovae + satellites)
  if (optEvents) tickEvents(DT);

  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

draw();
