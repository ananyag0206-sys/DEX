import React, { useEffect, useState, useContext, useCallback } from "react";
import { Copy, ExternalLink, Plus, Edit, Trash, Play, Square, X, Database, Zap } from "lucide-react";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";

function StatusIndicator({ status }) {
  const color = status === "Connected" ? "#22c55e" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span style={{ fontSize: 12 }}>{status}</span>
    </div>
  );
}

const openDashboard = (url) => {
  if (!url) return;
  const base = url.replace(/\/$/, "");
  window.open(`${base}/dashboard`, "_blank");
};

const Button = ({ children, onClick, variant = "default" }) => {
  const styles = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background:
      variant === "primary"
        ? "#48a2ff"
        : variant === "danger"
        ? "#ef4444"
        : "#111827",
    color: "#fff",
    transition: "opacity 0.15s",
  };
  return (
    <button
      onClick={onClick}
      style={styles}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
};

/* ── Add Database Modal ── */
function AddDatabaseModal({ isDarkMode, onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // slight delay so the enter animation plays
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim());
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") handleClose();
  };

  const bg = isDarkMode ? "#0f172a" : "#ffffff";
  const border = isDarkMode ? "#1e293b" : "#e2e8f0";
  const text = isDarkMode ? "#f1f5f9" : "#0f172a";
  const sub = isDarkMode ? "#64748b" : "#94a3b8";
  const inputBg = isDarkMode ? "#020617" : "#f8fafc";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.22s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -48%) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease",
          zIndex: 1001,
          width: 420,
          maxWidth: "calc(100vw - 32px)",
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: isDarkMode
            ? "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(72,162,255,0.08)"
            : "0 24px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Accent strip */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #48a2ff 0%, #a78bfa 50%, #34d399 100%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "20px 20px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Icon badge */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(72,162,255,0.35)",
              }}
            >
              <Database size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: text }}>
                New Qdrant DB
              </div>
              <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>
                Spin up a managed vector DB instance
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: sub,
              padding: 4,
              borderRadius: 6,
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 0" }}>
          {/* Info pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              background: isDarkMode ? "rgba(72,162,255,0.07)" : "rgba(72,162,255,0.06)",
              border: `1px solid ${isDarkMode ? "rgba(72,162,255,0.15)" : "rgba(72,162,255,0.2)"}`,
              marginBottom: 18,
            }}
          >
            <Zap size={13} color="#48a2ff" />
            <span style={{ fontSize: 11, color: "#48a2ff" }}>
              Container will be ready in seconds after creation
            </span>
          </div>

          {/* Input */}
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: sub,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            DB Name
          </label>
          <input
            autoFocus
            placeholder="e.g. embeddings-prod"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKey}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: inputBg,
              color: text,
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#48a2ff")}
            onBlur={(e) => (e.target.style.borderColor = border)}
          />

          {/* Character hint */}
          <div style={{ fontSize: 11, color: sub, marginTop: 6, textAlign: "right" }}>
            {name.length}/48
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px 20px",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: "transparent",
              color: text,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: name.trim()
                ? "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)"
                : isDarkMode
                ? "#1e293b"
                : "#e2e8f0",
              color: name.trim() ? "#fff" : sub,
              fontSize: 13,
              cursor: name.trim() ? "pointer" : "not-allowed",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: name.trim() ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
              transition: "all 0.15s",
            }}
          >
            <Plus size={14} />
            Create Database
          </button>
        </div>
      </div>
    </>
  );
}

/* ── QdrantCard (unchanged logic, slight polish) ── */
function QdrantCard({ node, isDarkMode, onUpdate, onDelete, onStart, onStop }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node?.name || "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(node.qdrantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveEdit = async () => {
    if (!newName?.trim()) return;
    await onUpdate(node._id, newName);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        background: isDarkMode ? "#020617" : "#ffffff",
        borderRadius: 12,
        padding: 14,
        border: `1px solid ${isDarkMode ? "#1e293b" : "#e5e7eb"}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        transition: "0.2s",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {isEditing ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                padding: 6,
                borderRadius: 6,
                border: "1px solid #374151",
                background: "transparent",
                color: isDarkMode ? "#fff" : "#000",
              }}
            />
            <Button variant="primary" onClick={handleSaveEdit}>Save</Button>
          </div>
        ) : (
          <div style={{ fontWeight: 600, fontSize: 14 }}>{node.name}</div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <StatusIndicator status={node.status} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{node.qdrantUrl}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Button onClick={handleCopy}>
          <Copy size={12} /> {copied ? "Copied" : "Copy"}
        </Button>
        <Button onClick={() => setIsEditing(true)}>
          <Edit size={12} />
        </Button>
        <Button variant="danger" onClick={() => onDelete(node._id)}>
          <Trash size={12} />
        </Button>
        {node.status === "Connected" ? (
          <Button onClick={() => onStop(node._id)}>
            <Square size={12} /> Stop
          </Button>
        ) : (
          <Button onClick={() => onStart(node._id)}>
            <Play size={12} /> Start
          </Button>
        )}
        <Button variant="primary" onClick={() => openDashboard(node.qdrantUrl)}>
          <ExternalLink size={12} />
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ConnectQdrant() {
  const { isDarkMode } = useContext(ThemeContext);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/container/status`);
      const data = await res.json();
      const mapped = Array.isArray(data)
  ? data.map((db) => ({
      _id: db.dbName,
      name: db.metadata?.customName || db.dbName,
      qdrantUrl: db.url,
      status: db.running ? "Connected" : "Disconnected",
    }))
  : [];
      setNodes(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, [fetchNodes]);

  const handleAddDatabase = async (name) => {
    await fetch(`${apiBase}/container/143`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dbMetadata: { customName: name } }),
    });
    setShowModal(false);
    fetchNodes();
  };

  return (
    <SideBar>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ color: "#48a2ff" }}>Qdrant Containers</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add
          </Button>
        </div>

        {loading && <div>Loading...</div>}

        {!loading &&
          nodes.map((node) => (
            <QdrantCard
              key={node._id}
              node={node}
              isDarkMode={isDarkMode}
              onUpdate={async (id, name) => {
                await fetch(`${apiBase}/container/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name }),
                });
                fetchNodes();
              }}
              onDelete={async (id) => {
                await fetch(`${apiBase}/container/${id}`, { method: "DELETE" });
                fetchNodes();
              }}
              onStart={async (id) => {
                await fetch(`${apiBase}/container/start/${id}`, { method: "POST" });
                fetchNodes();
              }}
              onStop={async (id) => {
                await fetch(`${apiBase}/container/stop/${id}`, { method: "POST" });
                fetchNodes();
              }}
            />
          ))}
      </div>

      {showModal && (
        <AddDatabaseModal
          isDarkMode={isDarkMode}
          onClose={() => setShowModal(false)}
          onConfirm={handleAddDatabase}
        />
      )}
    </SideBar>
  );
}
