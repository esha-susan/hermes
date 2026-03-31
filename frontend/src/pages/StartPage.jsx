import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Zap } from 'lucide-react'
import { startCampaign } from '../services/api'
import { useCampaignStore } from '../store/campaignStore'
import styles from './StartPage.module.css'

export default function StartPage() {
  const navigate = useNavigate()
  const { setCampaignId, reset } = useCampaignStore()
  const [dragging, setDragging]   = useState(false)
  const [file, setFile]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = (f) => {
    const allowed = ['.txt', '.pdf', '.docx']
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) {
      setError('Only .txt, .pdf, and .docx files are supported.')
      return
    }
    setFile(f)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    reset()

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await startCampaign(formData)
      setCampaignId(res.data.id)
      navigate('/agents')
    } catch (err) {
      setError('Failed to start campaign. Is the backend running?')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <Zap size={20} strokeWidth={2} />
            <span className="mono">HERMES</span>
          </div>
          <p className={styles.tagline}>
            Autonomous Content Factory
          </p>
          <h1 className={styles.headline}>
            One document.<br />
            Full campaign.
          </h1>
          <p className={styles.sub}>
            Upload a product brief and watch three AI agents
            research, write, and edit your entire marketing campaign.
          </p>
        </div>

        {/* Upload area */}
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <div className={styles.fileSelected}>
              <FileText size={32} strokeWidth={1.5} color="var(--blue)" />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : (
            <div className={styles.dropPrompt}>
              <Upload size={32} strokeWidth={1.5} color="var(--text-muted)" />
              <span className={styles.dropText}>
                Drop your product brief here
              </span>
              <span className={styles.dropHint}>
                .txt, .pdf, .docx — or click to browse
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        <button
          className={`btn btn-primary ${styles.launchBtn}`}
          onClick={handleSubmit}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <span className="pulse-dot" style={{ background: 'white' }} />
              Initialising agents...
            </>
          ) : (
            <>
              <Zap size={16} strokeWidth={2} />
              Launch Campaign
            </>
          )}
        </button>

        {/* Format chips */}
        <div className={styles.outputs}>
          {['Blog Post', 'Social Thread', 'Email Teaser'].map((label) => (
            <span key={label} className={`badge badge-muted ${styles.chip}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}