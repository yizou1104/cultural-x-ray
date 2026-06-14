import { THEME } from '../theme'

export default function ExplanationCard({ token, language }) {
  const t = THEME[language]

  if (!token) {
    return (
      <div className={`text-center py-8 text-sm italic ${t.subtitleText ?? t.labelText}`}>
        Click a segment to explore its meaning
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={`text-5xl font-bold ${t.tokenHighlight}`}
        style={{ fontFamily: t.titleFont }}
      >
        {token.token}
      </div>

      <Row label="Literal" value={token.literal} t={t} />
      <Row label="Meaning" value={token.semantic} t={t} />
      <Row label="Tone" value={token.tone} t={t} pill />
      <Row label="Cultural Note" value={token.cultural_note} t={t} />
      <Row label="Example" value={token.example} t={t} italic />

      {token.anecdote && (
        <div className={`rounded-xl p-4 ${t.anecdoteBox}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.anecdoteLabel}`}>
            Anecdote
          </div>
          <p className={`text-sm leading-relaxed ${t.anecdoteText}`}>{token.anecdote}</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, t, pill, italic }) {
  if (!value) return null
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.sectionLabel}`}>
        {label}
      </div>
      {pill ? (
        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${t.pillBg}`}>
          {value}
        </span>
      ) : (
        <p className={`text-sm leading-relaxed ${t.cardText} ${italic ? 'italic' : ''}`}>{value}</p>
      )}
    </div>
  )
}
