export function createBeanAssets(THREE: typeof import('three')) {
  const geometry = new THREE.SphereGeometry(1, 40, 28);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const seam = Math.sin(y * 3.3) * .065;
    const dent = z > 0 ? Math.exp(-Math.pow((x - seam) / .115, 2)) * .25 * Math.pow(Math.max(0, 1 - y * y), .6) : 0;
    const irregular = 1 + .006 * Math.sin(y * 13 + x * 8) * Math.sin(z * 11);
    positions.setXYZ(i, x * (.72 + .045 * Math.sin(y * 3)) * irregular, y * 1.04, (z * .50 - dent) * irregular);
  }
  geometry.computeVertexNormals();
  const seamPoints = Array.from({ length: 24 }, (_, i) => {
    const y = -.89 + i / 23 * 1.78;
    return new THREE.Vector3(Math.sin(y * 3.3) * .046, y * 1.04, Math.sqrt(1 - y * y) * .50 - .25 * Math.pow(1 - y * y, .6) + .002);
  });
  const crease = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints), 32, .012, 6, false);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(256, 256);
  let seed = 17;
  for(let i=0;i<pixels.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const tone=110+(seed%42);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=tone;pixels.data[i+3]=255;}
  context.putImageData(pixels,0,0);
  const bump = new THREE.CanvasTexture(canvas);
  const materials = ['#29160e','#351c10','#24120b','#402316'].map(color => new THREE.MeshPhysicalMaterial({color,roughness:.7,metalness:0,bumpMap:bump,bumpScale:.005,clearcoat:.12,clearcoatRoughness:.55}));
  const creaseMaterial = new THREE.MeshStandardMaterial({color:'#211209',roughness:.95});
  return {geometry,crease,materials,creaseMaterial};
}
