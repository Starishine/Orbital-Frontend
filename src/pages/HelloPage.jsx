import { useState } from 'react';
import SignupForm from '../component/SignupForm';
import SignInForm from '../component/SignInForm';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/money-tree-logo.jpg';

export default function HelloPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (user) => {
    alert(`Login Successful! Welcome ${user.username}`);
    localStorage.setItem('username', user.username); // Store username in local storage
    navigate('/dashboard', { state: { username: user.username } });
  };

  const handleSignupSuccess = (user) => {
    alert(`Signup Successful! Please log in, ${user.username}`);
    setShowSignUp(false);
    navigate('/');
  };

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