import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HelloPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // for navigation
  const [userId, setUserId] = useState(100); // Added userId state

  const handleLookup = () => {
    setError('');
    setUser(null);
    if (!userId) {
      setError('Please Enter User Name');
      return;
    }
    if (!password) {
      setError('Please Enter Password');
      return;
    }

    if (!email) {
      setError('Please Enter Email'); 
      return;
    }

    // if (password !== 'abc123') {
    //   setError('Incorrect Password');
    //   alert("Incorrect Password");
    //   return;
    // }

    // axios
    //   .get(`http://localhost:8080/sayHello?name=${userId}`)
    //   .then((response) => {
    //     console.log('API response: ', response.data);
    //     setUser(response.data);
    //   })
    //   .catch(() => {
    //     setError('User not found.');
    //   });

    axios.post('http://localhost:8080/signup/register', {
      userId: userId,
      username: username,
      password: password,
      email: email
  })
  .then((response) => {
      console.log('API response: ', response.data);
      setUser(response.data);
    })
  .catch((error) => {
      console.error('Error:', error);
      setError('User not found.');
    });
  
  };
  useEffect(() => {
    if (user) {
      alert(`Login Successful! Welcome ${user.username}`);
      navigate('/exchange'); // Redirect to home page after successful lookup
    }
  }, [user]); 

  return (
    
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <img src = "https://www.shutterstock.com/image-vector/money-tree-logo-flat-color-260nw-2190185709.jpg" alt = "Money Tree" />
      <h2>Signup</h2>
      <input
        type="input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <input
        type="input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginRight: '10px' }}
      />

      <input
        type="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '10px' }}
      />

      <button
        onClick={() => {
          handleLookup();
          setUserId(userId + 1);
          }}> Submit
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user && (
        <div style={{ marginTop: '20px' }}>
          <h3>User Details</h3>
          <p>Title: {user.title}</p>
          <p>Message: {user.message}</p>
        </div>
      )}
    </div>
  );
}