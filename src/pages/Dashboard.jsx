import { useLocation, Link, useNavigate } from "react-router-dom";
import AddBudgetForm from "../component/AddBudgetForm";
import ExistingBudget from "../component/ExistingBudget";


export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    console.log("location.state:", location.state);
    console.log("localStorage username:", localStorage.getItem('username'));
    const username = location.state?.user?.username || localStorage.getItem('username') || "User";
    console.log("Dashboard username:", username);

    const handleLogout = () => {
        localStorage.removeItem('username'); // Clear username from local storage
        navigate('/'); // Redirect to the home page
    }
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
                <h1>Welcome back, {username} </h1>
                <p>Welcome to your dashboard! Here you can set your budget!!</p>
                <AddBudgetForm> </AddBudgetForm>
                <ExistingBudget> </ExistingBudget>


            </div>
        </>
    );
}