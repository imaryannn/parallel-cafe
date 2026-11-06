'use client';

import { useEffect, useRef } from 'react';

export default function CoffeeBag() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const section = host.closest('section')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let loading = false;
    let cleanup: (() => void) | undefined;
    let inView = false;
    let requestRender = () => {};

    const initialize = async () => {
      if (loading) return;
      loading = true;
      const [THREE, { RoomEnvironment }, { createCoffeeBag }] = await Promise.all([
        import('three'), import('three/addons/environments/RoomEnvironment.js'), import('./coffee-bag-model'),
      ]);
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 1.8));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
      const room = new RoomEnvironment();
      const generator = new THREE.PMREMGenerator(renderer);
      const environment = generator.fromScene(room, .06);
      scene.environment = environment.texture;
      scene.environmentIntensity = .55;
      generator.dispose(); room.dispose();
      scene.add(new THREE.HemisphereLight(0xfff7e5, 0x5b674a, .9));
      const key = new THREE.DirectionalLight(0xfff5e5, 3.1);
      key.position.set(-3, 7, 5); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left:-4, right:4, top:4, bottom:-4, near:.1, far:20 });
      key.shadow.bias = -.0003; key.shadow.normalBias = .018; scene.add(key);
      const fill = new THREE.DirectionalLight(0xe8edda, .8);
      fill.position.set(5, 3, -4); scene.add(fill);
      const { table, textures } = createCoffeeBag(THREE); scene.add(table);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity:.13, color:'#3a4027' }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = -1.625; floor.receiveShadow = true; scene.add(floor);

      let frame = 0;
      let targetScroll = .5, scroll = .5;
      let targetX = 0, pointerX = 0, targetY = 0, pointerY = 0;
      let dirty = true;
      let contextAvailable = true;
      const draw = () => {
        frame = 0;
        if (disposed || !contextAvailable || document.hidden || (!inView && !dirty)) return;
        const staticScene = reduced.matches;
        scroll += (targetScroll - scroll) * .065;
        pointerX += (targetX - pointerX) * .055;
        pointerY += (targetY - pointerY) * .055;
        const angle = 1.32 + (staticScene ? 0 : (scroll - .5) * .32 + pointerX * .055);
        const radius = 7.2;
        camera.position.set(Math.cos(angle) * radius, 1.65 + (staticScene ? 0 : pointerY * .12), Math.sin(angle) * radius);
        camera.lookAt(0, .05, 0);
        renderer.render(scene, camera);
        host.classList.add('is-ready'); dirty = false;
        if (!staticScene && inView && (Math.abs(targetScroll-scroll)>.0001 || Math.abs(targetX-pointerX)>.0001 || Math.abs(targetY-pointerY)>.0001)) frame = requestAnimationFrame(draw);
      };
      requestRender = () => { if (!frame && !disposed) frame = requestAnimationFrame(draw); };
      const updateScroll = () => {
        if (!inView || reduced.matches) return;
        const bounds = section.getBoundingClientRect();
        targetScroll = THREE.MathUtils.clamp((innerHeight-bounds.top)/(innerHeight+bounds.height),0,1);
        requestRender();
      };
      const move = (event: PointerEvent) => {
        if (reduced.matches || event.pointerType !== 'mouse') return;
        const bounds = host.getBoundingClientRect();
        targetX=(event.clientX-bounds.left)/bounds.width*2-1;
        targetY=(event.clientY-bounds.top)/bounds.height*2-1; requestRender();
      };
      const leave = () => { targetX=targetY=0;requestRender(); };
      const resize = () => {
        const {width,height}=host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;requestRender();
      };
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
      const motionChange = () => { targetX=targetY=0;dirty=true;requestRender(); };
      const visibilityChange = () => { if(!document.hidden){dirty=true;requestRender();} };
      const contextLost = (event:Event) => { event.preventDefault();contextAvailable=false;host.classList.remove('is-ready'); };
      const contextRestored=()=>{contextAvailable=true;dirty=true;requestRender();};
      window.addEventListener('scroll',updateScroll,{passive:true});
      host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
      reduced.addEventListener('change',motionChange);document.addEventListener('visibilitychange',visibilityChange);
      renderer.domElement.addEventListener('webglcontextlost',contextLost);
      renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
      updateScroll();resize();
      cleanup = () => {
        cancelAnimationFrame(frame);resizeObserver.disconnect();
        window.removeEventListener('scroll',updateScroll);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);
        reduced.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',visibilityChange);
        renderer.domElement.removeEventListener('webglcontextlost',contextLost);
        renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);
        const geometries=new Set<InstanceType<typeof THREE.BufferGeometry>>(),materials=new Set<InstanceType<typeof THREE.Material>>();
        scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>materials.add(material));}});
        geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();host.classList.remove('is-ready');
      };
    };
    const preload = new IntersectionObserver(entries => {
      if(entries.some(entry=>entry.isIntersecting)){void initialize();preload.disconnect();}
    }, {rootMargin:'450px'});
    const visibility = new IntersectionObserver(([entry]) => {inView=entry.isIntersecting;if(inView)requestRender();}, {threshold:0});
    preload.observe(host);visibility.observe(host);
    return () => {disposed=true;preload.disconnect();visibility.disconnect();cleanup?.();};
  }, []);

  return <div className="table-scene" ref={hostRef} role="img" aria-label="A sculpted forest-green Parallel coffee bag with a cream label and folded paper seams">
    <div className="bag-placeholder" aria-hidden="true"><span>〃</span><strong>PARALLEL<br />CAFÈ</strong><small>THE EVERYDAY BLEND · 250 g</small></div>
  </div>;
}
