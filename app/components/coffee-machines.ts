import type { BufferGeometry, Group, Material, Mesh, NormalBufferAttributes, Object3D } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Purpose-built café equipment. All dimensions are in scene units; the front of
 * each machine faces +Z. Named anchors live in userData for the scroll sequence.
 */
export function createCoffeeMachines(THREE: typeof import('three')) {
  type Geometry = BufferGeometry<NormalBufferAttributes>;
  const grinder = new THREE.Group();
  grinder.name = 'Parallel precision grinder';
  const espresso = new THREE.Group();
  espresso.name = 'Parallel single-group espresso machine';
  const burr = new THREE.Group();
  burr.name = 'Conical burr assembly';
  const portafilter = new THREE.Group();
  portafilter.name = '58 mm double-spout portafilter';

  const green = new THREE.MeshPhysicalMaterial({ color: '#193d2d', roughness: 0.31, metalness: 0.35, clearcoat: 0.36, clearcoatRoughness: 0.28 });
  const darkGreen = new THREE.MeshStandardMaterial({ color: '#102a20', roughness: 0.44, metalness: 0.28 });
  const greenEdge = new THREE.MeshStandardMaterial({ color: '#2b5140', roughness: 0.35, metalness: 0.52 });
  const steel = new THREE.MeshStandardMaterial({ color: '#bfc5be', metalness: 0.92, roughness: 0.23 });
  const brushed = new THREE.MeshStandardMaterial({ color: '#919c95', metalness: 0.88, roughness: 0.37 });
  const polished = new THREE.MeshPhysicalMaterial({ color: '#e7e9df', metalness: 1, roughness: 0.14, clearcoat: 0.4 });
  const blackMetal = new THREE.MeshStandardMaterial({ color: '#161b18', metalness: 0.6, roughness: 0.28 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#141914', metalness: 0.05, roughness: 0.67 });
  const black = new THREE.MeshStandardMaterial({ color: '#070e0b', roughness: 0.37, metalness: 0.2 });
  const cream = new THREE.MeshStandardMaterial({ color: '#e9e6ce', roughness: 0.43, metalness: 0.06 });
  const brass = new THREE.MeshStandardMaterial({ color: '#b7a177', metalness: 0.8, roughness: 0.27 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#c7d6cc', metalness: 0, roughness: 0.06, transmission: 0.15, envMapIntensity: .45,
    transparent: true, opacity: 0.16, thickness: 0.04, ior: 1.47,
    depthWrite: false, side: THREE.DoubleSide,
  });

  function mesh(parent: Group, geometry: Geometry, material: Material | Material[], x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function roundedGeometry(width: number, height: number, depth: number, radius = 0.06) {
    const r = Math.min(radius, width / 2 - 0.002, height / 2 - 0.002, depth / 2 - 0.002);
    const shape = new THREE.Shape();
    const w = width / 2 - r;
    const h = height / 2 - r;
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * r, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 6 });
    geometry.translate(0, 0, -depth / 2 + r);
    return geometry;
  }

  function box(parent: Group, width: number, height: number, depth: number, material: Material, x = 0, y = 0, z = 0, radius = 0.04) {
    return mesh(parent, roundedGeometry(width, height, depth, radius), material, x, y, z);
  }

  function cylinder(parent: Group, radiusTop: number, radiusBottom: number, height: number, material: Material, x = 0, y = 0, z = 0, segments = 64) {
    return mesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, x, y, z);
  }

  function ring(parent: Group, radius: number, tube: number, material: Material, x = 0, y = 0, z = 0, horizontal = true) {
    const object = mesh(parent, new THREE.TorusGeometry(radius, tube, 10, 64), material, x, y, z);
    if (horizontal) object.rotation.x = Math.PI / 2;
    return object;
  }

  function lathe(parent: Group, points: number[][], material: Material, x = 0, y = 0, z = 0, segments = 72) {
    return mesh(parent, new THREE.LatheGeometry(points.map(point => new THREE.Vector2(point[0], point[1])), segments), material, x, y, z);
  }

  function tube(parent: Group, points: number[][], radius: number, material: Material, segments = 30) {
    const path = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(point[0], point[1], point[2])));
    return mesh(parent, new THREE.TubeGeometry(path, segments, radius, 12, false), material);
  }

  function screw(parent: Group, x: number, y: number, z: number, size = 0.024) {
    const head = cylinder(parent, size, size, 0.012, steel, x, y, z, 20);
    head.rotation.x = Math.PI / 2;
    box(parent, size * 1.17, size * 0.17, 0.013, blackMetal, x, y, z + 0.007, 0.001);
  }

  function parallelBadge(parent: Group, x: number, y: number, z: number, scale = 1, material: Material = brass) {
    const badge = new THREE.Group();
    badge.position.set(x, y, z);
    badge.rotation.z = -0.14;
    for (const offset of [-0.04, 0.04]) box(badge, 0.023 * scale, 0.19 * scale, 0.009, material, offset * scale, 0, 0, 0.003);
    parent.add(badge);
    return badge;
  }

  function printedPlane(parent: Group, width: number, height: number, x: number, y: number, z: number, draw: (context: CanvasRenderingContext2D, width: number, height: number) => void) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = Math.max(128, Math.round(768 * height / width));
    const context = canvas.getContext('2d');
    if (!context) return;
    draw(context, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false });
    const plane = mesh(parent, new THREE.PlaneGeometry(width, height), material, x, y, z);
    plane.castShadow = false;
    plane.receiveShadow = false;
    return plane;
  }

  // GRINDER — a sculpted cast-metal body sits on a separate, weighted foot.
  for (const x of [-0.42, 0.42]) for (const z of [-0.39, 0.45]) cylinder(grinder, 0.095, 0.1, 0.1, rubber, x, 0.05, z, 24);
  box(grinder, 1.22, 0.16, 1.2, blackMetal, 0, 0.16, 0.02, 0.065);
  box(grinder, 1.25, 0.075, 1.23, green, 0, 0.26, 0.02, 0.03);
  box(grinder, 1.06, 1.99, 0.93, green, 0, 1.3, -0.08, 0.14);
  box(grinder, 1.03, 0.11, 0.94, greenEdge, 0, 0.36, -0.08, 0.045);
  box(grinder, 1.015, 1.75, 0.91, darkGreen, 0, 1.31, -0.085, 0.135);
  box(grinder, 1.07, 1.8, 0.93, green, 0, 1.36, -0.095, 0.12);
  // A polished lower reveal and seam make the housing read as manufactured.
  box(grinder, 1.075, 0.025, 0.93, brushed, 0, 0.465, -0.095, 0.01);
  box(grinder, 0.78, 1.47, 0.035, green, 0, 1.29, 0.385, 0.014);
  for (const x of [-0.35, 0.35]) screw(grinder, x, 0.56, 0.411, 0.018);
  for (let i = 0; i < 8; i++) {
    const vent = box(grinder, 0.38, 0.024, 0.018, black, 0, 0.81 + i * 0.068, -0.56, 0.007);
    vent.rotation.y = Math.PI;
  }
  // Side motor-cooling slots, inset into a dark, softly rounded panel.
  for (const side of [-1, 1]) {
    const panel = box(grinder, 0.025, 0.49, 0.48, darkGreen, side * 0.535, 0.89, -0.12, 0.01);
    panel.name = 'Recessed motor ventilation';
    for (let i = 0; i < 7; i++) box(grinder, 0.03, 0.017, 0.34, black, side * 0.55, 0.72 + i * 0.055, -0.12, 0.006);
  }

  // The adjustment collar is knurled all the way around, with a calibrated face.
  cylinder(grinder, 0.38, 0.43, 0.13, blackMetal, 0, 2.29, -0.08);
  cylinder(grinder, 0.385, 0.385, 0.12, brushed, 0, 2.395, -0.08);
  ring(grinder, 0.387, 0.011, polished, 0, 2.455, -0.08);
  for (let i = 0; i < 56; i++) {
    const angle = i / 56 * Math.PI * 2;
    const grip = box(grinder, 0.015, 0.075, 0.013, blackMetal, Math.sin(angle) * 0.389, 2.398, -0.08 + Math.cos(angle) * 0.389, 0.003);
    grip.rotation.y = angle;
  }
  cylinder(grinder, 0.31, 0.355, 0.055, blackMetal, 0, 2.475, -0.08);
  const adjustmentPin = cylinder(grinder, 0.035, 0.035, 0.28, polished, 0.39, 2.43, 0.23, 24);
  adjustmentPin.rotation.z = -Math.PI / 3;
  cylinder(grinder, 0.045, 0.045, 0.08, blackMetal, 0.52, 2.505, 0.23, 24).rotation.z = -Math.PI / 3;

  // A genuinely hollow acrylic hopper, with a rolled lip and rubber-sealed lid.
  const hopper = lathe(grinder, [
    [0.208, 2.46], [0.225, 2.5], [0.25, 2.59], [0.37, 2.79],
    [0.51, 3.01], [0.535, 3.1], [0.535, 3.48], [0.53, 3.5],
    [0.511, 3.5], [0.514, 3.1], [0.493, 3.02], [0.352, 2.8],
    [0.231, 2.6], [0.207, 2.51], [0.19, 2.46], [0.208, 2.46],
  ], glass, 0, 0, -0.08, 96);
  hopper.name = 'Smoked acrylic bean hopper';
  hopper.renderOrder = 3;
  ring(grinder, 0.527, 0.014, glass, 0, 3.495, -0.08);
  const hopperLid = new THREE.Group();
  hopperLid.name = 'Removable hopper lid';
  hopperLid.position.set(0, 3.56, -0.08);
  grinder.add(hopperLid);
  lathe(hopperLid, [[0.0, -0.04], [0.49, -0.04], [0.548, -0.055], [0.56, -0.03], [0.556, 0.01], [0.535, 0.025], [0.11, 0.048], [0.0, 0.048]], blackMetal);
  ring(hopperLid, 0.548, 0.009, brushed, 0, -0.02, 0);
  cylinder(hopperLid, 0.08, 0.115, 0.04, rubber, 0, 0.062, 0, 48);
  // Slide gate and marked hopper retaining screw.
  box(grinder, 0.48, 0.022, 0.28, blackMetal, 0.16, 2.56, -0.08, 0.009);
  box(grinder, 0.09, 0.07, 0.22, rubber, 0.43, 2.56, -0.08, 0.02);

  burr.position.set(0, 2.55, -0.08);
  grinder.add(burr);
  lathe(burr, [[0.0, 0], [0.185, 0], [0.17, 0.07], [0.13, 0.18], [0.06, 0.25], [0.0, 0.25]], steel);
  for (let i = 0; i < 18; i++) {
    const angle = i / 18 * Math.PI * 2;
    const blade = box(burr, 0.022, 0.17, 0.055, polished, Math.sin(angle) * 0.118, 0.09, Math.cos(angle) * 0.118, 0.006);
    blade.rotation.set(0.2, angle, 0.19);
  }
  cylinder(burr, 0.045, 0.045, 0.045, brass, 0, 0.26, 0, 6);

  // Recessed OLED dosing display, glass cover, and tactile controls.
  box(grinder, 0.54, 0.36, 0.045, blackMetal, 0, 2.03, 0.411, 0.022);
  box(grinder, 0.485, 0.295, 0.012, black, 0, 2.03, 0.439, 0.005);
  printedPlane(grinder, 0.43, 0.255, 0, 2.035, 0.448, (context, width, height) => {
    context.fillStyle = '#0a1511'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#a6b7a6'; context.textAlign = 'center';
    context.font = `500 ${height * 0.12}px Arial`; context.fillText('DOUBLE DOSE', width / 2, height * 0.21);
    context.fillStyle = '#f0f0d8'; context.font = `400 ${height * 0.46}px Arial`;
    context.fillText('18.0', width * 0.45, height * 0.7);
    context.font = `400 ${height * 0.15}px Arial`; context.fillText('g', width * 0.78, height * 0.68);
    context.strokeStyle = '#415e49'; context.lineWidth = 3; context.beginPath(); context.moveTo(width * 0.12, height * 0.84); context.lineTo(width * 0.88, height * 0.84); context.stroke();
  });
  for (const x of [-0.17, 0.17]) {
    const button = cylinder(grinder, 0.053, 0.053, 0.023, blackMetal, x, 1.785, 0.434, 36);
    button.rotation.x = Math.PI / 2;
    ring(grinder, 0.048, 0.005, steel, x, 1.785, 0.448, false);
    box(grinder, 0.028, 0.006, 0.004, cream, x, 1.785, 0.461, 0.001);
    if (x > 0) box(grinder, 0.006, 0.028, 0.004, cream, x, 1.785, 0.462, 0.001);
  }
  // The chute is a bent metal channel with an open, dark mouth.
  const chute = box(grinder, 0.325, 0.29, 0.45, brushed, 0, 1.57, 0.6, 0.04);
  chute.rotation.x = -0.22;
  box(grinder, 0.265, 0.11, 0.018, black, 0, 1.49, 0.83, 0.008).rotation.x = -0.22;
  box(grinder, 0.34, 0.026, 0.13, polished, 0, 1.423, 0.795, 0.009);
  for (const x of [-0.131, 0.131]) screw(grinder, x, 1.62, 0.83, 0.014);
  // Adjustable dosing fork and spring-loaded activation paddle.
  box(grinder, 0.12, 0.59, 0.075, blackMetal, 0, 1.03, 0.418, 0.02);
  screw(grinder, 0, 1.22, 0.463, 0.03);
  screw(grinder, 0, 0.85, 0.463, 0.024);
  for (const side of [-1, 1]) {
    tube(grinder, [[side * 0.07, 0.92, 0.46], [side * 0.18, 0.92, 0.58], [side * 0.265, 0.92, 0.82], [side * 0.25, 0.955, 0.98]], 0.033, polished);
    box(grinder, 0.09, 0.034, 0.17, rubber, side * 0.24, 0.947, 0.88, 0.012);
  }
  box(grinder, 0.075, 0.21, 0.032, steel, 0, 1.13, 0.57, 0.013).rotation.x = -0.15;
  parallelBadge(grinder, 0, 0.67, 0.423, 0.72);
  // Removable grounds tray with a perimeter lip.
  box(grinder, 0.88, 0.05, 0.67, blackMetal, 0, 0.313, 0.45, 0.02);
  box(grinder, 0.73, 0.018, 0.52, rubber, 0, 0.344, 0.46, 0.007);
  for (let index = 0; index < 7; index++) box(grinder, 0.022, 0.014, 0.43, blackMetal, -0.27 + index * 0.09, 0.36, 0.46, 0.005);

  // ESPRESSO MACHINE — a monocoque shell with folded stainless front panels.
  for (const x of [-0.88, 0.88]) for (const z of [-0.46, 0.77]) {
    cylinder(espresso, 0.13, 0.14, 0.11, rubber, x, 0.055, z, 32);
    cylinder(espresso, 0.13, 0.13, 0.085, polished, x, 0.135, z, 32);
  }
  box(espresso, 2.35, 0.17, 1.75, blackMetal, 0, 0.245, 0.17, 0.065);
  box(espresso, 2.29, 0.055, 1.71, polished, 0, 0.355, 0.17, 0.022);
  // Tall rear shell and curved shoulder line.
  box(espresso, 2.25, 2.16, 1.18, green, 0, 1.5, -0.16, 0.17);
  box(espresso, 2.27, 0.05, 1.19, greenEdge, 0, 0.52, -0.16, 0.02);
  box(espresso, 2.1, 1.1, 0.06, brushed, 0, 1.975, 0.438, 0.025);
  box(espresso, 2.13, 0.075, 0.095, polished, 0, 2.54, 0.421, 0.035);
  box(espresso, 2.13, 0.036, 0.07, polished, 0, 1.418, 0.452, 0.015);
  for (const x of [-0.97, 0.97]) {
    screw(espresso, x, 2.42, 0.48, 0.023);
    screw(espresso, x, 1.53, 0.49, 0.023);
  }
  // Side panels have a separate edge return, lower ventilation, and exposed bolts.
  for (const side of [-1, 1]) {
    box(espresso, 0.04, 1.77, 0.91, darkGreen, side * 1.113, 1.47, -0.17, 0.017);
    box(espresso, 0.035, 1.7, 0.85, green, side * 1.14, 1.5, -0.17, 0.014);
    for (let index = 0; index < 6; index++) box(espresso, 0.039, 0.022, 0.49, blackMetal, side * 1.16, 0.79 + index * 0.08, -0.19, 0.008);
  }
  // Warm cup tray, fine slots, retaining rails with machined corner posts.
  box(espresso, 2.03, 0.04, 1.0, brushed, 0, 2.601, -0.16, 0.016);
  for (let index = 0; index < 17; index++) box(espresso, 0.022, 0.006, 0.61, blackMetal, -0.8 + index * 0.1, 2.627, -0.16, 0.002);
  for (const x of [-0.98, 0.98]) {
    tube(espresso, [[x, 2.63, 0.28], [x, 2.77, 0.25], [x, 2.79, -0.54], [x, 2.63, -0.6]], 0.024, polished);
    for (const z of [-0.59, 0.27]) cylinder(espresso, 0.041, 0.041, 0.026, steel, x, 2.64, z, 24);
  }
  tube(espresso, [[-0.97, 2.77, -0.56], [0, 2.79, -0.56], [0.97, 2.77, -0.56]], 0.024, polished);

  // Boiler-pressure manometer: recessed dial, indexed ticks, and a real needle.
  const gaugeX = -0.68, gaugeY = 2.11, gaugeZ = 0.494;
  const gaugeBody = cylinder(espresso, 0.205, 0.205, 0.07, blackMetal, gaugeX, gaugeY, gaugeZ);
  gaugeBody.rotation.x = Math.PI / 2;
  const gaugeDial = cylinder(espresso, 0.168, 0.168, 0.008, cream, gaugeX, gaugeY, gaugeZ + 0.04);
  gaugeDial.rotation.x = Math.PI / 2;
  ring(espresso, 0.185, 0.018, polished, gaugeX, gaugeY, gaugeZ + 0.044, false);
  for (let index = 0; index < 25; index++) {
    const angle = (-Math.PI * 0.77) + index / 24 * Math.PI * 1.54;
    const tick = box(espresso, index % 4 === 0 ? 0.008 : 0.004, index % 4 === 0 ? 0.026 : 0.013, 0.003, blackMetal, gaugeX + Math.sin(angle) * 0.139, gaugeY + Math.cos(angle) * 0.139, gaugeZ + 0.048, 0.001);
    tick.rotation.z = -angle;
  }
  const needle = box(espresso, 0.008, 0.115, 0.005, blackMetal, gaugeX + 0.029, gaugeY + 0.038, gaugeZ + 0.056, 0.002);
  needle.rotation.z = -0.65;
  const gaugePin = cylinder(espresso, 0.014, 0.014, 0.014, brass, gaugeX, gaugeY, gaugeZ + 0.06, 20);
  gaugePin.rotation.x = Math.PI / 2;
  printedPlane(espresso, 0.14, 0.055, gaugeX, gaugeY - 0.075, gaugeZ + 0.055, (context, width, height) => {
    context.fillStyle = '#253c2e'; context.textAlign = 'center'; context.font = `500 ${height * 0.65}px Arial`;
    context.fillText('BAR', width / 2, height * 0.7);
  });

  // Subtle wordmark, temperature screen, and backlit brew key.
  parallelBadge(espresso, 0, 2.32, 0.488, 0.72, blackMetal);
  printedPlane(espresso, 0.66, 0.11, 0, 2.085, 0.482, (context, width, height) => {
    context.fillStyle = '#24352b'; context.textAlign = 'center'; context.font = `500 ${height * 0.68}px Arial`;
    context.fillText('P A R A L L E L', width / 2, height * 0.74);
  });
  box(espresso, 0.34, 0.18, 0.035, blackMetal, 0.67, 2.22, 0.48, 0.016);
  printedPlane(espresso, 0.285, 0.125, 0.67, 2.22, 0.504, (context, width, height) => {
    context.fillStyle = '#09140f'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#dce5c5'; context.textAlign = 'center'; context.font = `400 ${height * 0.73}px Arial`;
    context.fillText('93°', width / 2, height * 0.79);
  });
  const brewKey = cylinder(espresso, 0.079, 0.079, 0.047, blackMetal, 0.67, 1.91, 0.499, 40);
  brewKey.rotation.x = Math.PI / 2;
  ring(espresso, 0.078, 0.007, brass, 0.67, 1.91, 0.525, false);
  const powerLightMaterial = new THREE.MeshStandardMaterial({ color: '#c3d7a0', emissive: '#8da950', emissiveIntensity: 0.8, roughness: 0.25 });
  const powerLight = cylinder(espresso, 0.018, 0.018, 0.007, powerLightMaterial, 0.67, 1.73, 0.489, 20);
  powerLight.rotation.x = Math.PI / 2;

  // The exposed brew group: boiler flange, fins, gasket, shower screen and lugs.
  box(espresso, 0.6, 0.28, 0.52, polished, 0, 1.83, 0.65, 0.055);
  cylinder(espresso, 0.29, 0.32, 0.23, polished, 0, 1.81, 0.9);
  cylinder(espresso, 0.315, 0.315, 0.045, blackMetal, 0, 1.938, 0.9);
  cylinder(espresso, 0.27, 0.30, 0.08, brushed, 0, 1.987, 0.9);
  for (const y of [1.77, 1.82, 1.87]) ring(espresso, 0.316, 0.009, brushed, 0, y, 0.9);
  lathe(espresso, [[0.0, 1.63], [0.25, 1.63], [0.345, 1.655], [0.37, 1.69], [0.37, 1.725], [0.335, 1.744], [0.30, 1.744], [0.0, 1.744]], polished, 0, 0, 0.9);
  cylinder(espresso, 0.268, 0.268, 0.025, rubber, 0, 1.62, 0.9);
  cylinder(espresso, 0.235, 0.235, 0.016, brushed, 0, 1.604, 0.9);
  for (let index = 0; index < 20; index++) {
    const angle = index * 2.39996;
    const radius = Math.sqrt((index + 0.5) / 20) * 0.2;
    cylinder(espresso, 0.008, 0.008, 0.003, blackMetal, Math.cos(angle) * radius, 1.594, 0.9 + Math.sin(angle) * radius, 8);
  }
  for (const side of [-1, 1]) box(espresso, 0.12, 0.08, 0.24, steel, side * 0.32, 1.665, 0.9, 0.02);

  // Steam valve: scalloped rotary wheel and a continuous articulated steel wand.
  const steamKnob = new THREE.Group();
  steamKnob.position.set(0.94, 1.77, 0.58);
  steamKnob.rotation.x = Math.PI / 2;
  espresso.add(steamKnob);
  cylinder(steamKnob, 0.135, 0.135, 0.12, blackMetal, 0, 0, 0, 48);
  for (let index = 0; index < 8; index++) {
    const angle = index / 8 * Math.PI * 2;
    cylinder(steamKnob, 0.036, 0.036, 0.12, blackMetal, Math.sin(angle) * 0.117, 0, Math.cos(angle) * 0.117, 16);
  }
  cylinder(steamKnob, 0.071, 0.071, 0.128, polished, 0, 0, 0, 40);
  cylinder(espresso, 0.065, 0.065, 0.08, polished, 0.9, 1.59, 0.61, 32);
  tube(espresso, [[0.9, 1.6, 0.61], [1.04, 1.43, 0.73], [1.06, 1.12, 0.96], [0.99, 0.73, 1.15]], 0.032, polished, 42);
  tube(espresso, [[1.045, 1.37, 0.77], [1.06, 1.22, 0.89]], 0.057, rubber, 12);
  const steamTip = cylinder(espresso, 0.044, 0.048, 0.09, polished, 0.983, 0.699, 1.163, 32);
  steamTip.rotation.x = -0.4;
  ring(espresso, 0.047, 0.006, blackMetal, 0.985, 0.727, 1.153);
  for (const x of [-0.022, 0.022]) cylinder(espresso, 0.007, 0.007, 0.006, black, 0.983 + x, 0.656, 1.18, 8);

  // Hot-water tap on the opposite side, with a separate polished outlet.
  cylinder(espresso, 0.05, 0.05, 0.1, polished, -0.83, 1.53, 0.6, 32);
  tube(espresso, [[-0.83, 1.55, 0.6], [-0.88, 1.33, 0.72], [-0.87, 1.05, 0.86]], 0.028, polished);
  cylinder(espresso, 0.044, 0.044, 0.085, blackMetal, -0.87, 1.02, 0.86, 32);

  // Removable drip tray with hollow surround and longitudinal steel slats.
  box(espresso, 2.24, 0.155, 1.0, steel, 0, 0.397, 0.64, 0.055);
  box(espresso, 2.06, 0.019, 0.83, black, 0, 0.48, 0.64, 0.008);
  for (let index = 0; index < 21; index++) box(espresso, 0.041, 0.027, 0.78, polished, -0.95 + index * 0.095, 0.497, 0.64, 0.011);
  box(espresso, 2.23, 0.034, 0.055, polished, 0, 0.49, 1.108, 0.015);
  box(espresso, 0.48, 0.027, 0.007, blackMetal, 0, 0.386, 1.144, 0.003);

  // PORTAFILTER — the detachable component used throughout the choreography.
  // Its rim is the origin; a full-length handle points along +X.
  lathe(portafilter, [
    [0.0, -0.225], [0.14, -0.225], [0.235, -0.19], [0.282, -0.115],
    [0.29, -0.045], [0.325, -0.025], [0.325, 0.005], [0.31, 0.019],
    [0.282, 0.019], [0.267, 0.0], [0.252, -0.125], [0.216, -0.172],
    [0.0, -0.175],
  ], polished);
  ring(portafilter, 0.306, 0.012, steel, 0, 0.012, 0);
  ring(portafilter, 0.275, 0.005, brushed, 0, -0.045, 0);
  for (const x of [-0.323, 0.323]) box(portafilter, 0.13, 0.068, 0.145, polished, x, -0.052, 0, 0.018);
  // Basket perforations sit on the actual recessed floor, under the grounds.
  for (let index = 0; index < 46; index++) {
    const angle = index * 2.39996;
    const radius = Math.sqrt((index + 0.5) / 46) * 0.205;
    cylinder(portafilter, 0.005, 0.005, 0.002, black, Math.cos(angle) * radius, -0.173, Math.sin(angle) * radius, 7);
  }
  const handleNeck = cylinder(portafilter, 0.072, 0.087, 0.3, polished, 0.412, -0.079, 0, 40);
  handleNeck.rotation.z = -Math.PI / 2;
  const handle = lathe(portafilter, [
    [0.0, 0], [0.077, 0], [0.095, 0.04], [0.102, 0.15],
    [0.115, 0.5], [0.118, 0.65], [0.104, 0.7], [0.0, 0.712],
  ], rubber, 0.53, -0.079, 0);
  handle.rotation.z = -Math.PI / 2;
  const handleCollar = cylinder(portafilter, 0.093, 0.093, 0.05, brushed, 0.55, -0.079, 0, 48);
  handleCollar.rotation.z = -Math.PI / 2;
  const endCap = cylinder(portafilter, 0.087, 0.087, 0.012, blackMetal, 1.238, -0.079, 0, 40);
  endCap.rotation.z = -Math.PI / 2;
  // A small Y-spout delivers two espresso streams when the basket is docked.
  cylinder(portafilter, 0.09, 0.07, 0.065, polished, 0, -0.251, 0, 40);
  for (const side of [-1, 1]) {
    tube(portafilter, [[0, -0.272, 0], [side * 0.115, -0.305, 0], [side * 0.105, -0.36, 0], [side * 0.105, -0.39, 0]], 0.036, polished, 16);
    cylinder(portafilter, 0.027, 0.027, 0.003, black, side * 0.105, -0.424, 0, 24);
  }

  grinder.userData = {
    ...grinder.userData,
    hopper,
    hopperLid,
    chute: new THREE.Vector3(0, 1.43, 0.8),
    basketDock: new THREE.Vector3(0, 1.17, 0.8),
    hopperEntry: new THREE.Vector3(0, 3.5, -0.08),
    dimensions: { width: 1.25, height: 3.642, depth: 1.628 },
  };
  espresso.userData = {
    ...espresso.userData,
    basketDock: new THREE.Vector3(0, 1.593, 0.9),
    spoutLeft: new THREE.Vector3(-0.105, 1.169, 0.9),
    spoutRight: new THREE.Vector3(0.105, 1.169, 0.9),
    cupStand: new THREE.Vector3(0, 0.515, 0.9),
    dimensions: { width: 2.359, height: 2.863, depth: 2.025 },
  };
  portafilter.userData = {
    ...portafilter.userData,
    basketRadius: 0.255,
    groundsSurface: new THREE.Vector3(0, -0.025, 0),
    spoutLeft: new THREE.Vector3(-0.105, -0.424, 0),
    spoutRight: new THREE.Vector3(0.105, -0.424, 0),
  };

  // Machine details share a handful of materials. Bake their transforms and
  // batch them, so the bevels, perforations, screws and vents cost few draw calls.
  // Interactive subassemblies keep their own pivots for the hero choreography.
  function batchStaticParts(target: Group, preserve: Set<unknown> = new Set()) {
    target.updateMatrixWorld(true);
    const inverse = target.matrixWorld.clone().invert();
    const batches = new Map<Material, { geometries: Geometry[]; shadows: boolean }>();
    const originals: Mesh[] = [];
    function visit(parent: Object3D) {
      for (const object of parent.children) {
        if (preserve.has(object)) continue;
        if (object instanceof THREE.Mesh && !Array.isArray(object.material)) {
          const material = object.material as Material;
          const source = object.geometry as Geometry;
          const geometry = source.index ? source.toNonIndexed() : source.clone();
          geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
          const batch = batches.get(material) ?? { geometries: [], shadows: object.castShadow };
          batch.geometries.push(geometry);
          batches.set(material, batch);
          originals.push(object);
        } else visit(object);
      }
    }
    visit(target);
    const unused = new Set<Geometry>();
    for (const original of originals) {
      original.removeFromParent();
      unused.add(original.geometry);
    }
    for (const [material, batch] of batches) {
      const geometry = mergeGeometries(batch.geometries, false);
      if (geometry) {
        const object = mesh(target, geometry, material);
        object.name = `${target.name} / ${material.type}`;
        object.castShadow = batch.shadows;
        object.receiveShadow = batch.shadows;
      }
      for (const part of batch.geometries) part.dispose();
    }
    for (const geometry of unused) geometry.dispose();
  }
  batchStaticParts(burr);
  batchStaticParts(hopperLid);
  batchStaticParts(grinder, new Set([burr, hopperLid, hopper]));
  batchStaticParts(espresso);
  batchStaticParts(portafilter);

  return { grinder, burr, portafilter, espresso };
}
