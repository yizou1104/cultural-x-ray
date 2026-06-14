export const THEME = {
  chinese: {
    // Page
    pageBg: 'bg-stone-950',
    titleFont: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
    titleText: 'text-amber-300',
    subtitleText: 'text-stone-400',

    // Cards
    card: 'bg-stone-900 border border-red-900/40',
    cardText: 'text-stone-200',
    labelText: 'text-red-400/80',

    // Inputs
    input: 'bg-stone-800 border-stone-600 text-stone-100 placeholder-stone-500 focus:ring-red-800 focus:border-red-800',
    toggleOn: 'bg-red-900 text-amber-200 border border-red-700',
    toggleOff: 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700',
    exampleBtn: 'bg-red-950/60 text-red-300 border border-red-900/60 hover:bg-red-900/60',
    submitBtn: 'bg-red-800 hover:bg-red-700 text-amber-100 disabled:bg-stone-700 disabled:text-stone-500',

    // Chips
    chipPending: 'bg-stone-800/40 text-stone-600 border-2 border-stone-800 animate-pulse',
    // Heat-map scores 0–3 (idle / hover state)
    chipScores: [
      'bg-stone-900 text-stone-600 border-2 border-stone-800 hover:border-stone-600',                                          // 0 — dim
      'bg-stone-800 text-stone-200 border-2 border-stone-600 hover:border-amber-700 hover:bg-stone-700',                       // 1 — normal
      'bg-amber-950/70 text-amber-300 border-2 border-amber-700/80 hover:border-amber-500 shadow-sm shadow-amber-950',         // 2 — warm
      'bg-amber-900/90 text-amber-200 border-2 border-amber-500 hover:border-amber-400 shadow-md shadow-amber-900/60',         // 3 — hot
    ],
    // Heat-map scores 0–3 (active / selected state)
    chipScoresActive: [
      'bg-stone-700 text-stone-300 border-2 border-stone-500',
      'bg-red-800 text-amber-100 border-2 border-red-600 shadow-lg shadow-red-950',
      'bg-amber-800 text-amber-100 border-2 border-amber-600 shadow-lg shadow-amber-900',
      'bg-amber-600 text-amber-50 border-2 border-amber-400 shadow-xl shadow-amber-800/70',
    ],

    // Progress
    progressTrack: 'bg-stone-700',
    progressFill: 'bg-red-700',
    progressText: 'text-stone-400',

    // Panels
    literalPanel: 'bg-stone-800 border border-stone-600 text-stone-300',
    semanticPanel: 'bg-red-950/60 border border-red-800/50 text-amber-200',
    panelLabel: 'text-stone-500',

    // Explanation card
    tokenHighlight: 'text-amber-300',
    pillBg: 'bg-red-900/60 text-red-300',
    anecdoteBox: 'bg-amber-950/40 border border-amber-800/40',
    anecdoteLabel: 'text-amber-500',
    anecdoteText: 'text-amber-200',
    sectionLabel: 'text-stone-500',

    // Phrase context
    phraseBox: 'bg-amber-950/30 border border-amber-800/30',
    phraseLabel: 'text-amber-500',
    phraseText: 'text-amber-200',
    phraseBadge: 'bg-red-900/60 text-red-300 border border-red-800/40',
    phraseIcon: '🏮',

    // Word group bar (spans chips that came from the same jieba word)
    groupBar: 'bg-amber-500',

    // English equivalent
    englishBtn: 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-600 hover:border-amber-600',
    englishBox: 'bg-stone-800 border border-amber-800/50',
    englishPhrase: 'text-amber-200',
    englishLabel: 'text-stone-400',
    englishBadge: 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
    englishAlt: 'text-stone-300',

    // Chat
    chatBox: 'bg-stone-900 border border-red-900/40',
    chatHeader: 'text-amber-300',
    chatSuggestBtn: 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 hover:border-amber-700',
    chatInput: 'bg-stone-800 border-stone-600 text-stone-100 placeholder-stone-500 focus:ring-red-800 focus:border-red-800',
    chatSendBtn: 'bg-red-800 hover:bg-red-700 text-amber-100 disabled:bg-stone-700 disabled:text-stone-500',
    chatUserBubble: 'bg-red-900/60 text-amber-100 border border-red-800/40',
    chatAiBubble: 'bg-stone-800 text-stone-200 border border-stone-600',
    chatLabel: 'text-stone-500',

    // Decorative
    decorClass: 'bg-pattern-chinese',
    divider: 'border-red-900/30',
    errorBox: 'bg-red-950/60 border border-red-800/40 text-red-300',
  },

  hindi: {
    // Page
    pageBg: 'bg-amber-50',
    titleFont: "'Laila', 'Hind', serif",
    titleText: 'text-orange-950',
    subtitleText: 'text-orange-700',

    // Cards
    card: 'bg-white border border-orange-200 shadow-md',
    cardText: 'text-gray-800',
    labelText: 'text-orange-600',

    // Inputs
    input: 'bg-white border-orange-300 text-gray-900 placeholder-orange-300 focus:ring-orange-500 focus:border-orange-500',
    toggleOn: 'bg-orange-600 text-white border border-orange-500 shadow-sm',
    toggleOff: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100',
    exampleBtn: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100',
    submitBtn: 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-orange-200 disabled:text-orange-400 shadow-sm',

    // Chips
    chipPending: 'bg-orange-50 text-orange-300 border-2 border-orange-100 animate-pulse',
    // Heat-map scores 0–3 (idle)
    chipScores: [
      'bg-orange-50/60 text-orange-300 border-2 border-orange-100 hover:border-orange-200',                                     // 0 — dim
      'bg-white text-gray-800 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 shadow-sm',                 // 1 — normal
      'bg-orange-100 text-orange-800 border-2 border-orange-400 hover:border-orange-500 shadow-sm',                             // 2 — warm
      'bg-orange-200 text-orange-950 border-2 border-orange-500 hover:border-orange-600 shadow-md shadow-orange-200',           // 3 — hot
    ],
    // Heat-map scores 0–3 (active)
    chipScoresActive: [
      'bg-orange-100 text-orange-600 border-2 border-orange-300',
      'bg-orange-500 text-white border-2 border-orange-400 shadow-md shadow-orange-200',
      'bg-orange-600 text-white border-2 border-orange-500 shadow-md shadow-orange-300',
      'bg-orange-700 text-white border-2 border-orange-600 shadow-lg shadow-orange-300',
    ],

    // Progress
    progressTrack: 'bg-orange-100',
    progressFill: 'bg-orange-500',
    progressText: 'text-orange-600',

    // Panels
    literalPanel: 'bg-amber-50 border border-amber-300 text-amber-900',
    semanticPanel: 'bg-orange-50 border border-orange-300 text-orange-900',
    panelLabel: 'text-orange-600',

    // Explanation card
    tokenHighlight: 'text-orange-700',
    pillBg: 'bg-orange-100 text-orange-800 border border-orange-200',
    anecdoteBox: 'bg-amber-50 border border-amber-300',
    anecdoteLabel: 'text-amber-700',
    anecdoteText: 'text-amber-900',
    sectionLabel: 'text-orange-600',

    // Phrase context
    phraseBox: 'bg-rose-50 border border-rose-300 shadow-sm',
    phraseLabel: 'text-rose-700',
    phraseText: 'text-rose-900',
    phraseBadge: 'bg-rose-100 text-rose-800 border border-rose-300',
    phraseIcon: '🪔',

    // Word group bar
    groupBar: 'bg-orange-500',

    // English equivalent
    englishBtn: 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 hover:border-orange-500',
    englishBox: 'bg-white border border-orange-200 shadow-md',
    englishPhrase: 'text-orange-900',
    englishLabel: 'text-orange-500',
    englishBadge: 'bg-orange-100 text-orange-800 border border-orange-200',
    englishAlt: 'text-orange-700',

    // Chat
    chatBox: 'bg-white border border-orange-200 shadow-md',
    chatHeader: 'text-orange-900',
    chatSuggestBtn: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 hover:border-orange-400',
    chatInput: 'bg-white border-orange-300 text-gray-900 placeholder-orange-300 focus:ring-orange-500 focus:border-orange-500',
    chatSendBtn: 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-orange-200 disabled:text-orange-400',
    chatUserBubble: 'bg-orange-100 text-orange-900 border border-orange-200',
    chatAiBubble: 'bg-amber-50 text-gray-800 border border-amber-200',
    chatLabel: 'text-orange-400',

    // Decorative
    decorClass: 'bg-pattern-hindi',
    divider: 'border-orange-200',
    errorBox: 'bg-red-50 border border-red-200 text-red-700',
  },
}
