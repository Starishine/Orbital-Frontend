import axios from "axios";
import { useState } from "react";
import React from "react";

export default function CategoryFeedback({
    description,
    suggestedCategory,
    categories,
    onAccept,
    onCorrection
}) {
    const [showCorrection, setShowCorrection] = useState(false);
    const [correctCategory, setCorrectCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');

    const handleCorrectionSubmit = () => {
        // Send feedback to backend
        axios.post('http://localhost:8000/feedback', {
            description: description,
            correct_category: correctCategory === "__custom__" ? customCategory : correctCategory
        });
        onCorrection(correctCategory === "__custom__" ? customCategory : correctCategory);
        setShowCorrection(false);
    };

    return (
        <>
            <div style={{ margin: '12px 0' }}>
                <span>Is "{suggestedCategory}" the correct category?</span>
                <button type="button" onClick={onAccept} style={{ marginLeft: 8 }}>Yes</button>
                <button
                    type="button"
                    onClick={() => setShowCorrection(true)}
                    style={{ marginLeft: 8 }}
                >No</button>
                {showCorrection && (
                    <>
                        <select
                            value={correctCategory}
                            onChange={e => setCorrectCategory(e.target.value)}
                            style={{ marginLeft: 8 }}
                        >
                            <option value="">Select correct category</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                            <option value="__custom__">Other (type below)</option>
                        </select>
                        {correctCategory === "__custom__" && (
                            <input
                                type="text"
                                placeholder="Enter custom category"
                                value={customCategory}
                                onChange={e => setCustomCategory(e.target.value)}
                                style={{ marginLeft: 8 }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={handleCorrectionSubmit}
                            style={{ marginLeft: 8 }}
                            disabled={
                                !(
                                    (correctCategory && correctCategory !== "__custom__") ||
                                    (correctCategory === "__custom__" && customCategory)
                                )
                            }
                        >
                            Submit Correction
                        </button>
                    </>
                )}
            </div>
        </>
    );
}