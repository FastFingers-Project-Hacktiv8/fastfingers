import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedKeyboard from "./AnimatedKeyboard";

const welcomeMessages = [
  "Get ready... the race is about to begin!",
  "Warm up those fingers — it's typing time!",
  "Speed is key. Accuracy wins.",
  "Type fast. Stay focused. Beat the clock.",
  "Can you break your record today?",
  "Every keystroke counts — go!",
  "Feel the rhythm. Own the race.",
  "Type like lightning, win like a champ!",
  "The keyboard is your racetrack.",
  "3... 2... 1... Type!",
];

const TypingVisualizer = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypedKey, setLastTypedKey] = useState("");

  // Animate typing message letter by letter
  useEffect(() => {
    let timeout;
    let charIndex = 0;

    const typeMessage = () => {
      const message = welcomeMessages[currentMessage];
      if (charIndex <= message.length) {
        setDisplayText(message.slice(0, charIndex));
        setIsTyping(true);
        charIndex++;
        timeout = setTimeout(typeMessage, 60 + Math.random() * 20);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          charIndex = 0;
          setDisplayText("");
          setCurrentMessage((prev) => (prev + 1) % welcomeMessages.length);
        }, 3000);
      }
    };

    typeMessage();
    return () => clearTimeout(timeout);
  }, [currentMessage]);

  // Trigger key animation on real key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();

      setLastTypedKey(key);
      setTimeout(() => setLastTypedKey(""), 100);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Title & subtitle */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          TEST TYPING
        </h1>
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          Real-time Typing Display
        </div>
      </motion.div>

      {/* Typing display */}
      <div className="mb-6 h-16 flex items-center justify-center">
        <motion.div
          key={currentMessage}
          className="text-xl md:text-2xl font-mono text-center max-w-xl text-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span>
            {displayText}
            {isTyping && !lastTypedKey && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-blue-600"
              >
                |
              </motion.span>
            )}
          </span>
        </motion.div>
      </div>

      {/* Keyboard animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnimatedKeyboard triggerKey={lastTypedKey} />
      </motion.div>
    </div>
  );
};

export default TypingVisualizer;
