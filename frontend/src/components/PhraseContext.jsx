import { THEME } from '../theme'

export default function PhraseContext({ context, language }) {
  const t = THEME[language]
  if (!context) return null

  return (
    <div className={`rounded-2xl p-6 ${t.phraseBox}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{t.phraseIcon}</span>
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.phraseLabel}`}>
            Cultural Significance
          </div>
          <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${t.phraseBadge}`}>
            {context.type}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Section label="Origin" text={context.origin} t={t} />
        <Section label="How it's used" text={context.cultural_usage} t={t} />
        <Section label="Significance" text={context.significance} t={t} />
      </div>
    </div>
  )
}

function Section({ label, text, t }) {
  if (!text) return null
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.phraseLabel}`}>
        {label}
      </div>
      <p className={`text-sm leading-relaxed ${t.phraseText}`}>{text}</p>
    </div>
  )
}
