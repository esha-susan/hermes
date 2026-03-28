// src/App.jsx
// WHY: Sets up our 3 pages and routing between them.
// React Router watches the URL and renders the right page component.

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage'
import AgentRoomPage from './pages/AgentRoomPage'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<StartPage />} />
        <Route path="/agents"  element={<AgentRoomPage />} />
        <Route path="/review"  element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}