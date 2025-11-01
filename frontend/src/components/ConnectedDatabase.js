// ConnectedDatabase.js
import React, { useState, useEffect, useContext } from "react";
import { Edit, Trash, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { ThemeContext } from "./ThemeContext";

// ---------- Initial Data ----------
const initialDatabases = [
    {
        name: "Project_Alpha",
        status1: "Connected",
        status2: "Connected",
        lastUpdate: "5 sec ago"
    },
    {
        name: "Posttgfcs_BL",
        status1: "Connected",
        status2: "Disconnected",
        lastUpdate: ""
    },
    {
        name: "Analytics_DB",
        status1: "Connected",
        status2: "Connected",
        lastUpdate: ""
    },
    {
        name: "Enterpriss_DB",
        status1: "Disconnected",
        status2: "Disconnected",
        lastUpdate: "21 Days ago"
    },
];

const monitoringData = [
    { time: "10:00", response: 45 },
    { time: "10:05", response: 50 },
    { time: "10:10", response: 55 },
    { time: "10:15", response: 52 },
    { time: "10:20", response: 60 },
    { time: "10:30", response: 58 },
];

// ---------- Components ----------
function StatusIndicator({ status, isDarkMode }) {
    return <span style={{
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        marginRight: "4px",
        backgroundColor: status === "Connected" ? "#22c55e" : "#ef4444",
    }}></span>;
}

function DatabaseCard({ db, isMobile, isDarkMode, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [newName, setNewName] = React.useState(db.name);

    const cardStyle = {
        background: isDarkMode ? "#191C28" : "#f9f9f9",
        borderRadius: "12px",
        padding: "8px",
        marginBottom: "7px",
        display: "flex",
        border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        boxShadow: isDarkMode ? "0 6px 15px rgba(0,0,0,0.3)" : "0 6px 15px rgba(0,0,0,0.1)",
        cursor: "pointer",
        fontSize: isMobile ? "12px" : "13px",
        transition: "transform 0.2s, box-shadow 0.2s",
        color: isDarkMode ? "#fff" : "#000",
    };

    const dbButtonStyle = {
        background: isDarkMode ? "#374151" : "#e5e7eb",
        padding: "4px 8px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        border: "none",
        color: isDarkMode ? "#fff" : "#000",
        cursor: "pointer",
        fontSize: "11px",
        transition: "background 0.2s",
    };

    const inputStyle = {
        padding: "6px 8px",
        borderRadius: "6px",
        border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
        background: isDarkMode ? "#10131E" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        outline: "none",
        fontSize: "13px",
    };

    return (
        <div
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {isEditing ? (
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => { onUpdate(db.name, newName); setIsEditing(false); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { onUpdate(db.name, newName); setIsEditing(false); } }}
                        style={inputStyle}
                        autoFocus
                    />
                ) : (
                    <div style={{ fontWeight: "600", fontSize: isMobile ? "13px" : "14px" }}>{db.name}</div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "11px", alignItems: "center" }}>
                    {db.lastUpdate && <span style={{ color: "#9ca3af" }}>{db.lastUpdate}</span>}
                    <span style={{ display: "flex", alignItems: "center" }}>
                        <StatusIndicator status={db.status1} isDarkMode={isDarkMode} /> {db.status1}
                    </span>
                    <span style={{ display: "flex", alignItems: "center" }}>
                        <StatusIndicator status={db.status2} isDarkMode={isDarkMode} /> {db.status2}
                    </span>
                </div>
            </div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                <button style={dbButtonStyle} onClick={() => setIsEditing(true)}><Edit size={12} /> Edit</button>
                <button style={dbButtonStyle} onClick={() => onDelete(db.name)}><Trash size={12} /> Delete</button>
            </div>
        </div>
    );
}

// ---------- Main Component ----------
export default function ConnectedDatabase() {
    const { isDarkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("All Databases");
    const [dbList, setDbList] = useState([]);
    const [showAddDB, setShowAddDB] = useState(false);
    const [newDBName, setNewDBName] = useState("");
    const navigate = useNavigate();

    // Load from localStorage
    useEffect(() => {
        const storedDBs = JSON.parse(localStorage.getItem("dbList") || "[]");
        const merged = [...storedDBs];
        initialDatabases.forEach(initDB => {
            if (!storedDBs.find(db => db.name === initDB.name)) {
                merged.push(initDB);
            }
        });
        setDbList(merged);
        localStorage.setItem("dbList", JSON.stringify(merged));
    }, []);

    const saveToLocalStorage = (updatedList) => {
        localStorage.setItem("dbList", JSON.stringify(updatedList));
        setDbList(updatedList);
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleUpdate = (oldName, newName) => {
        const updated = dbList.map(db => db.name === oldName ? { ...db, name: newName } : db);
        saveToLocalStorage(updated);
    };

    const handleDelete = (name) => saveToLocalStorage(dbList.filter(db => db.name !== name));
    const handleAddDatabase = () => {
        if (!newDBName.trim()) return;
        saveToLocalStorage([...dbList, { name: newDBName, status1: "Disconnected", status2: "Disconnected", lastUpdate: "" }]);
        setNewDBName("");
        setShowAddDB(false);
    };

    const filterOptions = ["All Databases", "Connected", "Disconnected", "Other"];
    const filteredDbList = dbList.filter(db => {
        if (selectedFilter === "All Databases") return true;
        if (selectedFilter === "Connected") return db.status1 === "Connected" || db.status2 === "Connected";
        if (selectedFilter === "Disconnected") return db.status1 === "Disconnected" && db.status2 === "Disconnected";
        return true;
    });

    // Styles that depend on dark/light
    const dynamicStyles = {
        mainContent: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "8px" : "12px",
            gap: "8px",
            height: "100%",
            justifyContent: "flex-start",
            background: isDarkMode ? "rgba(30,30,30,0.3)" : "rgba(255,255,255,0.3)",
        },
        heading: {
            color: isDarkMode ? "#0080ffff" : "#0259b1ff",
            fontSize: isMobile ? "18px" : "20px",
            margin: 0,
        },
        searchInput: {
            width: "100%",
            padding: isMobile ? "6px" : "8px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            background: isDarkMode ? "#191C28" : "#f0f0f0",
            color: isDarkMode ? "#fff" : "#000",
            fontSize: isMobile ? "12px" : "13px",
            marginBottom: "6px",
        },
        filterButton: {
            background: isDarkMode ? "#191C28" : "#f0f0f0",
            color: isDarkMode ? "#fff" : "#000",
            border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
            padding: "6px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: isMobile ? "11px" : "12px",
            minWidth: "90px",
            textAlign: "center",
        },
    };

    return (
        <SideBar isMobile={isMobile}>
            <div style={dynamicStyles.mainContent}>
                <h2 style={dynamicStyles.heading}>Connected Databases</h2>
                <input placeholder="Search database..." style={dynamicStyles.searchInput} />

                {/* Filter, Settings & Add */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                        <button style={dynamicStyles.filterButton} onClick={() => setFilterOpen(!filterOpen)}>
                            {selectedFilter} ▼
                        </button>
                        {filterOpen && <div style={{
                            position: "absolute",
                            background: isDarkMode ? "#1f2937" : "#e5e7eb",
                            borderRadius: "8px",
                            marginTop: "4px",
                            minWidth: "150px",
                            boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
                            zIndex: 100,
                        }}>
                            {filterOptions.map(opt => (
                                <div key={opt} style={{ padding: "6px 12px", cursor: "pointer", color: isDarkMode ? "#fff" : "#000" }}
                                    onClick={() => { setSelectedFilter(opt); setFilterOpen(false); }}>{opt}</div>
                            ))}
                        </div>}
                    </div>

                    <button style={dynamicStyles.filterButton} onClick={() => navigate("/AccountSettings")}>⚙️ Settings</button>

                    <button style={dynamicStyles.filterButton} onClick={() => setShowAddDB(true)}><Plus size={14} /> Add Database</button>
                </div>

                {/* Add DB Modal */}
                {showAddDB && (
                    <div style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 200
                    }}>
                        <div style={{
                            background: isDarkMode ? "#191C28" : "#fff",
                            padding: "20px",
                            borderRadius: "12px",
                            width: isMobile ? "90%" : "400px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                        }}>
                            <h3 style={{ margin: 0, color: "#48a2ff" }}>Add New Database</h3>
                            <input placeholder="Database Name" value={newDBName} onChange={(e) => setNewDBName(e.target.value)}
                                style={{
                                    padding: "8px",
                                    borderRadius: "8px",
                                    border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                                    background: isDarkMode ? "#191C28" : "#f9f9f9",
                                    color: isDarkMode ? "#fff" : "#000"
                                }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <button style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                                    background: "#374151",
                                    color: "#fff"
                                }} onClick={() => setShowAddDB(false)}>Cancel</button>
                                <button style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                                    background: "#7c3aed",
                                    color: "#fff"
                                }} onClick={handleAddDatabase}>Add</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Database List */}
                <div style={{ flex: 1, overflowY: "auto", marginBottom: "8px" }}>
                    {filteredDbList.map(db => <DatabaseCard key={db.name} db={db} isMobile={isMobile} isDarkMode={isDarkMode} onUpdate={handleUpdate} onDelete={handleDelete} />)}
                </div>

                {/* Monitoring Chart */}
                <div style={{
                    width: "100%",
                    minHeight: "60px",
                    background: isDarkMode ? "#191C28" : "#f9f9f9",
                    borderRadius: "12px",
                    border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                    padding: "2px",
                    fontSize: "10px",
                    marginBottom: "2px",
                    boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
                }}>
                    <h4 style={{ margin: "2px 0", fontSize: "12px", color: isDarkMode ? "#fff" : "#000" }}>Database Monitoring</h4>
                    <ResponsiveContainer width="100%" height={190}>
                        <LineChart data={monitoringData}>
                            <CartesianGrid stroke={isDarkMode ? "#444" : "#ccc"} strokeDasharray="3 3" />
                            <XAxis dataKey="time" stroke={isDarkMode ? "#fff" : "#000"} fontSize={10} />
                            <YAxis stroke={isDarkMode ? "#fff" : "#000"} fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#1f2937" : "#f0f0f0", border: "none", fontSize: "11px" }} />
                            <Line type="monotone" dataKey="response" stroke="#48a2ff" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Connection Health */}
                <div style={{
                    width: "100%",
                    minHeight: "30px",
                    background: isDarkMode ? "#191C28" : "#f9f9f9",
                    borderRadius: "12px",
                    padding: "2px 4px",
                    color: isDarkMode ? "#fff" : "#000",
                    border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                    fontSize: "9px",
                    boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
                    marginBottom: "2px",
                }}>
                    <h4 style={{ margin: "0", fontSize: "9px" }}>Connection Health</h4>
                    <p style={{ margin: "0", fontSize: "8px" }}>All systems running within normal parameters.</p>
                </div>
            </div>
        </SideBar>
    );
}



// IF U DONT WANT INITAL SAVED DATA THEN BUT THIS CODE
// ConnectedDatabase.js
// import React, { useState, useEffect } from "react";
// import { Edit, Trash, Plus } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import SideBar from "./SideBar";
// import {
//     LineChart,
//     Line,
//     XAxis,
//     YAxis,
//     Tooltip,
//     ResponsiveContainer,
//     CartesianGrid,
// } from "recharts";
// import bkg from "./bkg.jpg";

// // ---------- Initial Data ----------
// const initialDatabases = [
//     { name: "Project_Alpha", status1: "Connected", status2: "Connected", lastUpdate: "5 sec ago" },
//     { name: "Posttgfcs_BL", status1: "Connected", status2: "Disconnected", lastUpdate: "" },
//     { name: "Analytics_DB", status1: "Connected", status2: "Connected", lastUpdate: "" },
//     { name: "Enterpriss_DB", status1: "Disconnected", status2: "Disconnected", lastUpdate: "21 Days ago" },
// ];

// const monitoringData = [
//     { time: "10:00", response: 45 },
//     { time: "10:05", response: 50 },
//     { time: "10:10", response: 55 },
//     { time: "10:15", response: 52 },
//     { time: "10:20", response: 60 },
//     { time: "10:30", response: 58 },
// ];

// // ---------- Styles ----------
// const styles = {
//     container: (isMobile) => ({
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundImage: `url(${bkg})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         fontFamily: "Inter, sans-serif",
//         color: "#fff",
//         padding: isMobile ? "10px 0" : "0px",
//     }),
//     mainWrapper: (isMobile) => ({
//         display: "flex",
//         flexDirection: isMobile ? "column" : "row",
//         width: "95%",
//         height: isMobile ? "auto" : "95vh",
//         borderRadius: "16px",
//         border: "2px solid #fff",
//         overflow: "hidden",
//         background: "rgba(30,30,30,0.30)",
//         padding: "0px",
//         color: "#fff",
//         boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
//     }),
//     mainContent: (isMobile) => ({
//         flex: 1,
//         display: "flex",
//         flexDirection: "column",
//         padding: isMobile ? "8px" : "12px",
//         gap: "8px",
//         height: "100%",
//         justifyContent: "flex-start",
//     }),
//     heading: (isMobile) => ({
//         color: "#48a2ff",
//         fontSize: isMobile ? "18px" : "20px",
//         margin: 0,
//     }),
//     searchInput: (isMobile) => ({
//         width: "100%",
//         padding: isMobile ? "6px" : "8px",
//         borderRadius: "8px",
//         border: "none",
//         outline: "none",
//         background: "#191C28",
//         color: "#fff",
//         fontSize: isMobile ? "12px" : "13px",
//         marginBottom: "6px",
//     }),
//     filterButton: (isMobile) => ({
//         background: "#191C28",
//         color: "#fff",
//         border: "1px solid #fff",
//         padding: "6px 12px",
//         borderRadius: "8px",
//         cursor: "pointer",
//         fontSize: isMobile ? "11px" : "12px",
//         minWidth: "90px",
//         textAlign: "center",
//     }),
//     modalOverlay: {
//         position: "fixed",
//         top: 0, left: 0, right: 0, bottom: 0,
//         background: "rgba(0,0,0,0.6)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         zIndex: 200
//     },
//     modalContent: (isMobile) => ({
//         background: "#191C28",
//         padding: "20px",
//         borderRadius: "12px",
//         width: isMobile ? "90%" : "400px",
//         display: "flex",
//         flexDirection: "column",
//         gap: "12px"
//     }),
//     modalHeading: { margin: 0, color: "#48a2ff" },
//     modalInput: {
//         padding: "8px",
//         borderRadius: "8px",
//         border: "1px solid #fff",
//         background: "#191C28",
//         color: "#fff"
//     },
//     modalButtons: { display: "flex", justifyContent: "flex-end", gap: "8px" },
//     modalButtonCancel: {
//         padding: "6px 12px",
//         borderRadius: "6px",
//         border: "1px solid #fff",
//         background: "#374151",
//         color: "#fff"
//     },
//     modalButtonAdd: {
//         padding: "6px 12px",
//         borderRadius: "6px",
//         border: "1px solid #fff",
//         background: "#7c3aed",
//         color: "#fff"
//     },
//     dbCard: (isMobile) => ({
//         background: "#191C28",
//         borderRadius: "12px",
//         padding: "8px",
//         marginBottom: "7px",
//         display: "flex",
//         border: "1px solid #fff",
//         flexDirection: isMobile ? "column" : "row",
//         justifyContent: "space-between",
//         alignItems: isMobile ? "flex-start" : "center",
//         boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
//         cursor: "pointer",
//         fontSize: isMobile ? "12px" : "13px",
//         transition: "transform 0.2s, box-shadow 0.2s",
//     }),
//     dbInfo: { display: "flex", flexDirection: "column", gap: "4px" },
//     dbStatus: { display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "11px", color: "#fff", alignItems: "center" },
//     dbButton: {
//         background: "#374151",
//         padding: "4px 8px",
//         borderRadius: "6px",
//         display: "flex",
//         alignItems: "center",
//         gap: "4px",
//         border: "none",
//         color: "#fff",
//         cursor: "pointer",
//         fontSize: "11px",
//         transition: "background 0.2s",
//     },
//     statusIndicator: (status) => ({
//         display: "inline-block",
//         width: "8px",
//         height: "8px",
//         borderRadius: "50%",
//         marginRight: "4px",
//         backgroundColor: status === "Connected" ? "#22c55e" : "#ef4444",
//     }),
//     chartBox: {
//         width: "100%",
//         minHeight: "60px",
//         background: "#191C28",
//         borderRadius: "12px",
//         border: "1px solid #fff",
//         padding: "2px",
//         fontSize: "10px",
//         marginBottom: "2px",
//         boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//     },
//     healthBox: {
//         width: "100%",
//         minHeight: "30px",
//         background: "#191C28",
//         borderRadius: "12px",
//         padding: "2px 4px",
//         color: "#fff",
//         border: "1px solid #fff",
//         fontSize: "9px",
//         boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//         marginBottom: "2px",
//     }
// };

// // ---------- Components ----------
// function StatusIndicator({ status }) {
//     return <span style={styles.statusIndicator(status)}></span>;
// }

// function DatabaseCard({ db, isMobile, onUpdate, onDelete }) {
//     const [isEditing, setIsEditing] = React.useState(false);
//     const [newName, setNewName] = React.useState(db.name);

//     return (
//         <div
//             style={styles.dbCard(isMobile)}
//             onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
//             onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
//         >
//             <div style={styles.dbInfo}>
//                 {isEditing ? (
//                     <input
//                         value={newName}
//                         onChange={(e) => setNewName(e.target.value)}
//                         onBlur={() => { onUpdate(db.name, newName); setIsEditing(false); }}
//                         onKeyDown={(e) => { if (e.key === "Enter") { onUpdate(db.name, newName); setIsEditing(false); } }}
//                         style={styles.modalInput}
//                         autoFocus
//                     />
//                 ) : (
//                     <div style={{ fontWeight: "600", color: "#fff", fontSize: isMobile ? "13px" : "14px" }}>{db.name}</div>
//                 )}
//                 <div style={styles.dbStatus}>
//                     {db.lastUpdate && <span style={{ color: "#9ca3af" }}>{db.lastUpdate}</span>}
//                     <span style={{ display: "flex", alignItems: "center" }}>
//                         <StatusIndicator status={db.status1} />
//                         {db.status1}
//                     </span>
//                     <span style={{ display: "flex", alignItems: "center" }}>
//                         <StatusIndicator status={db.status2} />
//                         {db.status2}
//                     </span>
//                 </div>
//             </div>
//             <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
//                 <button style={styles.dbButton} onClick={() => setIsEditing(true)}><Edit size={12} /> Edit</button>
//                 <button style={styles.dbButton} onClick={() => onDelete(db.name)}><Trash size={12} /> Delete</button>
//             </div>
//         </div>
//     );
// }

// // ---------- Main Component ----------
// export default function ConnectedDatabase() {
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//     const [filterOpen, setFilterOpen] = useState(false);
//     const [selectedFilter, setSelectedFilter] = useState("All Databases");
//     const [dbList, setDbList] = useState([]);
//     const [showAddDB, setShowAddDB] = useState(false);
//     const [showSettings, setShowSettings] = useState(false);
//     const [newDBName, setNewDBName] = useState("");
//     const navigate = useNavigate();

//     // ---------- Load from localStorage ----------
//     useEffect(() => {
//         const storedDBs = localStorage.getItem("dbList");
//         if (storedDBs) setDbList(JSON.parse(storedDBs));
//         else {
//             localStorage.setItem("dbList", JSON.stringify(initialDatabases));
//             setDbList(initialDatabases);
//         }
//     }, []);

//     // ---------- Save to localStorage ----------
//     const saveToLocalStorage = (updatedList) => {
//         localStorage.setItem("dbList", JSON.stringify(updatedList));
//         setDbList(updatedList);
//     };

//     useEffect(() => {
//         const handleResize = () => setIsMobile(window.innerWidth < 768);
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     const handleNavigate = (path) => navigate(path);

//     const handleUpdate = (oldName, newName) => {
//         const updated = dbList.map(db => db.name === oldName ? { ...db, name: newName } : db);
//         saveToLocalStorage(updated);
//     };

//     const handleDelete = (name) => {
//         const updated = dbList.filter(db => db.name !== name);
//         saveToLocalStorage(updated);
//     };

//     const handleAddDatabase = () => {
//         if (!newDBName.trim()) return;
//         const updated = [...dbList, { name: newDBName, status1: "Disconnected", status2: "Disconnected", lastUpdate: "" }];
//         saveToLocalStorage(updated);
//         setNewDBName("");
//         setShowAddDB(false);
//     };

//     const filterOptions = ["All Databases", "Connected", "Disconnected", "Other"];
//     const filteredDbList = dbList.filter(db => {
//         if (selectedFilter === "All Databases") return true;
//         if (selectedFilter === "Connected") return db.status1 === "Connected" || db.status2 === "Connected";
//         if (selectedFilter === "Disconnected") return db.status1 === "Disconnected" && db.status2 === "Disconnected";
//         return true;
//     });

//     return (
//         <div style={styles.container(isMobile)}>
//             <div style={styles.mainWrapper(isMobile)}>
//                 <SideBar isMobile={isMobile} handleNavigate={handleNavigate} />

//                 <div style={styles.mainContent(isMobile)}>
//                     <h2 style={styles.heading(isMobile)}>Connected Databases</h2>
//                     <input placeholder="Search database..." style={styles.searchInput(isMobile)} />

//                     {/* Filter, Settings & Add */}
//                     <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap", alignItems: "center" }}>
//                         <div style={{ position: "relative" }}>
//                             <button style={styles.filterButton(isMobile)} onClick={() => setFilterOpen(!filterOpen)}>
//                                 {selectedFilter} ▼
//                             </button>
//                             {filterOpen && <div style={{
//                                 position: "absolute",
//                                 background: "#1f2937",
//                                 borderRadius: "8px",
//                                 marginTop: "4px",
//                                 minWidth: "150px",
//                                 boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                 zIndex: 100,
//                             }}>
//                                 {filterOptions.map(opt => (
//                                     <div key={opt} style={{ padding: "6px 12px", cursor: "pointer", color: "#fff" }}
//                                          onClick={() => { setSelectedFilter(opt); setFilterOpen(false); }}>{opt}</div>
//                                 ))}
//                             </div>}
//                         </div>

//                         <button style={styles.filterButton(isMobile)} onClick={() => handleNavigate("/AccountSettings")}>⚙️ Settings</button>

//                         <button style={styles.filterButton(isMobile)} onClick={() => setShowAddDB(true)}><Plus size={14} /> Add Database</button>
//                     </div>

//                     {/* Add DB Modal */}
//                     {showAddDB && (
//                         <div style={styles.modalOverlay}>
//                             <div style={styles.modalContent(isMobile)}>
//                                 <h3 style={styles.modalHeading}>Add New Database</h3>
//                                 <input placeholder="Database Name" value={newDBName} onChange={(e) => setNewDBName(e.target.value)} style={styles.modalInput} />
//                                 <div style={styles.modalButtons}>
//                                     <button style={styles.modalButtonCancel} onClick={() => setShowAddDB(false)}>Cancel</button>
//                                     <button style={styles.modalButtonAdd} onClick={handleAddDatabase}>Add</button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Database List */}
//                     <div style={{ flex: 1, overflowY: "auto", marginBottom: "8px" }}>
//                         {filteredDbList.map(db => <DatabaseCard key={db.name} db={db} isMobile={isMobile} onUpdate={handleUpdate} onDelete={handleDelete} />)}
//                     </div>

//                     {/* Monitoring Chart */}
//                     <div style={styles.chartBox}>
//                         <h4 style={{ margin: "2px 0", fontSize: "12px" }}>Database Monitoring</h4>
//                         <ResponsiveContainer width="100%" height={190}>
//                             <LineChart data={monitoringData}>
//                                 <CartesianGrid stroke="#444" strokeDasharray="3 3" />
//                                 <XAxis dataKey="time" stroke="#fff" fontSize={10} />
//                                 <YAxis stroke="#fff" fontSize={10} />
//                                 <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", fontSize: "11px" }} />
//                                 <Line type="monotone" dataKey="response" stroke="#48a2ff" strokeWidth={2} />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>

//                     {/* Connection Health */}
//                     <div style={styles.healthBox}>
//                         <h4 style={{ margin: "0", fontSize: "9px" }}>Connection Health</h4>
//                         <p style={{ margin: "0", fontSize: "8px" }}>All systems running within normal parameters.</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
