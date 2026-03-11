// ConnectedDatabase.js
import React, { useState, useEffect, useContext } from "react";
import { Edit, Trash, Plus, Link as LinkIcon, ExternalLink, Copy } from "lucide-react";
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

// small StatusIndicator component (keeps previous inline style)
function StatusIndicator({ status }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        marginRight: 6,
        backgroundColor: status === "Connected" ? "#22c55e" : "#ef4444",
      }}
    />
  );
}

/**
 * DatabaseCard - displays a database entry.
 *
 * Props:
 * - db: database object
 * - isMobile, isDarkMode
 * - onUpdate(id, newName)
 * - onDelete(id)
 * - onOpenPrisma(id) -> open prisma studio for this db (calls backend)
 */
function DatabaseCard({ db, isMobile, isDarkMode, onUpdate, onDelete, onOpenPrisma }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(db.name || "");
  const [isCopiedPrisma, setIsCopiedPrisma] = useState(false);
  const [isCopiedQdrant, setIsCopiedQdrant] = useState(false);

  useEffect(() => setNewName(db.name || ""), [db.name]);

  // --- Handlers ---
  const handleCopyPrismaUrl = async () => {
    const url = db.prismaPort ? `http://localhost:${db.prismaPort}` : db.prismaUrl || "";
    try {
      await navigator.clipboard.writeText(url);
      setIsCopiedPrisma(true);
      setTimeout(() => setIsCopiedPrisma(false), 1800);
    } catch {
      setIsCopiedPrisma(false);
      alert("Copy failed — please copy manually.");
    }
  };

  const handleCopyQdrantUrl = async () => {
    try {
      await navigator.clipboard.writeText(db.qdrantUrl);
      setIsCopiedQdrant(true);
      setTimeout(() => setIsCopiedQdrant(false), 1800);
    } catch {
      setIsCopiedQdrant(false);
      alert("Copy failed — please copy manually.");
    }
  };

  const handleSaveEdit = async () => {
    if (!newName?.trim()) {
      alert("Please enter a valid name.");
      return;
    }
    try {
      await onUpdate(db._id, newName);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // --- Styles ---
  const buttonStyle = {
    padding: "6px 8px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    display: "flex",
    gap: 6,
    alignItems: "center",
    fontSize: 13,
  };

  const actionButtonStyle = (bg, color) => ({ ...buttonStyle, background: bg, color });

  return (
    <div
      style={{
        background: isDarkMode ? "rgb(11, 18, 32)" : "#f9f9f9",
        borderRadius: 12,
        padding: 7.5,
        marginBottom: 8,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        border: `1px solid ${isDarkMode ? "#ffffffff" : "#00000011"}`,
        color: isDarkMode ? "#fff" : "#000",
        cursor: "default",
      }}
    >
      {/* Left: Name + Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        {/* Name */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
          {isEditing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") {
                    setNewName(db.name || "");
                    setIsEditing(false);
                  }
                }}
                autoFocus
                style={{
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: `1px solid ${isDarkMode ? "#2b2f3a" : "#d1d5db"}`,
                  background: isDarkMode ? "#071025" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  fontWeight: 700,
                  minWidth: isMobile ? 120 : 220,
                }}
              />
              <button onClick={handleSaveEdit} title="Save name" style={actionButtonStyle("#48a2ff", "#fff")}>
                Save
              </button>
              <button
                onClick={() => {
                  setNewName(db.name || "");
                  setIsEditing(false);
                }}
                title="Cancel"
                style={actionButtonStyle(isDarkMode ? "#374151" : "#e5e7eb", isDarkMode ? "#fff" : "#000")}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              onClick={() => db.dbType !== "qdrant" && onOpenPrisma(db)}
              title={
                db.dbType !== "qdrant"
                  ? db.prismaPort
                    ? `Open Prisma Studio (port ${db.prismaPort})`
                    : "Prisma port not set"
                  : ""
              }
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 13 : 15,
                color:
                  db.dbType !== "qdrant"
                    ? db.prismaPort
                      ? "#48a2ff"
                      : isDarkMode
                        ? "#94a3b8"
                        : "#334155"
                    : isDarkMode
                      ? "#cbd5e1"
                      : "#475569",
                cursor: db.dbType !== "qdrant" && db.prismaPort ? "pointer" : "default",
                textDecoration: db.dbType !== "qdrant" && db.prismaPort ? "underline" : "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {db.name}
            </div>
          )}

          {/* Prisma Port Badge */}
          {db.dbType !== "qdrant" && db.prismaPort && (
            <div
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 11,
                background: isDarkMode ? "#0f1724" : "#eef2ff",
                color: isDarkMode ? "#a5b4fc" : "#3730a3",
                border: `1px solid ${isDarkMode ? "#1f2937" : "#e6e6ff"}`,
                flexShrink: 0,
              }}
            >
              {db.prismaPort}
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", fontSize: 12 }}>
          {db.lastUpdate && <span style={{ color: "#9ca3af" }}>{db.lastUpdate}</span>}
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusIndicator status={db.status1 || "Disconnected"} />
            <span style={{ fontSize: 12 }}>{db.status1 || "Unknown"}</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusIndicator status={db.status2 || "Disconnected"} />
            <span style={{ fontSize: 12 }}>{db.status2 || "Unknown"}</span>
          </span>

          {db.dbType !== "qdrant" ? (
            db.schemaPath ? (
              <a
                href={`http://localhost:5000${db.schemaPath}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: isDarkMode ? "#93c5fd" : "#0369a1", textDecoration: "underline" }}
                title="Open uploaded Prisma schema file"
              >
                View Schema
              </a>
            ) : (
              <span style={{ fontSize: 12, color: "#9ca3af" }}>No schema</span>
            )
          ) : (
            <span style={{ fontSize: 12, color: isDarkMode ? "#cbd5e1" : "#475569" }}>
              Qdrant URL: {db.qdrantUrl || "-"}
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: isMobile ? 8 : 0 }}>
        {/* Prisma */}
        {db.dbType !== "qdrant" && (
          <>
            <button onClick={handleCopyPrismaUrl} title="Copy Prisma URL" style={actionButtonStyle(isDarkMode ? "#111827" : "#eef2ff", isDarkMode ? "#fff" : "#0f172a")}>
              <Copy size={14} /> {isCopiedPrisma ? "Copied" : "Copy"}
            </button>
            <button onClick={() => onOpenPrisma(db)} title="Open Prisma" style={actionButtonStyle(isDarkMode ? "#111827" : "#eef2ff", isDarkMode ? "#fff" : "#0f172a")}>
              Open Prisma
            </button>
          </>
        )}

        {/* Qdrant */}
        {db.dbType === "qdrant" && db.qdrantUrl && (
          <>
            <button onClick={handleCopyQdrantUrl} title="Copy Qdrant URL" style={actionButtonStyle(isDarkMode ? "#111827" : "#eef2ff", isDarkMode ? "#fff" : "#0f172a")}>
              <Copy size={14} /> {isCopiedQdrant ? "Copied" : "Copy Qdrant"}
            </button>
            <button onClick={() => window.open(db.qdrantUrl, "_blank")} title="Open Qdrant" style={actionButtonStyle(isDarkMode ? "#111827" : "#eef2ff", isDarkMode ? "#fff" : "#0f172a")}>
              Open Qdrant
            </button>
          </>
        )}

        {/* Edit */}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} title="Edit name" style={actionButtonStyle(isDarkMode ? "#111827" : "#f3f4f6", isDarkMode ? "#fff" : "#000")}>
            <Edit size={14} /> Edit
          </button>
        )}

        {/* Delete */}
        <button onClick={() => onDelete(db._id)} title="Delete DB" style={actionButtonStyle(isDarkMode ? "#111827" : "#fdecea", isDarkMode ? "#fff" : "#9b1c1c")}>
          <Trash size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

/**
 * Main component
 */
export default function ConnectedDatabase() {
  const { isDarkMode } = useContext(ThemeContext);
  const [dbList, setDbList] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Databases");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDB, setShowAddDB] = useState(false);
  const [newDBName, setNewDBName] = useState("");
  const [newDBUrl, setNewDBUrl] = useState("");
  const [newSchemaPath, setNewSchemaPath] = useState("");
  const [newPrismaPort, setNewPrismaPort] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [dbType, setDbType] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000/api/monitoring";
  const AI_API = "http://localhost:5000/api/chat";

  // ---------- Helper: file selection ----------
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadMessage(`Selected file: ${file.name}`);
    setNewSchemaPath(""); // we'll prefer uploaded file path
  };

  // ---------- Upload selected file ----------
  // backend route: POST /api/monitoring/upload-schema
  const uploadSelectedFile = async () => {
    if (!selectedFile) return { success: false, message: "No file selected" };

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await fetch(`${API_BASE}/upload-schema`, {
        method: "POST",
        body: fd,
      });

      // try parse json
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        // not json
        return { success: false, message: "Server returned non-JSON response" };
      }

      if (res.ok && data.success) {
        setUploadMessage("✅ File uploaded successfully");
        return { success: true, path: data.path || data.file?.path || "" };
      } else {
        return { success: false, message: data.message || "Upload failed" };
      }
    } catch (err) {
      console.error("Upload error:", err);
      return { success: false, message: err.message || "Upload failed" };
    }
  };

  // ---------- Fetch all databases ----------
  const fetchDatabases = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`);
      const json = await res.json();
      if (res.ok && json.success) {
        setDbList(json.data || []);
        // metrics from first DB
        const first = (json.data && json.data[0]) || null;
        if (first && Array.isArray(first.analytics)) {
          const mapped = first.analytics.map((a) => ({
            time: a.time || a.timestamp || new Date().toLocaleTimeString(),
            response: a.response || a.latency || 0,
          }));
          setMetricsData(mapped);
        } else {
          setMetricsData([]);
        }
      } else {
        setDbList([]);
        setMetricsData([]);
        console.error("Fetch /all returned error:", json);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setDbList([]);
      setMetricsData([]);
    }
  };

  // fetch on mount and every 30s
  useEffect(() => {
    fetchDatabases();
    const interval = setInterval(fetchDatabases, 30000);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Add Database ----------
  const handleAddDatabase = async () => {
    if (!newDBUrl?.trim()) {
      alert(`Please enter ${dbType === "qdrant" ? "Qdrant URL" : "Database URL"}`);
      return;
    }

    // Validate URL for all non-Qdrant DBs
    if (dbType !== "qdrant") {
      try {
        new URL(newDBUrl); // basic check
      } catch {
        alert("Please enter a valid Database URL (e.g., mongodb://localhost:27017)");
        return;
      }
    }

    // Validate Prisma port if applicable
    if (dbType !== "qdrant" && (!newPrismaPort || isNaN(Number(newPrismaPort)))) {
      alert("Please enter a valid Prisma port (e.g., 5555).");
      return;
    }

    // Validate Qdrant URL specifically
    if (dbType === "qdrant") {
      try {
        new URL(newDBUrl); // throws if invalid
      } catch {
        alert("Please enter a valid Qdrant URL (e.g., http://localhost:6333).");
        setLoadingAdd(false);
        return;
      }
    }

    setLoadingAdd(true);

    // Upload file if selected (Prisma / SQL)
    let schemaPathToSend = newSchemaPath || "";
    if (selectedFile) {
      setUploadMessage("Uploading file...");
      const uploadResult = await uploadSelectedFile();
      if (uploadResult.success && uploadResult.path) {
        schemaPathToSend = uploadResult.path;
      } else {
        const proceed = window.confirm(
          `Schema upload failed (${uploadResult.message || "error"}). Continue without uploading?`
        );
        if (!proceed) {
          setLoadingAdd(false);
          return;
        }
      }
    }

    // Warn if schema path is missing for Prisma/SQL DB
    if (dbType !== "qdrant" && !schemaPathToSend) {
      const proceed = window.confirm(
        "No schema path provided. Prisma Studio may not run without a valid schema. Continue?"
      );
      if (!proceed) {
        setLoadingAdd(false);
        return;
      }
    }

    try {
      // Get userId from localStorage (or your auth context)
      const userId = localStorage.getItem("userId") || "dummyUserId";

      const payload = {
        name: newDBName,
        dbType,
        ...(dbType === "qdrant"
          ? { qdrantUrl: newDBUrl }
          : { url: newDBUrl, schemaPath: schemaPathToSend, prismaPort: Number(newPrismaPort) }),
        userId,
      };

      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Add to state
        setDbList((prev) => [...prev, data.db]);
        setShowAddDB(false);

        // Reset all modal fields
        setDbType("");
        setNewDBName("");
        setNewDBUrl("");
        setNewSchemaPath("");
        setNewPrismaPort("");
        setSelectedFile(null);
        setUploadMessage("");

        // Optionally open Prisma Studio
        if (data.db && data.db.prismaPort) {
          const openUrl = `http://localhost:${data.db.prismaPort}`;
          window.open(openUrl, "_blank");
        }
      } else {
        console.error("Add DB failed:", data);
        alert(`Add DB failed: ${data.error || data.message || "unknown error"}`);
      }
    } catch (err) {
      console.error("Add DB request error:", err);
      alert("Error adding database. Check backend.");
    } finally {
      setLoadingAdd(false);
    }
  };

  // ---------- Update database name ----------
  const handleUpdate = async (id, name) => {
    if (!name?.trim()) return alert("Name required");

    const userId = localStorage.getItem("userId") || "dummyUserId"; // ⚠ FIX: declare here

    try {
      const res = await fetch(`${API_BASE}/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId }), // now defined
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbList((prev) => prev.map((d) => (d._id === id ? { ...d, name } : d)));
      } else {
        console.error("Update failed:", data);
        alert("Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update error");
    }
  };


  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this database?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbList((prev) => prev.filter((d) => d._id !== id));
      } else {
        console.error("Delete failed:", data);
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete error");
    }
  };

  // ---------- Open Prisma Studio ----------
  // Calls backend GET /open/:id which returns prismaUrl
  const handleOpenPrisma = async (db) => {
    if (!db._id) return;
    try {
      // if db.prismaPort exists locally, attempt direct open first (fast)
      if (db.prismaPort) {
        const url = `http://localhost:${db.prismaPort}`;
        // open in new tab
        window.open(url, "_blank");
        return;
      }

      // otherwise ask backend for the URL
      const res = await fetch(`${API_BASE}/open/${db._id}`);
      const data = await res.json();
      if (res.ok && data.success && data.prismaUrl) {
        window.open(data.prismaUrl, "_blank");
      } else {
        alert("Prisma URL not available for this database.");
      }
    } catch (err) {
      console.error("Open Prisma error:", err);
      alert("Failed to open Prisma Studio. Is it running?");
    }
  };

  // ---------- Filter logic ----------
  const filteredDbList = dbList.filter((db) => {
    const matchesSearch = db.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === "Connected")
      return matchesSearch && (db.status1 === "Connected" || db.status2 === "Connected");
    if (selectedFilter === "Disconnected")
      return matchesSearch && db.status1 === "Disconnected" && db.status2 === "Disconnected";
    return matchesSearch;
  });

  // ---------- UI ----------
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
        <h2 style={{ color: isDarkMode ? "#48a2ff" : "#0259b1", margin: 0 }}>Connected Databases</h2>

        {/* Search bar */}
        <input
          placeholder="Search database..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${isDarkMode ? "#ffffffff" : "#00000022"}`,
            outline: "none",
            background: isDarkMode ? "#0b1220" : "#f3f4f6",
            color: isDarkMode ? "#fff" : "#000",
          }}
        />

        {/* Filter + Add buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              style={{
                background: isDarkMode ? "#0b1220" : "#fff",
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
                width: isMobile ? "92%" : 520,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0, color: "#48a2ff" }}>
                Add {dbType === "qdrant" ? "Qdrant " : ""}Database
              </h3>

              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${isDarkMode ? "#1f2937" : "#e5e7eb"}`,
                  background: isDarkMode ? "#071025" : "#f9fafb",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              >
                <option value="">Select Database Type</option>
                <option value="sql">SQL</option>
                <option value="qdrant">Qdrant</option> {/* NEW */}
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mongodb">MongoDB</option>
                <option value="sqlite">SQLite</option>
              </select>

              <input
                placeholder="Database Name"
                value={newDBName}
                onChange={(e) => setNewDBName(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${isDarkMode ? "#1f2937" : "#e5e7eb"}`,
                  background: isDarkMode ? "#071025" : "#f9fafb",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              />

              <input
                type={dbType === "qdrant" ? "url" : "text"}
                placeholder={
                  dbType === "qdrant"
                    ? "Qdrant URL (e.g., http://localhost:6333)"
                    : "Database URL (e.g., mongodb://localhost:27017)"
                }
                value={newDBUrl}
                onChange={(e) => setNewDBUrl(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${isDarkMode ? "#1f2937" : "#e5e7eb"}`,
                  background: isDarkMode ? "#071025" : "#f9fafb",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              />

              {/* Hide Prisma-specific fields if DB is Qdrant */}
              {dbType !== "qdrant" && (
                <>
                  {/* Prisma schema upload */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(file);
                    }}
                    onClick={() => document.getElementById("schemaFileInput")?.click()}
                    style={{
                      border: `2px dashed ${isDarkMode ? "#2b2f3a" : "#cbd5e1"}`,
                      borderRadius: 10,
                      padding: "14px",
                      textAlign: "center",
                      color: isDarkMode ? "#cbd5e1" : "#475569",
                      background: isDarkMode ? "#071025" : "#f9fafb",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="file"
                      id="schemaFileInput"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                    {selectedFile ? (
                      <div>
                        <strong>📄 {selectedFile.name}</strong>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{uploadMessage}</div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: 0 }}>Drag & drop your Prisma/schema file here</p>
                        <p style={{ margin: 0 }}>
                          or <span style={{ color: "#48a2ff" }}>browse</span>
                        </p>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                          (Optional) Uploaded schema will be used to run Prisma Studio.
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    placeholder="Or provide existing Prisma Schema Path (e.g., /uploads/schema.prisma)"
                    value={newSchemaPath}
                    onChange={(e) => setNewSchemaPath(e.target.value)}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${isDarkMode ? "#1f2937" : "#e5e7eb"}`,
                      background: isDarkMode ? "#071025" : "#f9fafb",
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                  />

                  <input
                    placeholder="Prisma Studio Port (e.g., 5555)"
                    value={newPrismaPort}
                    onChange={(e) => setNewPrismaPort(e.target.value)}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${isDarkMode ? "#1f2937" : "#e5e7eb"}`,
                      background: isDarkMode ? "#071025" : "#f9fafb",
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                  />
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => {
                    setShowAddDB(false);
                    setSelectedFile(null);
                    setUploadMessage("");
                  }}
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
                  disabled={loadingAdd}
                >
                  {loadingAdd ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Cards */}
        <div style={{ flex: 1, overflowY: "auto", maxHeight: "40vh", paddingTop: 6 }}>
          {filteredDbList.length === 0 ? (
            <div style={{ padding: 12, color: isDarkMode ? "#94a3b8" : "#475569" }}>
              No databases. Click Add Database to create one.
            </div>
          ) : (
            filteredDbList.map((db) => (
              <DatabaseCard
                key={db._id}
                db={db}
                isMobile={isMobile}
                isDarkMode={isDarkMode}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onOpenPrisma={handleOpenPrisma}
              />
            ))
          )}
        </div>

        {/* Live Metrics */}
        {dbList[0]?.dbType !== "qdrant" &&
          (
            <div
              style={{
                width: "100%",
                minHeight: 60,
                background: isDarkMode ? "#0b1220" : "#f9fafb",
                borderRadius: 12,
                border: `1px solid ${isDarkMode ? "#ffffffff" : "#e6e6e6"}`,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontSize: 13 }}>Database Monitoring (Live)</h4>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  auto-refresh every 30s · last metrics shown for first DB
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
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
                    <Line type="monotone" dataKey="response" stroke="#48a2ff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        }

        {/* Connection Info + Upload Message */}
        <div
          style={{
            width: "100%",
            minHeight: 48,
            background: isDarkMode ? "#0b1220" : "#fff",
            borderRadius: 12,
            padding: 12,
            color: isDarkMode ? "#cbd5e1" : "#111827",
            border: `1px solid ${isDarkMode ? "#ffffffff" : "#e6e6e6"}`,
            fontSize: 12,
            marginTop: 6,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 600 }}>Connection Health</div>
          <div style={{ fontSize: 12 }}>
            Monitoring live metrics from MongoDB serverStatus (or simulated if unavailable).
          </div>
          {uploadMessage && <div style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>{uploadMessage}</div>}
        </div>


      </div>
    </SideBar>
  );
}
