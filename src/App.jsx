import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Exchange from './pages/Exchange';
import Contact from './pages/Contact';
import HelloPage from './pages/HelloPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <nav style={{ marginBottom: '20px' }}>
          {/* <Link to="/" style={{ marginLeft: '20px' }}>Home</Link> */}
          {/* <Link to="/exchange" style={{ marginLeft: '10px' }}>Exchange</Link>
          <Link to="/dashboard" style={{ marginLeft: '10px' }}>Dashboard</Link> */}

        </nav>
        <Routes>
          <Route path="/" element={<HelloPage />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/dashboard" element={<Dashboard />} />


        </Routes>
      </div>
    </Router>
  );
}