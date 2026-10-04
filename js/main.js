const slides = [...document.querySelectorAll('.slide')];
const btns = [...document.querySelectorAll('#menu button')];
const vids = [...document.querySelectorAll('video.bg')];
const wipe = document.getElementById('wipe');
const strips = [...wipe.querySelectorAll('i')];
const count = document.getElementById('count');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur = 0, busy = false;

// Faixas branca, vermelha e preta cruzando a tela
const sweep = (from, to, rev) => Promise.all(strips.map((s, i) => s.animate(
  [{ transform: `translateX(${from}%) skewX(-20deg)` }, { transform: `translateX(${to}%) skewX(-20deg)` }],
  { duration: 480, delay: (rev ? 2 - i : i) * 90, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }
).finished));

function show(n) {
  slides[cur].classList.remove('active');
  slides[n].classList.add('active');
  const s = slides[n].dataset; // fundo, cores e lado do conteúdo de cada seção
  Object.assign(document.body.dataset, { bg: s.bg, theme: s.t, side: s.side });
  vids.forEach(v => v.classList.contains('bg' + s.bg.toUpperCase()) ? v.play().catch(() => {}) : v.pause()); // só o vídeo do fundo atual toca
  btns.forEach((b, i) => b.classList.toggle('on', i === n));
  count.textContent = `${String(n + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  cur = n;
}

async function go(n) {
  n = (n + slides.length) % slides.length;
  if (busy || n === cur) return;
  busy = true;
  wipe.dataset.theme = slides[n].dataset.t; // faixas na cor da seção
  await sweep(-130, 0);
  show(n);
  await new Promise(r => setTimeout(r, 120));
  await sweep(0, 130, true);
  busy = false;
}

document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => go(+el.dataset.go));
document.getElementById('prev').onclick = () => go(cur - 1);
document.getElementById('next').onclick = () => go(cur + 1);
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') go(cur + 1);
  if (e.key === 'ArrowLeft') go(cur - 1);
});

// Parallax suave do fundo com o mouse
addEventListener('pointermove', e => {
  if (still) return;
  const x = (e.clientX / innerWidth - .5) * -24, y = (e.clientY / innerHeight - .5) * -14;
  document.querySelectorAll('.bg').forEach(b => b.style.translate = `${x}px ${y}px`);
});
