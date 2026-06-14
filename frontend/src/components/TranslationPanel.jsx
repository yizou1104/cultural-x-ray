import { THEME } from '../theme'

export default function TranslationPanel({ literal, semantic, language }) {
  const t = THEME[language]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Panel title="Literal Translation" text={literal} cls={t.literalPanel} labelCls={t.panelLabel} />
      <Panel title="Semantic Translation" text={semantic} cls={t.semanticPanel} labelCls={t.panelLabel} />
    </div>
  )
}

function Panel({ title, text, cls, labelCls }) {
  return (
    <div className={`rounded-2xl p-5 ${cls}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${labelCls}`}>{title}</div>
      <div className="text-base font-medium leading-relaxed">{text}</div>
    </div>
  )
}
