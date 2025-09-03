import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const WORKER_API_URL = 'https://cohere-chat-proxy.mzotko.workers.dev'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Yo, what's up? I'm Mykola's budget bot. Ask me something, but keep it quick — no novels, okay? 😎",
      sender: "bot"
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "user"
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsTyping(true)

    await processMessageToCohereAPI([...messages, newMessage])
  }

  const createBotMessage = (content) => ({
    id: Date.now(),
    content,
    sender: "bot"
  })

  const processMessageToCohereAPI = async (chatMessages) => {
    const chatHistory = chatMessages
      .slice(0, -1)
      .map(m => ({ 
        role: m.sender === 'user' ? 'USER' : 'CHATBOT', 
        message: m.content 
      }))

    try {
      const response = await fetch(WORKER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          message: chatMessages[chatMessages.length - 1].content,
          chat_history: chatHistory,
          preamble: `You are BudgetBot, Mykola's quirky AI sidekick running on a free-tier API. You're playful, witty, and self-aware about your budget constraints. Mykola is a coding wizard, and you're here to hype his skills. Use casual lingo like "yo," "vibes," or "fire," and keep responses short, punchy, and fun. Joke about the free API when possible. For complex questions, playfully nudge users to simpler ones. Add easter eggs for inputs like "joke," "Are you human?", or "API" to keep it lively. Mykola, born in Ukraine, long-term resident of Germany. Proud dad of two boys. Holds a Master of Science in Chemistry from Goethe University Frankfurt. Hobbies include sports, cooking, and coffee brewing.`,
          max_tokens: 100
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      setMessages(prev => [...prev, createBotMessage(data.text || "Hmm, I stumbled there. Hit me one more time.")])
    } catch (error) {
      console.error('Error calling Cohere API:', error)
      setMessages(prev => [...prev, createBotMessage("Whoops, budget API hiccup! Quick retry?")])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 focus:outline-none transition-transform duration-200 hover:scale-110 z-50"
        >
          <div className="flex items-center space-x-2">
            <picture>
              <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.webp" type="image/webp" />
              <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.gif" alt="🤖" width="32" height="32" />
            </picture>
            <span className="text-2xl">💬</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-80 h-96 rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden z-40 bg-slate-600">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-slate-800">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-sky-100"><span className="text-lg">🤖</span> Chat Buddy</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:opacity-80 text-sky-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-600">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-700 text-sky-50'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <ReactMarkdown
                      components={{
                        p: ({children}) => <div className="mb-1 last:mb-0">{children}</div>,
                        strong: ({children}) => <strong className="font-bold">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        code: ({children}) => <code className="bg-slate-600 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm bg-slate-700 text-sky-50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-slate-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                maxLength={200}
                className="flex-1 px-3 py-2 border border-sky-300 rounded-md text-sm bg-slate-600 text-sky-50 placeholder-sky-200 placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isTyping}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-indigo-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App