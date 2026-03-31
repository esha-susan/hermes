import { useEffect, useRef } from 'react'
import { getCampaign } from '../services/api'
import { useCampaignStore } from '../store/campaignStore'

const TERMINAL_STATES = ['done', 'error']
const POLL_INTERVAL_MS = 2000

export function useAgentStream(campaignId) {
  const intervalRef = useRef(null)
  const { loadCampaign, setStatus } = useCampaignStore()

  useEffect(() => {
    if (!campaignId) return

    const poll = async () => {
      try {
        const res = await getCampaign(campaignId)
        loadCampaign(res.data)
        setStatus(res.data.status)

        // Stop polling once we hit a terminal state
        if (TERMINAL_STATES.includes(res.data.status)) {
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        console.error('Polling error:', err)
        clearInterval(intervalRef.current)
      }
    }

    poll() 
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => clearInterval(intervalRef.current)
  }, [campaignId])
}