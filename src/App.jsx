import React, { useState } from 'react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { 
  MainContainer, 
  ChatContainer, 
  MessageList, 
  Message, 
  MessageInput,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react'

const COHERE_API_URL = 'https://api.cohere.ai/v1/chat'

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello! I'm your AI assistant. How can I help you today?",
      sentTime: "just now",
      sender: "ChatBot",
      direction: "incoming"
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    }

    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    setIsTyping(true)

    await processMessageToCohereAPI(newMessages)
  }

  const processMessageToCohereAPI = async (chatMessages) => {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY || process.env.COHERE_API_KEY

    if (!apiKey) {
      const errorMessage = {
        message: "Please set your Cohere API key in the .env file as COHERE_API_KEY",
        sender: "ChatBot",
        direction: "incoming"
      }
      setMessages(prevMessages => [...prevMessages, errorMessage])
      setIsTyping(false)
      return
    }

    const userMessages = chatMessages
      .filter(m => m.direction === 'outgoing')
      .map(m => ({ role: 'USER', message: m.message }))

    try {
      const response = await fetch(COHERE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          message: userMessages[userMessages.length - 1].message,
          chat_history: userMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            message: msg.message
          })),
          max_tokens: 500
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const cohereMessage = {
        message: data.text || "Sorry, I couldn't process your request.",
        sender: "ChatBot",
        direction: "incoming"
      }

      setMessages(prevMessages => [...prevMessages, cohereMessage])
    } catch (error) {
      console.error('Error calling Cohere API:', error)
      const errorMessage = {
        message: "Sorry, I encountered an error. Please try again.",
        sender: "ChatBot",
        direction: "incoming"
      }
      setMessages(prevMessages => [...prevMessages, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "100vh" }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatBot is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput 
              placeholder="Type message here..." 
              onSend={handleSend}
              attachButton={false}
            />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App