import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import loadingGif from './styles/loading.gif';

// Message 컴포넌트
const Message = ({ text, user, typing }) => {
  return (
    <div className={`message-container ${user ? 'user' : 'bot'} ${typing ? 'typing' : ''}`}>
      <div className={`${user ? 'user-image' : 'bot-image'}`}></div>
      <div className={`message ${user ? 'user' : 'bot'} ${typing ? 'typing' : ''}`}>
        {typing ? (
          <div className="typing-indicator">
            <img src={loadingGif} alt="로딩 중" className="loading-image" />            
            <p>{typing ? '' : text}</p>
          </div>
        ) : (
          <p>{text}</p>
        )}
      </div>
    </div>
  );
};

// ChatApp 컴포넌트
const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
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
    setInputValue('');
    setIsDisabled(true);
    setIsTyping(true);
    setMessages((prevMessages) => [...prevMessages, { text: '', user: false, typing: true }]);
    scrollToBottom();

    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: message,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const botMessage = response.data.message;
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { text: botMessage, user: false, typing: false }
      ]);
    } catch (error) {
      console.error('Error fetching the chat response:', error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { text: 'Error fetching the chat response', user: false, typing: false }
      ]);
    } finally {
      setIsDisabled(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'txt') {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'txt 확장자 파일만 받습니다.', user: false }
        ]);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:3001/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const res_message = response.data.message;
        const res_fileId = response.data.fileId;
        console.log(`File ID: ${res_fileId}`);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: res_message, user: false }
        ]);
      } catch (error) {
        console.error('Error uploading the file:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Error uploading the file.', user: false }
        ]);
      }
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message key={index} text={message.text} user={message.user} typing={message.typing} />
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
            disabled={isDisabled}
          />
        </form>
        <button className="send-button" onClick={handleSubmit} disabled={isDisabled}>
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
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const handleStart = async () => {
    const startButton = document.querySelector('.start-button');
    startButton.classList.add('loading');
    startButton.textContent = "";
  
    try {
      await axios.post('http://localhost:3001/api/chat_start', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
    // 2초 대기
    setTimeout(() => {
      startButton.classList.remove('loading');
      setIsOverlayVisible(false);
    }, 2000);
    } catch (error) {
      console.error('Error starting the chat:', error);
      startButton.classList.remove('loading');
      startButton.textContent = "시작";
    }
  };

  return (
    <div className="App">
      {isOverlayVisible && (
        <div className="overlay">
          <button className="start-button" onClick={handleStart}>시작</button>
        </div>
      )}
      <div className="ipad-frame">
        <ChatApp />
      </div>
    </div>
  );
};

export default App; // App 컴포넌트 내보내기
