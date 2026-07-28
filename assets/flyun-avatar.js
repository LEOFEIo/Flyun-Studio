import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';

const canvas = document.getElementById('flyunAvatarCanvas');
const stage = document.querySelector('[data-avatar-stage]');

if (canvas && stage) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.35, 13.5);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (error) {
    stage.dataset.avatarFallback = 'true';
    console.warn('FLYUN avatar renderer unavailable', error);
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const environment = new THREE.HemisphereLight(0xcfe8e1, 0x0b100d, 1.8);
    scene.add(environment);

    const key = new THREE.DirectionalLight(0xf2fff4, 5.6);
    key.position.set(-4.5, 7.5, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.radius = 5;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x72e7ff, 4.1);
    rim.position.set(4.5, 3, -5);
    scene.add(rim);

    const lime = new THREE.PointLight(0xc9ff57, 24, 9, 2);
    lime.position.set(-3.2, -1.8, 3);
    scene.add(lime);

    const clay = new THREE.MeshStandardMaterial({
      color: 0x96a29b,
      roughness: 0.56,
      metalness: 0.08
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x111512,
      roughness: 0.38,
      metalness: 0.22
    });
    const accentMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9ff57,
      toneMapped: false
    });

    const root = new THREE.Group();
    root.name = 'digital-curator';
    root.rotation.y = -0.12;
    scene.add(root);

    const rig = {};
    const selectable = [];
    const baseTransforms = new Map();

    function register(object, name, parent = root, selectablePart = true) {
      const pivot = new THREE.Group();
      pivot.name = name;
      pivot.userData.partName = name;
      object.name = `${name}-visual`;
      object.userData.partName = name;
      pivot.add(object);
      parent.add(pivot);
      rig[name] = pivot;
      if (selectablePart) {
        object.traverse(child => {
          if (!child.isMesh) return;
          child.name = `${name}-mesh`;
          child.userData.partName = name;
          selectable.push(child);
        });
      }
      baseTransforms.set(name, {
        position: pivot.position.clone(),
        rotation: pivot.rotation.clone(),
        scale: pivot.scale.clone()
      });
      return pivot;
    }

    function mesh(geometry, material = clay, name = 'part') {
      const object = new THREE.Mesh(geometry, material.clone());
      object.name = name;
      object.castShadow = true;
      object.receiveShadow = true;
      return object;
    }

    function capsule(radius, length, material = clay) {
      return mesh(new THREE.CapsuleGeometry(radius, length, 6, 18), material);
    }

    function ellipsoid(radius, scale, material = clay) {
      const object = mesh(new THREE.SphereGeometry(radius, 26, 20), material);
      object.scale.set(...scale);
      return object;
    }

    function joint(radius) {
      const group = new THREE.Group();
      group.add(mesh(new THREE.SphereGeometry(radius, 20, 14), jointMaterial));
      const ring = mesh(new THREE.TorusGeometry(radius * 1.04, radius * 0.1, 7, 28), jointMaterial);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      return group;
    }

    const pelvis = register(ellipsoid(1, [0.72, 0.54, 0.48]), 'pelvis');
    pelvis.position.y = 0.15;

    const torso = register(ellipsoid(1, [1.12, 1.58, 0.58]), 'torso', pelvis);
    torso.position.y = 1.57;

    const chest = register(ellipsoid(1, [1.18, 0.54, 0.62]), 'chest-shell', torso);
    chest.position.set(0, 0.62, 0.04);

    const neck = register(capsule(0.3, 0.36, jointMaterial), 'neck', torso);
    neck.position.y = 1.55;

    const headPivot = register(new THREE.Group(), 'head-pivot', neck, false);
    headPivot.position.y = 0.53;
    const head = register(ellipsoid(1, [0.54, 0.69, 0.57]), 'head', headPivot);
    const visor = register(ellipsoid(1, [0.57, 0.7, 0.42]), 'visor', headPivot);
    visor.position.z = 0.22;

    const visorRing = mesh(new THREE.TorusGeometry(0.55, 0.025, 6, 46), accentMaterial);
    visorRing.scale.y = 1.16;
    visorRing.position.z = 0.58;
    register(visorRing, 'visor-signal', headPivot);

    function buildArm(side) {
      const suffix = side > 0 ? 'l' : 'r';
      const shoulder = register(joint(0.29), `shoulder-${suffix}`, torso);
      shoulder.position.set(side * 1.08, 0.78, 0);

      const upperPivot = register(new THREE.Group(), `upper-arm-pivot-${suffix}`, shoulder, false);
      upperPivot.rotation.z = side * -0.28;
      const upper = register(capsule(0.24, 0.92), `upper-arm-${suffix}`, upperPivot);
      upper.position.y = -0.62;

      const elbow = register(joint(0.23), `elbow-${suffix}`, upperPivot);
      elbow.position.y = -1.26;

      const forePivot = register(new THREE.Group(), `forearm-pivot-${suffix}`, elbow, false);
      forePivot.rotation.z = side * -0.08;
      const forearm = register(capsule(0.2, 0.92), `forearm-${suffix}`, forePivot);
      forearm.position.y = -0.62;

      const wrist = register(joint(0.16), `wrist-${suffix}`, forePivot);
      wrist.position.y = -1.23;
      const hand = register(ellipsoid(1, [0.2, 0.42, 0.15]), `hand-${suffix}`, wrist);
      hand.position.y = -0.39;

      return { shoulder, upperPivot, elbow, forePivot, wrist, hand };
    }

    function buildLeg(side) {
      const suffix = side > 0 ? 'l' : 'r';
      const hip = register(joint(0.31), `hip-${suffix}`, pelvis);
      hip.position.set(side * 0.47, -0.3, 0);

      const thighPivot = register(new THREE.Group(), `thigh-pivot-${suffix}`, hip, false);
      const thigh = register(capsule(0.38, 1.32), `thigh-${suffix}`, thighPivot);
      thigh.position.y = -0.9;
      thigh.scale.z = 1.08;

      const knee = register(joint(0.29), `knee-${suffix}`, thighPivot);
      knee.position.set(0, -1.78, 0.06);

      const shinPivot = register(new THREE.Group(), `shin-pivot-${suffix}`, knee, false);
      const shin = register(capsule(0.3, 1.36), `shin-${suffix}`, shinPivot);
      shin.position.y = -0.9;

      const ankle = register(joint(0.19), `ankle-${suffix}`, shinPivot);
      ankle.position.y = -1.79;
      const foot = register(mesh(new THREE.BoxGeometry(0.52, 0.42, 0.98), clay), `foot-${suffix}`, ankle);
      foot.position.set(0, -0.3, 0.23);
      foot.geometry.translate(0, 0, 0.13);

      const sole = register(mesh(new THREE.BoxGeometry(0.54, 0.035, 1.01), accentMaterial), `sole-signal-${suffix}`, foot);
      sole.position.y = -0.22;
      return { hip, thighPivot, knee, shinPivot, ankle, foot };
    }

    const leftArm = buildArm(1);
    const rightArm = buildArm(-1);
    const leftLeg = buildLeg(1);
    const rightLeg = buildLeg(-1);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3.25, 64),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.23 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4.02;
    ground.receiveShadow = true;
    scene.add(ground);

    const groundRing = new THREE.Mesh(
      new THREE.RingGeometry(2.3, 2.34, 80),
      new THREE.MeshBasicMaterial({ color: 0xc9ff57, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    groundRing.rotation.x = -Math.PI / 2;
    groundRing.position.y = -3.99;
    scene.add(groundRing);

    root.userData.sculptRuntime = {
      nodes: rig,
      meshes: Object.fromEntries(selectable.map(item => [item.name, item])),
      sockets: Object.fromEntries(Object.entries(rig).map(([name, object]) => [`${name}-socket`, object])),
      colliders: Object.fromEntries(Object.keys(rig).map(name => [name, { type: /head|joint|knee|elbow|hip/.test(name) ? 'sphere' : 'capsule' }])),
      destructionGroups: {
        head: [headPivot],
        torso: [torso],
        leftArm: [leftArm.shoulder],
        rightArm: [rightArm.shoulder],
        leftLeg: [leftLeg.hip],
        rightLeg: [rightLeg.hip]
      }
    };

    const poseTargets = {
      idle: {
        'upper-arm-pivot-l': { z: -0.28 },
        'upper-arm-pivot-r': { z: 0.28 },
        'forearm-pivot-l': { z: -0.08 },
        'forearm-pivot-r': { z: 0.08 },
        'head-pivot': { x: 0, y: 0, z: 0 }
      },
      observe: {
        'upper-arm-pivot-l': { z: -0.36, x: -0.18 },
        'upper-arm-pivot-r': { z: 0.7, x: -0.32 },
        'forearm-pivot-l': { z: -0.18 },
        'forearm-pivot-r': { z: 1.18, x: -0.12 },
        'head-pivot': { x: -0.04, y: -0.24, z: 0.03 }
      },
      build: {
        'upper-arm-pivot-l': { z: -0.72, x: -0.2 },
        'upper-arm-pivot-r': { z: 0.72, x: -0.2 },
        'forearm-pivot-l': { z: -1.06, x: -0.05 },
        'forearm-pivot-r': { z: 1.06, x: -0.05 },
        'head-pivot': { x: 0.05, y: 0, z: 0 }
      },
      signal: {
        'upper-arm-pivot-l': { z: -1.36, x: 0.1 },
        'upper-arm-pivot-r': { z: 0.34, x: -0.1 },
        'forearm-pivot-l': { z: -0.22 },
        'forearm-pivot-r': { z: 0.44 },
        'head-pivot': { x: -0.08, y: 0.18, z: 0 }
      }
    };
    let activePose = 'idle';
    let selectedPart = null;
    let targetRotation = -0.12;
    let dragging = false;
    let previousX = 0;
    const pointer = new THREE.Vector2(10, 10);
    const raycaster = new THREE.Raycaster();
    const partLabel = document.getElementById('avatarPartLabel');

    function setPose(name) {
      if (!poseTargets[name]) return;
      activePose = name;
      stage.dataset.avatarPose = name;
      document.querySelectorAll('[data-avatar-pose]').forEach(button => {
        const active = button.dataset.avatarPose === name;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    function setPointer(event) {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    }

    canvas.addEventListener('pointerdown', event => {
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
      setPointer(event);
    });
    canvas.addEventListener('pointermove', event => {
      setPointer(event);
      if (!dragging) return;
      targetRotation += (event.clientX - previousX) * 0.009;
      previousX = event.clientX;
    });
    canvas.addEventListener('pointerup', event => {
      dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectable, false)[0];
      selectedPart = hit?.object || null;
      if (partLabel) {
        partLabel.textContent = selectedPart?.userData.partName?.replaceAll('-', ' ').toUpperCase() || 'DRAG TO ROTATE';
      }
    });
    canvas.addEventListener('pointerleave', () => { dragging = false; });
    canvas.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') targetRotation -= 0.22;
      if (event.key === 'ArrowRight') targetRotation += 0.22;
      if (['1', '2', '3', '4'].includes(event.key)) {
        setPose(['idle', 'observe', 'build', 'signal'][Number(event.key) - 1]);
      }
    });
    document.querySelectorAll('[data-avatar-pose]').forEach(button => {
      button.addEventListener('click', () => setPose(button.dataset.avatarPose));
    });

    function resize() {
      const bounds = stage.getBoundingClientRect();
      const width = Math.max(320, bounds.width);
      const height = Math.max(520, bounds.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 620 ? 15.5 : 13.5;
      camera.updateProjectionMatrix();
    }

    const clock = new THREE.Clock();
    function render() {
      const elapsed = clock.getElapsedTime();
      const target = poseTargets[activePose];
      Object.entries(target).forEach(([name, rotation]) => {
        const object = rig[name];
        if (!object) return;
        for (const axis of ['x', 'y', 'z']) {
          const value = rotation[axis] ?? baseTransforms.get(name)?.rotation[axis] ?? 0;
          object.rotation[axis] = THREE.MathUtils.lerp(object.rotation[axis], value, 0.075);
        }
      });
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetRotation, 0.08);
      if (!reducedMotion) {
        root.position.y = Math.sin(elapsed * 1.4) * 0.035;
        torso.position.y = 1.57 + Math.sin(elapsed * 1.8) * 0.008;
        if (!dragging) {
          headPivot.rotation.y += (pointer.x * 0.15 - headPivot.rotation.y) * 0.04;
          headPivot.rotation.x += (-pointer.y * 0.07 - headPivot.rotation.x) * 0.04;
        }
      }
      selectable.forEach(object => {
        if (!object.material?.emissive) return;
        object.material.emissiveIntensity = object === selectedPart ? 0.85 : 0;
      });
      renderer.render(scene, camera);
      if (!reducedMotion) requestAnimationFrame(render);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();
    setPose('idle');
    render();

    window.FlyunAvatar = {
      root,
      rig,
      setPose,
      rotateTo(value) { targetRotation = value; },
      get pose() { return activePose; }
    };
    stage.dataset.avatarReady = 'true';
  }
}
