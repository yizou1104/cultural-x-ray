import { THEME } from '../theme'

export default function EnglishEquivalent({ text, language, onResult, result, loading }) {
  const t = THEME[language]

  return (
    <div className="space-y-4">
      {!result && (
        <div className="flex justify-center">
          <button
            onClick={onResult}
            disabled={loading}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${t.englishBtn} disabled:opacity-50`}
          >
            {loading
              ? 'Finding equivalent…'
              : '🇬🇧 What would I say in English?'}
          </button>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl p-6 ${t.englishBox}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🇬🇧</span>
            <div className={`text-xs font-semibold uppercase tracking-wide ${t.englishLabel}`}>
              English Equivalent
            </div>
            {result.type && (
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${t.englishBadge}`}>
                {result.type}
              </span>
            )}
          </div>

          <p className={`text-2xl font-bold mb-3 leading-snug ${t.englishPhrase}`}>
            "{result.english_phrase}"
          </p>

          {result.explanation && (
            <p className={`text-sm leading-relaxed mb-3 ${t.cardText}`}>
              {result.explanation}
            </p>
          )}

          {result.alternatives && result.alternatives.length > 0 && (
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.englishLabel}`}>
                Also said as
              </div>
              <div className="flex flex-wrap gap-2">
                {result.alternatives.map((alt, i) => (
                  <span key={i} className={`text-sm italic ${t.englishAlt}`}>
                    "{alt}"{i < result.alternatives.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
