import React from 'react';

export default function BudgetBannerNotification({
    message,
    onClose,
    onNext,
    onPrev,
    showPrev,
    showNext,
    idx,
    total
}) {
    if (!message) return null;
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
            <span>
                {message}
                {typeof idx === 'number' && typeof total === 'number' && total > 1 && (
                    <span style={{ fontSize: 14, marginLeft: 12 }}>
                        ({idx + 1} of {total})
                    </span>
                )}
            </span>
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