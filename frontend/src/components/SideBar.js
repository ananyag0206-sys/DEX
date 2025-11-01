// SideBar.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bkg from "./bkg.jpg";   // Dark mode background
import bkg2 from "./bkg2.png"; // Light mode background
import { ThemeContext } from "./ThemeContext";
import { supabase } from "./supabase-client"; // ✅ Import Supabase

export default function SideBar({ children }) {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext); // get theme from context
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const navigate = useNavigate();
    const handleNavigate = (path) => navigate(path);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ---------- Styles ----------
    const styles = {
        container: {
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url(${isDarkMode ? bkg : bkg2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            fontFamily: "Inter, sans-serif",
            color: isDarkMode ? "#fff" : "#000",
            padding: isMobile ? "10px 0" : "0px",
            transition: "all 0.3s ease",
        },
        mainWrapper: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "95%",
            height: isMobile ? "auto" : "95vh",
            borderRadius: "16px",
            border: `2px solid ${isDarkMode ? "#fff" : "#000"}`,
            overflow: "hidden",
            background: isDarkMode ? "rgba(30,30,30,0.3)" : "rgba(255,255,255,0.3)",
            padding: "0px",
            color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.5)",
            boxShadow: isDarkMode ? "0 12px 30px rgba(0,0,0,0.2)" : "0 12px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
        },
        sidebar: {
            width: isMobile ? "100%" : "240px",
            background: isDarkMode
                ? "linear-gradient(400deg, #0D1630 40%, #394F98 100%)"
                : "#f2f2f2d1",
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "12px" : "24px",
            boxSizing: "border-box",
            borderRadius: isMobile ? "16px 16px 0 0" : "16px 0 0 16px",
            flexShrink: 0,
            transition: "all 0.3s ease",
            color: isDarkMode ? "#fff" : "#000",
        },
        logo: {
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
            color: isDarkMode ? "#fff" : "#000",
        },
        sidebarSearchContainer: { marginBottom: "12px" },
        sidebarSearchInput: {
            width: "100%",
            padding: isMobile ? "6px" : "8px",
            borderRadius: "8px",
            border: isDarkMode ? "none" : "1px solid #ccc",
            outline: "none",
            background: isDarkMode ? "#191C28" : "#F0F0F0",
            color: isDarkMode ? "#fff" : "#000",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.3s ease",
        },
        navList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" },
        navButton: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "transparent",
            border: "none",
            color: isDarkMode ? "#b5c4df" : "#333",
            fontSize: isMobile ? "13px" : "14px",
            padding: "10px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.3s ease",
        },
        sidebarFooter: { marginTop: "auto", fontSize: isMobile ? "11px" : "12px" },
        darkModeContainer: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" },
        contentArea: {
            flex: 1,
            padding: isMobile ? "10px" : "16px",
            overflowY: "auto",
            background: isDarkMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.3)",
            borderRadius: "0 16px 16px 0",
            transition: "all 0.3s ease",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainWrapper}>
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.logo}>DEX</div>
                    <div style={styles.sidebarSearchContainer}>
                        {/* <input placeholder="Search..." style={styles.sidebarSearchInput} /> */}
                    </div>

                    {/* Navigation Links */}
                    <nav>
                        <ul style={styles.navList}>
                            <li>
                                <button onClick={() => handleNavigate("/connecteddatabase")} style={styles.navButton}>
                                    Home
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/databases")} style={styles.navButton}>
                                    Databases
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/queryeditor")} style={styles.navButton}>
                                    Queries
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/AIinsights")} style={styles.navButton}>
                                    AI Insights
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Footer with Dark Mode and Sign Out */}
                    <div style={styles.sidebarFooter}>
                        <div>Welcome, Ananya</div>
                        <div style={styles.darkModeContainer}>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="switchCheckDefault"
                                    checked={!isDarkMode}
                                    onChange={toggleTheme}
                                />
                                <label className="form-check-label" htmlFor="switchCheckDefault">
                                    Dark / Light Mode
                                </label>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={async () => {
                                const { error } = await supabase.auth.signOut();
                                if (error) alert(error.message);
                                else navigate("/");
                            }}
                            style={{ ...styles.navButton, marginTop: "10px", color: "#ff4d4f", fontWeight: "bold" }}
                        >
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <div style={styles.contentArea}>{children}</div>
            </div>
        </div>
    );
}
