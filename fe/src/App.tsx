import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MapPage from './MapPage'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/maps" replace />} />
        <Route path="/maps" element={<MapPage />} />
        <Route path="/maps/region/:regionId" element={<MapPage />} />
        <Route path="/maps/region/:regionId/:locationId" element={<MapPage />} />
        <Route path="/starting-locations" element={<MapPage />} />
        <Route path="/starting-locations/:modeId/:regionId" element={<MapPage />} />
        <Route path="/starting-locations/:modeId/:regionId/:locationId" element={<MapPage />} />
        {/* Previous starting-location URLs remain readable. */}
        <Route path="/starting-locations/region/:regionId" element={<MapPage />} />
        <Route path="/starting-locations/region/:regionId/:locationId" element={<MapPage />} />
        <Route path="/about" element={<MapPage />} />
        {/* Legacy map URLs remain readable for old bookmarks. */}
        <Route path="/region/:regionId" element={<MapPage />} />
        <Route path="/region/:regionId/:locationId" element={<MapPage />} />
        <Route path="*" element={<Navigate to="/maps" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
