// src/services/api.js
// WHY: Centralizing API calls means if the backend URL changes,
// we update ONE file, not 20 components.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

export const healthCheck = () => api.get('/health')

export const startCampaign  = (formData) => api.post('/api/campaign/start', formData)
export const getCampaign    = (id)        => api.get(`/api/campaign/${id}`)
export const remixContent   = (id, mode)  => api.post(`/api/campaign/${id}/remix`, { mode })
export const getConsistency = (id)        => api.get(`/api/campaign/${id}/consistency`)
export const getReactions   = (id)        => api.get(`/api/campaign/${id}/reactions`)

export default api
