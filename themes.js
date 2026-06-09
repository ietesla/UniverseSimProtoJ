// ── Color themes ───────────────────────────────────────────────────────────
const THEMES = {
  white: {
    label: 'White',
    bgColor: [2, 0, 8],
    starPalette: () => Array(25).fill('#ffffff'),
    mistTint: () => [60, 30, 140],
    trailRGB: [220, 238, 255],
    constellationRGB: [160, 200, 255],
  },
  default: {
    label: 'Default',
    bgColor: [2, 0, 8],
    starPalette: () => [
      '#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',
      '#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',
      '#fffef5','#fffef5','#fffef5','#fffef5',
      '#fff8e8','#fff8e8','#fff8e8',
      '#ffefc0','#ffefc0',
      '#cce0ff','#cce0ff',
      '#b8d4ff','#ffd090','#ffb870','#ff9060',
    ],
    mistTint: () => pick([[60,30,140],[20,60,160],[100,20,100],[30,80,130],[80,20,120]]),
    trailRGB: [220, 238, 255],
    constellationRGB: [160, 200, 255],
  },
  aurora: {
    label: 'Aurora',
    bgColor: [0, 4, 12],
    starPalette: () => ['#afffdf','#7fffd4','#80ffea','#b0fff0','#ffffff','#ffffff','#c0fff0','#a0ffe0','#60ffcc','#ffffff','#ffffff','#b8ffec','#d0fff8','#ffffff','#ffffff','#e0fffa','#40ffcc','#20ffb0','#00ffaa','#80ffe8','#ffffff','#c8fff4','#b0ffe0','#88ffda','#60ffc8'],
    mistTint: () => pick([[0,120,100],[0,100,120],[20,140,110],[0,80,140],[10,110,130]]),
    trailRGB: [80, 255, 200],
    constellationRGB: [80, 255, 180],
  },
  ember: {
    label: 'Ember',
    bgColor: [8, 2, 0],
    starPalette: () => ['#ffffff','#ffffff','#ffffff','#fffaf0','#fff5e0','#ffe8c0','#ffd090','#ffb870','#ff9060','#ff7040','#ff9060','#ffb870','#ffd090','#ffe8c0','#ffffff','#ffffff','#fff5e0','#ffe0a0','#ffc060','#ff8040','#ffaa50','#ff6030','#ffd080','#ffb060','#ff9850'],
    mistTint: () => pick([[140,40,10],[160,30,0],[120,50,10],[140,20,0],[100,40,20]]),
    trailRGB: [255, 160, 60],
    constellationRGB: [255, 140, 80],
  },
  void: {
    label: 'Void',
    bgColor: [0, 0, 0],
    starPalette: () => ['#ffffff','#ffffff','#ddddff','#ccccff','#bbbbee','#ffffff','#aaaadd','#9999cc','#ffffff','#ffffff','#e8e8ff','#d0d0ee','#ffffff','#ffffff','#c8c8ff','#b0b0ee','#ffffff','#ffffff','#e0e0ff','#ffffff','#f0f0ff','#d8d8ff','#c0c0f0','#b8b8e8','#a8a8d8'],
    mistTint: () => pick([[20,20,40],[10,10,30],[30,20,50],[15,15,40],[25,10,45]]),
    trailRGB: [180, 180, 220],
    constellationRGB: [160, 160, 200],
  },
  rose: {
    label: 'Rose',
    bgColor: [6, 0, 4],
    starPalette: () => ['#ffffff','#ffffff','#ffffff','#fff0f8','#ffe0f0','#ffc0e0','#ffb0d8','#ff90c0','#ff70b0','#ff50a0','#ff80b8','#ffb0d0','#ffd0e8','#ffffff','#ffffff','#fff5fa','#ffd8ec','#ffb0d4','#ff90c4','#ff70b0','#ffffff','#ffc8e0','#ffb0d8','#ff98cc','#ff80c0'],
    mistTint: () => pick([[140,20,80],[120,10,70],[160,30,90],[100,20,60],[130,15,75]]),
    trailRGB: [255, 140, 200],
    constellationRGB: [255, 160, 210],
  },
  toxic: {
    label: 'Toxic',
    bgColor: [0, 6, 0],
    starPalette: () => ['#ffffff','#ffffff','#f0fff0','#e0ffe0','#c0ffc0','#a0ffa0','#80ff80','#60ff60','#40ff40','#20ff20','#50ff50','#80ff80','#b0ffb0','#d0ffd0','#ffffff','#ffffff','#c8ffc8','#a8ffa8','#88ff88','#68ff68','#ffffff','#b0ffb0','#98ff98','#80ff80','#70ff70'],
    mistTint: () => pick([[20,120,10],[10,140,0],[30,100,20],[0,130,10],[15,110,5]]),
    trailRGB: [80, 255, 80],
    constellationRGB: [100, 255, 100],
  },
  rainbow: {
    label: 'Rainbow',
    bgColor: [2, 0, 8],
    starPalette: () => {
      // Returns a vivid multi-hue palette based on current rainbow hue
      const palette = [];
      for (let i = 0; i < 25; i++) {
        const hue = (rainbowHue + i * 14) % 360;
        palette.push(hslToHex(hue, 100, 80));
      }
      return palette;
    },
    mistTint: () => {
      const [r, g, b] = hslToRGB(rainbowHue, 80, 35);
      return [r, g, b];
    },
    trailRGB: null,   // computed dynamically
    constellationRGB: null,
  },
  custom: {
    label: 'Custom',
    bgColor: [2, 0, 8],
    starPalette: () => {
      const [r,g,b] = customRGB;
      const h = `rgb(${r},${g},${b})`;
      const m = `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`;
      return [h,h,h,h,h,h,h,h,h,h,m,m,m,m,'#ffffff','#ffffff',h,h,m,m,'#ffffff',h,m,h,m];
    },
    mistTint: () => customRGB.map(v => Math.floor(v * 0.5)),
    trailRGB: null, // computed dynamically
    constellationRGB: null,
  },
};

// ── Rainbow helpers ────────────────────────────────────────────────────────
let rainbowHue = 0;          // 0–360, advances each frame
const RAINBOW_SPEED = 18;    // degrees per second

function hslToRGB(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)];
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRGB(h, s, l);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

let customRGB = [255, 255, 255];
let activeTheme = 'white';

// ── Theme transition ───────────────────────────────────────────────────────
const TRANSITION_SPEED = 0.7; // higher = faster (units: 1/sec)
let themeFrom = {
  bg:            [2, 0, 8],
  mist:          [60, 30, 140],
  trail:         [220, 238, 255],
  constellation: [160, 200, 255],
  starTint:      [255, 255, 255],
};
let themeTo = { ...themeFrom };
let themeCurrent = { bg:[2,0,8], mist:[60,30,140], trail:[220,238,255], constellation:[160,200,255], starTint:[255,255,255] };
let themeT = 1; // 0 = start of transition, 1 = complete

function hexToRGB(hex) {
  if (!hex || typeof hex !== 'string') return [255,255,255];
  const rgbMatch = hex.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  const c = hex.replace('#','');
  if (c.length === 3) return [parseInt(c[0]+c[0],16), parseInt(c[1]+c[1],16), parseInt(c[2]+c[2],16)];
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
}

function paletteToTint(palette) {
  const colors = palette.filter(h => h !== '#ffffff' && h !== '#fffef5');
  if (!colors.length) return [255,255,255];
  const avg = colors.reduce(([ar,ag,ab], h) => {
    const [r,g,b] = hexToRGB(h); return [ar+r, ag+g, ab+b];
  }, [0,0,0]).map(v => Math.round(v / colors.length));
  return avg;
}

function getTargetColors(name) {
  const th = THEMES[name];
  const palette = th.starPalette();
  const isDynamic = name === 'custom' || name === 'rainbow';
  const trail = isDynamic ? (name === 'custom' ? customRGB : hslToRGB(rainbowHue, 100, 70)) : th.trailRGB;
  const cons   = isDynamic ? (name === 'custom' ? customRGB : hslToRGB((rainbowHue + 30) % 360, 100, 75)) : th.constellationRGB;
  return {
    bg:            th.bgColor,
    mist:          th.mistTint(),
    trail:         trail,
    constellation: cons,
    starTint:      paletteToTint(palette),
  };
}

function lerpRGB(a, b, t) {
  return [
    Math.round(a[0] + (b[0]-a[0]) * t),
    Math.round(a[1] + (b[1]-a[1]) * t),
    Math.round(a[2] + (b[2]-a[2]) * t),
  ];
}

function tickThemeTransition(dt) {
  if (activeTheme === 'rainbow') {
    rainbowHue = (rainbowHue + RAINBOW_SPEED * dt) % 360;
    // Continuously push new target colors so the scene keeps cycling
    const newTarget = getTargetColors('rainbow');
    themeTo = newTarget;
    if (themeT >= 1) {
      themeFrom = { ...themeCurrent };
      themeT = 0;
    }
    // Also re-tint stars gradually
    const palette = THEMES['rainbow'].starPalette();
    stars.forEach(layer => layer.forEach(s => {
      if (Math.random() < dt * 0.3) { // stagger star recolors
        s.colorFrom = [...s.colorTo];
        const newColor = pick(palette);
        s.color = newColor;
        s.colorTo = hexToRGB(typeof newColor === 'string' ? newColor : '#ffffff');
      }
    }));
  }
  if (themeT >= 1) return;
  themeT = Math.min(1, themeT + dt * TRANSITION_SPEED);
  const ease = 1 - Math.pow(1 - themeT, 3);
  for (const key of Object.keys(themeCurrent)) {
    themeCurrent[key] = lerpRGB(themeFrom[key], themeTo[key], ease);
  }
}

function getCurrent(key) { return themeCurrent[key]; }

function applyTheme(name) {
  activeTheme = name;
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === name));
  document.getElementById('custom-rgb').style.display = name === 'custom' ? 'flex' : 'none';
  const prevEase = themeT >= 1 ? 1 : 1 - Math.pow(1-themeT, 3);
  themeFrom = { ...themeCurrent };
  themeTo = getTargetColors(name);
  themeT = 0;
  const palette = THEMES[name].starPalette();
  stars.forEach(layer => layer.forEach(s => {
    const fr = s.colorFrom, to = s.colorTo;
    const curR = Math.round(fr[0] + (to[0]-fr[0]) * prevEase);
    const curG = Math.round(fr[1] + (to[1]-fr[1]) * prevEase);
    const curB = Math.round(fr[2] + (to[2]-fr[2]) * prevEase);
    s.colorFrom = [curR, curG, curB];
    const newColor = pick(palette);
    s.color = newColor;
    s.colorTo = hexToRGB(typeof newColor === 'string' ? newColor : '#ffffff');
  }));
}

function updateCustomRGB() {
  const r = parseInt(document.getElementById('sld-r').value);
  const g = parseInt(document.getElementById('sld-g').value);
  const b = parseInt(document.getElementById('sld-b').value);
  customRGB = [r, g, b];
  document.getElementById('rgb-r-val').textContent = r;
  document.getElementById('rgb-g-val').textContent = g;
  document.getElementById('rgb-b-val').textContent = b;
  if (activeTheme === 'custom') applyTheme('custom');
}
