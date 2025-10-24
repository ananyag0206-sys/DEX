// SideBar.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navigate = useNavigate();
    const handleNavigate = (path) => navigate(path);

    const styles = {
        sidebar: {
            width: isMobile ? "100%" : "240px",
            backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "12px" : "24px",
            boxSizing: "border-box",
            borderRadius: isMobile ? "16px 16px 0 0" : "16px 0 0 16px",
            flexShrink: 0,
        },
        logo: {
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
            color: "#fff",
        },
        sidebarSearchContainer: { marginBottom: "12px" },
        sidebarSearchInput: {
            width: "100%",
            padding: isMobile ? "6px" : "8px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            background: "#191C28",
            color: "#fff",
            fontSize: isMobile ? "12px" : "13px",
        },
        navList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" },
        navButton: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "transparent",
            border: "none",
            color: "#b5c4df",
            fontSize: isMobile ? "13px" : "14px",
            padding: "10px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "left",
            transition: "background 0.2s",
        },
        sidebarFooter: { marginTop: "auto", fontSize: isMobile ? "11px" : "12px" },
        darkModeContainer: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" },
    };

    return (
        <aside style={styles.sidebar}>
            <div style={styles.logo}>DEX</div>
            <div style={styles.sidebarSearchContainer}>
                <input placeholder="Search..." style={styles.sidebarSearchInput} />
            </div>
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
                        <button onClick={() => handleNavigate("/queries")} style={styles.navButton}>
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
            <div style={styles.sidebarFooter}>
                <div>Welcome, Ananya</div>
                <div style={styles.darkModeContainer}>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="switchCheckDefault" />
                        <label className="form-check-label" htmlFor="switchCheckDefault">
                            Dark / Light Mode
                        </label>
                    </div>
                </div>
            </div>
        </aside>
    );
}
