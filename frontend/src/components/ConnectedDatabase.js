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

// ✅ StatusIndicator
function StatusIndicator({ status }) {
  return React.createElement("span", {
    style: {
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      marginRight: "6px",
      backgroundColor: status === "Connected" ? "#22c55e" : "#ef4444",
    },
  });
}

// ✅ DatabaseCard
function DatabaseCard({ db, isMobile, isDarkMode, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(db.name);

  useEffect(() => setNewName(db.name), [db.name]);

  return React.createElement(
    "div",
    {
      style: {
        background: isDarkMode ? "#191C28" : "#f9f9f9",
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        border: `1px solid ${isDarkMode ? "#2b2f3a" : "#e5e7eb"}`,
        color: isDarkMode ? "#fff" : "#000",
      },
    },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 4 } },
      isEditing
        ? React.createElement("input", {
          value: newName,
          onChange: (e) => setNewName(e.target.value),
          onBlur: () => {
            onUpdate(db._id, newName);
            setIsEditing(false);
          },
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              onUpdate(db._id, newName);
              setIsEditing(false);
            }
          },
          autoFocus: true,
          style: {
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${isDarkMode ? "#333" : "#ccc"}`,
            background: isDarkMode ? "#0f1724" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        })
        : React.createElement(
          "div",
          { style: { fontWeight: 600, fontSize: isMobile ? 13 : 14 } },
          db.name
        ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", fontSize: 12 } },
        db.lastUpdate &&
        React.createElement(
          "span",
          { style: { color: "#9ca3af" } },
          db.lastUpdate
        ),
        React.createElement(
          "span",
          { style: { display: "flex", alignItems: "center" } },
          React.createElement(StatusIndicator, { status: db.status1 || "Disconnected" }),
          db.status1 || "Unknown"
        ),
        React.createElement(
          "span",
          { style: { display: "flex", alignItems: "center" } },
          React.createElement(StatusIndicator, { status: db.status2 || "Disconnected" }),
          db.status2 || "Unknown"
        )
      )
    ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 8, marginTop: isMobile ? 8 : 0 } },
      React.createElement(
        "button",
        {
          onClick: () => setIsEditing(true),
          style: {
            background: isDarkMode ? "#374151" : "#e5e7eb",
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            color: isDarkMode ? "#fff" : "#000",
            display: "flex",
            gap: 6,
            alignItems: "center",
          },
        },
        React.createElement(Edit, { size: 14 }),
        " Edit"
      ),
      React.createElement(
        "button",
        {
          onClick: () => onDelete(db._id),
          style: {
            background: isDarkMode ? "#374151" : "#e5e7eb",
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            color: isDarkMode ? "#fff" : "#000",
            display: "flex",
            gap: 6,
            alignItems: "center",
          },
        },
        React.createElement(Trash, { size: 14 }),
        " Delete"
      )
    )
  );
}

// ✅ Main Component
export default function ConnectedDatabase() {
  const { isDarkMode } = useContext(ThemeContext);
  const [dbList, setDbList] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Databases");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDB, setShowAddDB] = useState(false);
  const [newDBName, setNewDBName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // ✅ Fetch all databases
  const fetchDatabases = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/monitoring/all");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setDbList(data.data); // ✅ Use the array only
      } else {
        console.error("Error fetching DB list:", data);
        setDbList([]); // ensure it's always an array
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setDbList([]); // fallback safe
    }
  };


  // ✅ Initial fetch + resize listener
  useEffect(() => {
    fetchDatabases();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Add database
  const handleAddDatabase = async () => {
    if (!newDBName.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/monitoring/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDBName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbList((prev) => [...prev, data.db]);
        setShowAddDB(false);
        setNewDBName("");
      } else {
        alert("Failed to add database.");
      }
    } catch (err) {
      console.error("Add DB error:", err);
      alert("Error adding database. Check backend connection.");
    }
  };

// ✅ Edit database
const handleUpdate = async (id, newName) => {
  try {
    const res = await fetch(`http://localhost:5000/api/monitoring/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert("✅ Database updated successfully");
      fetchDatabases(); // refresh the list
    } else {
      console.error("❌ Update failed:", data);
      alert("Error updating database. Check backend connection");
    }
  } catch (err) {
    console.error("❌ Update request error:", err);
    alert("Error updating database. Check backend connection");
  }
};


  // ✅ Delete database
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this database?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/monitoring/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbList((prev) => prev.filter((db) => db._id !== id));
      } else {
        alert("Failed to delete database.");
      }
    } catch (err) {
      console.error("Delete DB error:", err);
      alert("Error deleting database. Check backend connection.");
    }
  };

  // ✅ Filtered list
  const filteredDbList = dbList.filter((db) => {
    const matchesSearch = db.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === "Connected")
      return matchesSearch && (db.status1 === "Connected" || db.status2 === "Connected");
    if (selectedFilter === "Disconnected")
      return matchesSearch && db.status1 === "Disconnected" && db.status2 === "Disconnected";
    return matchesSearch;
  });

  return (
    <SideBar isMobile={isMobile}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 12,
          gap: 8,
          minHeight: "100vh",
          background: isDarkMode ? "rgba(10,12,18,0.6)" : "rgba(255,255,255,0.4)",
        }}
      >
        <h2 style={{ color: isDarkMode ? "#48a2ff" : "#0259b1", margin: 0 }}>
          Connected Databases
        </h2>

        {/* Search bar */}
        <input
          placeholder="Search database..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "none",
            outline: "none",
            background: isDarkMode ? "#0b1220" : "#f3f4f6",
            color: isDarkMode ? "#fff" : "#000",
          }}
        />

        {/* Filter + Add buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <button
              style={{
                background: isDarkMode ? "#0b1220" : "#f3f4f6",
                color: isDarkMode ? "#fff" : "#000",
                border: `1px solid ${isDarkMode ? "#2b2f3a" : "#e5e7eb"}`,
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
              onClick={() => setFilterOpen((s) => !s)}
            >
              {selectedFilter} ▼
            </button>
            {filterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  background: isDarkMode ? "#111827" : "#fff",
                  borderRadius: 8,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  zIndex: 100,
                  padding: 6,
                  minWidth: 160,
                }}
              >
                {["All Databases", "Connected", "Disconnected"].map((opt) => (
                  <div
                    key={opt}
                    style={{
                      padding: 8,
                      cursor: "pointer",
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                    onClick={() => {
                      setSelectedFilter(opt);
                      setFilterOpen(false);
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddDB(true)}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${isDarkMode ? "#2b2f3a" : "#e5e7eb"}`,
              background: isDarkMode ? "#0b1220" : "#fff",
              cursor: "pointer",
              color: isDarkMode ? "#fff" : "#000",
            }}
          >
            <Plus size={14} /> Add Database
          </button>
        </div>

        {/* Add DB Modal */}
        {showAddDB && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 200,
            }}
          >
            <div
              style={{
                background: isDarkMode ? "#0b1220" : "#fff",
                padding: 20,
                borderRadius: 12,
                width: isMobile ? "92%" : 420,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0, color: "#48a2ff" }}>Add New Database</h3>
              <input
                placeholder="Database Name"
                value={newDBName}
                onChange={(e) => setNewDBName(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${isDarkMode ? "#2b2f3a" : "#e5e7eb"}`,
                  background: isDarkMode ? "#071025" : "#f9fafb",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setShowAddDB(false)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#374151",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDatabase}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Cards */}
        <div style={{ flex: 1, overflowY: "auto", maxHeight: "40vh", paddingTop: 4 }}>
          {filteredDbList.map((db) => (
            <DatabaseCard
              key={db._id}
              db={db}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Live Metrics */}
        <div
          style={{
            width: "100%",
            minHeight: 60,
            background: isDarkMode ? "#0b1220" : "#f9fafb",
            borderRadius: 12,
            border: `1px solid ${isDarkMode ? "#2b2f3a" : "#e5e7eb"}`,
            padding: 8,
          }}
        >
          <h4 style={{ margin: 4, fontSize: 12 }}>Database Monitoring (Live)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metricsData}>
              <CartesianGrid stroke={isDarkMode ? "#1f2937" : "#e6e6e6"} strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke={isDarkMode ? "#9ca3af" : "#333"} fontSize={10} />
              <YAxis stroke={isDarkMode ? "#9ca3af" : "#333"} fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#111827" : "#fff",
                  border: "none",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="response"
                stroke="#48a2ff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Connection Info */}
        <div
          style={{
            width: "100%",
            minHeight: 40,
            background: isDarkMode ? "#0b1220" : "#fff",
            borderRadius: 12,
            padding: 10,
            color: isDarkMode ? "#cbd5e1" : "#111827",
            border: `1px solid ${isDarkMode ? "#2b2f3a" : "#e5e7eb"}`,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 600 }}>Connection Health</div>
          <div style={{ marginTop: 4, fontSize: 12 }}>
            Monitoring live metrics from MongoDB serverStatus (or simulated if unavailable).
          </div>
        </div>
      </div>
    </SideBar>
  );
}
