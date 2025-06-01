import { useLocation, Link, useNavigate } from "react-router-dom";
import AddBudgetForm from "../component/AddBudgetForm";
import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import ExistingBudget from "../component/ExistingBudget";


export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUserName] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/'); // Redirect to the home page
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redirect to login/signin page if token is missing
        }
        else {
            const decoded = jwtDecode(token);
            setUserName(decoded.sub); // Extract username from token
        }
    });

    return (
        <>
            <nav style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/exchange">Exchange</Link>
                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: 'auto',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 16px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </nav>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Welcome, {username} </h1>
                <p>Welcome to your dashboard! Here you can set your budget!!</p>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ marginRight: '40px', width: '500px' }}>
                        <AddBudgetForm />
                    </div>
                    <div style={{ flex: 1 }}>
                        <ExistingBudget />
                    </div>
                </div>


            </div>
        </>
    );
}