// src/components/WowFeatures/ConsistencyPanel.jsx

import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import styles from './WowFeatures.module.css'

const DIMENSION_LABELS = {
  pricing:           'Pricing',
  audience:          'Target Audience',
  tone:              'Brand Tone',
  value_proposition: 'Value Proposition',
}

const STATUS_CONFIG = {
  consistent:    { icon: CheckCircle,   cls: 'emerald', label: 'Consistent' },
  conflict:      { icon: XCircle,       cls: 'red',     label: 'Conflict' },
  not_mentioned: { icon: Info,          cls: 'muted',   label: 'N/A' },
}

const SEVERITY_CONFIG = {
  critical: { icon: XCircle,       cls: 'red',   label: 'Critical' },
  warning:  { icon: AlertTriangle, cls: 'amber', label: 'Warning' },
  info:     { icon: Info,          cls: 'blue',  label: 'Info' },
}

export default function ConsistencyPanel({ report }) {
  const score = report.overall_consistency_score || 0

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Consistency Report</h2>
          <p className={styles.panelSub}>Cross-platform brand alignment analysis</p>
        </div>
        <div className={styles.scoreBox}>
          <span className={styles.scoreNum} style={{ color: score >= 80 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
            {score}
          </span>
          <span className={styles.scoreLabel}>/ 100</span>
        </div>
      </div>

      {/* Dimensions grid */}
      <div className={styles.dimensionsGrid}>
        {Object.entries(report.dimensions || {}).map(([key, val]) => {
          const config = STATUS_CONFIG[val.status] || STATUS_CONFIG.not_mentioned
          const Icon = config.icon
          return (
            <div key={key} className={`${styles.dimensionCard} ${styles[config.cls]}`}>
              <div className={styles.dimensionTop}>
                <span className={styles.dimensionName}>{DIMENSION_LABELS[key] || key}</span>
                <Icon size={15} strokeWidth={1.5} />
              </div>
              <span className={`badge badge-${config.cls === 'muted' ? 'muted' : config.cls}`} style={{ fontSize: '11px' }}>
                {config.label}
              </span>
              <p className={styles.dimensionNote}>{val.note}</p>
            </div>
          )
        })}
      </div>

      {/* Conflicts */}
      {report.conflicts?.length > 0 ? (
        <div className={styles.conflictsList}>
          <h3 className={styles.sectionTitle}>Conflicts Found</h3>
          {report.conflicts.map((c, i) => {
            const config = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.info
            const Icon = config.icon
            return (
              <div key={i} className={`${styles.conflictItem} ${styles[config.cls + 'Border']}`}>
                <div className={styles.conflictHeader}>
                  <Icon size={14} strokeWidth={1.5} />
                  <span className={`badge badge-${config.cls}`} style={{ fontSize: '11px' }}>{config.label}</span>
                  <span className={styles.conflictDimension}>{c.dimension}</span>
                </div>
                <p className={styles.conflictDesc}>{c.description}</p>
                <p className={styles.conflictFix}>Fix: {c.fix}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.allClear}>
          <CheckCircle size={18} strokeWidth={1.5} color="var(--emerald)" />
          <span>No conflicts detected across all platforms</span>
        </div>
      )}
    </div>
  )
}