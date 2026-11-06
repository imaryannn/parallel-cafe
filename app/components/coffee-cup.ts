/** A reusable product model. All moving parts remain in the cup's local space. */
export function createCoffeeCup(THREE: typeof import('three')) {
  const cup = new THREE.Group();
  cup.name = 'Parallel takeaway cup';
  const textures: InstanceType<typeof THREE.Texture>[] = [];
  // A repeatable, very fine grain keeps the paper tactile without sparkling.
  let seed = 91;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const label = document.createElement('canvas');
  label.width = 2048; label.height = 1024;
  const ctx = label.getContext('2d')!;
  ctx.fillStyle = '#082e1c'; ctx.fillRect(0, 0, label.width, label.height);
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,250,219,.023)' : 'rgba(0,22,9,.024)';
    ctx.fillRect(random() * label.width, random() * label.height, .7 + random() * 1.2, .7 + random() * 1.2);
  }
  ctx.fillStyle = '#f3efd4'; ctx.textAlign = 'center';
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillText('GOOD COFFEE. BETTER COMPANY.', 1024, 167);
  ctx.save(); ctx.translate(1024, 294); ctx.transform(1, 0, -.15, 1, 0, 0);
  ctx.fillRect(-48, 0, 24, 170); ctx.fillRect(24, 0, 24, 170); ctx.restore();
  ctx.font = '700 87px Arial, sans-serif';
  ctx.fillText('PARALLEL', 1024, 611); ctx.fillText('CAFÈ', 1024, 706);
  ctx.font = '500 14px Arial, sans-serif';
  ctx.fillText('FIND YOUR LITTLE PAUSE.', 1024, 877);
  // The folded paper seam sits on the rear, away from the product lettering.
  ctx.fillStyle = 'rgba(4,31,16,.12)'; ctx.fillRect(8, 0, 7, 1024);
  ctx.fillStyle = 'rgba(241,239,207,.06)'; ctx.fillRect(15, 0, 2, 1024);
  const labelTexture = new THREE.CanvasTexture(label);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = 8; textures.push(labelTexture);

  const paper = document.createElement('canvas'); paper.width = 512; paper.height = 512;
  const paperCtx = paper.getContext('2d')!;
  const paperPixels = paperCtx.createImageData(512, 512);
  for (let i = 0; i < paperPixels.data.length; i += 4) {
    const tone = 126 + Math.round(random() * 12);
    paperPixels.data[i] = tone; paperPixels.data[i + 1] = tone; paperPixels.data[i + 2] = tone; paperPixels.data[i + 3] = 255;
  }
  paperCtx.putImageData(paperPixels, 0, 0);
  const paperTexture = new THREE.CanvasTexture(paper);
  paperTexture.wrapS = THREE.RepeatWrapping; paperTexture.wrapT = THREE.RepeatWrapping;
  paperTexture.repeat.set(3, 2); textures.push(paperTexture);

  const paperMaterial = new THREE.MeshStandardMaterial({ map: labelTexture, bumpMap: paperTexture, bumpScale: .011, roughness: .79, metalness: 0 });
  const lining = new THREE.MeshStandardMaterial({ color: '#efe3c7', roughness: .84, side: THREE.BackSide });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: '#e9ddbf', roughness: .7 });
  const polymer = new THREE.MeshPhysicalMaterial({ color: '#082b19', roughness: .39, metalness: 0, clearcoat: .24, clearcoatRoughness: .44 });
  const darkPolymer = new THREE.MeshStandardMaterial({ color: '#0c2c1c', roughness: .6 });
  const add = (geometry: import('three').BufferGeometry<import('three').NormalBufferAttributes>, material: InstanceType<typeof THREE.Material>, parent: InstanceType<typeof THREE.Group> = cup) => {
    const mesh = new THREE.Mesh(geometry, material); parent.add(mesh); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
  };
  const body = add(new THREE.CylinderGeometry(1.08, .78, 3.05, 128, 8, true), paperMaterial);
  body.rotation.y = Math.PI;
  body.name = 'Printed paper shell';
  // The two shells leave an honest paper thickness when the lid opens.
  add(new THREE.CylinderGeometry(1.046, .752, 3.018, 128, 1, true), lining).position.y = .004;
  const bottom = add(new THREE.CylinderGeometry(.78, .755, .052, 96), paperMaterial);
  bottom.position.y = -1.498;
  const insideFloor = add(new THREE.CircleGeometry(.752, 96), rimMaterial);
  insideFloor.rotation.x = -Math.PI / 2; insideFloor.position.y = -1.465;
  const rim = add(new THREE.TorusGeometry(1.064, .036, 14, 128), rimMaterial);
  rim.rotation.x = Math.PI / 2; rim.position.y = 1.524;
  const lowerSeam = add(new THREE.TorusGeometry(.779, .011, 8, 96), new THREE.MeshStandardMaterial({ color: '#163e29', roughness: .85 }));
  lowerSeam.rotation.x = Math.PI / 2; lowerSeam.position.y = -1.474;

  const lid = new THREE.Group(); lid.name = 'Moulded sipping lid'; cup.add(lid); lid.position.y = 1.55;
  const profile = [
    [1.035, -.068], [1.087, -.077], [1.122, -.06], [1.136, -.035],
    [1.137, .001], [1.12, .025], [1.084, .035], [1.08, .065],
    [1.048, .081], [1.014, .186], [.997, .222], [.97, .244],
    [.938, .256], [.899, .256], [.887, .245], [.887, .221],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(profile, 128), polymer, lid);
  const snapSeam = add(new THREE.TorusGeometry(1.124, .007, 8, 128), darkPolymer, lid);
  snapSeam.rotation.x = Math.PI / 2; snapSeam.position.y = -.018;
  const shoulder = add(new THREE.TorusGeometry(1.069, .009, 8, 128), polymer, lid);
  shoulder.rotation.x = Math.PI / 2; shoulder.position.y = .068;

  // An actual drinking opening cut into the deck, with a dark recessed well.
  const deckShape = new THREE.Shape(); deckShape.absarc(0, 0, .9, 0, Math.PI * 2, false);
  const aperture = new THREE.Path(); aperture.absellipse(0, -.674, .183, .052, 0, Math.PI * 2, true, 0);
  const vent = new THREE.Path(); vent.absarc(0, .63, .016, 0, Math.PI * 2, true);
  deckShape.holes.push(aperture, vent);
  const deck = add(new THREE.ShapeGeometry(deckShape, 64), polymer, lid);
  deck.rotation.x = -Math.PI / 2; deck.position.y = .242;
  const well = add(new THREE.CircleGeometry(.198, 48), darkPolymer, lid);
  well.rotation.x = -Math.PI / 2; well.scale.y = .34; well.position.set(0, .207, .674);
  const sipCurve = new THREE.EllipseCurve(0, 0, .196, .065, 0, Math.PI * 2, false, 0);
  const sipPoints = sipCurve.getPoints(64).map(p => new THREE.Vector3(p.x, .247, .674 + p.y));
  const sipBead = new THREE.CatmullRomCurve3(sipPoints, true);
  add(new THREE.TubeGeometry(sipBead, 64, .009, 8, true), polymer, lid);
  const deckRing = add(new THREE.TorusGeometry(.86, .006, 8, 128), polymer, lid);
  deckRing.rotation.x = Math.PI / 2; deckRing.position.y = .246;
  for (const x of [-.055, .055]) {
    const emboss = add(new THREE.BoxGeometry(.03, .003, .22), polymer, lid);
    emboss.position.set(x, .246, -.08); emboss.rotation.y = -.15;
  }

  const coffeeCanvas = document.createElement('canvas'); coffeeCanvas.width = 1024; coffeeCanvas.height = 1024;
  const coffeeCtx = coffeeCanvas.getContext('2d')!;
  const coffeeGradient = coffeeCtx.createRadialGradient(475, 470, 60, 512, 512, 512);
  coffeeGradient.addColorStop(0, '#75431e'); coffeeGradient.addColorStop(.6, '#925624');
  coffeeGradient.addColorStop(.88, '#ad763c'); coffeeGradient.addColorStop(.97, '#d5ab69'); coffeeGradient.addColorStop(1, '#91602e');
  coffeeCtx.fillStyle = coffeeGradient; coffeeCtx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1800; i++) {
    const theta = random() * Math.PI * 2; const r = Math.sqrt(random()) * 502;
    const bubble = .5 + random() * 2.5;
    coffeeCtx.fillStyle = i % 3 ? 'rgba(245,211,147,.10)' : 'rgba(83,44,16,.10)';
    coffeeCtx.beginPath(); coffeeCtx.arc(512 + Math.cos(theta) * r, 512 + Math.sin(theta) * r, bubble, 0, Math.PI * 2); coffeeCtx.fill();
  }
  const coffeeTexture = new THREE.CanvasTexture(coffeeCanvas); coffeeTexture.colorSpace = THREE.SRGBColorSpace; textures.push(coffeeTexture);
  const coffeeMaterial = new THREE.MeshPhysicalMaterial({ map: coffeeTexture, roughness: .44, metalness: 0, clearcoat: .18, clearcoatRoughness: .35, envMapIntensity:.3 });
  const surface = add(new THREE.CircleGeometry(1.034, 128), coffeeMaterial);
  surface.name = 'Coffee and crema surface'; surface.rotation.x = -Math.PI / 2; surface.position.y = 1.435;
  const crema = new THREE.Group(); crema.name = 'Fine crema at the paper edge'; cup.add(crema); crema.position.y = 1.441;
  const cremaMaterial = new THREE.MeshStandardMaterial({ color: '#d2aa6c', roughness: .48, transparent: true, opacity: .68 });
  const cremaEdge = add(new THREE.TorusGeometry(1.018, .008, 6, 128), cremaMaterial, crema);
  cremaEdge.rotation.x = Math.PI / 2;

  // Soft-edged milk on the coffee surface: nested tulip lobes, a heart and a fine draw-through.
  const latteArt = new THREE.Group(); latteArt.name = 'Poured tulip latte art'; cup.add(latteArt);
  latteArt.position.y = 1.447; latteArt.visible = false;
  const artCanvas = document.createElement('canvas'); artCanvas.width = artCanvas.height = 1024;
  const art = artCanvas.getContext('2d')!;
  art.translate(512, 512); art.rotate(-.16);
  art.shadowColor = '#f8e8cc'; art.shadowBlur = 2;
  const lobe = (y: number, w: number, h: number, color: string) => {
    art.fillStyle = color; art.beginPath(); art.moveTo(0, y+h*.6);
    art.bezierCurveTo(-w*.2,y+h*.25,-w,y+h*.05,-w,y-h*.3);
    art.bezierCurveTo(-w,y-h*.86,-w*.35,y-h*.87,0,y-h*.36);
    art.bezierCurveTo(w*.35,y-h*.87,w,y-h*.86,w,y-h*.3);
    art.bezierCurveTo(w,y+h*.05,w*.2,y+h*.25,0,y+h*.6); art.fill();
  };
  // Three rounded tulip hearts flow into one another, with coffee-coloured folds.
  lobe(132,260,166,'#f4e1bf');
  lobe(106,218,125,'#925624');
  lobe(12,206,166,'#f7e7cb');
  lobe(-10,164,115,'#925624');
  lobe(-120,143,170,'#fcf0d7');
  art.shadowBlur=1;art.strokeStyle='#f9e8ca';art.lineCap='round';art.lineWidth=10;
  art.beginPath();art.moveTo(0,-215);art.bezierCurveTo(-8,-50,10,155,0,275);art.stroke();
  const artTexture=new THREE.CanvasTexture(artCanvas);artTexture.colorSpace=THREE.SRGBColorSpace;textures.push(artTexture);
  const artMaterial=new THREE.MeshStandardMaterial({map:artTexture,transparent:true,opacity:1,depthWrite:false,roughness:.35,polygonOffset:true,polygonOffsetFactor:-1});
  const artSurface=add(new THREE.PlaneGeometry(2.5,2.5),artMaterial,latteArt);
  artSurface.rotation.x=-Math.PI/2;artSurface.castShadow=false;artSurface.receiveShadow=false;
  return { cup, lid, surface, crema, latteArt, textures };
}
