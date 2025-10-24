// src/components/AccountSettings.js
import React, { useState, useEffect } from "react";
import SideBar from "./SideBar"; // ✅ Import your sidebar component
import bkg from "./bkg.jpg";

export default function AccountSettings() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Load settings from localStorage or default
    const [settings, setSettings] = useState(() => {
        return JSON.parse(localStorage.getItem("accountSettings")) || {
            name: "Ananya Gupta",
            email: "ananya@example.com",
            suggestionFrequency: 50,
            darkMode: true,
            theme: "Dark",
            notifications: {
                slowQueries: true,
                connectionIssues: false,
                aiInsights: true,
            },
            integrations: {
                slack: true,
                webhooks: false,
            },
        };
    });

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("accountSettings", JSON.stringify(settings));
    }, [settings]);

    // Handle mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = {
        container: {
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url(${bkg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            fontFamily: "Inter, sans-serif",
            color: "#fff",
            padding: isMobile ? "10px 0" : "0px",
        },
        contentBox: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "95%",
            height: isMobile ? "auto" : "95vh",
            borderRadius: "16px",
            border: "2px solid rgba(255, 255, 255, 1)",
            overflow: "hidden",
            background: "rgba(30,30,30,0.30)",
            color: "#fff",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        },
        mainContent: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "10px" : "16px",
            gap: "10px",
            overflowY: "auto",
        },
        section: {
            background: "#191C28",
            borderRadius: "12px",
            border: "1px solid #fff",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        },
        sectionHeader: { fontSize: "16px", color: "#48a2ff", marginBottom: "8px" },
        input: {
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #555",
            background: "#10131E",
            color: "#fff",
            outline: "none",
            marginBottom: "10px",
        },
        slider: { width: "100%" },
        toggleRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "6px 0",
        },
        toggleLabel: { fontSize: "13px" },
        button: {
            background: "transparent",
            border: "1px solid #fff",
            color: "#fff",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            marginTop: "8px",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.contentBox}>
                {/* ✅ Sidebar Component */}
                <SideBar settings={settings} setSettings={setSettings} isMobile={isMobile} />

                {/* Main Content */}
                <div style={styles.mainContent}>
                    <h2 style={{ fontSize: "20px", color: "#48a2ff" }}>Account Settings</h2>

                    {/* Account Info */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionHeader}>Account Info</h3>
                        <label>Name</label>
                        <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            style={styles.input}
                        />
                        <label>Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            style={styles.input}
                        />
                        <button style={styles.button}>Change Password</button>
                    </div>

                    {/* AI Preferences */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionHeader}>AI Preferences</h3>
                        <label>Suggestion Frequency: {settings.suggestionFrequency}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.suggestionFrequency}
                            onChange={(e) =>
                                setSettings({ ...settings, suggestionFrequency: e.target.value })
                            }
                            style={styles.slider}
                        />
                    </div>

                    {/* Theme Settings */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionHeader}>Theme & Display</h3>
                        <div style={styles.toggleRow}>
                            <span>Current Theme: {settings.theme}</span>
                            <select
                                value={settings.theme}
                                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                style={styles.input}
                            >
                                <option>Dark</option>
                                <option>Light</option>
                                <option>System</option>
                            </select>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionHeader}>Notifications</h3>
                        {Object.entries(settings.notifications).map(([key, value]) => (
                            <div key={key} style={styles.toggleRow}>
                                <span style={styles.toggleLabel}>{key.replace(/([A-Z])/g, " $1")}</span>
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() =>
                                        setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, [key]: !value },
                                        })
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {/* Integrations */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionHeader}>Integrations</h3>
                        {Object.entries(settings.integrations).map(([key, value]) => (
                            <div key={key} style={styles.toggleRow}>
                                <span>{key.toUpperCase()}</span>
                                <button
                                    style={styles.button}
                                    onClick={() =>
                                        setSettings({
                                            ...settings,
                                            integrations: { ...settings.integrations, [key]: !value },
                                        })
                                    }
                                >
                                    {value ? "Disconnect" : "Connect"}
                                </button>
                            </div>
                        ))}
                        <button style={styles.button}>Generate New API Key</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
