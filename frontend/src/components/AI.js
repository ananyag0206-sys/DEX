import React, { useState, useEffect, useContext } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";

export default function AI() {
    const { isDarkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleNavigate = (path) => navigate(path);

    // Dummy chart & recommendations data
    const queryPerformance = [
        { name: "100", value: 20 },
        { name: "200", value: 60 },
        { name: "300", value: 40 },
        { name: "400", value: 80 },
        { name: "500", value: 60 },
        { name: "600", value: 120 },
        { name: "700", value: 90 },
    ];

    const growthData = [
        { category: "Users", current: 150, previous: 60 },
        { category: "Products", current: 140, previous: 70 },
        { category: "High Growth Products", current: 200, previous: 40 },
    ];

    const recommendations = [
        {
            title: "Query Optimization",
            description: "Add index to users.email for faster login query execution.",
            improvement: "Improve speed by 15%",
            icon: "💡",
            buttons: ["Apply", "Reject"],
        },
        {
            title: "Schema Optimization",
            description: "Partition logs_large table by date to enhance performance.",
            improvement: "Improve speed significantly",
            icon: "🧩",
            buttons: ["Apply", "Reject"],
        },
        {
            title: "Anomaly Detection",
            description: "Unusual deletions in line_usage table detected. Monitor this month.",
            icon: "🔍",
            buttons: ["Apply", "Reject"],
        },
        {
            title: "Predictive Analytics",
            description: "Orders table likely to exceed 3M rows within 1 year — plan for scaling.",
            icon: "📊",
            buttons: ["Review", "Plan Ahead"],
        },
    ];

    // Styles
    const styles = {
        mainContent: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "10px" : "16px",
            gap: "10px",
            overflowY: "auto",
            background: isDarkMode ? "rgba(30,30,30,0.3)" : "rgba(255,255,255,0.3)",
            borderRadius: "12px",
            transition: "all 0.3s ease",
        },
        header: { fontSize: isMobile ? "18px" : "20px", color: "#48a2ff", margin: 0 },
        filterRow: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "8px",
            alignItems: "center",
        },
        filterButton: {
            background: isDarkMode ? "#191C28" : "#f0f0f0",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            color: isDarkMode ? "#fff" : "#000",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            cursor: "pointer",
        },
        recommendationsBox: {
            background: isDarkMode ? "#191C28" : "#f9f9f9",
            borderRadius: "12px",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            padding: "12px",
            boxShadow: isDarkMode
                ? "0 6px 15px rgba(0,0,0,0.3)"
                : "0 6px 15px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
        },
        recCard: {
            background: isDarkMode ? "#10131E" : "#fff",
            borderRadius: "12px",
            padding: "12px",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            marginBottom: "8px",
            boxShadow: isDarkMode
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
        },
        chartContainer: {
            background: isDarkMode ? "#191C28" : "#fff",
            borderRadius: "12px",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            padding: "10px",
            boxShadow: isDarkMode
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
        },
        footerAlert: {
            background: isDarkMode ? "#191C28" : "#f9f9f9",
            borderRadius: "12px",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            padding: "8px",
            fontSize: "12px",
            marginTop: "auto",
            transition: "all 0.3s ease",
        },
    };

    return (
        <SideBar>
            <div style={styles.mainContent}>
                <h2 style={styles.header}>AI Insights & Optimization</h2>

                {/* Filter Row */}
                <div style={styles.filterRow}>
                    <button style={styles.filterButton}>Database: All</button>
                    <button style={styles.filterButton}>Date: Last 30 Days</button>
                    <button style={styles.filterButton}>Type: All</button>
                    <button onClick={() => handleNavigate("/NewChat")} style={styles.filterButton}>
                        New Chat
                    </button>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                        <button style={styles.filterButton}>☆ Connect Insights</button>
                        <button style={styles.filterButton}>Export</button>
                    </div>
                </div>

                {/* Recommendations */}
                <div style={styles.recommendationsBox}>
                    {recommendations.map((rec, i) => (
                        <div key={i} style={styles.recCard}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontWeight: "600", fontSize: "15px", color: isDarkMode ? "#fff" : "#000" }}>
                                    {rec.icon} {rec.title}
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {rec.buttons.map((btn) => (
                                        <button
                                            key={btn}
                                            style={{
                                                background: "transparent",
                                                border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                                                color: isDarkMode ? "#fff" : "#000",
                                                borderRadius: "6px",
                                                padding: "4px 10px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {btn}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: "6px", fontSize: "12px", color: isDarkMode ? "#ccc" : "#555" }}>
                                {rec.description}
                            </div>
                            {rec.improvement && (
                                <div style={{ marginTop: "4px", fontSize: "12px", color: "#48a2ff" }}>
                                    {rec.improvement}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                    <div style={styles.chartContainer}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", color: isDarkMode ? "#fff" : "#000" }}>
                            Query Performance Trends
                        </h4>
                        <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={queryPerformance}>
                                <CartesianGrid stroke={isDarkMode ? "#444" : "#ccc"} strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke={isDarkMode ? "#ccc" : "#333"} />
                                <YAxis stroke={isDarkMode ? "#ccc" : "#333"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? "#333" : "#fff",
                                        borderRadius: "6px",
                                        color: isDarkMode ? "#fff" : "#000",
                                    }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.chartContainer}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", color: isDarkMode ? "#fff" : "#000" }}>
                            Database Growth Trends
                        </h4>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={growthData}>
                                <CartesianGrid stroke={isDarkMode ? "#444" : "#ccc"} strokeDasharray="3 3" />
                                <XAxis dataKey="category" stroke={isDarkMode ? "#ccc" : "#333"} />
                                <YAxis stroke={isDarkMode ? "#ccc" : "#333"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? "#333" : "#fff",
                                        borderRadius: "6px",
                                        color: isDarkMode ? "#fff" : "#000",
                                    }}
                                />
                                <Bar dataKey="previous" fill="#60a5fa" />
                                <Bar dataKey="current" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Alert */}
                <div style={styles.footerAlert}>
                    Alerts: Connection issues with <b>High: Analysis_DB</b> detected.
                </div>
            </div>
        </SideBar>
    );
}
