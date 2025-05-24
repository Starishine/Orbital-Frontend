import SignupForm from '../component/SignupForm';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/money-tree-logo.jpg';

export default function HelloPage() {
  const navigate = useNavigate();

  const handleSignupSuccess = (user) => {
    alert(`Login Successful! Welcome ${user.username}`);
    navigate('/exchange');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <img src={logo} alt="Money Tree" />
      <h1>BudgetBuddy</h1>
      <h2>Signup</h2>
      <SignupForm onSuccess={handleSignupSuccess} />
    </div>
  );
}