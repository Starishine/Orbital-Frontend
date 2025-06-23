import AddExpenseForm from "../component/AddExpenseForm";
import ExistingExpenses from "../component/ExistingExpense";
import { Link } from 'react-router-dom';
export default function Expenses() {
    return (
        <>
            <nav style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/exchange">Exchange</Link>
                <Link to="/expenses">Expenses</Link>
            </nav>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Set your expenses</h1>
                <p>This is the expenses page where you can manage your expenses.</p>
                {<AddExpenseForm />}
                <div style={{ marginTop: '24px' }}>
                    <ExistingExpenses />
                </div>

            </div>
        </>
    );
}