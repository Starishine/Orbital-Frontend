import { useLocation } from "react-router-dom";
import AddBudgetForm from "../component/AddBudgetForm";
import ExistingBudget from "../component/ExistingBudget";


export default function Dashboard() {
    const location = useLocation();
    console.log("location.state:", location.state);
    console.log("localStorage username:", localStorage.getItem('username'));
    const username = location.state?.user?.username || localStorage.getItem('username') || "User";
    console.log("Dashboard username:", username);
    return (
        <>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Welcome back, {username} </h1>
                <p>Welcome to your dashboard! Here you can set your budget!!</p>
                <AddBudgetForm> </AddBudgetForm>
                <ExistingBudget> </ExistingBudget>


            </div>
        </>
    );
}