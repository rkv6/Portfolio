import React from "react";
import { motion, type Variants } from "framer-motion";

interface SlotMachineTextProps {
  text: string;
  className?: string;
}

const SlotMachineText: React.FC<SlotMachineTextProps> = ({ text, className }) => {
  return (
    <div className={`flex overflow-hidden relative ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " " || char === "-") {
          return <span key={index}>&nbsp;{char === "-" ? "-" : ""}</span>;
        }

        const variants: Variants = {
          initial: { y: "100%" },
          animate: { 
            y: 0,
            transition: {
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1] as const,
              delay: index * 0.1,
            },
          },
        };

        return (
          <div key={index} className="relative h-[1em] overflow-hidden flex flex-col">
            <motion.span 
              variants={variants} 
              initial="initial" 
              animate="animate"
              className="inline-block"
            >
              {char}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};

export default SlotMachineText;