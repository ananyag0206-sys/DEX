import { CircleUserRound, Cog, SunMoon } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase-client";
import { ThemeContext } from "./ThemeContext";
import bkg from "./bkg.jpg";
import bkg2 from "./bkg2.png";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AccountResetPage() {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    // ✅ Detect Supabase redirect
    useEffect(() => {
        if (window.location.hash.includes("access_token")) {
            setIsResetMode(true);
        }
    }, []);

    // ✅ Handle password update
    const handleUpdatePassword = async () => {
        if (!newPassword) {
            setMessage("Please enter a new password.");
            return;
        }
        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setIsLoading(false);

        if (error) {
            setMessage("❌ " + error.message);
        } else {
            setShowSuccess(true);
            setMessage("Password updated successfully!");
            setTimeout(() => navigate("/"), 2500);
        }
    };

    // 🎨 Styles
    const styles = {
        container: {
            minHeight: "100vh",
            width: "100vw",
            backgroundImage: `url(${isDarkMode ? bkg : bkg2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Poppins, sans-serif",
            color: "white",
            transition: "background 0.5s ease",
        },
        boxx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "10px 20px",
            minWidth: "10vw",
            borderRadius: "35px",
            border: "2px solid transparent",
            backgroundImage: isDarkMode
                ? "linear-gradient(#25257F, #1B1B37), linear-gradient(45deg, #D9B8DF, #5E15D4)"
                : "linear-gradient(45deg, #ccd6fcff, #F5F7FF), linear-gradient(45deg, #6A9CFF, #F5F3FA)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            color: isDarkMode ? "#fff" : "#000",
            fontWeight: "bold",
            position: "fixed",
            top: "20px",
            right: "20px",
        },
        iconGroup: {
            display: "flex",
            alignItems: "center",
            gap: "30px",
            color: isDarkMode ? "#fff" : "#000",
        },
        circleIcon: {
            minWidth: "2vw",
            minHeight: "4vh",
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        box: {
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "35px",
            padding: "40px",
            width: "55%",
            minWidth: "40vw",
            minHeight: "30vh",
            textAlign: "center",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        heading: {
            fontSize: "2rem",
            fontWeight: "700",
            color: isDarkMode ? "#d0d0d0" : "#000",
            marginBottom: "25px",
        },
        input: {
            minWidth: "70%",
            padding: "12px 15px",
            marginBottom: "15px",
            border: "2px solid transparent",
            borderRadius: "15px",
            outline: "none",
            fontSize: "0.95rem",
            color: "white",
            backgroundImage: isDarkMode
                ? "linear-gradient(90deg, #25257F, #1B1B37), linear-gradient(45deg, #003CFF, #E3DBE5)"
                : "linear-gradient(90deg, #DDE3FF, #F5F7FF), linear-gradient(45deg, #6A9CFF, #F5F3FA)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
        },
        button: {
            minWidth: "30%",
            padding: "10px",
            borderRadius: "55px",
            border: "2.5px solid transparent",
            backgroundImage: isDarkMode
                ? "linear-gradient(90deg, #7FE7FF, #37376F), linear-gradient(92deg, #D9B8DF, #5E15D4)"
                : "linear-gradient(90deg, #aff2feff, #A3A3FF), linear-gradient(92deg, #e9b2efff, #a979fbff)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
        },
        message: {
            marginBottom: "10px",
            color: isDarkMode ? "#ccc" : "#333",
            fontWeight: "500",
        },
    };

    return (
        <div style={styles.container}>
            {/* 🔹 Top Right Icon Bar */}
            <div style={styles.boxx}>
                <div style={styles.iconGroup}>
                    <div style={styles.circleIcon}><button onClick={() => navigate("/account-settings")} style={{ background: "none", border: "none" }}><Cog /></button></div>
                    <div style={styles.circleIcon}><button onClick={() => navigate("/")} style={{ background: "none", border: "none" }}><CircleUserRound /></button></div>
                    <div style={styles.circleIcon}><button onClick={toggleTheme} style={{ background: "none", border: "none" }}><SunMoon size={28} strokeWidth={1.75} /></button></div>
                </div>
            </div>

            {/* 🔹 Reset Box */}
            <div style={styles.box}>
                {isResetMode ? (
                    !showSuccess ? (
                        <>
                            <h1 style={styles.heading}>Reset Password</h1>
                            <p style={styles.message}>{message || "Enter your new password below:"}</p>

                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={styles.input}
                            />
                            <div>
                                <button onClick={handleUpdatePassword} style={styles.button}>
                                    {isLoading ? (
                                        <div
                                            style={{
                                                width: "24px",
                                                height: "24px",
                                                border: "3px solid #fff",
                                                borderTop: "3px solid transparent",
                                                borderRadius: "50%",
                                                margin: "auto",
                                                animation: "spin 0.8s linear infinite",
                                            }}
                                        />
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    background: "#4CAF50",
                                    margin: "auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    animation: "pop 0.3s ease-out",
                                }}
                            >
                                <span style={{ fontSize: "28px", color: "#fff" }}>✔</span>
                            </div>
                            <p style={{ marginTop: "12px" }}>Password updated successfully!</p>
                            <div
                                style={{
                                    height: "4px",
                                    width: "100%",
                                    background: "#333",
                                    borderRadius: "6px",
                                    overflow: "hidden",
                                    marginTop: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        background: "#48a2ff",
                                        animation: "progress 2s linear forwards",
                                    }}
                                ></div>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        <h3 style={styles.heading}>Invalid Access</h3>
                        <p style={styles.message}>This page can only be accessed via password reset link.</p>
                    </>
                )}
            </div>

            <style>
                {`
@keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
}
@keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
}
@keyframes progress {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
}
        `}
            </style>
        </div>
    );
}
