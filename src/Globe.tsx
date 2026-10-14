import { createPortal } from 'react-dom';
import { INSTAGRAM_URL } from './sections/data';
import React, { useRef, type FC, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, ScrollControls, useScroll, Scroll, Line } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';
import { AnimatePresence } from 'framer-motion';
import WorkPanel from './sections/WorkPanel';
import { useIsTouch } from './useIsTouch';
// It's good practice to import icons if you use them, for example from a library like 'react-icons'
// import { FaHeadphones, FaBars, FaPlay, FaForward, FaUpload, FaCog } from 'react-icons/fa';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

const useViewport = () => {
  const [vp, setVp] = useState({ w: typeof window === 'undefined' ? 1280 : window.innerWidth, h: typeof window === 'undefined' ? 800 : window.innerHeight });
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return vp;
};

const Globe = () => {
  const waterRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const pointMaterialRef = useRef<THREE.PointsMaterial>(null!);
  const scroll = useScroll();
  const cCyan = useMemo(() => new THREE.Color('#00ffff'), []);
  const cBlack = useMemo(() => new THREE.Color('#1a1a1a'), []);
  const cWireframe = useMemo(() => new THREE.Color('#888888'), []);

  // Generate random points on a sphere for the data points effect.
  // The array length must be a multiple of 3 (x, y, z per point); 5000 left a partial point that
  // became NaN and triggered a Three.js "Computed radius is NaN" error. Memoised so it is only built once.
  const sphere = useMemo(() => random.inSphere(new Float32Array(5001), { radius: 1.01 }), []);

  useFrame((state, delta) => {
    // Animate the size of the points to make them pulse
    if (pointMaterialRef.current) {
      pointMaterialRef.current.size =
        0.005 + 0.0025 * Math.sin(state.clock.getElapsedTime() * 3);
    }
    // Increase rotation speed based on scroll offset
    let rotationSpeed = 0.05 + scroll.offset * 0.5;
    if (scroll.offset > 0.8) {
      rotationSpeed = THREE.MathUtils.lerp(0.45, 0.05, (scroll.offset - 0.8) * 5);
    }

    if (waterRef.current) {
      waterRef.current.rotation.y += delta * rotationSpeed;
    }

    // Transition colors and opacity for the footer section
    const t = THREE.MathUtils.smoothstep(scroll.offset, 0.7, 0.95);
    if (pointMaterialRef.current) {
      pointMaterialRef.current.color.lerpColors(cCyan, cBlack, t);
      pointMaterialRef.current.opacity = THREE.MathUtils.lerp(1, 0.6, t);
    }
    if (waterRef.current && waterRef.current.material instanceof THREE.MeshStandardMaterial) {
      waterRef.current.material.color.lerpColors(cWireframe, cBlack, t);
      waterRef.current.material.opacity = THREE.MathUtils.lerp(1, 0.2, t);
      waterRef.current.material.transparent = true;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <>
      <Points ref={pointsRef} positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={pointMaterialRef}
          transparent
          color="#00ffff"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      <mesh ref={waterRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial wireframe color="#888888" />
      </mesh>
    </>
  );
};

const GlobePositioner = ({ globeRef: _globeRef }: { globeRef: React.MutableRefObject<THREE.Group> }) => {
  const scroll = useScroll();
  const isMobile = useIsMobile();

  useFrame((state) => {
    const progress = Math.min(scroll.offset / 0.33, 1);
    // Move camera instead of globe for flight effect
    // Original relative end pos: Globe(-1.5, 0, 2.5) from Camera(0, 0, 4.1) -> Dist(1.5, 0, 1.6)
    
    const startZ = isMobile ? 4.5 : 4.1;
    const startY = isMobile ? -2.0 : -0.8;
    const endX = isMobile ? 0 : 1.5;
    const endY = isMobile ? 0 : 0.8;
    const endZ = isMobile ? 4.5 : 1.6;
    let targetX = THREE.MathUtils.lerp(0, endX, progress);
    const targetY = THREE.MathUtils.lerp(startY, endY, progress);
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, progress);
    
    // Calculate lookAt Y offset to push globe down in footer
    let lookAtY = 0;
    if (scroll.offset > 0.7) {
      const footerProgress = (scroll.offset - 0.7) * 3.33;
      lookAtY = THREE.MathUtils.lerp(0, 0.6, footerProgress);
      if (!isMobile) {
        targetX = THREE.MathUtils.lerp(endX, 0.9, footerProgress);
      }
    }

    state.camera.position.x = targetX;
    state.camera.position.y = targetY;
    state.camera.position.z = targetZ;
    state.camera.lookAt(targetX, lookAtY, 0);

    // Bank the camera slightly as it moves to simulate a turn
    state.camera.rotation.z = THREE.MathUtils.lerp(0, -0.15, progress);
  });
  return null;
};

const GlobeRotator = ({ globeRef }: { globeRef: React.MutableRefObject<THREE.Group> }) => {
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow interaction if clicking on canvas or non-interactive elements
      if (!target.closest('.interactive') && !target.closest('button') && !target.closest('a')) {
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
        velocity.current = { x: 0, y: 0 };
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'auto';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && globeRef.current) {
        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;
        previousMouse.current = { x: e.clientX, y: e.clientY };

        velocity.current = { x: deltaX * 0.005, y: deltaY * 0.005 };
        
        globeRef.current.rotation.y += velocity.current.x;
        globeRef.current.rotation.x += velocity.current.y;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [globeRef]);

  useFrame(() => {
    if (!isDragging.current && globeRef.current) {
      globeRef.current.rotation.y += velocity.current.x;
      globeRef.current.rotation.x += velocity.current.y;
      
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
    }
  });

  return null;
};

const BackgroundController = () => {
  const scroll = useScroll();
  const black = useMemo(() => new THREE.Color('#000000'), []);
  const offWhite = useMemo(() => new THREE.Color('#f5f5f5'), []);

  useFrame((state) => {
    // Transition background to off-white when reaching the footer (last 25% of scroll)
    const t = THREE.MathUtils.smoothstep(scroll.offset, 0.6, 0.9);
    
    if (state.scene.background instanceof THREE.Color) {
      state.scene.background.lerpColors(black, offWhite, t);
    }
    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.lerpColors(black, offWhite, t);
    }
  });
  return null;
};

const ShootingStar = () => {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const speed = useRef(0);
  const scroll = useScroll();

  useFrame(() => {
    if (!ref.current) return;

    if (scroll.offset < 0.05) {
      ref.current.visible = true;
      if (matRef.current) matRef.current.opacity = 0.4 * (1 - scroll.offset / 0.05);
    } else {
      ref.current.visible = false;
    }

    ref.current.position.x -= speed.current;
    ref.current.position.y -= speed.current;
    // Reset if out of view
    if (ref.current.position.x < -20 || ref.current.position.y < -20) {
      reset();
    }
  });

  const reset = () => {
    const x = Math.random() * 30;
    const y = Math.random() * 30 + 10;
    const z = -10 - Math.random() * 20; // Position in background
    if (ref.current) {
      ref.current.position.set(x, y, z);
      speed.current = 0.2 + Math.random() * 0.5;
    }
  };

  useEffect(() => {
    reset();
    // Pre-warm position to scatter them along the path
    if (ref.current) {
      ref.current.position.x -= Math.random() * 20;
      ref.current.position.y -= Math.random() * 20;
    }
  }, []);

  return (
    <mesh ref={ref} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[3, 0.02, 0.02]} />
      <meshBasicMaterial ref={matRef} color="white" transparent opacity={0.4} />
    </mesh>
  );
};

const BackgroundStars = () => {
  const scroll = useScroll();
  const pointsRef = useRef<THREE.Points>(null!);
  
  const stars = useMemo(() => {
    return random.inSphere(new Float32Array(6000), { radius: 30 });
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    
    const current = scroll.offset;
    // Visible roughly from scroll 0.3 to 0.7 (covering the About Me section)
    let val = 0;
    if (current > 0.3 && current < 0.7) {
       if (current < 0.4) val = (current - 0.3) * 10;
       else if (current > 0.6) val = (0.7 - current) * 10;
       else val = 1;
    }
    
    (pointsRef.current.material as THREE.PointsMaterial).opacity = val;
    pointsRef.current.rotation.y += 0.0003;
  });

  return (
    <Points ref={pointsRef} positions={stars as Float32Array} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0}
      />
    </Points>
  );
};

const OrbitPath = () => {
  const points = useMemo(() => {
    const pts = [];
    const radius = 7;
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * 2 * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, []);

  return (
    <group rotation={[Math.PI / 4, 0, 0]} position={[7, 0, 0]}>
      <Line points={points} color="white" transparent opacity={0.15} lineWidth={1} />
    </group>
  );
};

interface InterfaceProps {
  /** Opens the Work / Services / Process / Contact panel, optionally scrolled to a section. */
  onOpenPanel: (section?: string) => void;
}

const Interface: FC<InterfaceProps> = ({ onOpenPanel }) => {
  const scroll = useScroll();
  const vp = useViewport();
  const isMobile = useIsMobile();
  // compact = tablets and short landscape windows: wider than a phone, too tight for the wide desktop hero.
  const compact = !isMobile && (vp.w < 1100 || vp.h < 600);
  const short = vp.h < 600;
  // Phones and portrait tablets: Hire me moves into the header row, and the footer headline sits above the globe.
  const topCta = isMobile || (compact && !short);
  const touch = useIsTouch();
  const tapReveal = touch || isMobile || compact;
  const [mailOpen, setMailOpen] = useState(false);
  const reduceMotion = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const footerHeadRef = useRef<HTMLHeadingElement>(null);
  const footerColsRef = useRef<HTMLDivElement>(null);
  const sideBySide = vp.w >= 900 || short;
  const leftRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const footerTextRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    // Fade out in the first 20% of the scroll
    const opacity = 1 - scroll.range(0, 0.2);
    // Move upwards rapidly to simulate a "spinning" or slot machine effect
    const offset = scroll.offset * 1500; // Adjust speed multiplier as needed

    if (leftRef.current) {
      leftRef.current.style.opacity = String(opacity);
      leftRef.current.style.transform = `translateY(-${offset}px)`;
    }
    if (headlineRef.current) {
      if (isMobile) {
        const opacityMobile = THREE.MathUtils.smoothstep(scroll.offset, 0.2, 0.3);
        headlineRef.current.style.opacity = String(opacityMobile);
        headlineRef.current.style.transform = reduceMotion.current ? 'none' : `translateY(${(1 - opacityMobile) * 18}px)`;
      } else {
        headlineRef.current.style.opacity = String(opacity);
        headlineRef.current.style.transform = `translateY(-${offset}px)`;
      }
    }
    if (introRef.current) {
      if (isMobile) {
        const opacityMobile = THREE.MathUtils.smoothstep(scroll.offset, 0.08, 0.18);
        introRef.current.style.opacity = String(opacityMobile);
        introRef.current.style.transform = reduceMotion.current ? 'none' : `translateY(${(1 - opacityMobile) * 18}px)`;
      } else {
        introRef.current.style.opacity = String(opacity);
        introRef.current.style.transform = `translateY(-${offset}px)`;
      }
    }

    if (footerTextRef.current) {
      const show = scroll.offset > 0.82;
      footerTextRef.current.style.opacity = show ? '1' : '0';
      footerTextRef.current.style.transform = show ? 'translateX(0)' : 'translateX(-50px)';
    }

    if (scrollIndicatorRef.current) {
      scrollIndicatorRef.current.style.opacity = String(1 - scroll.range(0, 0.05));
    }

    // Navbar: appears once the visitor reaches the About section. The difference blend mode keeps it
    // readable on both the dark and the light footer.
    if (navRef.current) {
      const visible = scroll.offset > 0.3;
      navRef.current.style.opacity = visible ? '1' : '0';
      navRef.current.style.transform = visible ? 'translateY(0)' : 'translateY(-16px)';
      navRef.current.style.pointerEvents = visible ? 'auto' : 'none';
    }

    // About: eases in as it arrives. On desktop it also fades out before the footer takes over,
    // which stops About text showing through the footer headline.
    if (aboutRef.current) {
      const enter = THREE.MathUtils.smoothstep(scroll.offset, isMobile ? 0.3 : 0.12, isMobile ? 0.44 : 0.4);
      const fade = isMobile ? 1 : 1 - scroll.range(0.62, 0.12);
      const o = enter * fade;
      aboutRef.current.style.opacity = String(o);
      aboutRef.current.style.transform = reduceMotion.current ? 'none' : `translateY(${(1 - enter) * 28}px)`;
      aboutRef.current.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    }

    // Footer: the headline rises into place, then the contact details follow it.
    const f1 = THREE.MathUtils.smoothstep(scroll.offset, isMobile ? 0.68 : 0.5, isMobile ? 0.86 : 0.78);
    const f2 = THREE.MathUtils.smoothstep(scroll.offset, isMobile ? 0.74 : 0.56, isMobile ? 0.92 : 0.86);
    if (footerHeadRef.current) {
      footerHeadRef.current.style.transform = reduceMotion.current ? 'none' : `translateY(${(1 - f1) * 40}px)`;
    }
    if (footerColsRef.current) {
      footerColsRef.current.style.opacity = String(f2);
      footerColsRef.current.style.transform = reduceMotion.current ? 'none' : `translateY(${(1 - f2) * 24}px)`;
    }
  });

  const textContainerStyle: React.CSSProperties = {
    position: compact ? 'relative' : 'absolute',
    bottom: isMobile ? '12vh' : compact ? 'auto' : '5rem',
    left: isMobile ? '1.5rem' : compact ? 'auto' : '5rem',
    maxWidth: compact && sideBySide ? '50vw' : '800px',
    color: 'white',
    fontSize: isMobile ? '15vw' : compact ? 'clamp(2.6rem, min(9vw, 15vh), 5rem)' : 'clamp(4rem, min(7.2vw, 13vh), 6rem)',
    lineHeight: '1.1',
    pointerEvents: 'auto',
    fontFamily: "'Satoshi', sans-serif",
  };

  const headlineStyle: React.CSSProperties = {
    position: compact ? 'relative' : 'absolute',
    bottom: isMobile || compact ? 'auto' : '5rem',
    // On phones the headline sits low on the second screen, clear of the globe and the intro paragraph.
    top: isMobile ? 'calc(200vh - 3.5rem)' : 'auto',
    translate: isMobile ? '0 -100%' : undefined,
    right: isMobile || compact ? 'auto' : '5rem',
    left: isMobile ? '1.5rem' : 'auto',
    maxWidth: isMobile ? 'calc(100% - 3rem)' : compact ? '100%' : '600px',
    color: 'white',
    textAlign: isMobile || compact ? 'left' : 'right',
    pointerEvents: 'auto',
    fontFamily: "'Satoshi', sans-serif",
  };

  const introStyle: React.CSSProperties = {
    position: compact ? 'relative' : 'absolute',
    bottom: isMobile || compact ? 'auto' : '18rem',
    top: isMobile ? '100vh' : 'auto',
    right: isMobile || compact ? 'auto' : '5rem',
    left: isMobile ? '1.5rem' : 'auto',
    maxWidth: isMobile ? 'calc(100% - 3rem)' : compact ? '100%' : '450px',
    color: 'white',
    textAlign: isMobile || compact ? 'left' : 'right',
    pointerEvents: 'auto',
    fontFamily: "'Staatliches', sans-serif",
  };


  const btnFont = compact ? 'clamp(0.95rem, 2.4vh, 1.2rem)' : '1.2rem';
  const heroStackStyle: React.CSSProperties = compact
    ? {
        position: 'absolute',
        left: 'clamp(1.5rem, 5vw, 5rem)',
        right: 'clamp(1.5rem, 5vw, 5rem)',
        bottom: 'clamp(1.25rem, 5vh, 5rem)',
        display: 'flex',
        flexDirection: sideBySide ? 'row' : 'column',
        alignItems: sideBySide ? 'flex-end' : 'flex-start',
        justifyContent: 'space-between',
        gap: sideBySide ? '2rem' : '1.5rem',
        pointerEvents: 'none',
      }
    : { display: 'contents' };
  const heroRightStyle: React.CSSProperties = compact
    ? { display: 'flex', flexDirection: 'column', gap: '0.5rem', width: sideBySide ? '45vw' : '100%', maxWidth: sideBySide ? '45vw' : '36rem' }
    : { display: 'contents' };

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid white',
    color: 'white',
    padding: isMobile ? '1rem 1.5rem' : compact ? '0.75rem 1.4rem' : '1rem 2.5rem',
    minHeight: '44px',
    cursor: 'pointer',
    borderRadius: '4px',
  };

  // Heading and text share one wrapper so they line up: side by side on desktop (heading left,
  // text right, both starting at the same height), stacked on phones.
  const aboutStyle: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '200vh' : '118vh',
    left: 0,
    width: '100%',
    boxSizing: 'border-box',
    padding: isMobile ? '0 1.5rem' : '0 5rem',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: isMobile ? '1.5rem' : '4rem',
    pointerEvents: 'none',
    color: 'white',
    fontFamily: "'Satoshi', sans-serif",
  };

  const aboutTextStyle: React.CSSProperties = {
    width: isMobile ? '100%' : 'min(45vw, 640px)',
    textAlign: 'left',
    pointerEvents: 'auto',
  };

  const footerContainerStyle: React.CSSProperties = {
    position: 'absolute',
    // The footer fills the last screen exactly (the scroll ends 100vh before the end of the page).
    top: isMobile ? '400vh' : '180vh',
    lineHeight: '1.3',
    left: '0',
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: short ? 'center' : 'flex-start',
    paddingTop: isMobile ? '14vh' : topCta ? 'clamp(5rem, 9vh, 8rem)' : !short ? 'clamp(4.5rem, 12vh, 10rem)' : undefined,
    paddingBottom: isMobile ? '18vh' : undefined,
    boxSizing: 'border-box',
    alignItems: 'center',
    pointerEvents: 'auto',
  };

  const goTo = (target: 'about' | 'end') => {
    const el = scroll.el;
    if (!el) return;
    const vh = window.innerHeight;
    const top = target === 'end' ? el.scrollHeight : (isMobile ? 1.95 : 0.98) * vh;
    el.scrollTo({ top, behavior: 'smooth' });
  };

  const navButton: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    font: "500 0.8rem 'Satoshi', sans-serif",
    letterSpacing: isMobile ? '0.08em' : '0.12em',
    textTransform: 'uppercase',
    padding: isMobile ? '0.6rem 0.4rem' : '0.4rem 0.25rem',
    minHeight: isMobile ? '44px' : undefined,
  };

  const navbar = createPortal(
    <nav
      ref={navRef}
      className="site-nav"
      aria-label="Site sections"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: isMobile ? 'space-between' : 'flex-end',
        gap: isMobile ? '0.25rem' : '2.25rem',
        padding: isMobile ? 'max(0.35rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right)) 0.35rem max(0.75rem, env(safe-area-inset-left))' : compact ? '1.25rem clamp(1.5rem, 5vw, 5rem)' : '1.5rem 5rem',
        mixBlendMode: 'difference',
        opacity: 0,
        transform: 'translateY(-16px)',
        pointerEvents: 'none',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <button style={navButton} onClick={() => goTo('about')}>About</button>
      <button style={navButton} onClick={() => onOpenPanel('work')}>Work</button>
      <button style={navButton} onClick={() => onOpenPanel('services')}>Services</button>
      {!isMobile && <button style={navButton} onClick={() => onOpenPanel('process')}>Process</button>}
      <button style={navButton} onClick={() => goTo('end')}>Contact</button>
    </nav>,
    document.body,
  );

  return (
    <Scroll html style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      {navbar}
      <style>
        {`
          :root { --ease-out: cubic-bezier(0.23, 1, 0.32, 1); }
          /* Entrances: translate only, so they never fight the scroll-driven transform and opacity. */
          @keyframes rise { from { translate: 0 16px; } to { translate: 0 0; } }
          .rise { animation: rise 0.6s var(--ease-out) both; }
          @keyframes hire-pop { from { opacity: 0; scale: 0.94; } to { opacity: 1; scale: 1; } }
          .hire-pop { animation: hire-pop 0.4s var(--ease-out) 0.2s both; transition: transform 0.16s var(--ease-out); }
          /* Press feedback on touch screens. */
          .slot-machine-container, .site-nav button { transition: transform 0.16s var(--ease-out); }
          @media (hover: none) {
            .slot-machine-container:active, .hire-pop:active, .site-nav button:active { transform: scale(0.97); }
          }
          @media (prefers-reduced-motion: reduce) {
            .rise, .hire-pop { animation: none; }
            .email-hidden-text { transition: none; }
            .slot-machine-container, .site-nav button, .hire-pop { transition: none; }
          }
          .site-nav button { opacity: 0.75; transition: opacity 0.2s ease; }
          .site-nav button:hover, .site-nav button:focus-visible { opacity: 1; }
          .site-nav button:focus-visible { outline: 1px solid currentColor; outline-offset: 4px; }
          /* Fonts (Staatliches, Stint Ultra Condensed, Satoshi) are loaded from index.html */
          .slot-machine-char {
            display: inline-block;
            position: relative;
            overflow: hidden;
            vertical-align: bottom;
          }
          .slot-machine-char span, .slot-machine-char::after {
            display: block;
            transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1);
            transition-delay: var(--delay, 0s);
          }
          .slot-machine-char::after {
            content: attr(data-text);
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            height: 100%;
          }
          .slot-machine-container:hover .slot-machine-char span {
            transform: translateY(-100%);
          }
          .slot-machine-container:hover .slot-machine-char::after {
            transform: translateY(-100%);
          }
          @keyframes slot-cycle {
            0%, 20% { transform: translateY(0); }
            45%, 65% { transform: translateY(-100%); }
            90%, 100% { transform: translateY(0); }
          }
          .slot-machine-infinite .slot-machine-char span,
          .slot-machine-infinite .slot-machine-char::after {
            animation: slot-cycle 4s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            animation-delay: var(--delay, 0s);
            transition: none;
          }
          .footer-text-anim {
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          }
          .email-reveal-container {
            display: inline-flex;
            align-items: center;
          }
          .email-hidden-text {
            max-width: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-width 0.8s ease, opacity 0.5s ease, transform 0.8s ease, margin-right 0.5s ease;
            transform: translateX(-20px);
            white-space: nowrap;
          }
          /* Hover only where a real pointer exists, so a tap on a phone does not leave it stuck open. */
          @media (hover: hover) {
            .email-reveal-container:hover .email-hidden-text {
              max-width: 200px;
              opacity: 1;
              transform: translateX(0);
              margin-right: 0.5rem;
            }
          }
          .email-reveal-container.open .email-hidden-text {
            max-width: 200px;
            opacity: 1;
            transform: translateX(0);
            margin-right: 0.5rem;
          }
          .scroll-arrow {
            width: 15px;
            height: 15px;
            border-right: 2px solid white;
            border-bottom: 2px solid white;
            transform: rotate(45deg);
            animation: scroll-bounce 2s infinite;
          }
          @keyframes scroll-bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(45deg); }
            40% { transform: translateY(-10px) rotate(45deg); }
            60% { transform: translateY(-5px) rotate(45deg); }
          }
        `}
      </style>
      <div
        className="rise"
        style={{
          position: 'absolute',
          top: '1rem',
          left: isMobile ? '1.5rem' : topCta ? 'clamp(1.5rem, 5vw, 5rem)' : '3.1rem',
          right: topCta ? (isMobile ? '1.5rem' : 'clamp(1.5rem, 5vw, 5rem)') : undefined,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{marginTop: '1rem',marginLeft: '10', fontSize: short ? '1.35rem' : 'clamp(1.9rem, 5vw, 2.5rem)', fontWeight: '400', fontFamily: "'Stint Ultra Condensed', serif", color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: '1' }}>
            Rithin K Varghese
          </span>
          <span style={{ fontSize: short ? '0.85rem' : '1.4rem', fontFamily: "'Satoshi', sans-serif", color: '#aaaaaa', letterSpacing: '0.05em' }}>portfolio'26</span>
        </div>
        {topCta && (
          <button
            type="button"
            className="hire-pop"
            onClick={() => (window.location.href = 'mailto:rithink604@gmail.com')}
            style={{ background: 'white', color: 'black', border: '1px solid white', borderRadius: '4px', padding: '0.6rem 1.1rem', minHeight: '44px', fontSize: '1rem', fontWeight: 600, fontFamily: "'Satoshi', sans-serif", cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Hire me →
          </button>
        )}
      </div>
      <div style={heroStackStyle}>
      <div ref={leftRef} style={textContainerStyle} >
        {/* Using divs for layout and spans for specific styling */}
        <div className="rise" style={{ fontFamily: "'Staatliches', sans-serif", lineHeight: '1', animationDelay: '60ms' }}>
          CREATIVE{' '}
          <span className="slot-machine-container slot-machine-infinite" style={{ display: 'inline-block' }}>
            {'DESIGNER'.split('').map((char, i) => (
              <span
                key={i}
                className="slot-machine-char"
                data-text={char}
                style={{
                  fontFamily: "'Stint Ultra Condensed', serif",
                  fontWeight: 400,
                  '--delay': `${i * 0.05}s`,
                } as React.CSSProperties}
              >
                <span>{char}</span>
              </span>
            ))}
          </span>
        </div>
        <div className="rise" style={{ fontFamily: "'Staatliches', sans-serif", lineHeight: '1', animationDelay: '130ms' }}>
          <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontWeight: 400, fontSize: '0.7em', verticalAlign: 'middle' }}>AND</span> DEVELOPER
        </div>
      </div>
      {isMobile && (
        <div
          ref={scrollIndicatorRef}
          style={{
            position: 'absolute',
            bottom: '5vh',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem', opacity: 0.7 }}>SCROLL</span>
          <div className="scroll-arrow"></div>
        </div>
      )}
      <div style={heroRightStyle}>
      <div ref={introRef} style={introStyle}>
        <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: short ? '0.95rem' : '1.15rem', color: '#cccccc', marginTop: compact ? 0 : '1rem', textAlign: isMobile || compact ? 'left' : 'justify', marginBottom: compact ? '0.5rem' : '2rem' }}>
          I am a developer who designs, and a designer who codes. I create websites that look simple, feel alive, and are engineered for high performance.
        </p>
      </div>
      <div ref={headlineRef} style={headlineStyle}>
        <h1 style={{ fontFamily: "'Staatliches', sans-serif", fontSize: compact ? 'clamp(1.5rem, min(4.5vw, 6.5vh), 2.5rem)' : '2.5rem', fontWeight: 'normal', lineHeight: '1.1', textAlign: isMobile || compact ? 'left' : 'justify', letterSpacing: '.05em' }}>
          I move people, not just <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontSize: 'inherit', fontWeight: '400' }}>screens.</span>
        </h1>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {!topCta && (
          <button
            onClick={() => window.location.href = 'mailto:rithink604@gmail.com'}
            style={{ ...buttonStyle, background: 'white', color: 'black', fontSize: btnFont, fontFamily: "'Satoshi', sans-serif" ,fontWeight: '600'}}
            className="slot-machine-container"
          >
            {'Hire me →'.replace(/ /g, ' ').split('').map((char, i) => (
              <span
                key={i}
                className="slot-machine-char"
                data-text={char}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              >
                <span>{char}</span>
              </span>
            ))}
          </button>
          )}
          <button
            type="button"
            onClick={() => onOpenPanel('work')}
            style={{ ...buttonStyle, fontSize: btnFont, fontFamily: "'Satoshi', sans-serif" }}
            className="slot-machine-container"
          >
            {'View work'.replace(/ /g, ' ').split('').map((char, i) => (
              <span
                key={i}
                className="slot-machine-char"
                data-text={char}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              >
                <span>{char}</span>
              </span>
            ))}
          </button>
          <button
            type="button"
            onClick={() => onOpenPanel('contact')}
            style={{ ...buttonStyle, fontSize: btnFont, fontFamily: "'Satoshi', sans-serif" }}
            className="slot-machine-container"
          >
            {"Let's Collaborate".replace(/ /g, ' ').split('').map((char, i) => (
              <span
                key={i}
                className="slot-machine-char"
                data-text={char}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              >
                <span>{char}</span>
              </span>
            ))}
          </button>
        </div>
      </div>
      </div>
      </div>
      <div id='about' ref={aboutRef} style={aboutStyle} className="interactive">
        <h2 style={{ fontSize: isMobile ? '3.5rem' : 'clamp(3.2rem, 6.5vw, 5.7rem)', margin: 0, fontFamily: "'Staatliches', sans-serif", lineHeight: '0.9', pointerEvents: 'auto' }}>
          <span>ABOUT</span>{' '}
          <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontWeight: 400 }}>ME</span>
        </h2>
        <div style={aboutTextStyle}>
        <p style={{ fontSize: short ? '1rem' : '1.1rem', lineHeight: '1.6', margin: '0 0 1.5rem', color: '#dddddd' }}>
          Hello, I'm Rithin K Varghese, the developer and founder of rk-studio. I established rk-studio because I believe your website should be an engine for growth, not a bottleneck. When you partner with me, you work directly with the engineer—bypassing agency complexity for focused, dedicated expertise.
        </p>
        <p style={{ fontSize: short ? '1rem' : '1.1rem', lineHeight: '1.6', margin: '0 0 1.5rem', color: '#dddddd' }}>
          My foundation is rooted in logic: as a final-year Electronics and Computer Science student at St. Joseph, I translate complex business requirements into efficient, secure, and scalable web architecture. My work centers on High-Performance Architecture, scalability, and commerce. I specialize in building solutions that are not just visually stunning, but functionally superior, focusing on blazing-fast load times, Custom APIs to handle unique business logic, and resilient E-commerce Solutions designed for conversion.
        </p>
        <p style={{ fontSize: short ? '1rem' : '1.1rem', lineHeight: '1.6', margin: 0, color: '#dddddd' }}>
          Driven by a commitment to craftsmanship, I bring a unique attention to detail and aesthetic sensibility to every project.
        </p>
        </div>
      </div>
      <div id="contact" style={footerContainerStyle} className="interactive">
        <h2 ref={footerHeadRef} style={{ fontSize: isMobile ? '18vw' : short ? 'min(13vw, 18vh)' : 'min(13vw, 24vh)', fontFamily: "'Staatliches', sans-serif", color: '#111', lineHeight: isMobile ? '1.05' : '1.1', margin: isMobile ? '0 0 2rem 0' : '0 0 min(8rem, 14vh) 0' }}>
          LET'S WORK{' '}
          <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontWeight: 200 }}>
            TOGETHER
          </span>
        </h2>
        
        <div ref={footerColsRef} style={{ position: isMobile ? 'relative' : 'absolute', bottom: isMobile ? 'auto' : short ? 'clamp(2.5rem, 7vh, 5rem)' : 'clamp(5rem, 24vh, 14rem)', right: isMobile ? 'auto' : 'clamp(1.5rem, 5vw, 5rem)', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: isMobile ? '1.25rem' : 'clamp(2rem, 10vw, 15rem)', justifyContent: 'flex-end', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', paddingRight: isMobile ? '1.5rem' : 0, marginTop: isMobile ? 'auto' : '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <h3 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: isMobile || compact ? 'clamp(1.4rem, 6vw, 2.5rem)' : '2.5rem', color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: isMobile ? '0.06em' : '0.1em' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {tapReveal ? (
                // Touch screens: tap "Mail" to slide the address out to its left, same as the hover on a computer.
                // Only the revealed address opens the mail app.
                <span className={`email-reveal-container${mailOpen ? ' open' : ''}`} style={{ color: '#111', fontFamily: "'Satoshi', sans-serif", fontSize: 'clamp(0.85rem, 3.6vw, 1rem)' }}>
                  <a
                    href="mailto:rithink604@gmail.com"
                    className="email-hidden-text"
                    tabIndex={mailOpen ? 0 : -1}
                    aria-hidden={!mailOpen}
                    style={{ color: '#111', textDecoration: 'underline', textUnderlineOffset: '0.2em', padding: '0.75rem 0', pointerEvents: mailOpen ? 'auto' : 'none' }}
                  >
                    rithink604@gmail.com
                  </a>
                  <button
                    type="button"
                    aria-expanded={mailOpen}
                    onClick={() => setMailOpen((o) => !o)}
                    style={{ background: 'none', border: 'none', padding: '0.75rem 0', minHeight: '44px', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
                  >
                    Mail
                  </button>
                </span>
              ) : (
                <a href="mailto:rithink604@gmail.com" className="email-reveal-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                  <span className="email-hidden-text">rithink604@gmail.com</span>
                  <span>Mail</span>
                </a>
              )}
              <a href="tel:+918086162298" className="email-reveal-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                <span className="email-hidden-text">+91 8086162298</span>
                <span>Phone</span>
              </a>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <h3 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: isMobile || compact ? 'clamp(1.4rem, 6vw, 2.5rem)' : '2.5rem', color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: isMobile ? '0.06em' : '0.1em' }}>Socials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {INSTAGRAM_URL && (
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="slot-machine-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                {'Instagram'.split('').map((char, i) => (
                  <span key={i} className="slot-machine-char" data-text={char} style={{ '--delay': `${i * 0.03}s` } as React.CSSProperties}>
                    <span>{char}</span>
                  </span>
                ))}
              </a>
              )}
              <a href="https://www.linkedin.com/in/rithin-k-varghese/" className="slot-machine-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                {'LinkedIn'.split('').map((char, i) => (
                  <span key={i} className="slot-machine-char" data-text={char} style={{ '--delay': `${i * 0.03}s` } as React.CSSProperties}>
                    <span>{char}</span>
                  </span>
                ))}
              </a>
              <a href="https://github.com/rkv6" className="slot-machine-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                {'GitHub'.split('').map((char, i) => (
                  <span key={i} className="slot-machine-char" data-text={char} style={{ '--delay': `${i * 0.03}s` } as React.CSSProperties}>
                    <span>{char}</span>
                  </span>
                ))}
              </a>
            </div>
          </div>
        </div>
        <div ref={footerTextRef} className="footer-text-anim" style={{ position: 'absolute', bottom: '.5rem', left: isMobile || compact ? '1.5rem' : '55%', right: isMobile || compact ? '1.5rem' : '3rem', opacity: 0, transform: 'translateX(-50px)' }}>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#111', opacity: 0.2, marginBottom: '0.5rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Satoshi', sans-serif", fontSize: '0.75rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>&copy; {new Date().getFullYear()} rk-studio</span>
            <span>Kerala, India</span>
            <span>9.7268° N, 76.7260° E</span>
          </div>
        </div>
      </div>
    </Scroll>
  );
};

interface GlobeCanvasProps {
  isZoomed: boolean;
}

const GlobeCanvas: FC<GlobeCanvasProps> = ({ isZoomed: _isZoomed }) => {
  const globeRef = useRef<THREE.Group>(null!);
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState<{ open: boolean; section?: string }>({ open: false });

  // The main container now serves as the background for the Globe and the UI.
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: '#000000',
  };

  return (
    <div style={containerStyle}>
      <Canvas camera={{ position: [0, 0, 4.1], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 5, 20]} />
        <ambientLight intensity={0.5} />
        <ScrollControls pages={isMobile ? 5 : 2.8} damping={0.3}>
          <BackgroundController />
          <GlobePositioner globeRef={globeRef} />
          <GlobeRotator globeRef={globeRef} />
          <OrbitPath />
          <group ref={globeRef}>
            <Globe />
          </group>
          <BackgroundStars />
          <group>
            {Array.from({ length: 20 }).map((_, i) => (
              <ShootingStar key={i} />
            ))}
          </group>
          <Interface onOpenPanel={(section) => setPanel({ open: true, section })} />
        </ScrollControls>
      </Canvas>
      <AnimatePresence>
        {panel.open && (
          <WorkPanel
            key="work-panel"
            initialSection={panel.section}
            onClose={() => setPanel({ open: false })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobeCanvas;