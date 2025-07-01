const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const generateRandomWordsByAi = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Can you generate random words for typing test about 100 words and only contain words?`,
  });

  // console.log(response.text);

  return response.text;
};

module.exports = generateRandomWordsByAi;
