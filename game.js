// ── Audio engine (Web Audio API — no files needed) ─────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;
let musicMode = false;
let activeTones = new Map();
let sfxSliderVal = 0.5;

function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new AudioCtx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
}

function sfx(type) {
  ensureAudio();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.connect(g);
  g.connect(masterGain);

  switch (type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
      break;
    case 'play':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
      break;
    case 'pause':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
      break;
    case 'clear':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;
    case 'random':
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;
    case 'step':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
      break;
    case 'toggle':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
      break;
    case 'slider':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + (sfxSliderVal || 0.5) * 600, now);
      osc.frequency.exponentialRampToValueAtTime(200 + (sfxSliderVal || 0.5) * 400, now + 0.06);
      g.gain.setValueAtTime(0.07, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
      break;
    case 'music-on':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.connect(g2); g2.connect(masterGain);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(659, now + 0.08);
      g2.gain.setValueAtTime(0, now);
      g2.gain.setValueAtTime(0.1, now + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o2.start(now + 0.08); o2.stop(now + 0.35);
      const o3 = audioCtx.createOscillator();
      const g3 = audioCtx.createGain();
      o3.connect(g3); g3.connect(masterGain);
      o3.type = 'sine';
      o3.frequency.setValueAtTime(784, now + 0.16);
      g3.gain.setValueAtTime(0, now);
      g3.gain.setValueAtTime(0.1, now + 0.16);
      g3.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      o3.start(now + 0.16); o3.stop(now + 0.45);
      break;
    case 'music-off':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
      const o4 = audioCtx.createOscillator();
      const g4 = audioCtx.createGain();
      o4.connect(g4); g4.connect(masterGain);
      o4.type = 'sine';
      o4.frequency.setValueAtTime(523, now + 0.1);
      g4.gain.setValueAtTime(0, now);
      g4.gain.setValueAtTime(0.1, now + 0.1);
      g4.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o4.start(now + 0.1); o4.stop(now + 0.3);
      break;
  }
}

// ── Musical cells — ambient tones based on cell positions ──────────────────────
// Pentatonic scale for pleasant harmonics
const PENTATONIC = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0];

function updateMusic() {
  if (!musicMode || !audioCtx) { killAllTones(); return; }

  // Sample a sparse grid of cells to create tones (max ~8 simultaneous)
  const step = Math.max(4, Math.floor(cols / 8));
  const activeKeys = new Set();

  for (let c = 0; c < cols; c += step) {
    let col_alive = 0;
    for (let r = 0; r < rows; r++) col_alive += grid[r][c];
    if (col_alive === 0) continue;

    const key = c;
    activeKeys.add(key);
    const freq = PENTATONIC[c % PENTATONIC.length];
    const pan = (c / cols) * 2 - 1; // -1 left to +1 right
    const vol = Math.min(col_alive / rows, 0.3) * 0.15;

    if (!activeTones.has(key)) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const p = audioCtx.createStereoPanner();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.value = 0;
      p.pan.value = pan;
      osc.connect(g);
      g.connect(p);
      p.connect(masterGain);
      osc.start();
      activeTones.set(key, { osc, gain: g, panner: p });
    }
    const tone = activeTones.get(key);
    tone.gain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.05);
  }

  // Fade out tones for columns no longer active
  for (const [key, tone] of activeTones) {
    if (!activeKeys.has(key)) {
      tone.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      setTimeout(() => {
        tone.osc.stop();
        activeTones.delete(key);
      }, 200);
    }
  }
}

function killAllTones() {
  for (const [, tone] of activeTones) {
    try { tone.osc.stop(); } catch (_) {}
    try { tone.osc.disconnect(); } catch (_) {}
  }
  activeTones.clear();
}

// ── Color palette — age-based heatmap ──────────────────────────────────────────
function ageColor(age) {
  // 0 → green, growing through cyan, blue, purple, to pink at high age
  const t = Math.min(age / 80, 1);
  if (t < 0.25) {
    const u = t / 0.25;
    return lerpRGB(74, 222, 128, 34, 211, 238, u);   // green → cyan
  } else if (t < 0.5) {
    const u = (t - 0.25) / 0.25;
    return lerpRGB(34, 211, 238, 99, 102, 241, u);    // cyan → indigo
  } else if (t < 0.75) {
    const u = (t - 0.5) / 0.25;
    return lerpRGB(99, 102, 241, 168, 85, 247, u);    // indigo → purple
  } else {
    const u = (t - 0.75) / 0.25;
    return lerpRGB(168, 85, 247, 236, 72, 153, u);    // purple → pink
  }
}

function lerpRGB(r1, g1, b1, r2, g2, b2, t) {
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

// ── Game state ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let cellSize = 10;
let cols, rows;
let grid = [];
let ages = [];
let running = false;
let generation = 0;
let animFrame = null;
let lastTime = 0;

// ── Grid ───────────────────────────────────────────────────────────────────────
function resize() {
  const maxW = Math.min(window.innerWidth - 32, 900);
  const maxH = Math.min(window.innerHeight - 240, 620);
  cols = Math.floor(maxW / cellSize);
  rows = Math.floor(maxH / cellSize);
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  const nextGrid = createGrid();
  const nextAges = createAgeGrid();
  for (let r = 0; r < Math.min(rows, grid.length || 0); r++)
    for (let c = 0; c < Math.min(cols, (grid[r] || []).length); c++) {
      nextGrid[r][c] = grid[r][c];
      nextAges[r][c] = ages[r] ? ages[r][c] : 0;
    }
  grid = nextGrid;
  ages = nextAges;
  draw();
}

function createGrid() {
  return Array.from({ length: rows }, () => new Uint8Array(cols));
}

function createAgeGrid() {
  return Array.from({ length: rows }, () => new Uint16Array(cols));
}

function countNeighbors(g, r, c) {
  let n = 0;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      n += g[(r + dr + rows) % rows][(c + dc + cols) % cols];
    }
  return n;
}

function step() {
  const next = createGrid();
  const nextAges = createAgeGrid();
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const n = countNeighbors(grid, r, c);
      if (grid[r][c]) {
        next[r][c] = (n === 2 || n === 3) ? 1 : 0;
      } else {
        next[r][c] = (n === 3) ? 1 : 0;
      }
      nextAges[r][c] = next[r][c] ? (ages[r][c] + 1) : 0;
    }
  grid = next;
  ages = nextAges;
  generation++;
}

// ── Drawing ────────────────────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  if (cellSize >= 6) {
    ctx.strokeStyle = '#111118';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath(); ctx.moveTo(c * cellSize, 0); ctx.lineTo(c * cellSize, canvas.height); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * cellSize); ctx.lineTo(canvas.width, r * cellSize); ctx.stroke();
    }
  }

  // Cells with age-based color
  let live = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c]) {
        ctx.fillStyle = ageColor(ages[r][c]);
        ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 0.5, cellSize - 0.5);
        live++;
      }

  document.getElementById('gen').textContent = generation;
  document.getElementById('live').textContent = live;
}

// ── Loop ───────────────────────────────────────────────────────────────────────
function getInterval() {
  return 1000 / parseInt(document.getElementById('speed').value);
}

function loop(ts) {
  if (ts - lastTime >= getInterval()) {
    step();
    draw();
    if (musicMode) updateMusic();
    lastTime = ts;
  }
  animFrame = requestAnimationFrame(loop);
}

function play() {
  if (running) return;
  running = true;
  sfx('play');
  document.getElementById('btn-play').textContent = '⏸ Pause';
  document.getElementById('btn-play').classList.add('active');
  lastTime = 0;
  animFrame = requestAnimationFrame(loop);
}

function pause() {
  if (!running) return;
  running = false;
  sfx('pause');
  cancelAnimationFrame(animFrame);
  document.getElementById('btn-play').textContent = '▶ Play';
  document.getElementById('btn-play').classList.remove('active');
  killAllTones();
}

// ── Mouse drawing ──────────────────────────────────────────────────────────────
let drawing = false;
let drawValue = 1;

canvas.addEventListener('mousedown', e => {
  ensureAudio();
  drawing = true;
  const { r, c } = cellAt(e);
  drawValue = grid[r][c] ? 0 : 1;
  toggle(r, c, drawValue);
});
canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  const { r, c } = cellAt(e);
  toggle(r, c, drawValue);
});
window.addEventListener('mouseup', () => drawing = false);

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  ensureAudio();
  drawing = true;
  const { r, c } = cellAt(e.touches[0]);
  drawValue = grid[r][c] ? 0 : 1;
  toggle(r, c, drawValue);
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!drawing) return;
  const { r, c } = cellAt(e.touches[0]);
  toggle(r, c, drawValue);
}, { passive: false });
window.addEventListener('touchend', () => drawing = false);

function cellAt(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    r: Math.floor((e.clientY - rect.top) / cellSize),
    c: Math.floor((e.clientX - rect.left) / cellSize),
  };
}

function toggle(r, c, val) {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return;
  grid[r][c] = val;
  ages[r][c] = val ? 1 : 0;
  sfx('toggle');
  draw();
}

// ── Controls ───────────────────────────────────────────────────────────────────
document.getElementById('btn-play').addEventListener('click', () => {
  running ? pause() : play();
});

document.getElementById('btn-step').addEventListener('click', () => {
  pause();
  sfx('step');
  step();
  draw();
});

document.getElementById('btn-clear').addEventListener('click', () => {
  pause();
  sfx('clear');
  grid = createGrid();
  ages = createAgeGrid();
  generation = 0;
  draw();
});

document.getElementById('btn-random').addEventListener('click', () => {
  pause();
  sfx('random');
  grid = createGrid();
  ages = createAgeGrid();
  generation = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      grid[r][c] = Math.random() < 0.3 ? 1 : 0;
      ages[r][c] = grid[r][c] ? 1 : 0;
    }
  draw();
});

document.getElementById('btn-music').addEventListener('click', () => {
  ensureAudio();
  musicMode = !musicMode;
  const btn = document.getElementById('btn-music');
  btn.textContent = musicMode ? '♫ Music On' : '♪ Music';
  btn.classList.toggle('music-on', musicMode);
  sfx(musicMode ? 'music-on' : 'music-off');
  if (!musicMode) killAllTones();
});

document.getElementById('cell-size').addEventListener('input', e => {
  cellSize = parseInt(e.target.value);
  sfxSliderVal = (cellSize - 4) / 20;
  sfx('slider');
  resize();
});

document.getElementById('speed').addEventListener('input', e => {
  sfxSliderVal = (parseInt(e.target.value) - 1) / 29;
  sfx('slider');
});

// ── Patterns ───────────────────────────────────────────────────────────────────
const PATTERNS = {
  glider: [[0,1],[1,2],[2,0],[2,1],[2,2]],
  lwss: [[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,4],[3,0],[3,3]],
  pulsar: [
    [0,2],[0,3],[0,4],[0,8],[0,9],[0,10],
    [2,0],[2,5],[2,7],[2,12],[3,0],[3,5],[3,7],[3,12],
    [4,0],[4,5],[4,7],[4,12],[5,2],[5,3],[5,4],[5,8],[5,9],[5,10],
    [7,2],[7,3],[7,4],[7,8],[7,9],[7,10],
    [8,0],[8,5],[8,7],[8,12],[9,0],[9,5],[9,7],[9,12],
    [10,0],[10,5],[10,7],[10,12],[12,2],[12,3],[12,4],[12,8],[12,9],[12,10],
  ],
  'r-pentomino': [[0,1],[0,2],[1,0],[1,1],[2,1]],
  gosper: [
    [0,24],[1,22],[1,24],
    [2,12],[2,13],[2,20],[2,21],[2,34],[2,35],
    [3,11],[3,15],[3,20],[3,21],[3,34],[3,35],
    [4,0],[4,1],[4,10],[4,16],[4,20],[4,21],
    [5,0],[5,1],[5,10],[5,14],[5,16],[5,17],[5,22],[5,24],
    [6,10],[6,16],[6,24],[7,11],[7,15],[8,12],[8,13],
  ],
  'glider-fleet': [
    [0,1],[1,2],[2,0],[2,1],[2,2],
    [0,11],[1,12],[2,10],[2,11],[2,12],
    [0,21],[1,22],[2,20],[2,21],[2,22],
    [6,1],[7,2],[8,0],[8,1],[8,2],
    [6,11],[7,12],[8,10],[8,11],[8,12],
  ],
};

document.getElementById('pattern').addEventListener('change', e => {
  const key = e.target.value;
  if (!key) return;
  sfx('click');
  e.target.value = '';
  const cells = PATTERNS[key];
  const maxR = Math.max(...cells.map(c => c[0]));
  const maxC = Math.max(...cells.map(c => c[1]));
  const or = Math.floor(rows / 2) - Math.floor(maxR / 2);
  const oc = Math.floor(cols / 2) - Math.floor(maxC / 2);
  for (const [dr, dc] of cells) {
    const r = or + dr, c = oc + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = 1;
      ages[r][c] = 1;
    }
  }
  draw();
});

// ── Keyboard ───────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); running ? pause() : play(); }
  if (e.code === 'ArrowRight') { pause(); sfx('step'); step(); draw(); }
  if (e.code === 'KeyM') { document.getElementById('btn-music').click(); }
  if (e.code === 'KeyC') { document.getElementById('btn-clear').click(); }
  if (e.code === 'KeyR') { document.getElementById('btn-random').click(); }
});

// ── Init ───────────────────────────────────────────────────────────────────────
window.addEventListener('resize', resize);
resize();
