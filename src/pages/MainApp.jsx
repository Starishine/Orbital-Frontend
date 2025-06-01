import { useState, useEffect } from 'react';
import SignupForm from '../component/SignupForm';
import SignInForm from '../component/SignInForm';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/money-tree-logo.jpg';

export default function MainApp() {
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (user, token) => {
    localStorage.setItem('token', token); // Store currency in local storage
    localStorage.setItem('currency', 'SGD'); // Default currency
    navigate('/dashboard');
  };

  const handleSignupSuccess = (user) => {
    alert(`Signup Successful! Please log in, ${user.username}`);
    setShowSignUp(false);
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard'); // Redirect to login/signin page if token is missing
    }
  });

  return (
    <>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <img src={logo} alt="Money Tree" style={{ maxWidth: '200px', marginBottom: '16px' }} />
        <h1>BudgetBuddy</h1>
        <h2 style={{
          fontSize: '1.1rem',
          color: '#666',
          fontWeight: 400,
          marginTop: '-10px',
          marginBottom: '24px',
          letterSpacing: '0.5px',
          fontStyle: 'italic'
        }}>
          Your university finance planner
        </h2>
        <h2>{showSignUp ? 'Signup' : 'Sign In'}</h2>
        {showSignUp ? (
          <SignupForm onSuccess={handleSignupSuccess} />
        ) : (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setShowSignUp(true)}
          />
        )}
      </div>
    </>
  );
}