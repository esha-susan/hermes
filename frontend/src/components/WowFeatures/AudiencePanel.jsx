// src/components/WowFeatures/AudiencePanel.jsx

import { User } from 'lucide-react'
import styles from './WowFeatures.module.css'

const PERSONAS = [
  { id: 'developer', label: 'Developer',  sub: 'Skeptical · Technical' },
  { id: 'ceo',       label: 'CEO',        sub: 'ROI-focused · Strategic' },
  { id: 'student',   label: 'Student',    sub: 'Curious · Budget-conscious' },
]

export default function AudiencePanel({ reactions }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Audience Reactions</h2>
          <p className={styles.panelSub}>Simulated responses from three persona types</p>
        </div>
      </div>

      <div className={styles.reactionsList}>
        {PERSONAS.map(({ id, label, sub }) => {
          const reaction = reactions[id]
          if (!reaction) return null
          return (
            <div key={id} className={styles.reactionCard}>
              <div className={styles.reactionHeader}>
                <div className={styles.avatarWrap}>
                  <User size={16} strokeWidth={1.5} />
                </div>
                <div className={styles.personaInfo}>
                  <span className={styles.personaName}>{label}</span>
                  <span className={styles.personaSub}>{sub}</span>
                </div>
                <span className={`badge badge-muted ${styles.verdict}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  {reaction.verdict}
                </span>
              </div>
              <p className={styles.reactionComment}>{reaction.comment}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}