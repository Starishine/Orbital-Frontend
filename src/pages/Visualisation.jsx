import BudgetForecast from "../component/BudgetForecast"
import { Link } from 'react-router-dom';
export default function Visualisation() {
    return (
        <>
            <nav style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/exchange">Exchange</Link>
                <Link to="/expenses">Expenses</Link>
                <Link to="/visualisation">Visualisation</Link>
            </nav>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
                <h1>Visualisation</h1>
                <p>This is the visualisation page where you can see your budget forecast.</p>
                <BudgetForecast />
            </div>
        </>

    );
}
