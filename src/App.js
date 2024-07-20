import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Message 컴포넌트
const Message = ({ text, user }) => {
  return (
    <div className={`message-container ${user ? 'user' : 'bot'}`}>
      <div className={`${user ? 'user-image' : 'bot-image'}`}></div>
      <div className={`message ${user ? 'user' : 'bot'}`}>
        <p>{text}</p>
      </div>
    </div>
  );
};

// ChatApp 컴포넌트
const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    setMessages((prevMessages) => [...prevMessages, { text: message, user: true }]);

    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: message,
        max_tokens: 150,
      }, {
        headers: {
          'Authorization': `sk-`,
          'Content-Type': 'application/json'
        }
      });

      const botMessage = response.data.choices[0].text.trim();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botMessage, user: false }
      ]);
    } catch (error) {
      console.error('Error fetching the chat response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Error fetching the chat response', user: false }
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File selected: ${file.name}`);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message key={index} text={message.text} user={message.user} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button className="attach-button" onClick={() => document.getElementById('file-upload').click()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" fillRule="evenodd" d="M9 7a5 5 0 0 1 10 0v8a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v6a5 5 0 0 0 10 0V7a3 3 0 1 0-6 0v8a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v6a3 3 0 1 1-6 0z" clipRule="evenodd"></path>
          </svg>
        </button>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
          />
        </form>
        <button className="send-button" onClick={handleSubmit}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" className="icon-2xl">
            <path fill="currentColor" fillRule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// App 컴포넌트
const App = () => {
  return (
    <div className="App">
      <div className="ipad-frame">
        <ChatApp /> {/* ChatApp 컴포넌트 사용 */}
      </div>
    </div>
  );
};

export default App;  // App 컴포넌트 내보내기
