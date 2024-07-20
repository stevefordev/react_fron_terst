import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';  // 스타일 파일
import App from './App';  // App 컴포넌트 가져오기

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
