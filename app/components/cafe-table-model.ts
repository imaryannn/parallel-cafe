import type { BufferGeometry, Group, Material, NormalBufferAttributes } from 'three';

/** A café table for two. Top surface y=0; camera-facing side is +Z. */
export function createCafeTable(THREE: typeof import('three')) {
  const table = new THREE.Group();
  table.name = 'A little table for two';
  const textures: InstanceType<typeof THREE.Texture>[] = [];
  let seed = 2369;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d')!);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8; textures.push(texture); return texture;
  }
  function mesh(parent: Group, geometry: BufferGeometry<NormalBufferAttributes>, material: Material, x=0,y=0,z=0) {
    const object=new THREE.Mesh(geometry,material); object.position.set(x,y,z);
    object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function lathe(parent: Group, points: number[][], material: Material, x=0,y=0,z=0,segments=96) {
    return mesh(parent,new THREE.LatheGeometry(points.map(([r,h])=>new THREE.Vector2(r,h)),segments),material,x,y,z);
  }

  // Long, gently wandering grain with pores and restrained tonal variation.
  const walnut = canvasTexture(2048,2048,context=>{
    const base=context.createLinearGradient(0,0,2048,2048);
    base.addColorStop(0,'#a8784e');base.addColorStop(.42,'#94633e');base.addColorStop(1,'#ad7e51');
    context.fillStyle=base;context.fillRect(0,0,2048,2048);
    for(let row=0;row<1350;row++){
      const y=row/1350*2048,phase=random()*Math.PI*2;
      const amplitude=3+random()*9;
      context.strokeStyle=row%4===0?'rgba(53,27,11,.15)':'rgba(244,196,137,.075)';
      context.lineWidth=.4+random()*1.3;context.beginPath();
      for(let x=0;x<=2048;x+=24){
        const bend=Math.sin(x*.003+phase)*amplitude+Math.sin(x*.009+phase)*2.5;
        const yy=y+bend+Math.exp(-Math.pow((x-690)/260,2))*Math.sin((y-1100)/180)*13;
        if(x===0)context.moveTo(x,yy);else context.lineTo(x,yy);
      }
      context.stroke();
    }
    for(let i=0;i<16000;i++){
      context.fillStyle=i%2?'rgba(39,22,9,.10)':'rgba(255,222,174,.07)';
      context.fillRect(random()*2048,random()*2048,2+random()*12,.35+random()*.65);
    }
  });
  const wood = new THREE.MeshStandardMaterial({map:walnut,bumpMap:walnut,bumpScale:.009,roughness:.57,metalness:0});
  const woodEdge=new THREE.MeshStandardMaterial({color:'#795132',roughness:.55,bumpMap:walnut,bumpScale:.005});
  // A soft routed edge gives the tabletop thickness without a sharp cylinder seam.
  lathe(table,[[0,-.16],[2.13,-.16],[2.2,-.145],[2.24,-.11],[2.25,-.055],[2.245,-.025],[2.23,-.008],[0,-.008]],woodEdge,0,0,0,160);
  const top=mesh(table,new THREE.CircleGeometry(2.232,160),wood,0,-.004,0);
  top.rotation.x=-Math.PI/2;top.rotation.z=.12;
  const underLip=lathe(table,[[2.12,-.17],[2.18,-.17],[2.18,-.14],[2.12,-.14]],woodEdge,0,0,0,128);
  underLip.name='Routed walnut edge';
  const powderCoat=new THREE.MeshStandardMaterial({color:'#173b2a',roughness:.55,metalness:.3});
  lathe(table,[[0,-1.6],[.72,-1.6],[.82,-1.57],[.84,-1.53],[.81,-1.48],[.66,-1.44],[.22,-1.37],[.135,-1.26],[.115,-.29],[.18,-.23],[.38,-.19],[0,-.19]],powderCoat,0,0,0,96);
  const footRing=mesh(table,new THREE.TorusGeometry(.78,.016,10,96),new THREE.MeshStandardMaterial({color:'#0d261b',roughness:.8}),0,-1.59,0);footRing.rotation.x=Math.PI/2;

  const ceramicNoise=canvasTexture(256,256,context=>{
    context.fillStyle='#bcbcbc';context.fillRect(0,0,256,256);
    for(let i=0;i<6000;i++){const tone=170+Math.floor(random()*45);context.fillStyle=`rgb(${tone},${tone},${tone})`;context.fillRect(random()*256,random()*256,.6,.6);}
  });
  ceramicNoise.colorSpace=THREE.NoColorSpace;
  const forestGlaze=new THREE.MeshPhysicalMaterial({color:'#123d28',roughness:.31,clearcoat:.38,clearcoatRoughness:.3,bumpMap:ceramicNoise,bumpScale:.0014});
  const ivoryGlaze=new THREE.MeshPhysicalMaterial({color:'#ede1c7',roughness:.3,clearcoat:.35,clearcoatRoughness:.28,bumpMap:ceramicNoise,bumpScale:.0014});
  const creamPrint=new THREE.MeshStandardMaterial({color:'#e8dfbf',roughness:.52});
  const greenPrint=new THREE.MeshStandardMaterial({color:'#234a33',roughness:.52});
  const steel=new THREE.MeshStandardMaterial({color:'#e1e1d5',metalness:1,roughness:.23});

  function coffeeTexture(variant: number) {
    return canvasTexture(1024,1024,context=>{
      const crema=context.createRadialGradient(485,470,30,512,512,512);
      crema.addColorStop(0,'#9a612e');crema.addColorStop(.67,'#ad753a');crema.addColorStop(.91,'#c3904b');crema.addColorStop(.98,'#cfaa70');crema.addColorStop(1,'#9c6b38');
      context.fillStyle=crema;context.fillRect(0,0,1024,1024);
      for(let i=0;i<1700;i++){
        const angle=random()*Math.PI*2,r=Math.sqrt(random())*508;
        context.fillStyle=i%3?'rgba(246,214,162,.12)':'rgba(75,36,12,.07)';
        context.beginPath();context.arc(512+Math.cos(angle)*r,512+Math.sin(angle)*r,.6+random()*1.9,0,Math.PI*2);context.fill();
      }
      context.save();context.translate(512,512);context.rotate(variant?.45:-.2);
      context.shadowColor='#f8e6c5';context.shadowBlur=2;
      const heart=(y:number,w:number,h:number,color:string)=>{
        context.fillStyle=color;context.beginPath();context.moveTo(0,y+h*.64);
        context.bezierCurveTo(-w*.24,y+h*.25,-w,y+h*.05,-w,y-h*.3);
        context.bezierCurveTo(-w,y-h*.85,-w*.35,y-h*.84,0,y-h*.35);
        context.bezierCurveTo(w*.35,y-h*.84,w,y-h*.85,w,y-h*.3);
        context.bezierCurveTo(w,y+h*.05,w*.24,y+h*.25,0,y+h*.64);context.fill();
      };
      if(variant){
        heart(5,240,260,'#f6e7cb');
        context.strokeStyle='#f9edda';context.lineWidth=9;context.lineCap='round';context.beginPath();context.moveTo(0,-84);context.quadraticCurveTo(8,138,-8,244);context.stroke();
      }else{
        heart(132,257,166,'#f5e3c2');heart(108,216,124,'#a96f35');
        heart(8,201,166,'#f9e9ce');heart(-16,159,115,'#a96f35');heart(-126,137,166,'#fcf0d8');
        context.strokeStyle='#fbefda';context.lineWidth=8;context.lineCap='round';context.beginPath();context.moveTo(0,-205);context.bezierCurveTo(-7,-45,8,150,0,266);context.stroke();
      }
      context.restore();
    });
  }
  const cupGeometry=new THREE.LatheGeometry([
    [0,0],[.265,0],[.305,.018],[.34,.055],[.39,.17],[.45,.40],[.483,.68],[.481,.738],
    [.473,.766],[.456,.772],[.442,.755],[.438,.70],[.405,.38],[.349,.16],[.295,.105],[0,.105],
  ].map(([r,y])=>new THREE.Vector2(r,y)),128);
  const saucerGeometry=new THREE.LatheGeometry([
    [0,.025],[.36,.025],[.49,.032],[.63,.06],[.75,.093],[.784,.106],[.791,.12],
    [.779,.135],[.75,.138],[.62,.101],[.47,.064],[.34,.059],[.32,.069],[.29,.072],[0,.072],
  ].map(([r,y])=>new THREE.Vector2(r,y)),128);
  const handleGeometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(.445,.627,0),new THREE.Vector3(.69,.665,0),new THREE.Vector3(.81,.49,0),
    new THREE.Vector3(.75,.26,0),new THREE.Vector3(.59,.173,0),new THREE.Vector3(.367,.20,0),
  ]),64,.057,14,false);
  function teaspoon(parent:Group,position:[number,number,number],rotation:number){
    const spoon=new THREE.Group();spoon.position.set(...position);spoon.rotation.y=rotation;parent.add(spoon);
    const bowl=lathe(spoon,[[0,-.021],[.03,-.019],[.06,-.01],[.087,.007],[.092,.014],[.086,.018],[.062,.003],[.032,-.012],[0,-.015]],steel,0,0,0,64);
    bowl.scale.z=1.4;
    mesh(spoon,new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.009,.11),new THREE.Vector3(0,.014,.22),new THREE.Vector3(0,.022,.46),new THREE.Vector3(0,.023,.57)]),24,.015,10,false),steel);
    const end=mesh(spoon,new THREE.SphereGeometry(1,24,12),steel,0,.023,.57);end.scale.set(.025,.012,.058);
  }
  function cupSetting(x:number,z:number,glaze:InstanceType<typeof THREE.Material>,handleSide:number,variant:number){
    const setting=new THREE.Group();setting.name=variant?'Ivory coffee setting':'Forest coffee setting';setting.position.set(x,.003,z);table.add(setting);
    mesh(setting,saucerGeometry,glaze);
    const vessel=new THREE.Group();vessel.position.y=.071;setting.add(vessel);
    mesh(vessel,cupGeometry,glaze);
    const handle=mesh(vessel,handleGeometry,glaze);handle.scale.x=handleSide;
    const coffee=mesh(vessel,new THREE.CircleGeometry(.437,96),new THREE.MeshPhysicalMaterial({map:coffeeTexture(variant),roughness:.38,clearcoat:.16,clearcoatRoughness:.3,envMapIntensity:.4}),0,.697,0);
    coffee.rotation.x=-Math.PI/2;coffee.castShadow=false;
    const crema=mesh(vessel,new THREE.TorusGeometry(.432,.003,6,96),new THREE.MeshStandardMaterial({color:'#d9b57b',roughness:.53}),0,.699,0);crema.rotation.x=Math.PI/2;
    for(const x of [-.039,.039]){
      const mark=mesh(vessel,new THREE.BoxGeometry(.021,.15,.003),variant?greenPrint:creamPrint,x,.43,.455);
      mark.rotation.z=-.15;mark.rotation.y=x*.8;
    }
    teaspoon(setting,[handleSide>0?-.57:.54,.116,-.18],handleSide>0?-.13:.2);
    return setting;
  }
  const first=cupSetting(-.88,.32,forestGlaze,-1,0);first.rotation.y=-.12;
  const second=cupSetting(.68,-.65,ivoryGlaze,1,1);second.rotation.y=.17;

  const linenTexture=canvasTexture(512,512,context=>{
    context.fillStyle='#e7dfc7';context.fillRect(0,0,512,512);
    for(let i=0;i<512;i+=3){
      context.strokeStyle=i%2?'rgba(135,123,94,.13)':'rgba(255,255,240,.2)';context.lineWidth=.6;
      context.beginPath();context.moveTo(i,0);context.lineTo(i,512);context.stroke();
      context.beginPath();context.moveTo(0,i);context.lineTo(512,i);context.stroke();
    }
    for(let i=0;i<2200;i++){context.fillStyle='rgba(126,112,85,.06)';context.fillRect(random()*512,random()*512,.8,2);}
  });
  linenTexture.wrapS=linenTexture.wrapT=THREE.RepeatWrapping;linenTexture.repeat.set(2,2);
  const linen=new THREE.MeshStandardMaterial({map:linenTexture,bumpMap:linenTexture,bumpScale:.005,roughness:.98,side:THREE.DoubleSide});
  const cloth=new THREE.Group();cloth.position.set(.82,.016,1.13);cloth.rotation.y=.18;table.add(cloth);
  const clothGeometry=new THREE.PlaneGeometry(1.33,.87,32,24),clothVertices=clothGeometry.attributes.position;
  for(let i=0;i<clothVertices.count;i++){
    const x=clothVertices.getX(i),y=clothVertices.getY(i);
    clothVertices.setZ(i,.009*Math.sin(x*13+y*6)+.006*Math.cos(y*21)+.006*Math.sin(x*29)*Math.pow(Math.abs(y)/.435,3));
  }
  clothGeometry.computeVertexNormals();
  const lowerCloth=mesh(cloth,clothGeometry,linen,0,.008,0);lowerCloth.rotation.x=-Math.PI/2;
  const upperCloth=mesh(cloth,clothGeometry,linen,.015,.021,-.018);upperCloth.rotation.x=-Math.PI/2;upperCloth.scale.set(.96,.95,1);
  const stitched=new THREE.MeshStandardMaterial({color:'#c8bda3',roughness:1});
  const stitchGeometry=new THREE.BoxGeometry(.017,.002,.003);
  const stitches=new THREE.InstancedMesh(stitchGeometry,stitched,43),stitchPose=new THREE.Object3D();
  for(let i=0;i<43;i++){stitchPose.position.set(-.6+i*.028,.036,.391);stitchPose.updateMatrix();stitches.setMatrixAt(i,stitchPose.matrix);}
  cloth.add(stitches);

  const cardTexture=canvasTexture(1024,640,context=>{
    context.fillStyle='#f6eed7';context.fillRect(0,0,1024,640);
    context.fillStyle='#1b432c';context.save();context.translate(173,225);context.transform(1,0,-.16,1,0,0);context.fillRect(0,0,27,173);context.fillRect(76,0,27,173);context.restore();
    context.textAlign='left';context.font='700 73px Arial, sans-serif';context.fillText('PARALLEL',345,293);context.font='500 49px Arial, sans-serif';context.fillText('CAFÈ',348,360);
    context.fillStyle='#66775b';context.font='500 20px Arial, sans-serif';context.textAlign='center';context.fillText('GOOD COFFEE. BETTER COMPANY.',512,525);
  });
  const card=new THREE.Group();card.position.set(0,.048,-.035);card.rotation.y=-.08;cloth.add(card);
  mesh(card,new THREE.BoxGeometry(1.074,.007,.667),new THREE.MeshStandardMaterial({color:'#e7dcc2',roughness:.9}));
  const cardFace=mesh(card,new THREE.PlaneGeometry(1.074,.667),new THREE.MeshStandardMaterial({map:cardTexture,roughness:.86}),0,.004,0);cardFace.rotation.x=-Math.PI/2;

  table.userData = { firstCup: first, secondCup: second, tabletopRadius: 2.25, tabletopHeight: 0 };
  return {table,textures};
}
