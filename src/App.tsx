// --- MAIN APP COMPONENT --
import React, { type FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence,type Variants } from 'framer-motion';
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

const marqueeVariants: Variants = {
  scroll: {
    x: ["-25%", "0%"], // Moves Left to Right
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 20, // Lower this number to make it faster
      ease: "linear",
    },
  },
};

const App: FC = () => {

  const text = "create design develop deploy debug innovate";

  const [isWebDevVisible, setIsWebDevVisible] = useState(false);
  const [isStudioVisible, setIsStudioVisible] = useState(false);
  const [isStudioMovedToTop, setIsStudioMovedToTop] = useState(false);
  const [isGlobeZoomed, setIsGlobeZoomed] = useState(false);

 const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: "easeInOut" as const // Added 'as const' here
    },
  },
  exit: {
    opacity: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeInOut" as const // Added 'as const' here
    },
   },
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) { // Scrolling down
      if (!isStudioVisible) {
        setIsStudioVisible(true);
      } else {
        setIsGlobeZoomed(false); // Zoom out
      }
    } else if (e.deltaY < 0) { // Scrolling up
      if (isStudioVisible && isStudioMovedToTop) {
        setIsGlobeZoomed(true); // Zoom in
      }
    }
  };

  useEffect(() => {
    if (isStudioVisible && !isStudioMovedToTop) {
      const timer = setTimeout(() => {
        setIsStudioMovedToTop(true);
      }, 2500); // Delay to allow slot machine animation to finish

      return () => clearTimeout(timer);
    }
  }, [isStudioVisible, isStudioMovedToTop]);

  return (
    <>
      {/* Import fonts from Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;900&family=Playfair+Display:ital,wght@1,700&display=swap');
          html, body {
            overflow: hidden;
          }
        `}
      </style>
      <div className="relative h-screen">
        <AnimatePresence initial={false}>
          {!isWebDevVisible ? (
            <motion.div
              key="marquee"
              onClick={() => setIsWebDevVisible(true)}
              className="absolute inset-0 w-screen h-screen flex items-center bg-white cursor-pointer"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CursorFollower />
              <Stars color="black" />
              <div className="w-full whitespace-nowrap overflow-hidden">
                <motion.h1
                  className="inline-block text-9xl font-semibold text-black select-none"
                  variants={marqueeVariants}
                  animate="scroll"
                  style={{ willChange: 'transform' }}
                >
                  {text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
                </motion.h1>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="webdev"
              className={`absolute inset-0 w-screen h-screen flex bg-black text-white font-['Inter'] transition-all duration-1000 ease-in-out ${
                isStudioMovedToTop
                  ? "items-start justify-start p-8 md:p-12"
                  : "justify-center items-center"
              }`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onWheel={handleWheel}
              layout
            >
              <Stars color="white" />
              <AnimatePresence mode="wait">
                {!isStudioVisible ? (
                  <motion.h1
                    key="webdev-text"
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-baseline text-9xl"
                  >
                    <span className="font-extralight">WEB</span>
                    <span className="font-['Playfair_Display'] italic font-bold ml-4">-developer</span>
                  </motion.h1>
                ) : (
                  <motion.h1
                    key="rk-studio-text"
                    className={`flex items-baseline ${isStudioMovedToTop ? "text-2xl" : "text-9xl"}`}
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <SlotMachineText text="RK" className="font-extralight" />
                    <SlotMachineText text=" -studio" className="font-['Playfair_Display'] italic font-bold ml-4" />
                  </motion.h1>
                )}
              </AnimatePresence>
              {isStudioMovedToTop && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <GlobeCanvas isZoomed={isGlobeZoomed} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default App;
