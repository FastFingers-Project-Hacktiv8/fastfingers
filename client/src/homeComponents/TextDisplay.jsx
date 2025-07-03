export default function TextDisplay({ text, userInput, gameStatus }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
      <div className="font-mono text-lg leading-7 select-none break-words whitespace-pre-wrap overflow-hidden">
        {text.split("").map((char, i) => {
          let className =
            "transition-colors duration-200 relative inline-block";

          if (i < userInput.length) {
            className +=
              userInput[i] === char
                ? " text-green-600 bg-green-50 border-b border-green-300"
                : " text-red-600 bg-red-50 border-b border-red-300";
          } else if (i === userInput.length && gameStatus === "playing") {
            className += " bg-blue-500 text-white animate-pulse";
          } else {
            className += " text-gray-500";
          }

          return (
            <span
              key={i}
              className={`${className} px-0.5 py-0.5 rounded-sm`}
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </div>
    </div>
  );
}
