import React from "react";
import { motion, type Variants } from "framer-motion";

interface SlotMachineTextProps {
  text: string;
  className?: string;
}

const SlotMachineText: React.FC<SlotMachineTextProps> = ({ text, className }) => {
  return (
    <div className={`flex relative ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " " || char === "-") {
          return <span key={index}>&nbsp;{char === "-" ? "-" : ""}</span>;
        }

        const variants: Variants = {
          initial: { y: "130%" },
          animate: { 
            y: 0,
            transition: {
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1] as const,
              delay: index * 0.1,
            },
          },
        };

        // Each letter slides up from behind its own mask. The mask is padded, with matching negative
        // margins, so tall capitals, descenders and the overhang of italic letters are never clipped.
        return (
          <div key={index} className="relative flex flex-col overflow-hidden leading-[1.2] px-[0.08em] -mx-[0.08em] py-[0.12em] -my-[0.12em]">
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