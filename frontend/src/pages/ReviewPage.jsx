// src/pages/ReviewPage.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Hash, Mail, RefreshCw, Zap, ChevronRight } from 'lucide-react'
import { useCampaignStore } from '../store/campaignStore'
import { remixContent, getConsistency, getReactions } from '../services/api'
import ConsistencyPanel from '../components/WowFeatures/ConsistencyPanel'
import RemixPanel from '../components/WowFeatures/RemixPanel'
import AudiencePanel from '../components/WowFeatures/AudiencePanel'
import styles from './ReviewPage.module.css'

const TABS = [
  { id: 'blog',   label: 'Blog Post',      icon: FileText },
  { id: 'thread', label: 'Social Thread',  icon: Hash },
  { id: 'email',  label: 'Email Teaser',   icon: Mail },
]

export default function ReviewPage() {
  const navigate = useNavigate()
  const {
    campaignId, factSheet, blogPost,
    socialThread, emailTeaser, editorNotes,
    setConsistency, setRemix, setReactions,
    consistencyReport, remixedContent, audienceReactions
  } = useCampaignStore()

  const [activeTab,    setActiveTab]    = useState('blog')
  const [activeFeature, setActiveFeature] = useState(null)
  const [loading,      setLoading]      = useState(null)

  if (!campaignId) {
    navigate('/')
    return null
  }

  const triggerConsistency = async () => {
    setLoading('consistency')
    try {
      const res = await getConsistency(campaignId)
      setConsistency(res.data)
      setActiveFeature('consistency')
    } finally { setLoading(null) }
  }

  const triggerRemix = async () => {
    setLoading('remix')
    try {
      const res = await remixContent(campaignId, 'all')
      setRemix(res.data)
      setActiveFeature('remix')
    } finally { setLoading(null) }
  }

  const triggerReactions = async () => {
    setLoading('reactions')
    try {
      const res = await getReactions(campaignId)
      setReactions(res.data)
      setActiveFeature('reactions')
    } finally { setLoading(null) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.layout}>
        {/* Left sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className="badge badge-emerald mono">
              <span className="pulse-dot" style={{ background: 'var(--emerald)' }} />
              Complete
            </span>
            <h2 className={styles.productName}>
              {factSheet?.product_name || 'Campaign'}
            </h2>
            <p className={styles.sidebarSub}>
              {editorNotes?.overall_quality && (
                <span>Quality: <strong>{editorNotes.overall_quality}</strong></span>
              )}
            </p>
          </div>

          {/* Content tabs */}
          <nav className={styles.tabNav}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.tabBtn} ${activeTab === id ? styles.tabActive : ''}`}
                onClick={() => { setActiveTab(id); setActiveFeature(null) }}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
                <ChevronRight size={14} className={styles.chevron} />
              </button>
            ))}
          </nav>

          {/* Feature buttons */}
          <div className={styles.featureSection}>
            <p className={styles.featureLabel} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Analysis Tools
            </p>
            <button
              className={`btn btn-ghost ${styles.featureBtn} ${activeFeature === 'consistency' ? styles.featureBtnActive : ''}`}
              onClick={triggerConsistency}
              disabled={loading === 'consistency'}
            >
              {loading === 'consistency' ? <RefreshCw size={14} className={styles.spin} /> : <Zap size={14} />}
              Consistency Check
            </button>
            <button
              className={`btn btn-ghost ${styles.featureBtn} ${activeFeature === 'remix' ? styles.featureBtnActive : ''}`}
              onClick={triggerRemix}
              disabled={loading === 'remix'}
            >
              {loading === 'remix' ? <RefreshCw size={14} className={styles.spin} /> : <Zap size={14} />}
              Remix Content
            </button>
            <button
              className={`btn btn-ghost ${styles.featureBtn} ${activeFeature === 'reactions' ? styles.featureBtnActive : ''}`}
              onClick={triggerReactions}
              disabled={loading === 'reactions'}
            >
              {loading === 'reactions' ? <RefreshCw size={14} className={styles.spin} /> : <Zap size={14} />}
              Audience Reactions
            </button>
          </div>

          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
            onClick={() => navigate('/')}
          >
            New Campaign
          </button>
        </aside>

        {/* Main content */}
        <main className={styles.main}>
          {!activeFeature && (
            <div className={styles.contentPanel}>
              <ContentHeader tab={activeTab} />
              <div className={styles.contentBody}>
                {activeTab === 'blog' && (
                  <div className={styles.prose}>
                    {blogPost?.split('\n').map((p, i) =>
                      p.trim() ? <p key={i}>{p}</p> : <br key={i} />
                    )}
                  </div>
                )}
                {activeTab === 'thread' && (
                  <div className={styles.thread}>
                    {socialThread?.map((post, i) => (
                      <div key={i} className={styles.threadPost}>
                        <span className={styles.postNum} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p>{post}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'email' && (
                  <div className={styles.emailBox}>
                    <p className={styles.emailLabel} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Email Teaser
                    </p>
                    <p className={styles.emailText}>{emailTeaser}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeFeature === 'consistency' && consistencyReport && (
            <ConsistencyPanel report={consistencyReport} />
          )}
          {activeFeature === 'remix' && remixedContent && (
            <RemixPanel content={remixedContent} />
          )}
          {activeFeature === 'reactions' && audienceReactions && (
            <AudiencePanel reactions={audienceReactions} />
          )}
        </main>
      </div>
    </div>
  )
}

function ContentHeader({ tab }) {
  const map = {
    blog:   { label: 'Blog Post',     sub: '~500 words · Long-form content' },
    thread: { label: 'Social Thread', sub: '5 posts · X / LinkedIn' },
    email:  { label: 'Email Teaser',  sub: '1 paragraph · Cold outreach' },
  }
  const { label, sub } = map[tab]
  return (
    <div className={styles.contentHeader}>
      <h2 className={styles.contentTitle}>{label}</h2>
      <span className="badge badge-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{sub}</span>
    </div>
  )
}