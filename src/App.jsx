import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Exchange from './pages/Exchange';
import MainApp from './pages/MainApp';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Visualisation from './pages/Visualisation';
import React from 'react';

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
          <Route path="/" element={<MainApp />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="visualisation" element={<Visualisation />} />


        </Routes>
      </div>
    </Router>
  );
}