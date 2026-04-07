import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Zap, Globe } from 'lucide-react'
import api,{ startCampaign } from '../services/api'
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
  const [inputMode, setInputMode] = useState('file')
  const [url, setUrl] = useState('')

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
    setLoading(true)
    setError(null)
    reset()
  
    try {
      let res
      if (inputMode === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)
        res = await startCampaign(formData)
      } else if (inputMode === 'url' && url) {
        res = await api.post('/api/campaign/start-from-url', { url })
      } else {
        setError('Please provide a file or URL.')
        setLoading(false)
        return
      }
      setCampaignId(res.data.id)
      navigate('/agents')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start campaign.')
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
        <div className={styles.modeToggle}>
  <button
    className={`${styles.modeBtn} ${inputMode === 'file' ? styles.modeBtnActive : ''}`}
    onClick={() => setInputMode('file')}
  >
    <Upload size={14} />
    Upload File
  </button>
  <button
    className={`${styles.modeBtn} ${inputMode === 'url' ? styles.modeBtnActive : ''}`}
    onClick={() => setInputMode('url')}
  >
    <Globe size={14} />
    From URL
  </button>
</div>


{inputMode === 'url' && (
  <div className={styles.urlInput}>
    <Globe size={18} strokeWidth={1.5} color="var(--text-muted)" />
    <input
      type="url"
      placeholder="https://yourproduct.com/features"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      className={styles.urlField}
    />
  </div>
)}
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
          disabled={
            loading ||
            (inputMode === 'file' && !file) ||
            (inputMode === 'url' && !url)
          }
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