import { useState, useEffect } from 'react';
import SignupForm from '../component/SignupForm';
import SignInForm from '../component/SignInForm';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/money-tree-logo.jpg';
import React from 'react';

export default function MainApp() {
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (user, token) => {
    localstorage.setItem('token', token); // store currency in local storage
    localstorage.setItem('money_currency', 'SGD'); // default currency
    navigate('/dashboard');
  };

  const handleSignupSuccess = (user) => {
    alert(`Signup successful! please log in, ${user.username}`);
    setShowSignUp(false);
    navigate('/');
  };

  useEffect(() => {
    const token = localstorage.getItem('token');
    if (token) {
      navigate('/dashboard'); // redirect to login/signin page if token is missing
    }
  });

  return (
    <>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <img src={logo} alt="Money Tree" style={{ maxWidth: '200px', marginBottom: '16px' }} />
        <h1>BudgetBuddy</h1>
        <h2 style={{
          fontSize: '1.1rem',
          color: 'var(--text)',
          fontWeight: 400,
          marginTop: '-10px',
          marginBottom: '24px',
          letterSpacing: '0.5px',
          fontStyle: 'italic',
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