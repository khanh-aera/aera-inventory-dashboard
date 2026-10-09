/* AERA FLORIA — technical assembly / explode animation.

   Display mode is copied from the product website (floria.html): Three.js with
   a 3-band toon gradient + per-mesh EdgesGeometry line overlay, ACESFilmic tone
   mapping, sRGB output, and the same key/rim/hemisphere lighting rig. Only the
   explode behaviour and the per-part technical colours are new.

   Geometry ships meshopt-compressed at FULL topology (1,410,324 tris, 42% of the
   3.36M source). Meshopt is a codec, not a simplifier — the earlier build cut
   10x via decimation and Khanh correctly reported it as broken.
*/
import * as THREE from './vendor/three/build/three.module.js';
import { GLTFLoader } from './vendor/three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/three/addons/libs/meshopt_decoder.module.js';

const META = window.AERA_PARTS || { parts: [] };
const BY_NAME = {};
META.parts.forEach((p) => { BY_NAME[p.name] = p; });

const stage = document.getElementById('gl');
const loadEl = document.getElementById('load');

function fail(msg) {
  loadEl.classList.remove('gone');
  loadEl.innerHTML = '<div class="lt" style="color:#E5484D">Không tải được mô hình</div>' +
                     '<div class="lp">' + msg + '</div>';
}

// ---------- renderer (same settings as the product site) ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: true, preserveDrawingBuffer: true,
  });
} catch (e) {
  fail('WebGL không khả dụng: ' + e.message);
  throw e;
}
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
stage.appendChild(renderer.domElement);

// ---------- scene / lights (product-site rig) ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
camera.position.set(0, 2.4, 9.6);

scene.add(new THREE.AmbientLight(0xffffff, 0.38));
scene.add(new THREE.HemisphereLight(0xfff4e6, 0xdddddd, 0.5));
const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
key.position.set(4, 6, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xffcc80, 1.0);
rim.position.set(-3, 1.5, -5);
scene.add(rim);

// 3-band toon gradient — the "blueprint" look locked on the product site
const gradCanvas = document.createElement('canvas');
gradCanvas.width = 3; gradCanvas.height = 1;
{
  const g = gradCanvas.getContext('2d');
  g.fillStyle = '#1a2553'; g.fillRect(0, 0, 1, 1);
  g.fillStyle = '#5b7ad8'; g.fillRect(1, 0, 1, 1);
  g.fillStyle = '#ffffff'; g.fillRect(2, 0, 1, 1);
}
const gradTex = new THREE.CanvasTexture(gradCanvas);
gradTex.minFilter = THREE.NearestFilter;
gradTex.magFilter = THREE.NearestFilter;
gradTex.generateMipmaps = false;

const edgeMat = new THREE.LineBasicMaterial({
  color: 0x8FB4FF, transparent: true, opacity: 0.9,
});

function matFor(hex, ghost) {
  return new THREE.MeshToonMaterial({
    color: new THREE.Color(hex),
    gradientMap: gradTex,
    side: THREE.DoubleSide,
    transparent: ghost,
    opacity: ghost ? 0.26 : 1.0,
    depthWrite: !ghost,
  });
}

// ---------- state ----------
const root = new THREE.Group();
scene.add(root);
const parts = [];
let H = 3.3;
const FIT = 0.85;                 // fraction of frame height the model fills
let t = 0, playing = true, dir = 1, speed = 1, spin = false, spinPhase = 0;
const visible = {};

// ---------- explode ----------
/* Offsets come from a collision-free stack solver baked into anim_parts.js
   ('travel'), NOT from a uniform rank ladder: the parts genuinely interpenetrate
   in the source (their heights sum to 2.2x the assembled height), so equal steps
   cannot separate them. `travel` is in the same normalised world units the
   renderer uses, so it can be added straight to position.y. */
function offsetFor(meta, e) { return e * meta.travel; }

// Bounds of the whole assembly at explode level e — used to fit the camera.
function frameHeight(e) {
  let lo = Infinity, hi = -Infinity;
  META.parts.forEach((p) => {
    const y = p.y + offsetFor(p, e);
    lo = Math.min(lo, y - p.h / 2);
    hi = Math.max(hi, y + p.h / 2);
  });
  return Math.max(H, hi - lo);
}
function frameCentreY(e) {
  let lo = Infinity, hi = -Infinity;
  META.parts.forEach((p) => {
    const y = p.y + offsetFor(p, e);
    lo = Math.min(lo, y - p.h / 2);
    hi = Math.max(hi, y + p.h / 2);
  });
  return (lo + hi) / 2;
}

// ---------- load ----------
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

loader.load('./floria_anim_opt.glb', (gltf) => {
  const meshes = [];
  gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
  if (!meshes.length) { fail('GLB không có mesh nào.'); return; }

  gltf.scene.updateMatrixWorld(true);

  // Normalise the assembly to ~3.3 units tall — the product site's framing
  // target — and centre it on the origin. Every number in anim_parts.js is
  // expressed in this same normalised space, so explode offsets line up.
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z) || 1;
  const s = 3.3 / span;
  const c = box.getCenter(new THREE.Vector3());

  let tris = 0;
  meshes.forEach((mesh) => {
    const meta = BY_NAME[mesh.name] || null;
    const ghost = meta ? !!meta.ghost : false;

    // bake the normalisation + centring into the mesh so the part is already
    // in final world space and only the explode offset has to be applied
    mesh.scale.setScalar(s);
    mesh.position.set(-c.x * s, -c.y * s, -c.z * s);
    mesh.updateMatrix();
    mesh.material = matFor(meta ? meta.color : '#8A8F98', ghost);

    const pos = mesh.geometry.getAttribute('position');
    tris += (mesh.geometry.index ? mesh.geometry.index.count : pos.count) / 3;

    // Edge overlay like the product site (40° threshold). Skipped on the very
    // heavy meshes: EdgesGeometry on 600k+ verts stalls the main thread.
    if (pos.count > 0 && pos.count < 450000) {
      try {
        mesh.add(new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry, 40), edgeMat));
      } catch (e) { /* cosmetic only */ }
    }

    const holder = new THREE.Group();
    holder.add(mesh);
    holder.userData.meta = meta;
    root.add(holder);
    parts.push(holder);
    if (meta) visible[meta.name] = true;
  });

  root.updateMatrixWorld(true);
  H = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y || 3.3;

  document.getElementById('chipTris').innerHTML =
    'Tam giác: <b>' + Math.round(tris).toLocaleString('en-US') + '</b>';
  buildLegend();
  loadEl.classList.add('gone');
  syncPlayBtn();
  animate();
}, undefined, (err) => {
  fail((err && err.message) || 'không tải được file .glb');
});

// ---------- UI ----------
const scrub = document.getElementById('scrub');
const pct = document.getElementById('pct');
const legend = document.getElementById('legend');

scrub.addEventListener('input', () => {
  t = scrub.value / 1000; playing = false; syncPlayBtn();
});
document.getElementById('play').addEventListener('click', () => {
  if (!playing && t >= 1) t = 0;
  playing = !playing; if (playing) dir = 1; syncPlayBtn();
});
document.getElementById('rev').addEventListener('click', () => {
  if (!playing && t <= 0) t = 1;
  playing = !playing; if (playing) dir = -1; syncPlayBtn();
});
document.getElementById('reset').addEventListener('click', () => {
  t = 0; playing = false; syncPlayBtn();
});
const autoBtn = document.getElementById('auto');
autoBtn.addEventListener('click', () => {
  spin = !spin;
  autoBtn.setAttribute('aria-pressed', spin ? 'true' : 'false');
  autoBtn.classList.toggle('on', spin);
});
document.querySelectorAll('.sp').forEach((b) => {
  b.addEventListener('click', () => {
    speed = parseFloat(b.dataset.s);
    document.querySelectorAll('.sp').forEach((o) => o.classList.remove('on'));
    b.classList.add('on');
  });
});
function syncPlayBtn() {
  document.getElementById('play').textContent = playing ? '⏸ Dừng' : '▶ Phát';
  document.getElementById('rev').textContent = playing && dir < 0 ? '⏸ Dừng' : '◀ Nghịch';
}

function buildLegend() {
  legend.innerHTML = '';
  [...META.parts].reverse().forEach((p) => {   // top -> base
    const row = document.createElement('div');
    row.className = 'lrow';
    row.innerHTML =
      '<span class="sw" style="background:' + p.color + ';opacity:' + (p.ghost ? .45 : 1) + '"></span>' +
      '<span class="nm">' + p.label + (p.ghost ? ' <em class="gh">xuyên</em>' : '') + '</span>' +
      '<span class="tr">' + p.tris.toLocaleString('en-US') + '▲</span>' +
      '<span class="eye">◉</span>';
    row.addEventListener('click', () => {
      visible[p.name] = !visible[p.name];
      row.classList.toggle('off', !visible[p.name]);
    });
    legend.appendChild(row);
  });
}

// ---------- orbit ----------
let drag = null;
const dom = renderer.domElement;
dom.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY };
  dom.setPointerCapture(e.pointerId);
});
/* Orbit rig.
   The camera is described by (yaw, pitch, radius) around a look target that is
   recomputed each frame from the CURRENT explode bounds. Keeping distance and
   aim in one place is what stops the top of the exploded stack from clipping:
   mutating camera.position directly measures distance from the world origin,
   not from the thing being framed. */
const orbit = {
  yaw: Math.PI * 0.13,
  pitch: 0.12,
  radius: 12,
  // eased toward the target so zooming/framing never snaps
  rNow: 12,
};
/* Camera distance for a given framed height.

   The model is tall and narrow, and the camera looks slightly downward, so the
   on-screen height is the world height foreshortened by the pitch AND divided
   by tan(fov/2). Solving it (rather than guessing a multiplier) is what keeps
   the assembly filling a consistent ~85% of the frame at every explode level
   without ever cropping the ends. */
function distForHeight(h) {
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const foreshorten = Math.max(0.35, Math.cos(orbit.pitch));
  return (h * foreshorten) / (2 * Math.tan(vfov / 2) * FIT);
}
function applyCamera(fh, fcy, k) {
  orbit.radius = Math.max(2.5, distForHeight(fh));
  orbit.rNow += (orbit.radius - orbit.rNow) * k;
  // aim at the true centre of the current bounds
  const ty = fcy;
  const horiz = orbit.rNow * Math.cos(orbit.pitch);
  camera.position.set(
    horiz * Math.sin(orbit.yaw),
    ty + orbit.rNow * Math.sin(orbit.pitch),
    horiz * Math.cos(orbit.yaw),
  );
  camera.userData.look = camera.userData.look || new THREE.Vector3();
  camera.userData.look.set(0, ty, 0);
  camera.lookAt(camera.userData.look);
}
const MINP = -Math.PI / 2 + 0.06, MAXP = Math.PI / 2 - 0.06;

dom.addEventListener('pointermove', (e) => {
  if (!drag) return;
  orbit.yaw   += (e.clientX - drag.x) * -0.006;
  orbit.pitch  = Math.max(MINP, Math.min(MAXP, orbit.pitch + (e.clientY - drag.y) * 0.005));
  drag.x = e.clientX; drag.y = e.clientY;
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) =>
  dom.addEventListener(ev, () => { drag = null; }));
dom.addEventListener('wheel', (e) => {
  e.preventDefault();
  orbit.rNow = Math.max(2, Math.min(60, orbit.rNow * (1 + Math.sign(e.deltaY) * 0.1)));
}, { passive: false });

// ---------- resize + loop ----------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
let frames = 0, fpsT = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());

  if (playing) {
    t += dir * dt * 0.42 * speed;
    if (t >= 1) { t = 1; playing = false; syncPlayBtn(); }
    if (t <= 0) { t = 0; playing = false; syncPlayBtn(); }
    scrub.value = Math.round(t * 1000);
    pct.textContent = Math.round(t * 100) + '%';
  }
  if (spin) spinPhase += dt * 0.25;

  const e = t * t * (3 - 2 * t);
  parts.forEach((h) => {
    const meta = h.userData.meta;
    if (!meta) return;
    h.visible = visible[meta.name] !== false;
    h.position.y = offsetFor(meta, e);
  });

  // Fit the current explode bounds and re-aim at their centre each frame.
  applyCamera(frameHeight(e), frameCentreY(e), 0.14);

  root.rotation.y = spinPhase;
  renderer.render(scene, camera);

  document.getElementById('chipState').innerHTML = 'Trạng thái: <b>' +
    (t < 0.02 ? 'Tổng hợp' : t > 0.98 ? 'Bung rời' : 'Đang bung') + '</b>';

  frames++; fpsT += dt;
  if (fpsT > 0.5) {
    const fps = Math.round(frames / fpsT); frames = 0; fpsT = 0;
    const chip = document.getElementById('chipFps');
    chip.innerHTML = 'FPS: <b>' + fps + '</b>';
    chip.classList.toggle('warn', fps < 30);
    chip.classList.toggle('err', fps < 15);
  }
}
