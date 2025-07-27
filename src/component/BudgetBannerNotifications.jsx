import React from 'react';

// BudgetBannerNotification: Displays a fixed notification banner with navigations
export default function BudgetBannerNotification({
    message,      // The notification message to display
    onClose,      // Function to call when close button is clicked
    onNext,       // Function to call when next button is clicked
    onPrev,       // Function to call when previous button is clicked
    showPrev,     // Boolean: show previous button
    showNext,     // Boolean: show next button
    idx,          // Current index (for multi-banner navigation)
    total         // Total number of banners
}) {
    if (!message) return null; // Don't render if no message
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            background: '#d32f2f',
            color: 'white',
            padding: '16px',
            zIndex: 9999,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Previous button */}
            {showPrev && (
                <button onClick={onPrev} style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    marginRight: 16
                }} aria-label="Previous">&#8592;</button>
            )}
            {/* Message and index */}
            <span>
                {message}
                {typeof idx === 'number' && typeof total === 'number' && total > 1 && (
                    <span style={{ fontSize: 14, marginLeft: 12 }}>
                        ({idx + 1} of {total})
                    </span>
                )}
            </span>
            {/* Next button */}
            {showNext && (
                <button onClick={onNext} style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    marginLeft: 16
                }} aria-label="Next">&#8594;</button>
            )}
            {/* Close button */}
            <button onClick={onClose} style={{
                marginLeft: 24,
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: 20,
                cursor: 'pointer'
            }} aria-label="Close">&times;</button>
        </div>
    );
}