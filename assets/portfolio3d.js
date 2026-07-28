import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#p3dCanvas');
const stage = document.querySelector('.p3d-stage');
const panel = document.querySelector('#p3dPanel');
const panelTitle = document.querySelector('#p3dPanelTitle');
const panelText = document.querySelector('#p3dPanelText');
const panelMeta = document.querySelector('#p3dPanelMeta');
const panelLink = document.querySelector('#p3dPanelLink');
const closeBtn = document.querySelector('#p3dPanelClose');
const nodes = [...document.querySelectorAll('.p3d-node')];
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070707, 0.055);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0.1, 1.2, 7.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const world = new THREE.Group();
scene.add(world);

const ambient = new THREE.HemisphereLight(0xffffff, 0x151515, 1.8);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xffffff, 4.2);
key.position.set(3, 5, 4);
scene.add(key);
const rim = new THREE.PointLight(0xd8ff4f, 28, 12, 2);
rim.position.set(-2.5, 1.5, -1.5);
scene.add(rim);
const hot = new THREE.PointLight(0xff4f32, 18, 9, 2);
hot.position.set(2.8, -0.5, 1.8);
scene.add(hot);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(4.5, 96),
  new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.9, metalness: 0.12 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.35;
world.add(ground);

const grid = new THREE.GridHelper(12, 32, 0x303030, 0x171717);
grid.position.y = -2.32;
grid.material.opacity = 0.32;
grid.material.transparent = true;
world.add(grid);

function makeRing(radius, color, opacity = 0.25) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.008, 8, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
  );
  ring.rotation.x = Math.PI / 2;
  return ring;
}
const rings = [makeRing(1.55, 0xd8ff4f, .32), makeRing(2.25, 0xffffff, .14), makeRing(3.1, 0xff4f32, .12)];
rings[0].position.y = -1.6; rings[1].position.y = -1.9; rings[2].position.y = -2.15;
world.add(...rings);

function material(color, metalness = .45, roughness = .38) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function createFallbackAvatar() {
  const g = new THREE.Group();
  const dark = material(0x111111, .75, .25);
  const cloth = material(0x202020, .25, .72);
  const skin = material(0xc6a083, .05, .75);
  const accent = material(0xd8ff4f, .3, .35);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.66, 1.3, 8, 20), cloth);
  torso.scale.set(1, .86, .58); torso.position.y = -.1; g.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(.95, .18, .08), accent);
  chest.position.set(0, .35, .42); chest.rotation.x = -.12; g.add(chest);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .28, 18), skin); neck.position.y = .95; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.43, 32, 28), skin); head.scale.set(.9, 1.08, .88); head.position.y = 1.35; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.445, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2.05), dark); hair.scale.set(.92, .72, .9); hair.position.y = 1.56; g.add(hair);

  const limbGeo = new THREE.CapsuleGeometry(.16, 1.22, 6, 14);
  const armL = new THREE.Mesh(limbGeo, cloth); armL.rotation.z = -.18; armL.position.set(-.77, -.12, 0); g.add(armL);
  const armR = armL.clone(); armR.rotation.z = .18; armR.position.x = .77; g.add(armR);
  const legGeo = new THREE.CapsuleGeometry(.2, 1.55, 6, 14);
  const legL = new THREE.Mesh(legGeo, dark); legL.position.set(-.31, -1.62, 0); g.add(legL);
  const legR = legL.clone(); legR.position.x = .31; g.add(legR);
  const shoeGeo = new THREE.BoxGeometry(.38, .2, .72);
  const shoeL = new THREE.Mesh(shoeGeo, dark); shoeL.position.set(-.31, -2.27, .14); g.add(shoeL);
  const shoeR = shoeL.clone(); shoeR.position.x = .31; g.add(shoeR);

  g.rotation.y = -.08;
  g.userData.fallback = true;
  return g;
}

let avatar = createFallbackAvatar();
world.add(avatar);

const loader = new GLTFLoader();
loader.load('models/avatar.glb', (gltf) => {
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetHeight = 4.4;
  const scale = targetHeight / Math.max(size.y, .001);
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -2.3 - box.min.y * scale, -center.z * scale);
  world.remove(avatar);
  avatar = model;
  world.add(avatar);
}, undefined, () => {
  document.documentElement.dataset.avatar = 'fallback';
});

const dustGeo = new THREE.BufferGeometry();
const dustCount = 540;
const pos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  const r = 4 + Math.random() * 8;
  const a = Math.random() * Math.PI * 2;
  pos[i * 3] = Math.cos(a) * r;
  pos[i * 3 + 1] = -2 + Math.random() * 7;
  pos[i * 3 + 2] = Math.sin(a) * r - 1.5;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xaaaaaa, size: .016, transparent: true, opacity: .34 }));
scene.add(dust);

const camTarget = new THREE.Vector3(0, .05, 0);
const desiredPos = camera.position.clone();
const desiredLook = camTarget.clone();
let pointerX = 0, pointerY = 0;
let currentView = 'home';

const views = {
  home: { pos:[.1,1.2,7.2], look:[0,.05,0] },
  work: { pos:[2.85,.75,5.25], look:[.05,.15,0] },
  ai: { pos:[3.25,1.65,4.6], look:[0,.65,0] },
  unity: { pos:[2.45,-.25,4.9], look:[0,-.65,0] },
  about: { pos:[-2.7,1.35,4.9], look:[0,.72,0] },
  contact: { pos:[-2.45,-.45,5.2], look:[0,-.72,0] }
};

const copy = {
  work:{meta:'01 / SELECTED WORK',title:'作品与实验',text:'虚拟校史馆、空间叙事、AIGC 产品与交互原型。这里是你对外展示设计能力的主入口。',href:'#work',label:'查看项目 ↓'},
  ai:{meta:'02 / AI PRODUCT',title:'AI × Product',text:'把 AI 当作产品能力，而不是装饰：招聘智能、Agent 工作流、生成式交互与数据产品。',href:'#work',label:'查看 AI 项目 ↓'},
  unity:{meta:'03 / UNITY · XR',title:'Unity / XR',text:'从虚拟展厅到空间交互：Unity、Three.js、WebXR 与 3D 资产共同组成你的空间设计能力。',href:'#work',label:'查看 XR 项目 ↓'},
  about:{meta:'04 / ABOUT',title:'许云飞 · Leo Xu',text:'视觉传达背景，设计硕士在读。研究 AIGC、交互设计与虚拟空间，同时持续实践产品、Unity 和人才科技。',href:'#about',label:'关于我 ↓'},
  contact:{meta:'05 / CONTACT',title:'一起做点有意思的',text:'开放作品合作、产品设计、3D / XR 交互、AI 产品与人才科技相关交流。',href:'#contact',label:'建立联系 ↓'}
};

function setView(name, openPanel = true) {
  const v = views[name] || views.home;
  desiredPos.set(...v.pos);
  desiredLook.set(...v.look);
  currentView = name;
  nodes.forEach(n => n.classList.toggle('active', n.dataset.view === name));
  if (copy[name] && openPanel) {
    const c = copy[name];
    panelMeta.textContent = c.meta;
    panelTitle.textContent = c.title;
    panelText.textContent = c.text;
    panelLink.href = c.href;
    panelLink.textContent = c.label;
    panel.classList.add('open');
  } else if (name === 'home') {
    panel.classList.remove('open');
  }
}

nodes.forEach(node => node.addEventListener('click', () => setView(node.dataset.view)));
closeBtn?.addEventListener('click', () => panel.classList.remove('open'));
panelLink?.addEventListener('click', () => panel.classList.remove('open'));

stage.addEventListener('pointermove', (e) => {
  const rect = stage.getBoundingClientRect();
  pointerX = ((e.clientX - rect.left) / rect.width - .5) * 2;
  pointerY = ((e.clientY - rect.top) / rect.height - .5) * 2;
});
stage.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
stage.addEventListener('dblclick', () => setView('home', false));

function resize() {
  const rect = stage.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
}
window.addEventListener('resize', resize, { passive: true });
resize();

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  const ease = prefersReduced ? .18 : .055;
  camera.position.lerp(desiredPos, ease);
  camTarget.lerp(desiredLook, ease);
  const px = prefersReduced ? 0 : pointerX * .12;
  const py = prefersReduced ? 0 : pointerY * .08;
  camera.lookAt(camTarget.x + px, camTarget.y - py, camTarget.z);

  if (avatar?.userData?.fallback) {
    avatar.rotation.y += (pointerX * .08 - avatar.rotation.y) * .025;
    avatar.position.y = Math.sin(t * .85) * .018;
  }
  rings[0].rotation.z = t * .09;
  rings[1].rotation.z = -t * .055;
  rings[2].rotation.z = t * .03;
  dust.rotation.y = t * .012;
  rim.intensity = 24 + Math.sin(t * 1.2) * 3;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const revealEls = [...document.querySelectorAll('[data-reveal]')];
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: .12 });
revealEls.forEach(el => io.observe(el));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { panel.classList.remove('open'); setView('home', false); }
  const map = {'1':'work','2':'ai','3':'unity','4':'about','5':'contact'};
  if (map[e.key]) setView(map[e.key]);
});
