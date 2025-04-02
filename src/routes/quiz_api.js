const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const genAI = new GoogleGenerativeAI(AIzaSyAVCG2p6PLeDO9HAkDdqjttCj8yYWppd7w);
    
    // Define schema to match expected quiz format
    const schema = {
      type: "object",
      properties: {
        response_code: { type: "number" },
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              difficulty: { type: "string" },
              category: { type: "string" },
              question: { type: "string" },
              correct_answer: { type: "string" },
              incorrect_answers: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["type", "difficulty", "category", "question", "correct_answer", "incorrect_answers"]
          }
        }
      },
      required: ["response_code", "results"]
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const result = await model.generateContent(
      `
        Create 5 quiz questions about ${topic}
        Difficulty: Easy
        Type: Multiple Choice
      `
    );

    const quizData = JSON.parse(result.response.text());
    
    res.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again later.' });
  }
});

module.exports = router;
