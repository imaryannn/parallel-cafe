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

      // Five screen-space compositions: intro, reveal, craft, supporting menu, closing return.
      const desktop: Pose[] = [
        { nx:0, y:-1.78, z:.2, rx:.10, ry:-.16, rz:-.16, scale:1.68, lid:0 },
        { nx:.47, y:-.15, z:0, rx:.04, ry:.22, rz:.10, scale:1.02, lid:0 },
        { nx:-.05, y:-.10, z:0, rx:.20, ry:-.10, rz:.05, scale:1.00, lid:0 },
        { nx:.55, y:.40, z:0, rx:.06, ry:-.30, rz:-.04, scale:.90, lid:0 },
        { nx:.20, y:-.96, z:.1, rx:.08, ry:-.02, rz:-.04, scale:1.58, lid:.18 },
      ];
      const tablet: Pose[] = [
        { nx:0, y:-1.35, z:.1, rx:.10, ry:-.16, rz:-.15, scale:1.10, lid:0 },
        { nx:.47, y:-.15, z:0, rx:.04, ry:.22, rz:.10, scale:.92, lid:0 },
        { nx:-.05, y:-.10, z:0, rx:.20, ry:-.10, rz:.05, scale:.85, lid:0 },
        { nx:.55, y:.40, z:0, rx:.06, ry:-.30, rz:-.04, scale:.75, lid:0 },
        { nx:.20, y:-.14, z:.1, rx:.08, ry:-.02, rz:-.04, scale:1.06, lid:.18 },
      ];
      const handheld: Pose[] = [
        { nx:.06, y:-1.15, z:0, rx:.10, ry:-.16, rz:-.14, scale:1.12, lid:0 },
        { nx:.52, y:1.18, z:0, rx:.04, ry:.52, rz:.18, scale:.70, lid:0 },
        { nx:.30, y:.20, z:0, rx:.20, ry:-.10, rz:.04, scale:.70, lid:0 },
        { nx:.30, y:.80, z:0, rx:.06, ry:-.30, rz:-.03, scale:.70, lid:0 },
        { nx:.18, y:.28, z:0, rx:.10, ry:-.02, rz:-.04, scale:.82, lid:.30 },
      ];
      const poses = mobile ? handheld : matchMedia('(max-width: 900px)').matches ? tablet : desktop;
      const pose: Pose = { ...poses[0] };

      let dirty = true;
      const resize = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); dirty = true; };
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(document.documentElement); resize();

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false, anchors: true, prevent: node => !!node.closest('.modal-backdrop') });
      lenis.on('scroll', ScrollTrigger.update);

      const context = gsap.context(() => {
        const sections = Array.from(wrapper.querySelectorAll<HTMLElement>('.hero,.story,.craft,.menu-section,.cta'));
        const footer = wrapper.querySelector<HTMLElement>('footer');

        // Each chapter begins when its top enters the viewport and settles before it reaches the fold.
        const travel = (i: number, end = 'top 18%') => {
          gsap.timeline({
            scrollTrigger: { trigger: sections[i], start: 'top bottom', end, scrub: .65, invalidateOnRefresh: true },
          }).fromTo(pose, { ...poses[i - 1] }, { ...poses[i], duration: 1, ease: 'power2.inOut', immediateRender: false }, 0);
        };

        travel(1);
        travel(2);
        travel(3);
        travel(4, 'top 10%');

        // The cup exits after the story and returns only for the closing composition.
        if (sections[2] && sections[4]) {
          ScrollTrigger.create({
            trigger: sections[2], start: 'top 62%',
            endTrigger: sections[4], end: 'top 10%',
            onEnter: () => wrapper.classList.add('cup-away'),
            onEnterBack: () => wrapper.classList.add('cup-away'),
            onLeave: () => wrapper.classList.remove('cup-away'),
            onLeaveBack: () => wrapper.classList.remove('cup-away'),
          });
        }

        // The cup leaves the stage before the utility footer, then returns when scrolling back up.
        if (footer) {
          ScrollTrigger.create({
            trigger: footer, start: 'top 82%',
            onEnter: () => wrapper.classList.add('cup-out'),
            onLeaveBack: () => wrapper.classList.remove('cup-out'),
          });
        }

        gsap.utils.toArray<HTMLElement>('.story-copy,.craft-copy,.craft-photo,.craft-steps,.section-heading,.menu-card,.cta-layout,.footer-faq,footer h2').forEach(element => {
          gsap.from(element, { y: 34, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('cafe:refresh', refresh);

      const lastPose = { ...pose };
      const tick = (time: number) => {
        lenis.raf(time * 1000);
        if (document.hidden) return;
        const moved = pose.nx !== lastPose.nx || pose.y !== lastPose.y || pose.z !== lastPose.z
          || pose.rx !== lastPose.rx || pose.ry !== lastPose.ry || pose.rz !== lastPose.rz
          || pose.scale !== lastPose.scale || pose.lid !== lastPose.lid;
        if (!moved && !dirty) return;
        dirty = false; Object.assign(lastPose, pose);
        const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
        cup.position.set(pose.nx * halfWidth, pose.y, pose.z); cup.rotation.set(pose.rx, pose.ry, pose.rz); cup.scale.setScalar(pose.scale);
        lid.position.y = 1.55 + pose.lid; lid.rotation.z = pose.lid * -.13;
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
    <div className="webgl-cup" ref={canvasHost} role="img" aria-label="A three-dimensional Parallel Café cup that follows you through the page"/>
  </div>;
}
