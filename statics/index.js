// custom cursor
/*
const cur = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px';
  cur.style.top = (e.clientY - 9) + 'px';
});
document.addEventListener('mouseleave', () => cur.style.opacity = '0');
document.addEventListener('mouseenter', () => cur.style.opacity = '1'); */

// typewriter
const lines = [
  'a software developer.',
  'a digital artist.',
  'a musician.',
  'a video game enthusiast.',
];
let li = 0, ci = 0, deleting = false;
const el = document.getElementById('typed-text');

function type() {
  const line = lines[li];
  if (!deleting) {
    el.textContent = line.slice(0, ++ci);
    if (ci === line.length) {
      deleting = true;
      setTimeout(type, 800);
      return;
    }
    setTimeout(type, 48);
  } else {
    el.textContent = line.slice(0, --ci);
    if (ci === 0) {
      deleting = false;
      li = (li + 1) % lines.length;
      setTimeout(type, 200);
      return;
    }
    setTimeout(type, 22);
  }
}
setTimeout(type, 800);