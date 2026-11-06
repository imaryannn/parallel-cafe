'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import 'lenis/dist/lenis.css';
import { createBeanAssets } from './coffee-beans';
import { createGravityStream } from './coffee-motion';

/** One continuous 3D scene accompanies the five coffee chapters. */
export default function ScrollExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const breakpoint = matchMedia('(max-width: 760px)');
    let dispose: (() => void) | undefined;
    let generation = 0;

    const setup = async () => {
      const current = ++generation;
      dispose?.();
      dispose = undefined;
      if (reduced.matches) return;
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }, THREE, { RoomEnvironment }, { createCoffeeMachines }, { createCoffeeCup }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'), import('lenis'), import('three'),
        import('three/addons/environments/RoomEnvironment.js'), import('./coffee-machines'), import('./coffee-cup'),
      ]);
      if (current !== generation || !root.current || !canvasHost.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const wrapper = root.current;
      const host = canvasHost.current;
      const mobile = breakpoint.matches;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, .05, 80);
      const room = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(room, .04);
      scene.environment = environment.texture;
      scene.environmentIntensity = .75;
      room.dispose(); pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xfff9e6, 0x183523, .65));
      const key = new THREE.DirectionalLight(0xfff7e4, 3.4);
      key.position.set(-3, 7, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
      Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -5, near: .1, far: 24 });
      key.shadow.bias = -.0003; key.shadow.normalBias = .025;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xe1ecdf, 3);
      rim.position.set(4, 5, -3); scene.add(rim);
      const fill = new THREE.DirectionalLight(0xffffff, .65);
      fill.position.set(3, 1, 6); scene.add(fill);

      const { cup, lid, surface, crema, latteArt } = createCoffeeCup(THREE);
      scene.add(cup);
      const studio = new THREE.Group(); scene.add(studio);
      const { grinder, burr, portafilter, espresso } = createCoffeeMachines(THREE);
      grinder.position.set(-2.25, 0, 0);
      espresso.position.set(2, 0, 0); espresso.scale.setScalar(1.4);
      studio.add(grinder, espresso, portafilter);
      const hopperLid = grinder.userData.hopperLid as InstanceType<typeof THREE.Group>;
      const hopperLidY = hopperLid.position.y;
      const groundMaterial = new THREE.MeshStandardMaterial({ color: '#4b2c17', roughness: .98 });
      const steel = new THREE.MeshStandardMaterial({ color: '#d8ddd5', roughness: .2, metalness: 1 });
      const dark = new THREE.MeshStandardMaterial({ color: '#153326', roughness: .3, metalness: .2 });
      const puck = new THREE.Mesh(new THREE.CylinderGeometry(.254, .245, .13, 64), groundMaterial);
      puck.position.y = -.09; portafilter.add(puck);
      // Individual granules on the puck catch the light during the tamping close-up.
      const puckGrain = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.008, 0), groundMaterial, 180);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 180; i++) {
        const angle = i * 2.39996, radius = Math.sqrt((i + .5) / 180) * .245;
        dummy.position.set(Math.cos(angle) * radius, -.023, Math.sin(angle) * radius);
        dummy.rotation.set(i, i * .7, i * 1.2); dummy.updateMatrix(); puckGrain.setMatrixAt(i, dummy.matrix);
      }
      portafilter.add(puckGrain);
      const tamper = new THREE.Group(); studio.add(tamper);
      const tamperBase = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .085, 64), steel); tamper.add(tamperBase);
      const tamperGrip = new THREE.Mesh(new THREE.LatheGeometry([[0, .04], [.12, .04], [.08, .14], [.12, .27], [.14, .36], [.1, .41], [0, .42]].map(([x, y]) => new THREE.Vector2(x, y)), 64), dark);
      tamper.add(tamperGrip);

      const {geometry:beanGeometry,crease:grooveGeometry,materials:beanMaterials,creaseMaterial:grooveMaterial}=createBeanAssets(THREE);
      const beans=Array.from({length:44},(_,i)=>{
        const bean=new THREE.Group();
        const shell=new THREE.Mesh(beanGeometry,beanMaterials[i%4]);shell.castShadow=true;
        bean.add(shell,new THREE.Mesh(grooveGeometry,grooveMaterial));bean.scale.setScalar(.145+(i%4)*.009);studio.add(bean);return bean;
      });
      const grounds=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.008,0),groundMaterial,520);studio.add(grounds);
      const shadowMaterial = new THREE.ShadowMaterial({ color: '#001c0c', opacity: .14 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), shadowMaterial);
      floor.rotation.x = -Math.PI / 2; floor.position.y = -.008; floor.receiveShadow = true; studio.add(floor);

      // A double-walled stainless milk pitcher, with a formed spout and open top.
      const pitcher = new THREE.Group(); scene.add(pitcher);
      const pitcherSteel=steel.clone();
      const pitcherGeometry = new THREE.LatheGeometry([[0,0],[.26,0],[.31,.04],[.35,.72],[.34,.82],[.322,.82],[.327,.72],[.29,.05],[0,.035]].map(([x,y])=>new THREE.Vector2(x,y)), 96);
      const pitcherVertices = pitcherGeometry.attributes.position;
      for(let i=0;i<pitcherVertices.count;i++){
        const x=pitcherVertices.getX(i),y=pitcherVertices.getY(i),z=pitcherVertices.getZ(i);
        const lip = THREE.MathUtils.smoothstep(y,.6,.82) * THREE.MathUtils.smoothstep(-x,.21,.34) * Math.max(0,1-Math.abs(z)/.2);
        pitcherVertices.setXYZ(i,x-lip*.15,y+lip*.07,z);
      }
      pitcherGeometry.computeVertexNormals();
      const pitcherBody = new THREE.Mesh(pitcherGeometry, pitcherSteel); pitcherBody.castShadow=true; pitcher.add(pitcherBody);
      const pitcherHandle = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.34,.68,0),new THREE.Vector3(.67,.62,0),new THREE.Vector3(.7,.29,0),new THREE.Vector3(.32,.12,0)]),32,.035,12,false),pitcherSteel); pitcher.add(pitcherHandle);
      const milkMaterial = new THREE.MeshPhysicalMaterial({ color:'#f1dfba', roughness:.23, clearcoat:.3 });
      const milkInPitcher = new THREE.Mesh(new THREE.CircleGeometry(.312,64),milkMaterial); milkInPitcher.rotation.x=-Math.PI/2;milkInPitcher.position.y=.66;pitcher.add(milkInPitcher);
      const espressoMaterial = new THREE.MeshPhysicalMaterial({color:'#6e3210',roughness:.2,clearcoat:.6});
      const streams=[createGravityStream(THREE,espressoMaterial),createGravityStream(THREE,espressoMaterial)];streams.forEach(stream=>scene.add(stream.mesh));
      const milkStream=createGravityStream(THREE,milkMaterial);scene.add(milkStream.mesh);
      const streamStart=new THREE.Vector3(),streamEnd=new THREE.Vector3(),spoutOffset=new THREE.Vector3();
      const impactRipples=Array.from({length:3},()=>{
        const mesh=new THREE.Mesh(new THREE.TorusGeometry(.18,.004,5,64),new THREE.MeshStandardMaterial({color:'#dfb27a',transparent:true,opacity:.2,roughness:.3,depthWrite:false}));mesh.rotation.x=-Math.PI/2;cup.add(mesh);return mesh;
      });
      const stageMaterials = new Map<InstanceType<typeof THREE.Material>, {opacity:number;transparent:boolean}>();
      studio.traverse(object=>{if(object instanceof THREE.Mesh){for(const material of Array.isArray(object.material)?object.material:[object.material])stageMaterials.set(material,{opacity:material.opacity,transparent:material.transparent});}});
      let lastStageAlpha=-1;
      const animateStageOpacity=(alpha:number)=>{
        if(alpha===lastStageAlpha)return;lastStageAlpha=alpha;
        stageMaterials.forEach((original,material)=>{const transparent=original.transparent||alpha<1;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}material.opacity=original.opacity*alpha;});
      };

      const process={progress:0};
      let dirty=true, width=1,height=1,lastProgress=-1,lastPhase=-1;
      const hero=wrapper.querySelector<HTMLElement>('.hero')!;
      const title=wrapper.querySelector<HTMLElement>('.hero-giant')!;
      const heroLower=wrapper.querySelector<HTMLElement>('.hero-lower')!;
      const processUI=wrapper.querySelector<HTMLElement>('.hero-process')!;
      const captions=Array.from(wrapper.querySelectorAll<HTMLElement>('.process-caption'));
      const buttons=Array.from(wrapper.querySelectorAll<HTMLButtonElement>('[data-brew-step]'));
      const chapterNav=wrapper.querySelector<HTMLElement>('.journey-nav-host')!;
      const chapterLinks=Array.from(wrapper.querySelectorAll<HTMLAnchorElement>('.journey-nav a'));
      const chapters=Array.from(wrapper.querySelectorAll<HTMLElement>('.brew-chapter'));
      let chapterStarts:number[]=[],journeyEnd=0,lastNavChapter=-2,navVisible=false;
      const startButton=wrapper.querySelector<HTMLButtonElement>('[data-brew-start]')!;
      const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
      const tilt={x:0,y:0,targetX:0,targetY:0};
      const resetTilt=()=>{tilt.targetX=0;tilt.targetY=0;};
      const moveTilt=(event:PointerEvent)=>{
        if(!finePointer.matches||event.pointerType==='touch'||lastProgress>=.055)return;
        const bounds=hero.getBoundingClientRect();
        tilt.targetX=THREE.MathUtils.clamp((event.clientX-bounds.left)/bounds.width*2-1,-1,1)*.035;
        tilt.targetY=THREE.MathUtils.clamp((event.clientY-bounds.top)/bounds.height*2-1,-1,1)*.025;
      };
      hero.addEventListener('pointermove',moveTilt,{passive:true});
      hero.addEventListener('pointerleave',resetTilt);
      finePointer.addEventListener('change',resetTilt);
      const chapterEasing = (t: number) => t * t * (3 - 2 * t);
      const lenis=new Lenis({
        lerp: .08,
        smoothWheel:true,
        wheelMultiplier:1,
        touchMultiplier:1,
        syncTouch:false,
        anchors:{duration:1.1,easing:chapterEasing,offset:-28},
        prevent:node=>!!node.closest('.modal-backdrop'),
      });
      lenis.on('scroll',ScrollTrigger.update);
      const context=gsap.context(()=>{});
      context.add(()=>{
        // Lenis already eases the scroll position. A second scrub delay makes
        // the coffee continue drifting after the page has reached a chapter.
        gsap.to(process,{progress:1,ease:'none',scrollTrigger:{trigger:wrapper,refreshPriority:10,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
      });
      const seekHandlers = buttons.map((button, index) => {
        const chapter = chapters[index];
        const seek = () => {
          if (chapter) lenis.scrollTo(chapter, {duration: 1.1, easing: chapterEasing, offset: -28});
        };
        button.addEventListener('click', seek);
        return seek;
      });
      const start = () => lenis.scrollTo(document.getElementById('craft')!, {
        duration: 1.2,
        easing: chapterEasing,
      });
      startButton.addEventListener('click', start);
      const resize=()=>{width=wrapper.clientWidth;height=hero.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();chapterStarts=chapters.map(chapter=>chapter.getBoundingClientRect().top+window.scrollY);journeyEnd=wrapper.getBoundingClientRect().bottom+window.scrollY;dirty=true;};
      const observer=new ResizeObserver(resize);observer.observe(hero);resize();
      const refresh=()=>{resize();ScrollTrigger.sort();ScrollTrigger.refresh();lenis.resize();};
      window.addEventListener('cafe:refresh',refresh);
      const smooth=THREE.MathUtils.smoothstep,lerp=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;
      const focus=new THREE.Vector3(),cameraOffset=new THREE.Vector3();
      const milkTint=new THREE.Color('#ffe3b6');
      const artMaterials=new Set<InstanceType<typeof THREE.Material>>();
      latteArt.traverse(object=>{if(object instanceof THREE.Mesh){for(const material of Array.isArray(object.material)?object.material:[object.material])artMaterials.add(material);}});
      const cameraShots=[
        {at:.00,focus:[0,.15,0],offset:[0,.4,10.7]},
        {at:.17,focus:[-2.25,1.95,.12],offset:[2.5,1.7,8.9]},
        {at:.31,focus:[-2.25,1.85,.35],offset:[2.0,1.6,8.0]},
        {at:.42,focus:[-2.1,1.45,.8],offset:[1.7,2.7,5.2]},
        {at:.55,focus:[2,1.9,.8],offset:[2.4,1.65,7.5]},
        {at:.65,focus:[2,1.65,1.26],offset:[1.5,1.5,4.8]},
        {at:.79,focus:[1.2,1.3,2.8],offset:[1.7,3.3,5.4]},
        {at:.87,focus:[1.2,1.3,2.8],offset:[1.2,2.7,5.8]},
        {at:.96,focus:[0,1.55,4.7],offset:[0,.75,6.4]},
        {at:1,focus:[0,1.55,4.7],offset:[0,.75,6.4]},
      ];
      let previousFrame=performance.now();
      const tick=()=>{
        // Use elapsed wall time so GSAP's long-frame compensation cannot
        // stretch the scroll easing when a detailed 3D frame takes longer.
        const now=performance.now(),delta=Math.min((now-previousFrame)/1000,.05);
        previousFrame=now;
        lenis.raf(now);
        if(document.hidden)return;
        const readingLine=window.scrollY+window.innerHeight*.35;
        let navChapter=-1;
        chapterStarts.forEach((top,index)=>{if(readingLine>=top)navChapter=index;});
        // The scene progress stops at 1, but the page keeps scrolling. Keep
        // tracker visibility independent of rendering so it exits in place.
        const showNav=navChapter>=0&&window.scrollY+window.innerHeight<journeyEnd;
        if(showNav!==navVisible){
          chapterNav.classList.toggle('is-active',showNav);
          chapterNav.inert=!showNav;
          navVisible=showNav;
        }
        if(navChapter!==lastNavChapter){
          chapterLinks.forEach((link,index)=>{if(index===navChapter)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
          lastNavChapter=navChapter;
        }
        const pageProgress=process.progress*5;
        const stops=[0,.22,.38,.64,.80,1];
        const chapter=Math.min(4,Math.floor(pageProgress));
        const p=THREE.MathUtils.lerp(stops[chapter],stops[chapter+1],pageProgress-chapter);
        // Pointer motion is a small opening-cup detail and fades out entirely
        // before the brewing sequence. Stop drawing again once it settles.
        if(p>=.055){tilt.x=0;tilt.y=0;resetTilt();}
        else if(Math.abs(tilt.targetX-tilt.x)+Math.abs(tilt.targetY-tilt.y)>.00001){
          const damping=1-Math.exp(-9*delta);
          tilt.x=lerp(tilt.x,tilt.targetX,damping);tilt.y=lerp(tilt.y,tilt.targetY,damping);
          if(Math.abs(tilt.targetX-tilt.x)+Math.abs(tilt.targetY-tilt.y)<.00001){tilt.x=tilt.targetX;tilt.y=tilt.targetY;}
          dirty=true;
        }
        if(!dirty&&Math.abs(p-lastProgress)<.000001)return;
        dirty=false;lastProgress=p;
        const intro=smooth(p,.055,.155),finish=smooth(p,.865,.96);
        title.style.opacity=String(1-smooth(p,.045,.125));
        title.style.translate=`0 ${-intro*90}px`;
        heroLower.style.opacity=String(1-smooth(p,.03,.105));
        heroLower.style.pointerEvents=p<.1?'auto':'none';
        processUI.style.opacity=String(smooth(p,.105,.16));
        processUI.style.visibility=p>.105?'visible':'hidden';
        hero.style.setProperty('--brew-progress',String(p));
        wrapper.classList.toggle('is-brewing',p>.105);
        const phase=p<.29?0:p<.53?1:p<.715?2:p<.87?3:4;
        if(phase!==lastPhase){
          captions.forEach((caption,i)=>{caption.classList.toggle('is-current',i===phase);caption.setAttribute('aria-hidden',String(i!==phase));});
          buttons.forEach((button,i)=>{if(i===phase)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});lastPhase=phase;
        }
        // Camera dolly, orbit and focus changes share the same scroll clock.
        const next=cameraShots.findIndex(shot=>shot.at>p);
        const b=cameraShots[next<0?cameraShots.length-1:next],a=cameraShots[Math.max(0,(next<0?cameraShots.length-1:next)-1)];
        const blend=smooth(p,a.at,b.at);
        focus.set(lerp(a.focus[0],b.focus[0],blend),lerp(a.focus[1],b.focus[1],blend),lerp(a.focus[2],b.focus[2],blend));
        cameraOffset.set(lerp(a.offset[0],b.offset[0],blend),lerp(a.offset[1],b.offset[1],blend),lerp(a.offset[2],b.offset[2],blend));
        if(mobile)cameraOffset.multiplyScalar(1+intro*.06);
        else cameraOffset.multiplyScalar(1+.48*smooth(p,.46,.56)*(1-smooth(p,.70,.77)));
        camera.position.copy(focus).add(cameraOffset);camera.lookAt(focus);
        if(mobile){
          const sceneHeight=height*lerp(1,.48,intro),sceneBottom=height*.07*intro;
          renderer.setViewport(0,sceneBottom,width,sceneHeight);camera.clearViewOffset();camera.aspect=width/sceneHeight;camera.updateProjectionMatrix();
        }else{
          renderer.setViewport(0,0,width,height);camera.setViewOffset(width,height,-width*.185*intro,0,width,height);
        }

        studio.visible=p>.055;
        animateStageOpacity(smooth(p,.055,.145)*(1-smooth(p,.735,.795)));
        // The opening cup settles into the machine while its lid lifts clear.
        const cupArrive=smooth(p,.055,.17),takeOut=smooth(p,.705,.755);
        const cupScale=lerp(mobile?.85:1.3,.24,cupArrive);
        cup.position.set(lerp(0,2,cupArrive),lerp(mobile?-.75:-1.3,1.087,cupArrive),lerp(.25,1.26,cupArrive));
        cup.scale.setScalar(cupScale);
        cup.rotation.set(lerp(.13,0,cupArrive),lerp(-.16,0,cupArrive),lerp(-.17,0,cupArrive));
        const tiltWeight=1-smooth(p,.015,.055);
        cup.rotation.x+=tilt.y*tiltWeight;cup.rotation.y+=tilt.x*tiltWeight;
        if(p>.705){cup.position.set(lerp(2,1.2,takeOut),lerp(1.087,.84,takeOut),lerp(1.26,2.8,takeOut));cup.scale.setScalar(lerp(.24,.54,takeOut));}
        if(p>.865){cup.position.set(lerp(1.2,0,finish),lerp(.84,1.48,finish),lerp(2.8,4.7,finish));cup.scale.setScalar(lerp(.54,.92,finish));cup.rotation.set(0,-.12*finish,-.12*finish);}
        lid.visible=p<.165||p>.873;
        if(p<.165){lid.position.set(cupArrive*1.4,1.55+cupArrive*4,0);lid.rotation.z=-cupArrive*.35;}
        else{const closing=smooth(p,.89,.956);lid.position.set((1-closing)*.4,1.55+(1-closing)*2.15,0);lid.rotation.z=(1-closing)*.18;}

        const dosing=smooth(p,.245,.385);
        hopperLid.position.y=hopperLidY+(.7*smooth(p,.12,.18)*(1-smooth(p,.265,.30)));
        hopperLid.rotation.z=.25*smooth(p,.12,.18)*(1-smooth(p,.29,.325));
        hopperLid.position.x=1.05*smooth(p,.12,.16)*(1-smooth(p,.29,.325));
        burr.rotation.y=p*180;
        grinder.rotation.z=p>.26&&p<.39?Math.sin(p*1600)*.001:0;
        // These same beans fall, land, and feed the burr. There is no pre-filled pile.
        beans.forEach((bean,i)=>{
          const rawAge=(p-(.16+i/beans.length*.105))/.038;
          const age=clamp(rawAge,0,1),fall=age*age,angle=i*2.39996;
          const layer=Math.floor(i/11),packingRadius=.13+layer*.055+(i%3)*.018;
          const settledY=2.86+layer*.14-.8*dosing;
          const startY=4.05+(i%4)*.04;
          const radius=lerp(.28+(i%4)*.04,packingRadius*(1-dosing*.72),fall);
          bean.position.set(-2.25+Math.cos(angle)*radius,lerp(startY,settledY,fall),-.08+Math.sin(angle)*radius);
          bean.visible=rawAge>=0&&bean.position.y>2.64;
          const settle=smooth(age,.65,1);
          bean.rotation.set(
            lerp(i+age*2.4,Math.PI/2+(i%3-1)*.18,settle),
            lerp(i*.7+age*1.6,angle,settle),
            lerp(i*.2+age*2,(i%5-2)*.1,settle),
          );
        });
        const transfer=smooth(p,.465,.545);
        portafilter.position.set(lerp(-2.25,2,transfer),lerp(1.17,2.2302,transfer)+Math.sin(transfer*Math.PI)*.4,lerp(.8,1.26,transfer));
        portafilter.scale.setScalar(lerp(1,1.4,transfer));
        portafilter.rotation.y=-smooth(p,.51,.555)*Math.PI*.5;
        puck.visible=p>.25;puckGrain.visible=p>.27;
        const tamp=smooth(p,.415,.437)*(1-smooth(p,.443,.465));
        puck.scale.y=Math.max(.04,dosing)*(1-smooth(p,.415,.437)*.22);puck.position.y=-.155+puck.scale.y*.065;
        puckGrain.position.y=(-.155+puck.scale.y*.13)+.023;
        tamper.visible=p>.39&&p<.465;tamper.position.set(-2.25,1.17+.54-tamp*.55,.8);tamper.rotation.y=p*12;
        grounds.visible=p>.25&&p<.405;
        if(grounds.visible){
          for(let i=0;i<520;i++){
            const age=(p-(.25+i/520*.133))/.019,fall=clamp(age,0,1);
            const active=age>=0&&age<1;
            const height=1.43-(1.17-.155+puck.scale.y*.13);
            dummy.position.set(-2.25+Math.sin(i*8.7)*(.025+fall*.13),1.43-height*fall*fall,.8+Math.cos(i*4.3)*(.025+fall*.13));
            dummy.scale.set(active?.65+(i%4)*.2:0,active?.5+(i%3)*.3:0,active?.7:0);
            dummy.rotation.set(i,fall*4+i,i);dummy.updateMatrix();grounds.setMatrixAt(i,dummy.matrix);
          }
          grounds.instanceMatrix.needsUpdate=true;
        }

        const extraction=smooth(p,.563,.695),milkFill=smooth(p,.768,.846);
        const fillLevel=.03+extraction*.22+milkFill*.70;
        const level=-1.42+fillLevel*2.84,radius=.73+fillLevel*.265;
        surface.position.y=level;surface.scale.setScalar(radius);surface.visible=p<.09||p>.563;
        crema.position.y=level+.006;crema.scale.setScalar(radius);crema.visible=p>.575;
        const artReveal=smooth(p,.804,.845);
        latteArt.position.y=level+.012;latteArt.scale.set(radius*(.55+artReveal*.45),1,radius*(.55+artReveal*.45));latteArt.visible=p>.804;
        artMaterials.forEach(material=>{material.opacity=artReveal;});
        (surface.material as InstanceType<typeof THREE.MeshStandardMaterial>).color.set('#ffffff').lerp(milkTint,milkFill*.25);
        cup.updateMatrixWorld(true);portafilter.updateMatrixWorld(true);
        streams.forEach((stream,i)=>{
          stream.mesh.visible=p>.563&&p<.701;
          if(stream.mesh.visible){
            streamStart.set(i===0?-.105:.105,-.424,0);portafilter.localToWorld(streamStart);
            streamEnd.copy(streamStart);streamEnd.y=cup.position.y+level*cup.scale.y+.002;
            stream.update(streamStart,streamEnd,.012*(1-smooth(p,.687,.701)*.8),p,smooth(p,.563,.571),smooth(p,.695,.701));
          }
        });
        // The pitcher rolls about its lip, lowers for the pattern, then lifts for the draw-through.
        const pitcherEnter=smooth(p,.731,.765),pitcherExit=smooth(p,.848,.88);
        const pour=smooth(p,.765,.837),draw=smooth(p,.834,.846),artMove=smooth(p,.803,.834);
        pitcher.visible=p>.731&&p<.88;
        pitcher.rotation.set(.04*Math.sin(pour*Math.PI),(.08-.14*pour)*(1-pitcherExit),(.48+.49*pour)*(1-pitcherExit));
        const wiggle=Math.sin(artMove*Math.PI*12)*.055*Math.sin(artMove*Math.PI);
        const rimY=cup.position.y+1.525*cup.scale.y;
        const lipX=cup.position.x+.095+wiggle+(1-pitcherEnter)*1.5+pitcherExit*1.5;
        const lipY=rimY+lerp(.62,.10,smooth(p,.775,.809))+draw*.3+(1-pitcherEnter)*.55+pitcherExit*.5;
        const lipZ=cup.position.z+lerp(-.13,.14,artMove)-draw*.3;
        spoutOffset.set(-.48,.89,0).applyEuler(pitcher.rotation);
        pitcher.position.set(lipX-spoutOffset.x,lipY-spoutOffset.y,lipZ-spoutOffset.z);
        milkInPitcher.visible=pour<.15; // The tilted vessel's near wall occludes the remaining milk.
        milkStream.mesh.visible=p>.768&&p<.848;
        if(milkStream.mesh.visible){
          pitcher.updateMatrixWorld(true);streamStart.set(-.48,.89,0);pitcher.localToWorld(streamStart);
          streamEnd.set(cup.position.x+wiggle*.55,cup.position.y+level*cup.scale.y+.002,cup.position.z+lerp(-.08,.12,artMove)-draw*.28);
          milkStream.update(streamStart,streamEnd,lerp(.027,.045,artMove)*(1-draw*.65),p,smooth(p,.768,.774),smooth(p,.844,.848));
        }
        impactRipples.forEach((ripple,i)=>{
          ripple.visible=p>.768&&p<.846;
          const ripplePhase=(p*34+i/3)%1;
          ripple.position.set(wiggle,level+.008,0);ripple.scale.setScalar(.2+ripplePhase*1.3);
          ripple.material.opacity=(1-ripplePhase)*.16;
        });
        renderer.render(scene,camera);
      };
      gsap.ticker.add(tick);
      wrapper.classList.add('webgl-ready');
      refresh();
      void document.fonts.ready.then(()=>{
        if(current!==generation)return;
        refresh();
        // Resolve section links after fonts have established the page height.
        const hash=window.location.hash.slice(1);
        const anchor=hash&&hash!=='home'&&hash!=='ritual'?document.getElementById(hash):null;
        if(anchor)lenis.scrollTo(anchor,{immediate:true,offset:-28});
      });
      const onLoss=(event:Event)=>{event.preventDefault();dispose?.();dispose=undefined;};
      renderer.domElement.addEventListener('webglcontextlost',onLoss);
      dispose=()=>{
        gsap.ticker.remove(tick);context.revert();lenis.destroy();observer.disconnect();
        window.removeEventListener('cafe:refresh',refresh);
        hero.removeEventListener('pointermove',moveTilt);hero.removeEventListener('pointerleave',resetTilt);finePointer.removeEventListener('change',resetTilt);
        startButton.removeEventListener('click',start);buttons.forEach((button,i)=>button.removeEventListener('click',seekHandlers[i]));
        renderer.domElement.removeEventListener('webglcontextlost',onLoss);
        const geometries=new Set<InstanceType<typeof THREE.BufferGeometry>>(),materials=new Set<InstanceType<typeof THREE.Material>>(),textures=new Set<InstanceType<typeof THREE.Texture>>();
        scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material]){materials.add(material);Object.values(material).forEach(value=>{if(value instanceof THREE.Texture)textures.add(value);});}}});
        geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());
        environment.dispose();renderer.dispose();renderer.domElement.remove();wrapper.classList.remove('webgl-ready','is-brewing');
        chapterNav.classList.remove('is-active');chapterNav.inert=true;
        [title,heroLower,processUI].forEach(element=>{element.style.removeProperty('opacity');element.style.removeProperty('translate');element.style.removeProperty('visibility');element.style.removeProperty('pointer-events');});
      };
    };
    const restart=()=>{void setup();};
    restart();reduced.addEventListener('change',restart);breakpoint.addEventListener('change',restart);
    return()=>{generation++;reduced.removeEventListener('change',restart);breakpoint.removeEventListener('change',restart);dispose?.();};
  },[]);

  return <div className="scroll-journey" ref={root}>
    <div className="journey-content">{children}</div>
    <div className="webgl-cup" ref={canvasHost} role="img" aria-label="Scroll to follow whole beans through grinding, tamping, espresso extraction, milk pouring and a closing Parallel Café cup" />
    <div className="journey-nav-host" inert><nav className="journey-nav" aria-label="Jump to a coffee chapter">{[['craft','Beans'],['grind','Grind'],['espresso','Espresso'],['milk','Milk'],['ready','Your cup']].map(([id,label]) => <a href={'#'+id} key={id}>{label}</a>)}</nav></div>
  </div>;
}
