import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const keyboardLayout = [
  [
    { key: "escape", label: "esc", size: "normal" },
    { key: "1", label: "1", size: "normal" },
    { key: "2", label: "2", size: "normal" },
    { key: "3", label: "3", size: "normal" },
    { key: "4", label: "4", size: "normal" },
    { key: "5", label: "5", size: "normal" },
    { key: "6", label: "6", size: "normal" },
    { key: "7", label: "7", size: "normal" },
    { key: "8", label: "8", size: "normal" },
    { key: "9", label: "9", size: "normal" },
    { key: "0", label: "0", size: "normal" },
    { key: "-", label: "-", size: "normal" },
    { key: "=", label: "=", size: "normal" },
    { key: "backspace", label: "back", size: "large" },
  ],
  [
    { key: "tab", label: "tab", size: "medium" },
    { key: "q", label: "q", size: "normal" },
    { key: "w", label: "w", size: "normal" },
    { key: "e", label: "e", size: "normal" },
    { key: "r", label: "r", size: "normal" },
    { key: "t", label: "t", size: "normal" },
    { key: "y", label: "y", size: "normal" },
    { key: "u", label: "u", size: "normal" },
    { key: "i", label: "i", size: "normal" },
    { key: "o", label: "o", size: "normal" },
    { key: "p", label: "p", size: "normal" },
    { key: "[", label: "[", size: "normal" },
    { key: "]", label: "]", size: "normal" },
    { key: "\\", label: "\\", size: "medium" },
  ],
  [
    { key: "capslock", label: "caps", size: "large" },
    { key: "a", label: "a", size: "normal" },
    { key: "s", label: "s", size: "normal" },
    { key: "d", label: "d", size: "normal" },
    { key: "f", label: "f", size: "normal" },
    { key: "g", label: "g", size: "normal" },
    { key: "h", label: "h", size: "normal" },
    { key: "j", label: "j", size: "normal" },
    { key: "k", label: "k", size: "normal" },
    { key: "l", label: "l", size: "normal" },
    { key: ";", label: ";", size: "normal" },
    { key: "'", label: "'", size: "normal" },
    { key: "enter", label: "enter", size: "large" },
  ],
  [
    { key: "shiftleft", label: "shift", size: "xlarge" },
    { key: "z", label: "z", size: "normal" },
    { key: "x", label: "x", size: "normal" },
    { key: "c", label: "c", size: "normal" },
    { key: "v", label: "v", size: "normal" },
    { key: "b", label: "b", size: "normal" },
    { key: "n", label: "n", size: "normal" },
    { key: "m", label: "m", size: "normal" },
    { key: ",", label: ",", size: "normal" },
    { key: ".", label: ".", size: "normal" },
    { key: "/", label: "/", size: "normal" },
    { key: "shiftright", label: "shift", size: "xlarge" },
  ],
  [
    { key: "controlleft", label: "ctrl", size: "medium" },
    { key: "meta", label: "win", size: "medium" },
    { key: "altleft", label: "alt", size: "medium" },
    { key: " ", label: "", size: "space" },
    { key: "altright", label: "alt", size: "medium" },
    { key: "fn", label: "fn", size: "medium" },
    { key: "controlright", label: "ctrl", size: "medium" },
  ],
];

const sizeClasses = {
  normal: "w-6 h-6 text-[8px]",
  medium: "w-8 h-6 text-[8px]",
  large: "w-10 h-6 text-[8px]",
  xlarge: "w-12 h-6 text-[8px]",
  space: "w-20 h-6 text-[8px]",
};

const AnimatedKeyboard = ({ triggerKey }) => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [fakeCpm, setFakeCpm] = useState(0);
  const keyRefs = useRef({});

  // Auto-increase CPM smoothly
  useEffect(() => {
    let current = 0;
    const max = 500;
    const step = 1;
    const interval = setInterval(() => {
      current += step;
      if (current > max) {
        current = 0;
      }
      setFakeCpm(current);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Wave animation
  const animateKeyWave = (pressedKey) => {
    const allKeys = Object.keys(keyRefs.current);
    const pressedIndex = allKeys.indexOf(pressedKey);
    if (pressedIndex === -1) return;

    const hue = Math.floor(Math.random() * 360);
    const glowColor = `hsl(${hue}, 100%, 70%)`;
    const textColor = `hsl(${hue}, 100%, 30%)`;
    const bgColor = `hsl(${hue}, 100%, 95%)`;

    const animateKey = (keyId, delay) => {
      const keyEl = keyRefs.current[keyId];
      if (!keyEl) return;

      setTimeout(() => {
        keyEl.style.transition =
          "transform 0.25s ease, box-shadow 0.3s ease, color 0.3s ease, background-color 0.3s ease";
        keyEl.style.boxShadow = `0 0 8px ${glowColor}`;
        keyEl.style.color = textColor;
        keyEl.style.backgroundColor = bgColor;
        keyEl.style.transform = "scale(1.07)";
        setTimeout(() => {
          keyEl.style.boxShadow = "none";
          keyEl.style.color = "";
          keyEl.style.backgroundColor = "";
          keyEl.style.transform = "scale(1)";
        }, 200);
      }, delay);
    };

    allKeys.forEach((keyId, index) => {
      const distance = Math.abs(index - pressedIndex);
      const delay = distance * 30;
      animateKey(keyId, delay);
    });
  };

  // Trigger on prop key
  useEffect(() => {
    if (triggerKey) {
      const key = triggerKey.toLowerCase();
      setActiveKeys(new Set([key]));
      animateKeyWave(key);
      setTimeout(() => setActiveKeys(new Set()), 150);
    }
  }, [triggerKey]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      {/* CPM Display */}
      <motion.div
        key={fakeCpm}
        className="bg-blue-100 px-4 py-2 rounded-lg border border-blue-300 shadow-sm"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 0.98, 1] }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-blue-800 text-center">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-bold"
          >
            {fakeCpm}
          </motion.div>
          <div className="text-xs opacity-80">CPM</div>
        </div>
      </motion.div>

      {/* Keyboard */}
      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 shadow-md">
        <div className="space-y-1">
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-1">
              {row.map(({ key, label, size }) => {
                const isActive = activeKeys.has(key);
                const keyId = `${key}-${rowIndex}`;
                return (
                  <motion.div
                    layout
                    key={keyId}
                    ref={(el) => (keyRefs.current[key] = el)}
                    className={`
                      ${sizeClasses[size]}
                      bg-white
                      border border-gray-300
                      rounded
                      flex items-center justify-center
                      text-gray-800 font-semibold
                      uppercase
                      select-none
                      transition-all duration-150
                      ${
                        isActive
                          ? "bg-blue-100 border-blue-400 text-blue-700 shadow"
                          : ""
                      }
                    `}
                    animate={{
                      scale: isActive ? 0.95 : 1,
                      y: isActive ? 2 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                  >
                    {label || (key === " " ? "" : key)}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedKeyboard;
