/* Real-time 3D hero: the RZR model on a patch of basalt ground at dusk. The camera flies around it with the scroll,
   the parts drift apart mid-way ("exploded view"), the lights come on, and the visitor can spin it with a finger.
   Model: "polaris rzr xp 1000 eps high lifter" by amogusstrikesback2, CC-BY-4.0 (see models/rzr/license.txt). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export async function start({ hero, canvas, progress, touch, reduce }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .1, 200);
  scene.fog = new THREE.Fog(0x2a160b, 14, 30);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .5;

  // light of a low sun: warm key from behind (rim), cool fill from the front, soft sky
  const sun = new THREE.DirectionalLight(0xffa860, 4.6); sun.position.set(-5, 4.2, -7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -.0004; sun.shadow.radius = 6; scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc8dcff, 1.25); fill.position.set(5, 3.5, 7); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xffd9b0, 0x2a1a10, .75));
  const glow = new THREE.PointLight(0xff7a1a, 30, 16, 2); glow.position.set(0, .6, -5); scene.add(glow);

  // ground: a noisy basalt-dust disc that fades into the page
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); x.fillStyle = '#3d2c20'; x.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 16000; i++) { const r = rnd() * 4 + .5, v = 26 + rnd() * 70 | 0; x.fillStyle = `rgba(${v + 38},${v + 18},${v},${.14 + rnd() * .42})`; x.beginPath(); x.arc(rnd() * 1024, rnd() * 1024, r, 0, 6.3); x.fill(); }
    x.strokeStyle = 'rgba(20,12,8,.5)'; x.lineWidth = 16; for (const o of [300, 380, 640, 720]) { x.beginPath(); x.moveTo(o, 0); x.bezierCurveTo(o + 30, 340, o - 30, 680, o + 12, 1024); x.stroke(); }   // faint tyre tracks
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.4, 2.4); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
  const fade = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 18, 128, 128, 128); g.addColorStop(0, '#fff'); g.addColorStop(.5, '#ccc'); g.addColorStop(.86, '#222'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(13, 72), new THREE.MeshStandardMaterial({ map: tex, alphaMap: fade, transparent: true, roughness: 1, metalness: 0 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // basalt rocks scattered around the vehicle (never under it)
  { const g = new THREE.IcosahedronGeometry(1, 1), pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const k = .72 + rnd() * .5; pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * .7, pos.getZ(i) * k); } g.computeVertexNormals();
    const rocks = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0x2b2420, roughness: .95, flatShading: true }), 46), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 46; i++) { const a = rnd() * 6.283, r = 3.6 + rnd() * 6.2, s = .1 + rnd() * rnd() * .62; e.set(rnd() * 3, rnd() * 3, rnd() * 3); q.setFromEuler(e); m.compose(new THREE.Vector3(Math.cos(a) * r, s * .22, Math.sin(a) * r), q, new THREE.Vector3(s, s, s)); rocks.setMatrixAt(i, m); }
    rocks.castShadow = rocks.receiveShadow = true; scene.add(rocks); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.3, 3.335, 128), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: .5, fog: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .014; scene.add(ring);
  const ticks = new THREE.Group(); for (let i = 0; i < 72; i++) { const t = new THREE.Mesh(new THREE.PlaneGeometry(.012, i % 6 ? .07 : .17), ring.material); const a = i / 72 * 6.283; t.position.set(Math.cos(a) * 3.46, .014, Math.sin(a) * 3.46); t.rotation.set(-Math.PI / 2, 0, -a + Math.PI / 2); ticks.add(t); } scene.add(ticks);

  // the model
  const gltf = await new GLTFLoader().loadAsync('models/rzr/scene.gltf');
  const model = gltf.scene, rig = new THREE.Group(); rig.add(model); scene.add(rig);
  const glows = []; model.traverse((o) => { if (o.isMesh && /glows/.test(o.name || '')) { glows.push(o); o.visible = false; } });   // light-beam planes are not part of the body: keep them out of the measurements
  let box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(4.3 / Math.max(size.x, size.z)); model.updateMatrixWorld(true);
  // face the front toward +Z, using the wheel names (WheelF* / WheelB*)
  const wp = { F: new THREE.Vector3(), B: new THREE.Vector3() }, wheels = [];
  model.traverse((o) => { const m = /^Wheel([FB])([LR])$/.exec(o.name || ''); if (m) { wp[m[1]].add(o.getWorldPosition(new THREE.Vector3())); wheels.push(o); } });
  if (wheels.length === 4) { const f = wp.F.sub(wp.B); rig.rotation.y = -Math.atan2(f.x, f.z); }
  rig.updateMatrixWorld(true); box = new THREE.Box3().setFromObject(rig); const c = box.getCenter(new THREE.Vector3());
  rig.position.set(-c.x, -box.min.y, -c.z); rig.updateMatrixWorld(true);
  const H = box.max.y - box.min.y, L = box.max.z - box.min.z, parts = [], beams = [];
  glows.forEach((o) => o.visible = true);
  const PAINT = new THREE.Color(0xd3261c);                    // Tuscana's RZRs are red
  model.traverse((o) => { if (!o.isMesh) return; const n = o.name || '';
    if (/glows/.test(n) && /front_and_back|reverse/.test(n)) { o.visible = false; return; }     // flat beam planes look wrong from the side: the spot lights do that job
    if (/glows/.test(n)) { o.material = new THREE.MeshBasicMaterial({ map: o.material.map, color: /brakes|back/.test(n) && !/front/.test(n) ? 0xff3020 : 0xfff0d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }); beams.push(o); return; }
    o.castShadow = true; o.receiveShadow = true;
    if (/carpaint/.test(n)) { o.material = o.material.clone(); o.material.color.copy(PAINT); o.material.roughness = .38; o.material.metalness = .25; if ('clearcoat' in o.material) { o.material.clearcoat = 1; o.material.clearcoatRoughness = .18; } }
    if (/glass/.test(n)) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .28; o.material.roughness = .05; } });
  // exploded view: wheels, doors, roof and bumper drift away from the chassis
  const local = (o, world) => o.parent.worldToLocal(o.getWorldPosition(new THREE.Vector3()).add(world)).sub(o.position);
  model.traverse((o) => { const n = o.name || ''; let d = null;
    if (/^Wheel([FB])([LR])$/.test(n)) { const p = o.getWorldPosition(new THREE.Vector3()); d = new THREE.Vector3(Math.sign(p.x) * 1.25, .1, Math.sign(p.z) * .45); }
    else if (/^detach_door_L/.test(n) || /^detach_door_R/.test(n)) { const p = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); d = new THREE.Vector3(Math.sign(p.x) * 1.05, .25, 0); }
    else if (/^detach_roof/.test(n)) d = new THREE.Vector3(0, 1.15, -.1);
    else if (/^detach_bumper_F/.test(n)) d = new THREE.Vector3(0, .05, .95);
    if (d) parts.push({ o, home: o.position.clone(), dir: local(o, d) }); });
  // headlights: two real spot lights at the nose
  const lamps = [-1, 1].map((s) => { const l = new THREE.SpotLight(0xfff1d6, 0, 22, .5, .6, 1.4); l.position.set(s * .5, H * .52, L * .44); l.target.position.set(s * .9, 0, L * .5 + 7); scene.add(l, l.target); return l; });

  // camera
  const ss = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  let W = 1, Hh = 1, portrait = false, yaw = 0, vyaw = 0, drag = null, vis = true, sm = 0, lastP = 0, spin = 0;
  const resize = () => { W = canvas.clientWidth; Hh = canvas.clientHeight; portrait = Hh > W * 1.05; renderer.setSize(W, Hh, false); cam.aspect = W / Hh; cam.fov = portrait ? 38 : 28; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(hero);
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, on: false }; });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (!drag.on && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) { drag.on = true; canvas.style.cursor = 'grabbing'; } if (drag.on) { vyaw = dx * .012; yaw += vyaw; drag.x = e.clientX; drag.y = e.clientY; } }, { passive: true });
  const up = () => { drag = null; canvas.style.cursor = 'grab'; }; addEventListener('pointerup', up); addEventListener('pointercancel', up);
  canvas.style.cursor = 'grab';

  const target = new THREE.Vector3(), clock = new THREE.Clock();
  function frame() { requestAnimationFrame(frame); if (!vis) return; clock.getDelta(); const t = clock.elapsedTime, p = progress(); sm += (p - sm) * (reduce ? 1 : .085);
    if (!drag || !drag.on) { yaw += vyaw; vyaw *= .94; }
    const a = THREE.MathUtils.degToRad(34 + sm * 326) + yaw + (reduce ? 0 : Math.sin(t * .25) * .035);
    const close = ss(.2, .36, sm) * (1 - ss(.56, .7, sm));                      // moves in for the detail beat
    const R = (portrait ? 9.6 : 8.4) - close * (portrait ? 1.6 : 2.2) + ss(.84, 1, sm) * 1.6, h = 1.55 + Math.sin(sm * Math.PI) * 1.9 - close * .25;
    cam.position.set(Math.sin(a) * R, h, Math.cos(a) * R);
    target.set(0, H * .44, 0); cam.lookAt(target);
    // on a phone the copy sits on top, so the vehicle is framed in the lower part of the screen; on desktop it sits to the left of the copy
    if (portrait) cam.setViewOffset(W, Hh, 0, -Hh * (.2 - close * .05), W, Hh); else cam.setViewOffset(W, Hh, W * .17 * (1 - ss(.62, .8, sm)), -Hh * .04, W, Hh);
    const ex = ss(.3, .44, sm) * (1 - ss(.56, .68, sm)); for (const q of parts) q.o.position.copy(q.home).addScaledVector(q.dir, ex);
    spin += (sm - lastP) * 46; lastP = sm; for (const w of wheels) w.rotation.x = spin;
    rig.position.y = -box.min.y + (reduce ? 0 : Math.sin(t * 1.7) * .004);
    const on = ss(.02, .1, sm), flick = on * (.92 + Math.sin(t * 31) * .02); for (const l of lamps) l.intensity = flick * 160; for (const b of beams) b.material.opacity = on * .9;
    ring.material.opacity = .28 + .26 * Math.sin(t * 1.6) ** 2; ticks.rotation.y = -sm * 2.2 + t * .03;
    glow.intensity = 22 + Math.sin(t * 2.1) * 5;
    renderer.render(scene, cam); }
  renderer.compile(scene, cam); frame();
  canvas.classList.add('on'); hero.classList.add('gl');
  return { model };
}
