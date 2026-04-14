import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom"; // ✅ Added for page navigation
import bkg from "./bkg.jpg";

function Dashboard() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate(); // ✅ navigation hook

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isTablet = windowWidth <= 1024;
    const isMobile = windowWidth <= 600;

    // ✅ Function to handle navigation
    const handleConnectDatabase = () => {
        navigate("/connecteddatabase");
    };

    // Sample data for chart
    const chartData = [
        { time: "8AM", queries: 5 },
        { time: "10AM", queries: 8 },
        { time: "12PM", queries: 6 },
        { time: "2PM", queries: 12 },
        { time: "4PM", queries: 9 },
        { time: "6PM", queries: 14 },
        { time: "8PM", queries: 7 },
    ];

const styles = {
    container: {
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${bkg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: isMobile ? "column" : "row", // ✅ mobile responsive
        fontFamily: "Inter, sans-serif",
        color: "#fff",
    },
    contentBox: {
        display: "flex",
        flex: 1,
        margin: isMobile ? "5px" : "20px",
        border: "2px solid #ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(30, 30, 30, 0.85)",
        flexDirection: isMobile ? "column" : "row", // ✅
    },
    dashboardContainer: {
        display: "flex",
        flex: 1,
        height: "100%",
        overflow: "hidden",
        flexDirection: isMobile ? "column" : "row", // ✅
    },
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
        fontSize: "30px",
        fontWeight: "bold",
        color: "#fbfbfb",
        marginBottom: "30px",
        textAlign: "center",
    },
    searchContainer: {
        display: "flex",
        alignItems: "center",
        background: "#191C28",
        borderRadius: "8px",
        width: isMobile ? "100%" : "80%",
        minHeight: "20px",
        border: "1px solid #ffffff",
        padding: "5px 10px",
        marginBottom: "20px",
    },
    searchInput: {
        flex: 1,
        border: "none",
        outline: "none",
        background: "transparent",
        color: "#fff",
        fontSize: "12px",
    },
    navButton: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        background: "transparent",
        border: "none",
        color: "#b5c4df",
        fontSize: "14px",
        padding: "10px 15px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left",
    },
    navList: {
        listStyleType: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    sidebarFooter: {
        marginTop: "auto",
        fontSize: "12px",
    },
    darkModeContainer: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "5px",
    },
    mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "10px" : "20px",
        gap: "10px",
        overflowY: "auto",
    },
    headerH2: {
        fontSize: "25px",
        marginBottom: "1px",
        marginTop: "0px",
        color: "#48a2ff",
    },
    stats: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        minHeight: "140px",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row", // ✅
    },
    statBox: {
        flex: "1 1 30%",
        minWidth: isMobile ? "100%" : "100px",
        border: "1px solid #ffffff",
        backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
        borderRadius: "10px",
        padding: "10px",
        textAlign: "center",
        boxShadow: "0 4px 16px 0 #232f45",
    },
    statBoxP: {
        margin: "0 0 5px 0",
        color: "#ffffff",
        fontSize: "20px",
        height: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textTransform: "uppercase",
        letterSpacing: "1px",
        textAlign: "center",
    },
    statBoxH3: { margin: 0, fontSize: "25px", color: "#ffffff" },
    overview: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row", // ✅
    },
    activity: {
        width: isMobile ? "100%" : "550px",
        color: "#fff",
        fontSize: "25px",
        minHeight: "140px",
        border: "1px solid #ffffff",
        backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
        borderRadius: "10px",
        padding: "10px",
    },
    queriesOverTime: {
        flex: "1 1 48%",
        width: isMobile ? "100%" : undefined,
        minHeight: "100px",
        border: "1px solid #ffffff",
        backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
        borderRadius: "10px",
        padding: "10px",
    },
    aiSectionContainer: {
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: "20px",
        flexDirection: isMobile ? "column" : "row", // ✅
    },
    aiRecommendations: {
        flex: "1 1 55%",
        border: "1px solid #ffffff",
        backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
        borderRadius: "16px",
        padding: "22px 24px",
    },
    rightBoxes: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: isMobile ? "100%" : "35%",
    },
    rightBox: {
        border: "1px solid #ffffff",
        backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
        color: "#fff",
        padding: "10px 15px",
        borderRadius: "10px",
        textAlign: "center",
        cursor: "pointer",
        height: "74px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    },
    button: {
        backgroundColor: "transparent",
        color: "inherit",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        fontWeight: "500",
        padding: "0",
        transition: "transform 0.2s ease, opacity 0.2s ease",
    },
    pinnedDatabases: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        background: "#202632",
        borderRadius: "10px",
        padding: "10px",
        border: "1px solid #ffffff",
        backgroundImage: "linear-gradient(400deg, #0D1630 40%, #394F98 100%)",
        minHeight: "100px",
    },
    pinnedH4: {
        fontSize: "25px",
        color: "#48a2ff",
        margin: 0,
        textTransform: "uppercase",
        marginBottom: "10px",
        letterSpacing: "1px",
    },
    pinnedList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: isMobile ? "center" : "flex-start", // ✅
    },
    pinnedItem: {
        flex: "0 0 200px",
        padding: "5px",
        borderRadius: "6px",
        background: "#242b36",
        textAlign: "center",
        fontSize: "12px",
        height: "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#ffffff",
    },
    pinnedAdd: {
        width: "60px",
        height: "40px",
        borderRadius: "6px",
        background: "#242b36",
        border: "2px dashed #48a2ff",
        color: "#48a2ff",
        textAlign: "center",
        cursor: "pointer",
        fontSize: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
        alignSelf: "flex-start",
    },
};


    return (
        <div style={styles.container}>
            <div style={styles.contentBox}>
                <div style={styles.dashboardContainer}>
                    {/* Sidebar */}
                    <aside style={styles.sidebar}>
                        <div style={styles.logo}>DEX</div>
                        <div style={styles.searchContainer}>
                            <input type="text" placeholder="Search" style={styles.searchInput} />
                        </div>
                        <nav>
                            <ul style={styles.navList}>
                                <li><button style={styles.navButton}>Home</button></li>
                                <li><button onClick={handleConnectDatabase} // ✅ navigate to connected page 
                                style={styles.navButton}>Databases</button></li>
                                <li><button style={styles.navButton}>Queries</button></li>
                                <li><button style={styles.navButton}>AI Insights</button></li>
                            </ul>
                        </nav>
                        <div style={styles.sidebarFooter}>
                            <div>Welcome, Ananya</div>
                            <div style={styles.darkModeContainer}>
                                <input type="checkbox" id="modeSwitch" />
                                <label htmlFor="modeSwitch">Dark / Light Mode</label>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main style={styles.mainContent}>
                        <header>
                            <h2 style={styles.headerH2}>Welcome, Ananya! Here's your data overview.</h2>
                        </header>

                        {/* Stats Section */}
                        <section style={styles.stats}>
                            <div style={styles.statBox}>
                                <p style={styles.statBoxP}>Total Databases</p>
                                <h3 style={styles.statBoxH3}>17</h3>
                            </div>
                            <div style={styles.statBox}>
                                <p style={styles.statBoxP}>Queries Today</p>
                                <h3 style={styles.statBoxH3}>53</h3>
                            </div>
                            <div style={styles.statBox}>
                                <p style={styles.statBoxP}>AI Suggestions Applied</p>
                                <h3 style={styles.statBoxH3}>12</h3>
                            </div>
                        </section>

                        {/* Overview Section */}
                        <section style={styles.overview}>
                            <div style={styles.activity}>
                                <h4>Recent Activity</h4>
                                <ul>
                                    <li>Executed: SELECT * FROM users</li>
                                    <li>Executed: SELECT users (Project_Alpha)</li>
                                    <li>DB 'Analytics_V2' connected</li>
                                    <li>AI: Index added on 'order_db' table</li>
                                </ul>
                            </div>

                            <div style={styles.queriesOverTime}>
                                <h4>Queries Over Time</h4>
                                <ResponsiveContainer width="100%" height={120}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid stroke="#232f45" strokeDasharray="3 3" />
                                        <XAxis dataKey="time" stroke="#48a2ff" />
                                        <YAxis stroke="#48a2ff" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#202632",
                                                borderRadius: "8px",
                                                border: "none",
                                                color: "#fff",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="queries"
                                            stroke="#40a9ff"
                                            strokeWidth={3}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* AI + Right Side */}
                        <section style={styles.aiSectionContainer}>
                            <div style={styles.aiRecommendations}>
                                <h4>AI Recommendations</h4>
                                <ul>
                                    <li>Optimize query: 'customer-data:logs_db_events'</li>
                                    <li>High-traffic table: financial.records</li>
                                </ul>
                            </div>

                            <div style={styles.rightBoxes}>
                                <div style={styles.rightBox}>
                                    <button
                                        style={styles.button}
                                        
                                    >
                                        Connect New Database
                                    </button>
                                </div>
                                <div style={styles.rightBox}>
                                    <button style={styles.button}>View Database</button>
                                </div>
                            </div>
                        </section>

                        {/* Pinned Databases */}
                        <section style={styles.pinnedDatabases}>
                            <h4 style={styles.pinnedH4}>Pinned Databases</h4>
                            <div style={styles.pinnedList}>
                                <div style={styles.pinnedItem}>🗄️ Project_Alpha</div>
                                <div style={styles.pinnedItem}>🗄️ Analytics_DB</div>
                                <div style={styles.pinnedItem}>🗄️ Logs_Archive</div>
                                <div style={styles.pinnedAdd}>+</div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
