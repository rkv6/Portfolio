// --- MAIN APP COMPONENT --
import React, { type FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence,type Variants } from 'framer-motion';
import Stars from './Stars';
import SlotMachineText from './SlotMachineText';
import GlobeCanvas from './Globe';
import { useIsTouch } from './useIsTouch';

const CursorFollower = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // No cursor on touch screens; the tap hint at the bottom of the screen replaces it.
  if (isTouch) return null;

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
  const isTouch = useIsTouch();
  const touchStartY = useRef<number | null>(null);

  // Intro steps can be advanced by wheel (original), tap/click, swipe up, keyboard, or the Enter button.
  const enterStudio = () => setIsStudioVisible(true);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startY = touchStartY.current;
    const endY = e.changedTouches[0]?.clientY;
    touchStartY.current = null;
    if (startY !== null && endY !== undefined && startY - endY > 40) {
      enterStudio(); // swipe up
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || !['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) return;
      if (!isWebDevVisible) {
        e.preventDefault();
        setIsWebDevVisible(true);
      } else if (!isStudioVisible) {
        e.preventDefault();
        setIsStudioVisible(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isWebDevVisible, isStudioVisible]);

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
      {/* Fonts (Inter, Playfair Display) are loaded from index.html */}
      <style>
        {`
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
              role="button"
              tabIndex={0}
              aria-label="Enter portfolio"
              className="absolute inset-0 w-screen h-screen flex items-center bg-white cursor-pointer"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CursorFollower />
              {isTouch && (
                <p className="absolute bottom-10 left-0 right-0 text-center text-xs uppercase tracking-[0.25em] text-black/70 font-['Inter'] font-medium pointer-events-none">
                  Tap to enter
                </p>
              )}
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
              onClick={() => { if (!isStudioVisible) enterStudio(); }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              layout
            >
              <Stars color="white" />
              <AnimatePresence mode="wait">
                {!isStudioVisible ? (
                  <motion.h1
                    key="webdev-text"
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-baseline whitespace-nowrap text-[11vw] lg:text-9xl"
                  >
                    <span className="font-extralight">WEB</span>
                    <span className="font-['Playfair_Display'] italic font-bold ml-4">-developer</span>
                  </motion.h1>
                ) : (
                  <motion.h1
                    key="rk-studio-text"
                    className={`flex items-baseline ${isStudioMovedToTop ? "text-2xl" : "text-[16vw] lg:text-9xl"}`}
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <SlotMachineText text="RK" className="font-extralight" />
                    <SlotMachineText text=" -studio" className="font-['Playfair_Display'] italic font-bold ml-4" />
                  </motion.h1>
                )}
              </AnimatePresence>
              {!isStudioVisible && (
                <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); enterStudio(); }}
                    className="rounded border border-white/70 px-8 py-3 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Enter ↓
                  </button>
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/50 pointer-events-none">
                    {isTouch ? 'Tap anywhere or swipe up' : 'Scroll, click or press Enter'}
                  </p>
                </div>
              )}
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
