import { useState, useEffect, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity?: number;
}

const generateStaticStars = (
  count: number,
  width: number,
  height: number
): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.4,
  }));
};

const Stars = ({ color }: { color: 'white' | 'black' }) => {
  const [trailStars, setTrailStars] = useState<Star[]>([]);
  const [staticStars, setStaticStars] = useState<Star[]>([]);
  const [clickStars, setClickStars] = useState<Star[]>([]);
  const [showScrollToExplore, _setShowScrollToExplore] = useState(true);
  const starId = useRef(0);
  const lastMoveTime = useRef(0);
  const throttleInterval = 20; // ms

  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0
  );
  const mouseY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const now = performance.now();
      if (now - lastMoveTime.current < throttleInterval) return;
      lastMoveTime.current = now;

      setTrailStars((prevStars) => [
        ...prevStars,
        {
          id: starId.current++,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 10 + 2,
        },
      ]);
    };

    const handlePointerDown = (e: PointerEvent) => {
      setClickStars((prevStars) => [
        ...prevStars,
        {
          id: starId.current++,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 50 + 20,
        },
      ]);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setStaticStars(
      generateStaticStars(300, window.innerWidth * 1.2, window.innerHeight * 1.2)
    );
  }, []);

  const handleAnimationComplete = (id: number) => {
    setTrailStars((prevStars) => prevStars.filter((star) => star.id !== id));
  };

  const handleCompleteClickStar = (id: number) => {
    setClickStars((prevStars) => prevStars.filter((star) => star.id !== id));
  };

  const parallaxX = useTransform(mouseX, [0, window.innerWidth], [15, -15]);
  const parallaxY = useTransform(mouseY, [0, window.innerHeight], [15, -15]);

  const textStyle: CSSProperties = {
    color: color === "white" ? "white" : "black",
    backgroundColor: color === "white" ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.1)",
    padding: "8px 12px",
    borderRadius: "8px",
    pointerEvents: "none",
    position: "absolute",
    transform: "translateX(15px) translateY(15px)",
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  };

  return (
    <>
      {/* Parallax background stars */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {staticStars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${
              color === "white" ? "bg-white" : "bg-black"
            } rounded-full`}
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ))}
      </motion.div>

      {/* Mouse trail stars */}
      <div className="fixed inset-0 pointer-events-none">
        {trailStars.map((star) => (
          <motion.div
            key={star.id}
            className={`absolute ${
              color === "white" ? "bg-white" : "bg-black"
            } rounded-full`}
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() => handleAnimationComplete(star.id)}
          />
        ))}
      </div>

      {/* Click stars */}
      <div className="fixed inset-0 pointer-events-none">
        {clickStars.map((star) => (
          <motion.div
            key={star.id}
            className={`absolute ${
              color === "white" ? "bg-white" : "bg-black"
            } rounded-full`}
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => handleCompleteClickStar(star.id)}
          />
        ))}
      </div>

      {/* Scroll to explore text */}
      <div className="fixed inset-0 pointer-events-none">
        <AnimatePresence>
          {showScrollToExplore && color === "white" && (
            <motion.div
              style={{ ...textStyle, x: mouseX, y: mouseY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              scroll to explore
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Stars;
