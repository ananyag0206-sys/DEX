import React, { useState, useEffect, useContext } from "react";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";
import { supabase } from "./supabase-client";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [newPassword, setNewPassword] = useState("");
    const [resetStage, setResetStage] = useState("normal");
    const [message, setMessage] = useState("");

    const [settings, setSettings] = useState(() => {
        return JSON.parse(localStorage.getItem("accountSettings")) || {
            name: "Ananya Gupta",
            email: "ananya@example.com",
            suggestionFrequency: 50,
            theme: isDarkMode ? "Dark" : "Light",
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

    // ✅ Save settings to localStorage
    useEffect(() => {
        localStorage.setItem("accountSettings", JSON.stringify(settings));
    }, [settings]);

    // ✅ Detect Supabase redirect
    useEffect(() => {
        const hashParams = window.location.hash;
        if (hashParams && hashParams.includes("access_token")) {
            setResetStage("reset");
            setMessage("Enter your new password below.");
        }
    }, []);

    // ✅ Responsive check
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ✅ Step 1: Send reset link
    const handleResetPassword = async () => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                settings.email,
                {
                    redirectTo: "http://localhost:3000/account-reset",
                }
            );
            if (error) throw error;
            alert("✅ Password reset link sent to your email.");
        } catch (err) {
            console.error("Password reset error:", err.message);
            alert("❌ Error sending reset link: " + err.message);
        }
    };

    // ✅ Step 2: Update password when link clicked
    const handleUpdatePassword = async () => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setMessage("❌ " + error.message);
        } else {
            setMessage("✅ Password updated successfully!");
            setTimeout(() => {
                window.location.hash = "";
                navigate("/login");
            }, 2000);
        }
    };

    // ✅ Handle theme change from settings dropdown
    const handleThemeChange = (theme) => {
        const selectedDark = theme === "Dark";

        // Only toggle if different from current theme
        if (selectedDark !== isDarkMode) {
            toggleTheme(); // calls ThemeContext toggle function
        }

        // Update settings + localStorage
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem("isDarkMode", JSON.stringify(selectedDark));

        // Update background immediately
        document.body.style.backgroundColor = selectedDark ? "#10131E" : "#fff";
    };

    // ✅ Sync dropdown when Sidebar toggle changes
    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            theme: isDarkMode ? "Dark" : "Light",
        }));
        document.body.style.backgroundColor = isDarkMode ? "#10131E" : "#fff";
    }, [isDarkMode]);

    const styles = {
        mainContent: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "10px" : "16px",
            gap: "10px",
            overflowY: "auto",
            transition: "background 0.3s ease",
        },
        section: {
            background: isDarkMode ? "#191C28" : "#f0f0f0",
            borderRadius: "12px",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            padding: "16px",
            boxShadow: isDarkMode
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.1)",
        },
        sectionHeader: { fontSize: "16px", color: "#48a2ff", marginBottom: "8px" },
        input: {
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: `1px solid ${isDarkMode ? "#555" : "#aaa"}`,
            background: isDarkMode ? "#10131E" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
            outline: "none",
            marginBottom: "10px",
        },
        button: {
            background: "#48a2ff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#fff",
            marginTop: "8px",
        },
        secondaryButton: {
            background: "transparent",
            border: "1px solid #48a2ff",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#48a2ff",
            marginTop: "10px",
        },
    };

    return (
        <SideBar>
            <div style={styles.mainContent}>
                <h2 style={{ fontSize: "20px", color: "#48a2ff" }}>Account Settings</h2>

                {resetStage === "reset" ? (
                    <div style={styles.section}>
                        <h3 style={styles.sectionHeader}>Reset Your Password</h3>
                        <p>{message}</p>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={styles.input}
                        />
                        <button style={styles.button} onClick={handleUpdatePassword}>
                            Update Password
                        </button>
                        <button
                            style={styles.secondaryButton}
                            onClick={() => navigate("/login")}
                        >
                            Go Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Account Info */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionHeader}>Account Info</h3>
                            <label>Name</label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) =>
                                    setSettings({ ...settings, name: e.target.value })
                                }
                                style={styles.input}
                            />
                            <label>Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) =>
                                    setSettings({ ...settings, email: e.target.value })
                                }
                                style={styles.input}
                            />
                            <button style={styles.button} onClick={handleResetPassword}>
                                Reset Password
                            </button>
                        </div>

                        {/* AI Preferences */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionHeader}>AI Preferences</h3>
                            <label>
                                Suggestion Frequency: {settings.suggestionFrequency}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.suggestionFrequency}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        suggestionFrequency: e.target.value,
                                    })
                                }
                                style={{ width: "100%" }}
                            />
                        </div>

                        {/* Theme Settings */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionHeader}>Theme & Display</h3>
                            <label>Current Theme: {settings.theme}</label>
                            <select
                                value={settings.theme}
                                onChange={(e) => handleThemeChange(e.target.value)}
                                style={styles.input}
                            >
                                <option>Dark</option>
                                <option>Light</option>
                            </select>
                        </div>

                        {/* Notifications */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionHeader}>Notifications</h3>
                            {Object.entries(settings.notifications).map(([key, value]) => (
                                <div
                                    key={key}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        margin: "6px 0",
                                    }}
                                >
                                    <span style={{ fontSize: "13px" }}>
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() =>
                                            setSettings({
                                                ...settings,
                                                notifications: {
                                                    ...settings.notifications,
                                                    [key]: !value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </SideBar>
    );
}
