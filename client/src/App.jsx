import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/history');
      setHistory(res.data.reverse()); // Yeniler üstte
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/chat', { userMessage: input });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.botReply }]);
      fetchHistory();
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Hata oluştu!" }]);
    } finally { setLoading(false); }
  };

  const startNewChat = () => {
    setMessages([{ role: 'bot', text: 'Hello! Let\'s start a new lesson. What sentence should we convert today?' }]);
  };

  const loadFromHistory = (item) => {
    setMessages([{ role: 'user', text: item.user }, { role: 'bot', text: item.bot }]);
  };

  return (
    <div className="main-wrapper">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📜 History</h2>
          <button className="new-chat-btn" onClick={startNewChat} title="New Chat">+</button>
        </div>
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
              <p className="hist-q">{item.user.substring(0, 35)}...</p>
              <span className="hist-date">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="app-container">
        <div className="header"><h1>🐟 Tuna Chat AI Agent</h1></div>
        <div className="chat-window">
          {messages.length === 0 && <p className="welcome-msg">Welcome! Write a direct speech sentence to begin.</p>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>{msg.text}</div>
          ))}
          {loading && <div className="message bot">Teacher is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type something..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;