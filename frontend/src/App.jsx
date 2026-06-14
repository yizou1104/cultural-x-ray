import { useState, useEffect, useRef } from 'react'
import { THEME } from './theme'
import TokenDisplay from './components/TokenDisplay'
import ExplanationCard from './components/ExplanationCard'
import TranslationPanel from './components/TranslationPanel'
import PhraseContext from './components/PhraseContext'
import EnglishEquivalent from './components/EnglishEquivalent'
import ChatPanel from './components/ChatPanel'

export default function App() {
  const [language, setLanguage] = useState('chinese')
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('idle')         // 'idle' | 'generating' | 'done'
  const [pendingTokens, setPendingTokens] = useState([])   // string[] from segmentation
  const [readyTokens, setReadyTokens] = useState([])       // (TokenObject|null)[]
  const [overall, setOverall] = useState(null)              // literal/semantic/phrase_context
  const [tokenScores, setTokenScores] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const [error, setError] = useState(null)
  const [examples, setExamples] = useState([])
  const [tokenGroups, setTokenGroups] = useState([])
  const [englishEquiv, setEnglishEquiv] = useState(null)
  const [loadingEquiv, setLoadingEquiv] = useState(false)

  const userSelectedRef = useRef(false)

  const t = THEME[language]

  useEffect(() => {
    fetch('/examples').then(r => r.json()).then(setExamples).catch(() => {})
  }, [])

  function reset() {
    setPendingTokens([])
    setReadyTokens([])
    setOverall(null)
    setHighlightedIndices(new Set())
    setActiveIndex(null)
    setError(null)
    setPhase('idle')
    setTokenGroups([])
    setTokenScores(null)
    setEnglishEquiv(null)
    setLoadingEquiv(false)
    userSelectedRef.current = false
  }

  function handleSelect(i) {
    userSelectedRef.current = true
    setActiveIndex(i)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || phase === 'generating') return
    reset()
    setPhase('generating')

    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') { setPhase('done'); break }

          const event = JSON.parse(payload)

          if (event.type === 'tokens') {
            // Can arrive twice: once for jieba, once for AI-refined version
            setPendingTokens(event.tokens)
            setTokenGroups(event.groups ?? event.tokens.map((_, i) => i))
            setReadyTokens(new Array(event.tokens.length).fill(null))
            setTokenScores(null)
            if (!userSelectedRef.current) setActiveIndex(null)
          } else if (event.type === 'token') {
            setReadyTokens(prev => {
              const next = [...prev]
              next[event.index] = event.data
              return next
            })
            if (!userSelectedRef.current) setActiveIndex(event.index)
          } else if (event.type === 'overall') {
            setOverall(event.data)
          } else if (event.type === 'scores') {
            setTokenScores(event.scores)
          } else if (event.type === 'error') {
            throw new Error(event.message)
          }
        }
      }
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    }
  }

  async function handleEnglishEquiv() {
    setLoadingEquiv(true)
    try {
      const res = await fetch('/english_equivalent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })
      if (!res.ok) throw new Error('Failed')
      setEnglishEquiv(await res.json())
    } catch {
      // silently ignore — button remains visible for retry
    } finally {
      setLoadingEquiv(false)
    }
  }

  function loadExample(ex) {
    setLanguage(ex.language)
    setText(ex.text)
    reset()
  }

  const isGenerating = phase === 'generating'
  const readyCount = readyTokens.filter(t => t !== null).length
  const totalCount = pendingTokens.length
  const activeToken = activeIndex !== null ? readyTokens[activeIndex] : null

  // Chinese decorative seal characters shown as watermark
  const ChineseSeal = () => (
    <div className="absolute top-8 right-8 opacity-5 select-none pointer-events-none text-amber-400"
         style={{ fontFamily: t.titleFont, fontSize: '120px', lineHeight: 1 }}>
      文
    </div>
  )

  // Hindi decorative mandala shown as watermark
  const HindiMandala = () => {
    const cx = 90, cy = 90, radii = [80, 62, 46, 30, 16]
    const spokes = [0,30,60,90,120,150,180,210,240,270,300,330]
    const petals = [0,45,90,135,180,225,270,315]
    return (
      <div className="absolute top-4 right-4 opacity-[0.06] select-none pointer-events-none">
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          {radii.map(r => <circle key={r} cx={cx} cy={cy} r={r} stroke="#ea580c" strokeWidth="0.8"/>)}
          {spokes.map(deg => (
            <line key={deg}
              x1={cx + 16 * Math.cos(deg * Math.PI / 180)}
              y1={cy + 16 * Math.sin(deg * Math.PI / 180)}
              x2={cx + 80 * Math.cos(deg * Math.PI / 180)}
              y2={cy + 80 * Math.sin(deg * Math.PI / 180)}
              stroke="#ea580c" strokeWidth="0.6"/>
          ))}
          {petals.map(deg => {
            const r = 46, pr = 14
            const px = cx + r * Math.cos(deg * Math.PI / 180)
            const py = cy + r * Math.sin(deg * Math.PI / 180)
            return <ellipse key={deg} cx={px} cy={py} rx={pr} ry={pr * 0.45}
              transform={`rotate(${deg}, ${px}, ${py})`}
              stroke="#ea580c" strokeWidth="0.8" fill="rgba(234,88,12,0.15)"/>
          })}
          <circle cx={cx} cy={cy} r="5" fill="#ea580c"/>
        </svg>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.decorClass} transition-colors duration-700`}>
      <div className="max-w-4xl mx-auto px-4 py-12 relative">

        {/* Decorative watermark */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {language === 'chinese' ? <ChineseSeal /> : <HindiMandala />}
        </div>

        {/* Header */}
        <div className="text-center mb-10 relative">
          <h1
            className={`text-5xl font-bold mb-3 tracking-wide ${t.titleText}`}
            style={{ fontFamily: t.titleFont }}
          >
            {language === 'chinese' ? '文化透视' : 'सांस्कृतिक दृष्टि'}
          </h1>
          <p className={`text-base ${t.subtitleText}`}>
            Cultural X-Ray &mdash; {language === 'chinese'
              ? 'Reveal the meaning behind Chinese text'
              : 'Reveal the meaning behind Hindi text'}
          </p>
        </div>

        {/* Input card */}
        <div className={`rounded-2xl p-6 mb-5 relative ${t.card}`}>
          {/* Language toggle */}
          <div className="flex gap-2 mb-5">
            {['chinese', 'hindi'].map(lang => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setText(''); reset() }}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  language === lang ? t.toggleOn : t.toggleOff
                }`}
              >
                {lang === 'chinese' ? '中文 (Chinese)' : 'हिन्दी (Hindi)'}
              </button>
            ))}
          </div>

          {/* Example buttons */}
          {examples.filter(ex => ex.language === language).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {examples.filter(ex => ex.language === language).map(ex => (
                <button
                  key={ex.id}
                  onClick={() => loadExample(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${t.exampleBtn}`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={language === 'chinese' ? '输入中文句子…' : 'हिंदी वाक्य दर्ज करें…'}
              rows={2}
              disabled={isGenerating}
              style={{ fontFamily: t.titleFont, fontSize: '1.3rem' }}
              className={`flex-1 rounded-xl border px-4 py-3 resize-none focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors duration-300 ${t.input}`}
            />
            <button
              type="submit"
              disabled={isGenerating || !text.trim()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${t.submitBtn}`}
            >
              {isGenerating ? 'Analyzing…' : language === 'chinese' ? '解读 (Analyze)' : 'विश्लेषण (Analyze)'}
            </button>
          </form>

          {error && (
            <div className={`mt-3 text-sm rounded-xl px-4 py-2 ${t.errorBox}`}>{error}</div>
          )}
        </div>

        {/* Token chips */}
        {pendingTokens.length > 0 && (
          <div className={`rounded-2xl p-6 mb-5 ${t.card}`}>
            {isGenerating && (
              <div className="mb-5">
                <div className={`flex justify-between text-xs mb-1.5 ${t.progressText}`}>
                  <span>{language === 'chinese' ? '正在分析… (Analyzing…)' : 'विश्लेषण हो रहा है… (Analyzing…)'}</span>
                  <span>{readyCount} / {totalCount}</span>
                </div>
                <div className={`h-1 rounded-full overflow-hidden ${t.progressTrack}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${t.progressFill}`}
                    style={{ width: totalCount ? `${(readyCount / totalCount) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            )}
            <p className={`text-xs uppercase tracking-widest mb-5 font-semibold ${t.labelText}`}>
              {phase === 'done'
                ? (language === 'chinese' ? '点击字词查看解释 (Click to explore)' : 'किसी शब्द पर क्लिक करें (Click to explore)')
                : (language === 'chinese' ? '分析完成后逐一亮起 (Lighting up as analysis completes)' : 'विश्लेषण होते ही प्रकाशित होगा (Lighting up as analysis completes)')}
            </p>
            <TokenDisplay
              pendingTokens={pendingTokens}
              readyTokens={readyTokens}
              activeIndex={activeIndex}
              onSelect={handleSelect}
              language={language}
              tokenScores={tokenScores}
              tokenGroups={tokenGroups}
            />
          </div>
        )}

        {/* Explanation card — shown as soon as any token is selected */}
        {activeToken && (
          <div className={`rounded-2xl p-6 mb-5 ${t.card}`}>
            <ExplanationCard token={activeToken} language={language} />
          </div>
        )}

        {/* Translations + phrase context — appear when overall arrives */}
        {overall && (
          <div className="space-y-4">
            <TranslationPanel
              literal={overall.literal_translation}
              semantic={overall.semantic_translation}
              language={language}
            />
            <PhraseContext context={overall.phrase_context} language={language} />
            <EnglishEquivalent
              text={text}
              language={language}
              onResult={handleEnglishEquiv}
              result={englishEquiv}
              loading={loadingEquiv}
            />
            <ChatPanel text={text} language={language} />
          </div>
        )}

      </div>
    </div>
  )
}
