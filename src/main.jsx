import './style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatWidget from './App.jsx'

ReactDOM.createRoot(document.getElementById('chat-widget')).render(
  <React.StrictMode>
    <ChatWidget />
  </React.StrictMode>,
)
