import { motion } from "framer-motion";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface SlotMachineTextProps {
  text: string;
  className?: string;
}

const SlotMachineText: React.FC<SlotMachineTextProps> = ({ text, className }) => {
  return (
    <div className={`flex overflow-hidden relative ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") {
          return <span key={index}>&nbsp;</span>;
        }

        const variants = {
          initial: { y: "100%" },
          animate: { 
            y: 0,
            transition: {
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.1,
            },
          },
        };

        return (
          <motion.span key={index} variants={variants} initial="initial" animate="animate">
            {char}
          </motion.span>
        );
      })}
    </div>
  );
};

export default SlotMachineText;