/* ==========================================================================
   SAFVEX — 3D Hero: The Growth Line
   A literal visualisation of the brand's core promise: an ascending
   trajectory built from thousands of points, drifting in an ambient
   starfield. Mouse parallax + scroll-linked camera dolly.
   Requires THREE (global) loaded before this file.
   ========================================================================== */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(0, 0, 26);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const group = new THREE.Group();
  scene.add(group);

  /* ---------- 1. The growth line: points sampled along an ascending curve ---------- */
  const CURVE_POINTS = 900;
  const curvePositions = new Float32Array(CURVE_POINTS * 3);
  const curveColors = new Float32Array(CURVE_POINTS * 3);
  const colorA = new THREE.Color('#5ec8ff');
  const colorB = new THREE.Color('#f472b6');

  function growthY(t) {
    // Ascending trend with realistic "market" noise — never truly flat, always net-up.
    return (
      t * 13 - 6 +
      Math.sin(t * 9) * 0.9 +
      Math.sin(t * 23 + 1.4) * 0.35
    );
  }

  for (let i = 0; i < CURVE_POINTS; i++) {
    const t = i / (CURVE_POINTS - 1);
    const x = t * 30 - 15;
    const y = growthY(t);
    const z = Math.sin(t * 6.0) * 2.2 - 2;
    curvePositions[i * 3] = x;
    curvePositions[i * 3 + 1] = y * 0.42;
    curvePositions[i * 3 + 2] = z;

    const c = colorA.clone().lerp(colorB, t);
    curveColors[i * 3] = c.r;
    curveColors[i * 3 + 1] = c.g;
    curveColors[i * 3 + 2] = c.b;
  }

  const curveGeo = new THREE.BufferGeometry();
  curveGeo.setAttribute('position', new THREE.BufferAttribute(curvePositions, 3));
  curveGeo.setAttribute('color', new THREE.BufferAttribute(curveColors, 3));
  const curveMat = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const growthLine = new THREE.Points(curveGeo, curveMat);
  group.add(growthLine);

  /* ---------- 2. Ambient starfield for depth ---------- */
  const STAR_COUNT = 700;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 34;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 8;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.045,
    color: 0x8891ad,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- Interaction: parallax + scroll dolly ---------- */
  let targetRotX = 0, targetRotY = 0;
  let mouseX = 0, mouseY = 0;

  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
    targetRotY = mouseX * 0.35;
    targetRotX = -mouseY * 0.18;
  }, { passive: true });

  let scrollProgress = 0;
  function updateScroll() {
    const heroEl = document.querySelector('.hero');
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    const h = heroEl.offsetHeight;
    scrollProgress = Math.min(Math.max(-rect.top / h, 0), 1);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();

    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
    group.rotation.z = Math.sin(t * 0.08) * 0.03;

    stars.rotation.y = t * 0.006;

    // Scroll dolly: camera pushes in and slightly rises as user scrolls past hero
    camera.position.z = 26 - scrollProgress * 9;
    camera.position.y = scrollProgress * 3;
    camera.lookAt(0, 1.5, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  canvas.classList.add('is-ready');
})();
