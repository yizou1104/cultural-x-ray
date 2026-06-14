import { THEME } from '../theme'

function buildGroups(tokens, groupIds) {
  if (!groupIds || groupIds.length !== tokens.length) {
    return tokens.map((tok, i) => ({ indices: [i], tokens: [tok] }))
  }
  const result = []
  for (let i = 0; i < tokens.length; i++) {
    const last = result[result.length - 1]
    if (last && groupIds[i] === groupIds[i - 1]) {
      last.indices.push(i)
      last.tokens.push(tokens[i])
    } else {
      result.push({ indices: [i], tokens: [tokens[i]] })
    }
  }
  return result
}

export default function TokenDisplay({
  pendingTokens,
  readyTokens,
  activeIndex,
  onSelect,
  language,
  tokenScores,   // number[] | null — 0-3 per token, arrives after all tokens are analyzed
  tokenGroups,
}) {
  const t = THEME[language]
  const groups = buildGroups(pendingTokens, tokenGroups)

  return (
    <div className="flex flex-wrap gap-3 justify-center items-end">
      {groups.map((group, gi) => {
        const isMulti = group.indices.length > 1
        return (
          <div key={gi} className={`relative flex ${isMulti ? 'pb-3' : ''}`}>
            {group.indices.map((i, ti) => {
              const tokenStr = pendingTokens[i]
              const isReady  = readyTokens[i] != null
              const isActive = activeIndex === i
              const score    = tokenScores ? (tokenScores[i] ?? 1) : 1

              let chipClass
              if (!isReady) {
                chipClass = t.chipPending
              } else if (isActive) {
                chipClass = t.chipScoresActive[score]
              } else {
                chipClass = t.chipScores[score]
              }

              const isFirst = ti === 0
              const isLast  = ti === group.indices.length - 1
              let radiusClass = 'rounded-xl'
              if (isMulti) {
                if (isFirst)     radiusClass = 'rounded-l-xl rounded-r-none'
                else if (isLast) radiusClass = 'rounded-r-xl rounded-l-none'
                else             radiusClass = 'rounded-none'
              }

              return (
                <button
                  key={i}
                  onClick={() => isReady && onSelect(i)}
                  disabled={!isReady}
                  style={{ fontFamily: t.titleFont }}
                  className={`px-4 py-2 text-2xl font-medium transition-all duration-300
                    ${radiusClass}
                    ${isMulti && !isFirst ? 'border-l-0' : ''}
                    ${chipClass}`}
                >
                  {tokenStr}
                </button>
              )
            })}

            {isMulti && (
              <div className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${t.groupBar}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
