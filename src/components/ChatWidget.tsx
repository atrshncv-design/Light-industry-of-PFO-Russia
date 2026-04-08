'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Здравствуйте! Я ИИ-ассистент по анализу лёгкой промышленности ПФО. Задайте мне вопрос о данных карты — например, о занятости, отгрузке, производительности или специализации регионов.'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<Message[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const newHistory = [...historyRef.current, userMsg]

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      })

      const data = await response.json()
      setIsTyping(false)

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `\u26a0\ufe0f ${data.error}` }])
      } else {
        const assistantMsg: Message = { role: 'assistant', content: data.message }
        historyRef.current = [...newHistory, assistantMsg]
        setMessages(prev => [...prev, assistantMsg])
      }
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: '\u26a0\ufe0f Ошибка соединения. Попробуйте позже.' }])
    }
  }, [input, isTyping])

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="Спросить ИИ-ассистента"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4caf50, #2196f3)',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          cursor: 'pointer',
          zIndex: 10001,
          boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.transform = 'scale(1.1)'
          el.style.boxShadow = '0 6px 28px rgba(33, 150, 243, 0.6)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.transform = 'scale(1)'
          el.style.boxShadow = '0 4px 20px rgba(33, 150, 243, 0.4)'
        }}
      >
        {isOpen ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 96,
          right: 24,
          width: 400,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 600,
          background: '#1e2a3a',
          borderRadius: 16,
          border: '1px solid rgba(76, 175, 80, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontSize: 14,
          animation: 'chatSlideIn 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #1b5e20, #2196f3)',
            color: '#fff',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>ИИ-ассистент ПФО</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>GigaChat · Лёгкая промышленность</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 300,
            maxHeight: 400,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  lineHeight: 1.5,
                  wordWrap: 'break-word',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #4caf50, #388e3c)'
                    : 'rgba(255,255,255,0.08)',
                  color: msg.role === 'user' ? '#fff' : '#e0e0e0',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.role === 'assistant' ? '🤖 ' : ''}{msg.content}
              </div>
            ))}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                borderBottomLeftRadius: 4,
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 7, height: 7, background: '#4caf50', borderRadius: '50%',
                    animation: `typingBounce 1.4s infinite ${i * 0.2}s`,
                  }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            padding: '12px 14px',
            gap: 8,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="Спросите про регион или показатель..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                color: '#fff', cursor: isTyping ? 'not-allowed' : 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isTyping || !input.trim() ? 0.5 : 1,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}
