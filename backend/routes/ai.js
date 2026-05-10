const express = require('express');
const router = express.Router();
const axios = require('axios');

// Groq Config
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Groq API Key not configured on server' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const response = await axios.post(GROQ_API_URL, {
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.5,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Groq Backend Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'AI Error',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
