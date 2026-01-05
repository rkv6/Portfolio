// --- MAIN APP COMPONENT ---

import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Stars from './Stars';
import SlotMachineText from './SlotMachineText';
import GlobeCanvas from './Globe';

const CursorFollower = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 pointer-events-none text-black text-sm font-['Inter'] z-50 font-medium"
      style={{ willChange: 'transform' }}
    >
      ( CLICK TO EXPLORE )
    </div>
  );
};

const App: FC = () => {
  const text = "create design develop deploy debug innovate";
  
  // State Management
  const [isWebDevVisible, setIsWebDevVisible] = useState(false);
  const [isStudioVisible, setIsStudioVisible] = useState(false);
  const [isStudioMovedToTop, setIsStudioMovedToTop] = useState(false);
  const [isGlobeZoomed, setIsGlobeZoomed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // New: prevents scroll spam

  // 1. Memoized Scroll Handler
  const handleNavigation = useCallback((direction: 'down' | 'up') => {
    if (isAnimating) return;

    if (direction === 'down') {
      if (!isWebDevVisible) {
        setIsWebDevVisible(true);
      } else if (!isStudioVisible) {
        setIsStudioVisible(true);
        // Add a small lock to prevent skipping states
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      } else {
        setIsGlobeZoomed(false);
      }
    } else {
      if (isStudioVisible && isStudioMovedToTop) {
        setIsGlobeZoomed(true);
      }
    }
  }, [isWebDevVisible, isStudioVisible, isStudioMovedToTop, isAnimating]);

  // 2. Production-safe Event Listener
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return; // Threshold for trackpads
      handleNavigation(e.deltaY > 0 ? 'down' : 'up');
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [handleNavigation]);

  // 3. Slot Machine Transition logic
  useEffect(() => {
    if (isStudioVisible && !isStudioMovedToTop) {
      const timer = setTimeout(() => {
        setIsStudioMovedToTop(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isStudioVisible, isStudioMovedToTop]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;900&family=Playfair+Display:ital,wght@1,700&display=swap');
          body { margin: 0; overflow: hidden; }
        `}
      </style>

      <AnimatePresence mode="wait">
        {!isWebDevVisible ? (
          <motion.div
            key="marquee"
            className="absolute inset-0 flex items-center cursor-pointer"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setIsWebDevVisible(true)}
          >
            <CursorFollower />
            <Stars color="black" />
            <div className="w-full whitespace-nowrap overflow-hidden">
              <motion.h1 
                className="inline-block text-9xl font-semibold text-black select-none"
                animate={{ x: [0, -1300] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                {text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
              </motion.h1>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="webdev"
            className={`absolute inset-0 flex transition-all duration-1000 bg-black text-white font-['Inter'] ${
              isStudioMovedToTop ? "items-start p-12" : "items-center justify-center"
            }`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Stars color="white" />
            <AnimatePresence mode="wait">
              {!isStudioVisible ? (
                <motion.h1 
                  key="webdev-text" 
                  exit={{ opacity: 0, y: -20 }}
                  className="text-9xl flex items-baseline"
                >
                  <span className="font-extralight">WEB</span>
                  <span className="font-['Playfair_Display'] italic font-bold ml-4">-developer</span>
                </motion.h1>
              ) : (
                <motion.h1
                  key="rk-studio-text"
                  layout
                  className={`flex items-baseline ${isStudioMovedToTop ? "text-2xl" : "text-9xl"}`}
                >
                  <SlotMachineText text="RK" className="font-extralight" />
                  <SlotMachineText text=" -studio" className="font-['Playfair_Display'] italic font-bold ml-4" />
                </motion.h1>
              )}
            </AnimatePresence>

            {isStudioMovedToTop && (
              <motion.div 
                className="absolute inset-0 z-[-1]"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
              >
                <GlobeCanvas />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
