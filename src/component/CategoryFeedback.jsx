import axios from "axios";
import { useState } from "react";
import React from "react";

// CategoryFeedback: Component to handle feedback on suggested categories
// Allows users to accept or correct the suggested category for an expense description
export default function CategoryFeedback({
    description,         // Expense description
    suggestedCategory,   // Category suggested by ML
    categories,          // List of available categories
    onAccept,            // Callback when user accepts suggestion
    onCorrection         // Callback when user submits correction
}) {
    const [showCorrection, setShowCorrection] = useState(false);
    const [correctCategory, setCorrectCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');

    // Handle correction submission: send feedback to backend and notify parent
    const handleCorrectionSubmit = () => {
        // Send feedback to backend
        axios.post('/ml/feedback', {
            description: description,
            correct_category: correctCategory === "__custom__" ? customCategory : correctCategory
        });
        // Notify parent component
        onCorrection(correctCategory === "__custom__" ? customCategory : correctCategory);
        setShowCorrection(false);
    };

    return (
        <div
            style={{
                margin: '16px 0',
                padding: '18px',
                background: '#f5f5f5',
                borderRadius: 12,
                border: '1px solid #e3f2fd',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontFamily: 'Inter, Arial, sans-serif'
            }}
        >
            {/* Prompt user to confirm suggested category */}
            <span style={{ fontWeight: 600, color: '#263859', marginBottom: 6 }}>
                Is "{suggestedCategory}" the correct category?
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
                {/* Accept button */}
                <button
                    type="button"
                    onClick={onAccept}
                    style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 18px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#263859'}
                    onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                >
                    Yes
                </button>
                {/* Correction button */}
                <button
                    type="button"
                    onClick={() => setShowCorrection(true)}
                    style={{
                        background: '#d32f2f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 18px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#263859'}
                    onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
                >
                    No
                </button>
            </div>
            {/* Correction UI: select or enter correct category */}
            {showCorrection && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    {/* Dropdown for categories */}
                    <select
                        value={correctCategory}
                        onChange={e => setCorrectCategory(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #e3f2fd',
                            fontSize: 16,
                            background: '#fff',
                            color: '#263859',
                            outline: 'none'
                        }}
                    >
                        <option value="">Select correct category</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                        ))}
                        <option value="__custom__">Other (type below)</option>
                    </select>
                    {/* Custom category input if "Other" selected */}
                    {correctCategory === "__custom__" && (
                        <input
                            type="text"
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={e => setCustomCategory(e.target.value)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 8,
                                border: '1px solid #e3f2fd',
                                fontSize: 16,
                                background: '#fff',
                                color: '#263859',
                                outline: 'none'
                            }}
                        />
                    )}
                    {/* Submit correction button */}
                    <button
                        type="button"
                        onClick={handleCorrectionSubmit}
                        style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 24px',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                            transition: 'background 0.2s'
                        }}
                        disabled={
                            !(
                                (correctCategory && correctCategory !== "__custom__") ||
                                (correctCategory === "__custom__" && customCategory)
                            )
                        }
                        onMouseOver={e => e.currentTarget.style.background = '#263859'}
                        onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                    >
                        Submit Correction
                    </button>
                </div>
            )}
        </div>
    );
}