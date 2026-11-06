/** A softly folded, matte coffee pouch with a printed paper label. */
export function createCoffeeBag(THREE: typeof import('three')) {
  const table = new THREE.Group();
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 2048;
  const c = canvas.getContext('2d')!;
  c.fillStyle='#204b32';c.fillRect(0,0,2048,2048);
  // The front occupies the first half of the cylindrical UV sheet.
  c.fillStyle='#f5efd5';c.fillRect(170,480,684,1170);
  c.fillStyle='#24442d';c.textAlign='center';
  c.font='500 28px Arial';c.fillText('YOUR DAILY PARALLEL',512,575);
  c.save();c.translate(450,680);c.transform(1,0,-.16,1,0,0);c.fillRect(0,0,30,210);c.fillRect(82,0,30,210);c.restore();
  c.font='700 100px Arial';c.fillText('PARALLEL',512,1040);c.font='500 65px Arial';c.fillText('CAFÈ',512,1120);
  c.fillRect(250,1190,524,2);c.font='400 45px Georgia';c.fillText('The everyday blend',512,1280);
  c.font='400 27px Arial';c.fillText('CHOCOLATE · CARAMEL · A LITTLE JOY',512,1360);
  c.font='500 27px Arial';c.fillText('WHOLE BEAN',512,1540);c.fillText('250 g',512,1600);
  c.fillStyle='#d6dfbf';c.font='500 32px Arial';c.fillText('GOOD COFFEE. BETTER COMPANY.',1536,1050);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.wrapS=THREE.RepeatWrapping;
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  const rings=72,segments=128;
  for(let j=0;j<=rings;j++){
    const t=j/rings,y=-1.5+t*3.1;
    const shoulder=THREE.MathUtils.smoothstep(t,.76,1);
    const w=.91+.12*Math.sin(t*Math.PI)-.13*shoulder;
    const depth=.34+.11*Math.sin(t*Math.PI)-.27*shoulder;
    for(let i=0;i<=segments;i++){
      const a=i/segments*Math.PI*2,co=Math.cos(a),si=Math.sin(a);
      const x=Math.sign(co)*Math.pow(Math.abs(co),.45)*w;
      const folds=Math.sin(a*6+t*7)*.018*Math.pow(Math.abs(co),3)*Math.sin(t*Math.PI);
      positions.push(x,y,Math.sign(si)*Math.pow(Math.abs(si),.45)*depth+folds);
      uvs.push(.5-i/segments,t);
      if(j<rings&&i<segments){const k=j*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0x204b32,roughness:.86,metalness:0,side:THREE.FrontSide});
  const body=new THREE.Mesh(geometry,material);body.castShadow=true;body.receiveShadow=false;table.add(body);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=684;labelCanvas.height=1170;
  labelCanvas.getContext('2d')!.drawImage(canvas,170,480,684,1170,0,0,684,1170);
  const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;labelTexture.anisotropy=8;
  const label=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.91),new THREE.MeshStandardMaterial({map:labelTexture,roughness:.95,polygonOffset:true,polygonOffsetFactor:-1}));
  label.position.set(0,-.12,.46);table.add(label);
  const seamMaterial=new THREE.MeshStandardMaterial({color:'#20432c',roughness:.9});
  const seal=new THREE.Mesh(new THREE.BoxGeometry(1.58,.12,.14),seamMaterial);seal.position.y=1.57;seal.castShadow=true;table.add(seal);
  for(let i=0;i<3;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(1.51,.008,.007),new THREE.MeshStandardMaterial({color:'#3d6247',roughness:.9}));line.position.set(0,1.535+i*.025,.075);table.add(line);}
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.8,.045,.64),seamMaterial);base.position.y=-1.49;table.add(base);
  const valve=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.012,40),new THREE.MeshStandardMaterial({color:'#143923',roughness:.9}));valve.rotation.x=Math.PI/2;valve.position.set(0,1.05,.274);table.add(valve);
  table.rotation.set(0,-.12,-.07);table.position.y=.04;
  return {table,textures:[texture,labelTexture]};
}
