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
    navigate('/exchange');
  };

  const handleSignupSuccess = (user) => {
    alert(`Signup Successful! Welcome ${user.username}`);
    setShowSignUp(false);
    navigate('/home');
  };

  return (
    <>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <img src={logo} alt="Money Tree" style={{ maxWidth: '120px', marginBottom: '16px' }} />
        <h1>BudgetBuddy</h1>
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