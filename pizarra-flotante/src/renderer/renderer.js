const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const badge = document.getElementById('badge');

const COLORS = ['#ff3b30', '#ffcc00', '#34c759', '#0a84ff', '#ffffff', '#000000'];
let colorIdx = 0;
let size = 4;

const strokes = [];   // [{ color, size, points: [{x,y}] }]
let current = null;
let drawingMode = true;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

function styleCtx(s) {
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawStroke(s) {
  styleCtx(s);
  const p = s.points;
  if (p.length === 1) {
    ctx.beginPath();
    ctx.arc(p[0].x, p[0].y, s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2;
    const my = (p[i].y + p[i + 1].y) / 2;
    ctx.quadraticCurveTo(p[i].x, p[i].y, mx, my);
  }
  ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
  ctx.stroke();
}

function redraw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  strokes.forEach(drawStroke);
}

function flash(text) {
  badge.textContent = text;
  badge.classList.add('show');
  clearTimeout(flash.t);
  flash.t = setTimeout(() => badge.classList.remove('show'), 1200);
}

// --- Dibujo con puntero (mouse, lápiz táctil) ---
canvas.addEventListener('pointerdown', (e) => {
  if (!drawingMode || e.button !== 0) return;
  canvas.setPointerCapture(e.pointerId);
  current = { color: COLORS[colorIdx], size, points: [{ x: e.clientX, y: e.clientY }] };
  strokes.push(current);
  drawStroke(current);
});

canvas.addEventListener('pointermove', (e) => {
  if (!current) return;
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of events) current.points.push({ x: ev.clientX, y: ev.clientY });
  redraw();
});

const endStroke = () => { current = null; };
canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);

// --- Teclado (solo en modo dibujo, cuando la ventana tiene foco) ---
window.addEventListener('keydown', (e) => {
  if (!drawingMode) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    strokes.pop();
    redraw();
    return;
  }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= COLORS.length) { colorIdx = n - 1; flash(`Color ${n}`); }
  if (e.key === '+' || e.key === ']') { size = Math.min(40, size + 1); flash(`Grosor ${size}`); }
  if (e.key === '-' || e.key === '[') { size = Math.max(1, size - 1); flash(`Grosor ${size}`); }
});

// --- Mensajes desde el proceso principal ---
window.api.onMode((isDrawing) => {
  drawingMode = isDrawing;
  document.body.classList.toggle('drawing', isDrawing);
  canvas.style.cursor = isDrawing ? 'crosshair' : 'default';
  if (!isDrawing) current = null;
  flash(isDrawing ? 'Modo dibujo' : 'Pasar clics');
});

window.api.onClear(() => {
  strokes.length = 0;
  redraw();
  flash('Pizarra limpia');
});

window.addEventListener('resize', resize);
resize();
