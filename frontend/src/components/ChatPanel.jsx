import { useState, useRef, useEffect } from 'react'
import { THEME } from '../theme'

const SUGGESTED_QUESTIONS = [
  'Why is this phrase difficult to translate?',
  'What historical origin does it have?',
  'How would a native English speaker say this?',
  'Is this phrase still common today?',
  'What social norm does this reflect?',
  'What would happen if translated literally?',
]

export default function ChatPanel({ text, language }) {
  const t = THEME[language]
  const [messages, setMessages] = useState([])   // {role: 'user'|'ai', text: string}
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(question) {
    const q = (question ?? input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, question: q }),
      })
      const text_body = await res.text()
      let answer
      if (res.ok) {
        try {
          const data = JSON.parse(text_body)
          answer = data.answer || text_body
        } catch {
          answer = text_body
        }
      } else {
        try {
          const err = JSON.parse(text_body)
          answer = `Error: ${err.detail || res.statusText}`
        } catch {
          answer = `Error ${res.status}: ${res.statusText}`
        }
      }
      setMessages(prev => [...prev, { role: 'ai', text: answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `Network error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-2xl p-6 ${t.chatBox}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">💡</span>
        <span className={`text-sm font-bold uppercase tracking-widest ${t.chatHeader}`}>
          Explore Further
        </span>
      </div>

      {/* Suggested questions — only shown when chat is empty */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${t.chatSuggestBtn}`}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Message thread */}
      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed border ${
                m.role === 'user' ? t.chatUserBubble : t.chatAiBubble
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className={`px-4 py-2.5 rounded-xl text-sm border ${t.chatAiBubble}`}>
                <span className="animate-pulse">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a follow-up question…"
          disabled={loading}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors ${t.chatInput}`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${t.chatSendBtn}`}
        >
          Ask
        </button>
      </form>
    </div>
  )
}
