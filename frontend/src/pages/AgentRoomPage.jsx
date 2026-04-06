
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Pen, Eye, AlertCircle } from 'lucide-react'
import { useCampaignStore } from '../store/campaignStore'
import { useAgentStream } from '../hooks/useAgentStream'
import styles from './AgentRoomPage.module.css'

// Which statuses activate each agent
const AGENT_CONFIG = [
  {
    id: 'research',
    label: 'Research Agent',
    role: 'Extracts facts, builds structured brief',
    icon: Brain,
    activeOn: ['researching'],
    doneOn: ['writing', 'editing', 'done'],
  },
  {
    id: 'copywriter',
    label: 'Copywriter Agent',
    role: 'Generates blog, thread, and email',
    icon: Pen,
    activeOn: ['writing'],
    doneOn: ['editing', 'done'],
  },
  {
    id: 'editor',
    label: 'Editor Agent',
    role: 'Validates facts, checks tone and consistency',
    icon: Eye,
    activeOn: ['editing'],
    doneOn: ['done'],
  },
]

function getAgentState(agent, status) {
  if (agent.doneOn.includes(status)) return 'done'
  if (agent.activeOn.includes(status)) return 'active'
  return 'idle'
}

const STATUS_LABELS = {
  pending: 'Initialising',
  researching: 'Research in progress',
  writing: 'Writing campaign content',
  editing: 'Editor reviewing content',
  done: 'Campaign complete',
  error: 'Pipeline error',
}

export default function AgentRoomPage() {
  const navigate = useNavigate()
  const { campaignId, status } = useCampaignStore()

  const safeStatus = status || 'pending'

  // Start polling ONLY if campaign exists
  useAgentStream(campaignId || null)

  // Redirect if no campaign
  useEffect(() => {
    if (!campaignId) navigate('/')
  }, [campaignId, navigate])

  // Auto-navigate when done
  useEffect(() => {
    if (safeStatus === 'done') {
      const timer = setTimeout(() => navigate('/review'), 1200)
      return () => clearTimeout(timer)
    }
  }, [safeStatus, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className="badge badge-blue mono">
            <span className="pulse-dot" style={{ background: 'var(--blue)' }} />
            LIVE
          </span>
          <h1 className={styles.title}>Agent Room</h1>
          <p className={styles.statusText}>
            {safeStatus === 'done'
              ? 'Campaign complete — redirecting...'
              : STATUS_LABELS[safeStatus] || 'Processing'}
          </p>
        </div>

        {/* Agent cards */}
        <div className={styles.agents}>
          {AGENT_CONFIG.map((agent, i) => {
            const { icon: Icon } = agent
            const state = getAgentState(agent, safeStatus)

            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                state={state}
                Icon={Icon}
                index={i}
              />
            )
          })}
        </div>

        {/* Error state */}
        {safeStatus === 'error' && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} />
            <span>Pipeline encountered an error. Check the backend logs.</span>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              Start over
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: getProgressWidth(safeStatus) }}
          />
        </div>

        <p
          className={styles.progressLabel}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Progress: {getProgressWidth(safeStatus)}
        </p>
      </div>
    </div>
  )
}

function AgentCard({ agent, state, Icon, index }) {
  return (
    <div
      className={`${styles.card} ${styles[state]}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardLeft}>
        <div className={styles.iconWrap}>
          <Icon size={20} strokeWidth={1.5} />
          {state === 'active' && <span className={styles.activePing} />}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <span className={styles.agentLabel}>{agent.label}</span>
          <StateBadge state={state} />
        </div>
        <p className={styles.agentRole}>{agent.role}</p>
      </div>
    </div>
  )
}

function StateBadge({ state }) {
  const map = {
    idle: { cls: 'badge-muted', text: 'Waiting' },
    active: { cls: 'badge-blue', text: 'Running' },
    done: { cls: 'badge-emerald', text: 'Done' },
  }

  const { cls, text } = map[state]

  return (
    <span className={`badge ${cls}`}>
      {state === 'active' && (
        <span className="pulse-dot" style={{ background: 'var(--blue)' }} />
      )}
      {text}
    </span>
  )
}

function getProgressWidth(status) {
  const map = {
    pending: '5%',
    researching: '33%',
    writing: '66%',
    editing: '85%',
    done: '100%',
    error: '100%',
  }
  return map[status] || '0%'
}

