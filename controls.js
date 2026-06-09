// ── Option flags ───────────────────────────────────────────────────────────
let optGalaxies   = false;
let optComets     = false;
let optEvents     = false;
let optSatellites = false;
let optSupernovae = false;
let optNebulas    = false;
let optScroll     = false;
let optMouseLook  = true;
let optDrawing    = false;
let optFlash      = false;
let optConnect    = false;
let scrollSpeed   = 3;

let optConstellations = false;
let optZip = false;

// ── Toggle listeners ───────────────────────────────────────────────────────
document.getElementById('tog-galaxies').addEventListener('change', e => { optGalaxies = e.target.checked; });
document.getElementById('tog-comets').addEventListener('change', e => { optComets = e.target.checked; });
document.getElementById('tog-events').addEventListener('change', e => {
  optEvents = e.target.checked;
  document.getElementById('events-sub-row').style.display = optEvents ? 'block' : 'none';
});
document.getElementById('tog-satellites').addEventListener('change', e => { optSatellites = e.target.checked; });
document.getElementById('tog-supernovae').addEventListener('change', e => { optSupernovae = e.target.checked; });
document.getElementById('tog-nebulas').addEventListener('change', e => { optNebulas = e.target.checked; });
document.getElementById('tog-constellations').addEventListener('change', e => {
  optConstellations = e.target.checked;
  document.getElementById('zip-row').style.display = optConstellations ? 'block' : 'none';
  if (optConstellations) {
    document.getElementById('tog-zip').checked = false;
    optZip = false;
  }
});
document.getElementById('tog-zip').addEventListener('change', e => { optZip = e.target.checked; });
document.getElementById('tog-scroll').addEventListener('change', e => {
  optScroll = e.target.checked;
  document.getElementById('scroll-speed-row').classList.toggle('visible', optScroll);
});
document.getElementById('tog-mouselook').addEventListener('change', e => { optMouseLook = e.target.checked; });
document.getElementById('tog-drawing').addEventListener('change', e => {
  optDrawing = e.target.checked;
  document.getElementById('drawing-sub-row').style.display = optDrawing ? 'block' : 'none';
});
document.getElementById('tog-flash').addEventListener('change', e => { optFlash = e.target.checked; });
document.getElementById('tog-connect').addEventListener('change', e => { optConnect = e.target.checked; });

// ── Slider listeners ───────────────────────────────────────────────────────
document.getElementById('sld-speed').addEventListener('input', e => {
  scrollSpeed = parseFloat(e.target.value);
  const val = parseFloat(e.target.value);
  document.getElementById('scroll-speed-val').textContent = val === 0 ? '0' : (val > 0 ? '+' + val : val);
});
document.getElementById('sld-trail').addEventListener('input', e => {
  TRAIL_LIFE = parseFloat(e.target.value);
  const val = parseFloat(e.target.value);
  document.getElementById('trail-life-val').textContent = val < 1 ? (val + 's') : (Math.round(val) + 's');
});

// ── Theme buttons & custom RGB ─────────────────────────────────────────────
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});
['sld-r','sld-g','sld-b'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateCustomRGB);
});

// ── Randomize ──────────────────────────────────────────────────────────────
document.getElementById('btn-randomize').addEventListener('click', () => {
  stars          = makeStars();
  cosmicMist     = makeCosmicMist();
  galaxies       = makeGalaxies();
  nebulaClouds   = makeNebulaClouds();
  constellations = makeConstellations();
  supernovae.length = 0;
  satellites.length = 0;
  comets.length = 0;
  nextCometTime  = rng(1, 4);
  nextEventTime  = rng(4, 14);
  applyTheme(activeTheme);
});
