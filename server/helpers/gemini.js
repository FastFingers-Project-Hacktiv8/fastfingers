const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const generateRandomWordsByAi = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate exactly 60 random English words suitable for a typing test. Only common words separated by spaces. No punctuation, numbers, or special characters.`,
  });

  // Clean up the text
  const cleanedText = response.text
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  console.log("AI generated text:", cleanedText);
  return cleanedText;
};

module.exports = { generateRandomWordsByAi };
