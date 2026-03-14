import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ProcessingDisplay({ capturedImageUrl, resultUrl, onAnimationComplete }) {
  const [rotateY, setRotateY] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    let timeout, interval;
    if (!resultUrl) {
      // Start the first flip almost immediately
      timeout = setTimeout(() => {
        setRotateY((prev) => prev + 180);
      }, 100);

      // Continue flipping repeatedly
      interval = setInterval(() => {
        setRotateY((prev) => prev + 180);
      }, 900);
    } else {
      // When result arrives, settle on the back side (odd multiple of 180)
      setRotateY((prev) => {
        let next = prev + 180;
        if (Math.abs(next / 180) % 2 === 0) {
          next += 180;
        }
        return next;
      });
      setIsFinishing(true);
    }
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [resultUrl]);

  return (
    <div className="w-full h-full perspective-1000">
      <motion.div
        className="w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (isFinishing) {
            onAnimationComplete();
          }
        }}
      >
        {/* --- FRONT SIDE: The blurring captured image --- */}
        <div className="absolute w-full h-full backface-hidden">
          <motion.img
            src={capturedImageUrl}
            alt="Processing Front"
            className="w-full h-full object-contain"
            // This animation creates the progressive blur effect
            animate={{ filter: ["blur(0px)", "blur(16px)"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "mirror", // Goes from blur(0) -> blur(16) -> blur(0)
              ease: "easeInOut",
            }}
          />
        </div>

        {/* --- BACK SIDE: The final result image or bouncing captured image --- */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          {resultUrl ? (
            <img
              src={resultUrl}
              alt="Result"
              className="w-full h-full object-contain"
            />
          ) : (
            <motion.img
              src={capturedImageUrl}
              alt="Processing Back"
              className="w-full h-full object-contain"
              animate={{ filter: ["blur(0px)", "blur(16px)"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}