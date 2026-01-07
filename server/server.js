require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;

// Mesajları JSON dosyasına kaydetme fonksiyonu
const saveToDatabase = (userMsg, botMsg) => {
  const newEntry = {
    id: Date.now(),
    date: new Date().toLocaleString('tr-TR'),
    user: userMsg,
    bot: botMsg
  };
  let history = [];
  if (fs.existsSync('messages.json')) {
    history = JSON.parse(fs.readFileSync('messages.json'));
  }
  history.push(newEntry);
  fs.writeFileSync('messages.json', JSON.stringify(history, null, 2));
};

// API: Konuşma geçmişini getir
app.get('/api/history', (req, res) => {
  if (fs.existsSync('messages.json')) {
    const data = JSON.parse(fs.readFileSync('messages.json'));
    res.json(data);
  } else {
    res.json([]);
  }
});

// API: Chat botu ile iletişim
app.post('/api/chat', async (req, res) => {
  const { userMessage } = req.body;
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are 'Tuna Chat', a specialized AI English Teacher. Your expertise is 'Reported Speech'. Convert sentences and explain rules clearly."
          },
          { role: "user", content: userMessage }
        ]
      },
      { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const botReply = response.data.choices[0].message.content;
    saveToDatabase(userMessage, botReply);
    res.json({ botReply });
  } catch (error) {
    res.status(500).json({ error: "API Hatası" });
  }
});

app.listen(3001, () => console.log('✅ Server 3001 portunda hazır!'));