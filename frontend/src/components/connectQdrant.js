import React, { useEffect, useState, useContext, useCallback } from "react";
import { Copy, ExternalLink, Plus, Edit, Trash } from "lucide-react";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";

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

/* ---------------- DASHBOARD OPENER ---------------- */
const openDashboard = (url) => {
  if (!url) return;

  const base = url.replace(/\/$/, "");
  window.open(`${base}/dashboard`, "_blank");
};

function QdrantCard({ node, isDarkMode, onUpdate, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node?.name || "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(node.qdrantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveEdit = async () => {
    if (!newName?.trim()) {
      alert("Please enter a valid name.");
      return;
    }
    await onUpdate(node._id, newName);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        background: isDarkMode ? "#0b1220" : "#f9f9f9",
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        border: `1px solid ${isDarkMode ? "#ffffff22" : "#00000011"}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: isDarkMode ? "#fff" : "#000",
        flexWrap: "wrap",
        gap: "10px"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {isEditing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") {
                  setNewName(node.name || "");
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
              }}
            />
            <button
              onClick={handleSaveEdit}
              style={{ padding: "6px 8px", borderRadius: 8, background: "#48a2ff", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setNewName(node.name || "");
                setIsEditing(false);
              }}
              style={{ padding: "6px 8px", borderRadius: 8, background: isDarkMode ? "#374151" : "#e5e7eb", color: isDarkMode ? "#fff" : "#000", border: "none", cursor: "pointer", fontSize: 13 }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ fontWeight: 700 }}>{node.name}</div>
        )}

        <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span>
            <StatusIndicator status={node.status1 || node.status} />
            {node.status1 || node.status || "Unknown"}
          </span>
          <span style={{ color: "#9ca3af" }}>{node.qdrantUrl || node.url}</span>
          {node.lastUpdate && <span style={{ color: "#9ca3af" }}>Updated: {node.lastUpdate}</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={handleCopy}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: isDarkMode ? "#111827" : "#eef2ff",
            color: isDarkMode ? "#fff" : "#000",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <Copy size={14} />
          {copied ? "Copied" : "Copy"}
        </button>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: isDarkMode ? "#111827" : "#f3f4f6",
              color: isDarkMode ? "#fff" : "#000",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Edit size={14} /> Edit
          </button>
        )}

        <button
          onClick={() => onDelete(node._id)}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: isDarkMode ? "#111827" : "#fdecea",
            color: isDarkMode ? "#fff" : "#9b1c1c",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <Trash size={14} /> Delete
        </button>

        <button
          onClick={() => openDashboard(node.qdrantUrl)}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#48a2ff",
            color: "#fff",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <ExternalLink size={14} />
          Open Dashboard
        </button>
      </div>
    </div >
  );
}

export default function ConnectQdrant() {
  const { isDarkMode } = useContext(ThemeContext);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDB, setShowAddDB] = useState(false);
  const [newDBName, setNewDBName] = useState("");
  const [newDBUrl, setNewDBUrl] = useState("");
  const [addingDB, setAddingDB] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  if (typeof window === "undefined") return;

  const update = () => setIsMobile(window.innerWidth < 768);

  update(); // run once immediately
  window.addEventListener("resize", update);

  return () => window.removeEventListener("resize", update);
}, []);

  const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  /*
  // Old Fetch Logic:
  const fetchNodes = async () => {
    try {
      const res = await fetch(`${apiBase}/qdrantdb`);
      const data = await res.json();
      setNodes(data || []);
    } catch (err) {
      console.error("Failed to fetch Qdrant nodes", err);
    } finally {
      setLoading(false);
    }
  };
  */


const checkPortHealth = async (url) => {
  if (!url || typeof url !== "string") return "Disconnected";

  try {
    const res = await fetch(`${url}/collections`);
    return res.ok ? "Connected" : "Disconnected";
  } catch {
    return "Disconnected";
  }
};



 const fetchNodes = useCallback(async () => {
  try {
    const userId = localStorage.getItem("userId") || "dummyUserId";
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";

    const res = await fetch(`${apiBase}/api/monitoring/all${qs}`);
    const data = await res.json();

    if (res.ok && data?.success) {
      const qdrantNodes = (data.data || []).filter(
        (db) => db.dbType === "qdrant"
      );

      const updatedNodes = await Promise.all(
        qdrantNodes.map(async (node) => {
          const status = await checkPortHealth(node.qdrantUrl || node.url);

          return {
            ...node,
            status1: status,
            lastUpdate: new Date().toISOString(),
          };
        })
      );

      setNodes(updatedNodes);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [apiBase]);

  useEffect(() => {
  fetchNodes();

  const interval = setInterval(fetchNodes, 10000);

  return () => clearInterval(interval);
}, [fetchNodes]);

  const handleAddDatabase = async () => {
    if (!newDBName.trim()) return alert("Database Name required");
    if (!newDBUrl.trim()) return alert("Qdrant URL required");
    if (!newDBUrl.includes(":")) {
      return alert("Please include port in URL (example: http://localhost:6337)");
    }

    setAddingDB(true);
    try {
      const userId = localStorage.getItem("userId") || "dummyUserId";
      const payload = {
        name: newDBName,
        dbType: "qdrant",
        qdrantUrl: newDBUrl,
        userId,
      };

      const res = await fetch(`${apiBase}/api/monitoring/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNodes((prev) => [...prev, data.db]);
        setShowAddDB(false);
        setNewDBName("");
        setNewDBUrl("");
      } else {
        alert(`Failed to add: ${data.error || data.message || "Unknown error"}`);
      }
    } catch (err) {
      alert("Error adding database.");
      console.error(err);
    } finally {
      setAddingDB(false);
    }
  };

  const handleUpdate = async (id, name) => {
    try {
      const userId = localStorage.getItem("userId") || "dummyUserId";
      const res = await fetch(`${apiBase}/api/monitoring/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNodes((prev) => prev.map((n) => (n._id === id ? { ...n, name } : n)));
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update error");
    }
  };

  const handleDelete = async (id) => {
    const prev = nodes;

    // 🔥 OPTIMISTIC UI UPDATE
    setNodes((prevNodes) => prevNodes.filter((n) => n._id !== id));

    try {
      const res = await fetch(`${apiBase}/api/monitoring/delete/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setNodes(prev); // rollback
        alert("Delete failed");
      }
    } catch (err) {
      setNodes(prev); // rollback
      console.error(err);
      alert("Delete error");
    }
  };

  return (
    <SideBar>
      <div
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minHeight: "100vh",
          background: isDarkMode ? "rgba(10,12,18,0.6)" : "#f8fafc",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ color: "#48a2ff", margin: 0 }}>Connected Qdrant Nodes</h2>
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
            <Plus size={14} /> Add Qdrant Node
          </button>
        </div>

        {loading && <div style={{ color: isDarkMode ? "#fff" : "#000" }}>Loading nodes...</div>}

        {!loading && nodes.length === 0 && (
          <div style={{ color: isDarkMode ? "#aaa" : "#555" }}>
            No Qdrant nodes found. Click "Add Qdrant Node" to connect your first database.
          </div>
        )}

        {!loading &&
          nodes.map((node) => (
            <QdrantCard
              key={node._id}
              node={node}
              isDarkMode={isDarkMode}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}

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
              <h3 style={{ margin: 0, color: "#48a2ff" }}>Add Qdrant Node</h3>

              <input
                placeholder="Database Name (e.g., Qdrant-Node-1)"
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
                placeholder="Qdrant URL (e.g., http://localhost:6333)"
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

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                <button
                  onClick={() => setShowAddDB(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: isDarkMode ? "#1f2937" : "#e5e7eb",
                    color: isDarkMode ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDatabase}
                  disabled={addingDB}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#48a2ff",
                    color: "#fff",
                    cursor: "pointer",
                    opacity: addingDB ? 0.7 : 1,
                  }}
                >
                  {addingDB ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideBar>
  );
}