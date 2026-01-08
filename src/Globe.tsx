import { useRef, type FC, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, ScrollControls, useScroll, Scroll, Line } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';
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

const Globe = () => {
  const waterRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const pointMaterialRef = useRef<THREE.PointsMaterial>(null!);
  const scroll = useScroll();
  const cCyan = useMemo(() => new THREE.Color('#00ffff'), []);
  const cBlack = useMemo(() => new THREE.Color('#1a1a1a'), []);
  const cWireframe = useMemo(() => new THREE.Color('#888888'), []);

  // Generate random points on a sphere for the data points effect
  const sphere = random.inSphere(new Float32Array(5000), { radius: 1.01 });

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

const Interface = () => {
  const scroll = useScroll();
  const isMobile = useIsMobile();
  const leftRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const footerTextRef = useRef<HTMLDivElement>(null);
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
        headlineRef.current.style.transform = 'none';
      } else {
        headlineRef.current.style.opacity = String(opacity);
        headlineRef.current.style.transform = `translateY(-${offset}px)`;
      }
    }
    if (introRef.current) {
      if (isMobile) {
        const opacityMobile = THREE.MathUtils.smoothstep(scroll.offset, 0.08, 0.18);
        introRef.current.style.opacity = String(opacityMobile);
        introRef.current.style.transform = 'none';
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
  });

  const textContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: isMobile ? '12vh' : '5rem',
    left: isMobile ? '1.5rem' : '5rem',
    maxWidth: '800px',
    color: 'white',
    fontSize: isMobile ? '15vw' : '6rem', // Increased font size for the whole block
    lineHeight: '1.1', // Adjusted line height for the new size
    pointerEvents: 'auto',
    fontFamily: "'Satoshi', sans-serif",
  };

  const headlineStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: isMobile ? 'auto' : '5rem',
    top: isMobile ? '120vh' : 'auto',
    right: isMobile ? 'auto' : '5rem',
    left: isMobile ? '1.5rem' : 'auto',
    maxWidth: isMobile ? 'calc(100% - 3rem)' : '600px',
    color: 'white',
    textAlign: isMobile ? 'left' : 'right',
    pointerEvents: 'auto',
    fontFamily: "'Satoshi', sans-serif",
  };

  const introStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: isMobile ? 'auto' : '18rem',
    top: isMobile ? '100vh' : 'auto',
    right: isMobile ? 'auto' : '5rem',
    left: isMobile ? '1.5rem' : 'auto',
    maxWidth: isMobile ? 'calc(100% - 3rem)' : '450px',
    color: 'white',
    textAlign: isMobile ? 'left' : 'right',
    pointerEvents: 'auto',
    fontFamily: "'Staatliches', sans-serif",
  };


  const buttonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid white',
    color: 'white',
    padding: isMobile ? '1rem 1.5rem' : '1rem 2.5rem',
    cursor: 'pointer',
    borderRadius: '4px',
  };

  const aboutHeadingStyle: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '200vh' : '100vh',
    left: isMobile ? '1.5rem' : '5rem',
    pointerEvents: 'auto',
    color: 'white',
  };

  const aboutContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '215vh' : '100vh',
    right: isMobile ? 'auto' : '5rem',
    left: isMobile ? '1.5rem' : 'auto',
    maxWidth: isMobile ? 'calc(100% - 3rem)' : '45vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: isMobile ? 'flex-start' : 'center',
    pointerEvents: 'auto',
    textAlign: 'left',
    color: 'white',
    fontFamily: "'Satoshi', sans-serif",
  };

  const footerContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '320vh' : '150vh',
    lineHeight: '1.3',
    left: '0',
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  };

  return (
    <Scroll html style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Staatliches&family=Stint+Ultra+Condensed&display=swap');
          @import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap');

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
          .email-reveal-container:hover .email-hidden-text {
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
      <div style={{ position: 'absolute', top: '1rem', left: isMobile ? '1.5rem' : '3.1rem', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{marginTop: '1rem',marginLeft: '10', fontSize: '2.5rem', fontWeight: '400', fontFamily: "'Stint Ultra Condensed', serif", color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: '1' }}>
            Rithin K Varghese
          </span>
          <span style={{ fontSize: '1.4rem', fontFamily: "'Satoshi', sans-serif", color: '#aaaaaa', letterSpacing: '0.05em' }}>portfolio'26</span>
        </div>
      </div>
      <div ref={leftRef} style={textContainerStyle} >
        {/* Using divs for layout and spans for specific styling */}
        <div style={{ fontFamily: "'Staatliches', sans-serif", lineHeight: '1' }}>
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
        <div style={{ fontFamily: "'Staatliches', sans-serif", lineHeight: '1' }}>
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
      <div ref={introRef} style={introStyle}>
        <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '1.15rem', color: '#cccccc', marginTop: '1rem', textAlign: isMobile ? 'left' : 'justify', marginBottom: '2rem' }}>
          I am a developer who designs, and a designer who codes. I create websites that look simple, feel alive, and are engineered for high performance.
        </p>
      </div>
      <div ref={headlineRef} style={headlineStyle}>
        <h1 style={{ fontFamily: "'Staatliches', sans-serif", fontSize: '2.5rem', fontWeight: 'normal', lineHeight: '1.1', textAlign: isMobile ? 'left' : 'justify', letterSpacing: '.05em' }}>
          I move people, not just <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontSize: '2.5rem', fontWeight: '400' }}>screens.</span>
        </h1>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.href = 'mailto:rithink604@gmail.com'}
            style={{ ...buttonStyle, background: 'white', color: 'black', fontSize: '1.2rem', fontFamily: "'Satoshi', sans-serif" ,fontWeight: '600'}}
            className="slot-machine-container"
          >
            {'Hire me →'.split('').map((char, i) => (
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
            style={{ ...buttonStyle, fontSize: '1.2rem', fontFamily: "'Satoshi', sans-serif" }}
            className="slot-machine-container"
          >
            {"Let's Collaborate".split('').map((char, i) => (
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
      <div id='about' style={aboutHeadingStyle} className="interactive">
        <h2 style={{ fontSize: isMobile ? '3.5rem' : '5.7rem', marginBottom: '1.1rem', fontFamily: "'Staatliches', sans-serif", lineHeight: '1' }}>
          <span>ABOUT</span>{' '}
          <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontWeight: 400 }}>ME</span>
        </h2>
      </div>
      <div style={aboutContentStyle} className="interactive">
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#dddddd' }}>
          Hello, I'm Rithin K Varghese, the developer and founder of rk-studio. I established rk-studio because I believe your website should be an engine for growth, not a bottleneck. When you partner with me, you work directly with the engineer—bypassing agency complexity for focused, dedicated expertise.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#dddddd' }}>
          My foundation is rooted in logic: as a final-year Electronics and Computer Science student at St. Joseph, I translate complex business requirements into efficient, secure, and scalable web architecture. My work centers on High-Performance Architecture, scalability, and commerce. I specialize in building solutions that are not just visually stunning, but functionally superior, focusing on blazing-fast load times, Custom APIs to handle unique business logic, and resilient E-commerce Solutions designed for conversion.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#dddddd' }}>
          Driven by a commitment to craftsmanship, I bring a unique attention to detail and aesthetic sensibility to every project.
        </p>
      </div>
      <div id="contact" style={footerContainerStyle} className="interactive">
        <h2 style={{ fontSize: isMobile ? '18vw' : '13vw', fontFamily: "'Staatliches', sans-serif", color: '#111', lineHeight: '2', margin: isMobile ? '0 0 2rem 0' : '0 0 5.5rem 0' }}>
          LET'S WORK{' '}
          <span style={{ fontFamily: "'Stint Ultra Condensed', serif", fontWeight: 200 }}>
            TOGETHER
          </span>
        </h2>
        
        <div style={{ position: isMobile ? 'relative' : 'absolute', bottom: isMobile ? 'auto' : '5rem', right: isMobile ? 'auto' : '5rem', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: isMobile ? '2rem' : '15rem', justifyContent: isMobile ? 'center' : 'flex-end', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '2rem' : '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', gap: '0.5rem' }}>
            <h3 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '2.5rem', color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', gap: '0.5rem' }}>
              <a href="mailto:rithink604@gmail.com" className="email-reveal-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                <span className="email-hidden-text">rithink604@gmail.com</span>
                <span>Mail</span>
              </a>
              <a href="tel:+918086162298" className="email-reveal-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                <span className="email-hidden-text">+91 8086162298</span>
                <span>Phone</span>
              </a>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', gap: '0.5rem' }}>
            <h3 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '2.5rem', color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Socials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', gap: '0.5rem' }}>
              <a href="#" className="slot-machine-container" style={{ color: '#111', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontSize: '1rem' }}>
                {'Instagram'.split('').map((char, i) => (
                  <span key={i} className="slot-machine-char" data-text={char} style={{ '--delay': `${i * 0.03}s` } as React.CSSProperties}>
                    <span>{char}</span>
                  </span>
                ))}
              </a>
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
        <div ref={footerTextRef} className="footer-text-anim" style={{ position: 'absolute', bottom: '.5rem', left: '55%', right: '3rem', opacity: 0, transform: 'translateX(-50px)' }}>
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
          <Interface />
        </ScrollControls>
      </Canvas>
    </div>
  );
};

export default GlobeCanvas;