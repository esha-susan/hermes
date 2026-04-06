// src/components/WowFeatures/RemixPanel.jsx

import { useState } from 'react'
import styles from './WowFeatures.module.css'

const REMIX_MODES = [
  { id: 'meme',       label: 'Meme',        sub: 'Ultra-short, punchy' },
  { id: 'story',      label: 'Story',       sub: 'Narrative arc' },
  { id: 'viral_hook', label: 'Viral Hook',  sub: 'Scroll-stopper' },
  { id: 'minimal',    label: 'Minimal',     sub: 'One perfect sentence' },
]

export default function RemixPanel({ content }) {
  const [active, setActive] = useState('meme')

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Content Remix</h2>
          <p className={styles.panelSub}>Four creative transformations of your campaign</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className={styles.modeRow}>
        {REMIX_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.modeBtn} ${active === mode.id ? styles.modeBtnActive : ''}`}
            onClick={() => setActive(mode.id)}
          >
            <span className={styles.modeName}>{mode.label}</span>
            <span className={styles.modeSub}>{mode.sub}</span>
          </button>
        ))}
      </div>

      {/* Content display */}
      <div className={styles.remixContent}>
        <p className={styles.remixText}>
          {content[active] || 'No content for this mode.'}
        </p>
      </div>
    </div>
  )
}