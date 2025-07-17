import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

export default function VisualisationRing({ expenses, members }) {
    // Calculate total spent per member
    const spent = {};
    members.forEach(m => spent[m] = 0);
    expenses.forEach(exp => {
        spent[exp.username] = (spent[exp.username] || 0) + Number(exp.amount);
    });

    const data = {
        labels: members,
        datasets: [
            {
                data: members.map(m => spent[m]),
                backgroundColor: [
                    "#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b", "#00796b"
                ],
                borderWidth: 2,
            }
        ]
    };

    return (
        <div style={{ maxWidth: 320, margin: "0 auto", background: "var(--card)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ textAlign: "center", color: "var(--primary, #1976d2)", marginBottom: 16 }}>Spending by Member</h3>
            <Doughnut
                data={data}
                options={{
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom",
                            labels: {
                                font: { size: 14 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: $${context.parsed}`;
                                }
                            }
                        }
                    }
                }}
            />
        </div>
    );
}