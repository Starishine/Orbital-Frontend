import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Exchange from './pages/Exchange';
import Contact from './pages/Contact';
import HelloPage from  './pages/HelloPage';

export default function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
          <Link to="/exchange" style={{ marginRight: '10px' }}>Exchange</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/home" style={{ marginLeft: '20px' }}>Hello Page</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/home" element={<HelloPage />} />
        </Routes>
      </div>
    </Router>
  );
}