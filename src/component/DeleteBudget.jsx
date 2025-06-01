import axios from 'axios';
export default function DeleteBudget({ budgetId, onDeleteSuccess }) {
    const handleDelete = () => {
        if (!window.confirm('Are you sure you want to delete this budget?')) {
            return; // User cancelled the deletion
        }

        axios.delete(`http://localhost:8080/budget/delete/${budgetId}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                const data = response.data;
                console.log(data);
                if (data.status === "SUCCESS" && data.code === 200) {
                    onDeleteSuccess();
                } else {
                    console.error('Error deleting budget:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error deleting budget:', error);
            });
    };

    return (
        <button onClick={handleDelete} style={{ color: 'red' }}>
            Delete Budget
        </button>
    );
}