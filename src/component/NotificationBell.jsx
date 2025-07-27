import React, { useState } from "react";

// NotificationBell: Displays a bell icon with a badge for unread notifications.
// Clicking the bell toggles a dropdown showing all notification banners.
export default function NotificationBell({ banners, isDarkMode }) {
    const [open, setOpen] = useState(false);

    // Bell icon SVG, color changes with dark mode
    const BellIcon = (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={isDarkMode ? "#eee" : "currentColor"} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    );

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            {/* bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 24,
                    color: "#fafafaff",
                    position: "relative",
                    marginTop: "-10px"
                }}
                aria-label="Notifications"
            >
                {BellIcon}
                {/* red badge with count if there are notifications */}
                {banners.length > 0 && (
                    <span style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "#d32f2f",
                        color: "white",
                        borderRadius: "50%",
                        padding: "2px 6px",
                        fontSize: 12,
                        fontWeight: 700
                    }}>
                        {banners.length}
                    </span>
                )}
            </button>
            {/* Dropdown with notification messages */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "120%",
                    right: 0,
                    minWidth: 300,
                    background: "white",
                    color: "#333",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(182, 32, 32, 0.15)",
                    zIndex: 10000,
                    padding: 12
                }}>
                    <b>Notifications</b>
                    <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                        {banners.length === 0 ? (
                            <li style={{ color: "#888" }}>No notifications</li>
                        ) : (
                            banners.map((msg, idx) => (
                                <li key={idx} style={{
                                    padding: "8px 0",
                                    borderBottom: idx !== banners.length - 1 ? "1px solid #eee" : "none"
                                }}>
                                    {msg}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}