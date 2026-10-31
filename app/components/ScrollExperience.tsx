'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import 'lenis/dist/lenis.css';

type Pose = {
  nx: number; y: number; z: number;
  rx: number; ry: number; rz: number;
  scale: number; lid: number;
};

/** A single persistent cup that travels between the page's five chapters as you scroll. */
export default function ScrollExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (() => void) | undefined;
    let generation = 0;
    const setup = async () => {
      const current = ++generation;
      dispose?.();
      dispose = undefined;
      if (media.matches) return; // The branded CSS cup in the hero stays; native scrolling for reduced motion.
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }, THREE] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'), import('lenis'), import('three'),
      ]);
      if (current !== generation || !root.current || !canvasHost.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.ticker.lagSmoothing(0);
      const wrapper = root.current;
      const host = canvasHost.current;
      wrapper.appendChild(host);
      const mobile = matchMedia('(max-width: 760px)').matches;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { return; } // The original branded CSS cup remains visible without WebGL.
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = .95;
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
      camera.position.set(0, .4, 10.7);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x153222, 2.0));
      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(-4, 5, 6); scene.add(key);
      const rimLight = new THREE.DirectionalLight(0xdce8df, 2);
      rimLight.position.set(5, 2, -3); scene.add(rimLight);
      const fill = new THREE.DirectionalLight(0xffffff, .8);
      fill.position.set(3, -2, 5); scene.add(fill);
      const cup = new THREE.Group(); scene.add(cup);
      const label = document.createElement('canvas'); label.width = 4096; label.height = 2048;
      const ctx = label.getContext('2d')!;
      ctx.fillStyle = '#174b2d'; ctx.fillRect(0, 0, 4096, 2048);
      // Fine, low-contrast paper grain; lettering respects the cup's physical UV proportions.
      for (let i = 0; i < 55000; i++) { ctx.fillStyle = i % 2 ? '#ffffff05' : '#00000005'; ctx.fillRect(Math.random() * 4096, Math.random() * 2048, 2, 2); }
      ctx.fillStyle = '#f3efcf'; ctx.textAlign = 'center';
      ctx.font = '30px Arial'; ctx.fillText('GOOD COFFEE.', 2048, 315); ctx.fillText('BETTER COMPANY.', 2048, 360);
      ctx.save(); ctx.translate(2048, 620); ctx.transform(1, 0, -.16, 1, 0, 0);
      ctx.fillRect(-84, 0, 42, 350); ctx.fillRect(42, 0, 42, 350); ctx.restore();
      ctx.font = 'bold 180px Arial'; ctx.fillText('PARALLEL', 2048, 1185); ctx.fillText('CAFÈ', 2048, 1380);
      ctx.font = '27px Arial'; ctx.fillText('FIND YOUR LITTLE PAUSE.', 2048, 1770);
      ctx.font = '28px Arial'; ctx.fillText('SIDE BY SIDE.', 180, 1080); ctx.fillText('SIDE BY SIDE.', 3916, 1080);
      const texture = new THREE.CanvasTexture(label); texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.08, .78, 3.05, 96, 1, true), new THREE.MeshStandardMaterial({ map: texture, roughness: .72 }));
      body.rotation.y = Math.PI; cup.add(body);
      const green = new THREE.MeshPhysicalMaterial({ color: '#1b4529', roughness: .48, metalness: 0, clearcoat: .22, clearcoatRoughness: .48 });
      const cream = new THREE.MeshStandardMaterial({ color: '#e4dab3', roughness: .85 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.78, .76, .09, 96), green); base.position.y = -1.52; cup.add(base);
      const rolledRim = new THREE.Mesh(new THREE.TorusGeometry(1.057, .047, 12, 96), cream); rolledRim.rotation.x = Math.PI / 2; rolledRim.position.y = 1.525; cup.add(rolledRim);
      const coffee = new THREE.Mesh(new THREE.CircleGeometry(1.035, 96), new THREE.MeshStandardMaterial({ color: '#352315', roughness: .24, metalness: .12 }));
      coffee.rotation.x = -Math.PI / 2; coffee.position.y = 1.46; cup.add(coffee);
      const lid = new THREE.Group(); lid.position.y = 1.55; cup.add(lid);
      const profile = [[1.06,-.09],[1.12,-.09],[1.17,-.06],[1.18,-.015],[1.17,.025],[1.12,.045],[1.1,.06],[1.06,.065],[1.025,.23],[1,.26],[.94,.28],[.9,.27],[.88,.22],[0,.22]].map(([x,y]) => new THREE.Vector2(x,y));
      const lidMesh = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), green); lid.add(lidMesh);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(.94,.027,10,96), green); lip.rotation.x=Math.PI/2; lip.position.y=.275; lid.add(lip);
      const sip = new THREE.Mesh(new THREE.SphereGeometry(1,24,12), new THREE.MeshStandardMaterial({color:'#102419',roughness:.9}));
      sip.scale.set(.18,.013,.06); sip.position.set(0,.228,.73); lid.add(sip);

      // A miniature coffee studio, built from real geometry rather than a video.
      const studio = new THREE.Group(); scene.add(studio); studio.visible = false;
      const metal = new THREE.MeshStandardMaterial({color:'#87968a',metalness:.72,roughness:.28});
      const darkMetal = new THREE.MeshStandardMaterial({color:'#143520',metalness:.35,roughness:.4});
      const bronze = new THREE.MeshStandardMaterial({color:'#8a502c',metalness:.15,roughness:.65});
      const grinder = new THREE.Group(); studio.add(grinder);
      function part(geometry: import('three').BufferGeometry<import('three').NormalBufferAttributes>, material: InstanceType<typeof THREE.Material>, y:number, parent=grinder) {
        const mesh=new THREE.Mesh(geometry,material); mesh.position.y=y;parent.add(mesh);return mesh;
      }
      part(new THREE.CylinderGeometry(.65,.36,.7,64,1,true),new THREE.MeshPhysicalMaterial({color:'#c9d5b0',transparent:true,opacity:.23,roughness:.15,side:THREE.DoubleSide}),2.1);
      const hopperRim=part(new THREE.TorusGeometry(.65,.025,8,64),metal,2.45);hopperRim.rotation.x=Math.PI/2;
      part(new THREE.CylinderGeometry(.48,.48,.42,64),darkMetal,1.55);
      part(new THREE.CylinderGeometry(.51,.51,.08,64),metal,1.75);
      const burr=new THREE.Group();grinder.add(burr);burr.position.y=1.62;
      for(let i=0;i<16;i++){const tooth=new THREE.Mesh(new THREE.BoxGeometry(.06,.18,.4),metal);const angle=i/16*Math.PI*2;tooth.position.set(Math.cos(angle)*.3,0,Math.sin(angle)*.3);tooth.rotation.y=-angle;burr.add(tooth);}
      part(new THREE.CylinderGeometry(.18,.12,.42,32),metal,1.15);
      const beans:InstanceType<typeof THREE.Group>[]=[];
      const beanGeometry=new THREE.SphereGeometry(1,16,12);
      for(let i=0;i<28;i++){
        const bean=new THREE.Group();const shell=new THREE.Mesh(beanGeometry,bronze);shell.scale.set(.14,.21,.1);bean.add(shell);
        const groove=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.02,-.16,.09),new THREE.Vector3(.025,0,.105),new THREE.Vector3(-.02,.16,.09)]),10,.012,5,false),new THREE.MeshStandardMaterial({color:'#382319',roughness:1}));bean.add(groove);beans.push(bean);studio.add(bean);
      }
      const grounds=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.025,0),bronze,130);studio.add(grounds);
      const dummy=new THREE.Object3D();
      const groundsBed=part(new THREE.CylinderGeometry(.48,.44,.07,48),bronze,.1,studio);
      const saucer=part(new THREE.CylinderGeometry(.66,.6,.055,64),metal,.035,studio);
      const brewer=new THREE.Group();studio.add(brewer);
      const arm=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.9,2.2,-.2),new THREE.Vector3(.85,2.6,-.2),new THREE.Vector3(.12,2.6,0),new THREE.Vector3(0,2.1,0)]),32,.085,12,false),metal);brewer.add(arm);
      part(new THREE.CylinderGeometry(.13,.13,.18,32),darkMetal,2.03,brewer);
      const liquidMaterial=new THREE.MeshPhysicalMaterial({color:'#753d1c',roughness:.18,metalness:0,clearcoat:.8});
      const stream=part(new THREE.CylinderGeometry(.037,.045,1,16),liquidMaterial,1,studio);
      const liquid=new THREE.Mesh(new THREE.CylinderGeometry(1,.98,1,64),liquidMaterial);cup.add(liquid);
      const crema=new THREE.Mesh(new THREE.TorusGeometry(.86,.012,8,64),new THREE.MeshStandardMaterial({color:'#c39860',roughness:.5}));crema.rotation.x=Math.PI/2;cup.add(crema);
      const steam:InstanceType<typeof THREE.Mesh>[]=[];
      for(let i=0;i<3;i++){const curve=new THREE.CatmullRomCurve3(Array.from({length:12},(_,j)=>new THREE.Vector3(Math.sin(j*.7+i)*.08+(i-1)*.23,j*.07,0)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.009,5,false),new THREE.MeshBasicMaterial({color:'#e6ddbf',transparent:true,opacity:.28}));cup.add(mesh);steam.push(mesh);}
      const heroPose:Pose={nx:mobile?.06:0,y:mobile?-1.15:-1.78,z:.2,rx:.1,ry:-.16,rz:-.16,scale:mobile?1.12:1.68,lid:0};
      const pose:Pose={...heroPose};
      const process={progress:0,active:false};
      let dirty = true;
      const resize = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); dirty = true; };
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(document.documentElement); resize();

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false, anchors: true, prevent: node => !!node.closest('.modal-backdrop') });
      lenis.on('scroll', ScrollTrigger.update);

      const context = gsap.context(() => {
        const hero=wrapper.querySelector<HTMLElement>('.hero')!;
        const sequence=wrapper.querySelector<HTMLElement>('.brew-sequence')!;
        // The cup belongs to the hero and the studio only; it no longer wanders over content.
        ScrollTrigger.create({trigger:hero,start:'top top',end:'bottom top',onUpdate:self=>{if(!process.active){host.style.opacity=String(1-self.progress);Object.assign(pose,heroPose);dirty=true;}}});
        host.style.opacity='1';
        gsap.to(process,{progress:1,ease:'none',scrollTrigger:{trigger:sequence,start:'top top',end:()=>'+='+innerHeight*(mobile?3.2:4.2),pin:true,scrub:.6,invalidateOnRefresh:true,
          onToggle:self=>{process.active=self.isActive;studio.visible=self.isActive;host.style.opacity=self.isActive?'1':'0';dirty=true;},
          onUpdate:self=>{
            const phase=Math.min(3,Math.floor(self.progress*4));
            sequence.querySelectorAll('.brew-caption').forEach((el,i)=>{el.classList.toggle('is-current',phase===i);el.setAttribute('aria-hidden',String(phase!==i));});
            sequence.querySelectorAll('.brew-progress span').forEach((el,i)=>{el.classList.toggle('is-current',phase===i);el.setAttribute('aria-hidden',String(phase!==i));});
            sequence.style.setProperty('--brew-progress',String(self.progress)); dirty=true;
          }}});
        gsap.utils.toArray<HTMLElement>('.story-copy,.craft-copy,.craft-photo,.craft-steps,.section-heading,.menu-card,.cta-layout,.footer-faq,footer h2').forEach(element => {
          gsap.from(element, { y: 34, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('cafe:refresh', refresh);

      const lastPose = { ...pose };
      const clamp=THREE.MathUtils.clamp;
      const tick = (time: number) => {
        lenis.raf(time * 1000);
        if (document.hidden) return;
        if(!process.active){const hero=wrapper.querySelector('.hero')!.getBoundingClientRect();host.style.opacity=hero.bottom>0?String(Math.max(0,Math.min(1,hero.bottom/innerHeight))):'0';}
        const moved = process.active || pose.nx !== lastPose.nx || pose.y !== lastPose.y || pose.z !== lastPose.z
          || pose.rx !== lastPose.rx || pose.ry !== lastPose.ry || pose.rz !== lastPose.rz
          || pose.scale !== lastPose.scale || pose.lid !== lastPose.lid;
        if (!moved && !dirty) return;
        dirty = false; Object.assign(lastPose, pose);
        const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
        if(process.active){
          const p=process.progress;
          const studioX=mobile?0:halfWidth*.38;
          studio.position.set(studioX,mobile?-.9:0,0);studio.scale.setScalar(mobile?.75:1);

          cup.visible=p>.39;
          cup.position.set(studioX,mobile?-1.1:-1.45,0);cup.rotation.set(.22,-.12,0);cup.scale.setScalar(mobile?.65:.77);
          lid.position.y=1.55+(1-THREE.MathUtils.smoothstep(p,.85,.96))*2.1;
          lid.position.x=(1-THREE.MathUtils.smoothstep(p,.85,.96))*.65;
          lid.rotation.z=(1-THREE.MathUtils.smoothstep(p,.85,.96))*.2;
          lid.visible=p>.8;
          const grind=clamp((p-.16)/.25,0,1);
          grinder.visible=p<.46;grinder.position.y=-THREE.MathUtils.smoothstep(p,.4,.46)*.6;grinder.scale.setScalar(1-THREE.MathUtils.smoothstep(p,.4,.46));burr.rotation.y=p*100;
          beans.forEach((bean,i)=>{const delay=i/28*.19;const fall=clamp((p-delay)/.18,0,1);const angle=i*2.399;const radius=.35+(i%5)*.06;bean.visible=p<.42&&fall<1;bean.position.set(Math.cos(angle)*radius*(1-fall),3.4-fall*1.85+(i%4)*.12,Math.sin(angle)*radius);bean.rotation.set(p*16+i,i*.7+p*12,p*5);bean.scale.setScalar(1-THREE.MathUtils.smoothstep(fall,.8,1));});
          grounds.visible=p>.17&&p<.43;
          for(let i=0;i<130;i++){const fall=((p*11+i*.017)%1);const spread=.06+fall*.35;dummy.position.set(Math.sin(i*8.7)*spread,1.0-fall*.9,Math.cos(i*4.3)*spread);dummy.rotation.set(i,p*40+i,i);dummy.scale.setScalar(Math.min(1,grind*5));dummy.updateMatrix();grounds.setMatrixAt(i,dummy.matrix);}grounds.instanceMatrix.needsUpdate=true;
          groundsBed.visible=p>.18&&p<.44;saucer.visible=p<.44;groundsBed.scale.y=.1+grind*3;
          brewer.visible=p>.44&&p<.86;brewer.position.y=(1-THREE.MathUtils.smoothstep(p,.44,.5))*1.2;
          stream.visible=p>.5&&p<.81;stream.position.y=.88;stream.scale.set(1+Math.sin(p*200)*.08,2.15,1);
          const fill=THREE.MathUtils.smoothstep(p,.5,.81);
          coffee.position.y=-1.38+fill*2.81;coffee.visible=p>.5;
          coffee.scale.setScalar(.76+fill*.24);
          liquid.visible=p>.5;liquid.scale.set(.78+fill*.25,Math.max(.01,fill*2.81),.78+fill*.25);liquid.position.y=-1.38+fill*1.405;
          body.material.transparent=true;body.material.opacity=p>.5&&p<.81?.25:1;
          crema.visible=p>.59&&p<.92;crema.position.y=coffee.position.y+.006;crema.scale.setScalar(.3+fill*.7);
          steam.forEach((mesh,i)=>{mesh.visible=p>.72&&p<.91;mesh.position.set(0,1.5+(p-.72)*2,0);mesh.rotation.y=i+p*6;});
          // Final presentation settles, with a subtle nod as the lid snaps into place.
          if(p>.94){cup.rotation.z=-THREE.MathUtils.smoothstep(p,.94,1)*.12;cup.scale.setScalar((mobile?.65:.77)+THREE.MathUtils.smoothstep(p,.94,1)*.15);}

        }else{
          cup.visible=true;studio.visible=false;liquid.visible=false;crema.visible=false;steam.forEach(mesh=>mesh.visible=false);body.material.opacity=1;
          cup.position.set(pose.nx * halfWidth, pose.y, pose.z);cup.rotation.set(pose.rx,pose.ry,pose.rz);cup.scale.setScalar(pose.scale);lid.visible=true;lid.position.set(0,1.55,0);lid.rotation.z=0;coffee.position.y=1.46;coffee.scale.setScalar(1);
        }
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      wrapper.classList.add('webgl-ready');
      ScrollTrigger.refresh();
      const onLoss = (event: Event) => { event.preventDefault(); wrapper.classList.remove('webgl-ready'); };
      renderer.domElement.addEventListener('webglcontextlost', onLoss);
      dispose = () => {
        wrapper.classList.remove('cup-front', 'cup-out', 'cup-away');
        wrapper.appendChild(host);
        window.removeEventListener('cafe:refresh', refresh);
        gsap.ticker.remove(tick); context.revert(); lenis.destroy(); resizeObserver.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', onLoss);
        scene.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const materials = Array.isArray(obj.material) ? obj.material : [obj.material]; materials.forEach(m => m.dispose()); } });
        texture.dispose(); renderer.dispose(); renderer.domElement.remove(); wrapper.classList.remove('webgl-ready');
      };
    };
    const breakpoint = matchMedia('(max-width: 760px)');
    void setup(); media.addEventListener('change', setup); breakpoint.addEventListener('change', setup);
    return () => { generation++; media.removeEventListener('change', setup); breakpoint.removeEventListener('change', setup); dispose?.(); };
  }, []);

  return <div className="scroll-journey" ref={root}>
    {children}
    <div className="webgl-cup" ref={canvasHost} role="img" aria-label="3D beans grinding, coffee pouring, and a Parallel Café cup being sealed"/>
  </div>;
}
