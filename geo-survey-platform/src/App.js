import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MapViewer from './pages/MapViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map-viewer" element={<MapViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
