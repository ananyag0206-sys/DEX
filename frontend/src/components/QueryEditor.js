// src/QueryEditor.js
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";
import { supabase } from "./supabase-client"; // ✅ Supabase import

export default function QueryEditor() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState(
`CREATE DATABASE CompanyDB;
USE CompanyDB;

CREATE TABLE Employees (
 EmpID INT PRIMARY KEY,
 EmpName VARCHAR(50),
 Department VARCHAR(30),
 Salary DECIMAL(10,2)
);

INSERT INTO Employees VALUES
(1, 'Aditi', 'HR', 45000),
(2, 'Ravi', 'Finance', 55000),
(3, 'Priya', 'IT', 60000);`
  );
  const [results, setResults] = useState([
    { ID: 1, Name: "Aditi", Department: "HR", Salary: 45000 },
    { ID: 2, Name: "Ravi", Department: "Finance", Salary: 55000 },
    { ID: 3, Name: "Priya", Department: "IT", Salary: 60000 },
  ]);
  const [executionSeries, setExecutionSeries] = useState([
    { name: "10", value: 8 },
    { name: "20", value: 9 },
    { name: "30", value: 10 },
    { name: "40", value: 18 },
    { name: "50", value: 11 },
    { name: "60", value: 17 },
    { name: "70", value: 19 },
  ]);

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setTemplates(data || []);
      setLoadingTemplates(false);
    };
    fetchTemplates();
  }, []);

  const parseInsertRows = (text) => {
    const valuesBlockRegex = /INSERT\s+INTO\s+\w+\s+VALUES\s*([\s\S]*?);/i;
    const match = text.match(valuesBlockRegex);
    if (!match) return null;
    const block = match[1];
    const rowMatches = [...block.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].trim());
    const rows = rowMatches.map((r) => {
      const cols = r.match(/('(.*?)'|[^,]+)/g).map((c) => c.trim());
      return cols.map((c) => {
        const s = c.trim();
        if (/^'.*'$/.test(s)) return s.slice(1, -1);
        if (!isNaN(Number(s))) return Number(s);
        return s;
      });
    });
    return rows;
  };

  const runQuery = () => {
    const rows = parseInsertRows(queryText);
    if (rows && rows.length > 0) {
      const mapped =
        rows[0].length === 4
          ? rows.map((r) => ({
              ID: r[0],
              Name: r[1],
              Department: r[2],
              Salary: r[3],
            }))
          : rows.map((r, idx) =>
              r.reduce((acc, val, i) => {
                acc["c" + (i + 1)] = val;
                return acc;
              }, { idx: idx + 1 })
            );
      setResults(mapped);
    } else {
      if (/SELECT/i.test(queryText)) {
        const whereMatch = queryText.match(/WHERE\s+Salary\s*([<>=]+)\s*(\d+)/i);
        if (whereMatch) {
          const op = whereMatch[1];
          const val = Number(whereMatch[2]);
          const filtered = results.filter((r) => {
            if (op === ">") return r.Salary > val;
            if (op === "<") return r.Salary < val;
            if (op === ">=") return r.Salary >= val;
            if (op === "<=") return r.Salary <= val;
            if (op === "=" || op === "==") return r.Salary === val;
            return true;
          });
          setResults(filtered);
        }
      }
    }

    const newSeries = executionSeries.map((p, i) => ({
      ...p,
      value: Math.max(
        3,
        Math.round(p.value * (0.85 + Math.random() * 0.4))
      ),
    }));
    const finalVal = Math.max(
      5,
      Math.round(
        8 + (queryText.length % 50) * (0.1 + Math.random() * 0.2) + Math.random() * 8
      )
    );
    const appended = [...newSeries.slice(1), { name: `${(Math.random()*70)|0}`, value: finalVal }];
    setExecutionSeries(appended);
  };

  const saveTemplate = async () => {
    const name = prompt("Template name?");
    if (!name) return;

    const { data, error } = await supabase
      .from("query_templates")
      .insert([{ name, sql: queryText }])
      .select();

    if (error) {
      alert("Error saving template: " + error.message);
      console.error(error);
    } else {
      setTemplates((prev) => [data[0], ...prev]);
      alert("Saved template: " + name);
    }
  };

  const applyTemplate = (t) => {
    setSelectedTemplate(t.id);
    setQueryText(t.sql);
  };

  const deleteTemplate = async (t) => {
    if (!window.confirm("Delete template " + t.name + "?")) return;

    const { error } = await supabase
      .from("query_templates")
      .delete()
      .eq("id", t.id);

    if (error) {
      alert("Error deleting template: " + error.message);
    } else {
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
      if (selectedTemplate === t.id) setSelectedTemplate(null);
    }
  };

  const exportCSV = () => {
    if (!results || results.length === 0) {
      alert("No results to export");
      return;
    }
    const keys = Object.keys(results[0]);
    const csv = [
      keys.join(","),
      ...results.map((r) => keys.map((k) => `"${String(r[k] ?? "")}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJoin = () => {
    alert("JOIN clicked — placeholder. Implement DB join logic as needed.");
  };

  const handleExit = () => {
    navigate("/");
  };

  const lines = queryText.split("\n").length;

  return (
    <SideBar>
      <div
        style={{
          flex: 1,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: "100vh",
        //   backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Top bar: Save + Query Template + Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            background: isDarkMode ? "rgba(10,12,20,0.5)" : "rgba(255,255,255,0.5)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            color: isDarkMode ? "#fff" : "#0b2540",
            boxShadow: isDarkMode ? "0 6px 20px rgba(0,0,0,0.6)" : "0 6px 20px rgba(0,0,0,0.08)",
          }}
        >
          <button
            onClick={saveTemplate}
            style={{
              background: "#1f2b4a",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Save
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 700, color: "#cce4ff" }}>≡ Query Template</div>
            <select
              value={selectedTemplate || ""}
              onChange={(e) => {
                const t = templates.find((x) => String(x.id) === e.target.value);
                if (t) applyTemplate(t);
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: isDarkMode ? "#0f1724" : "#fff",
                color: isDarkMode ? "#fff" : "#000",
              }}
            >
              <option value="">Choose template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {templates.length > 0 && (
              <button
                onClick={() => {
                  if (!window.confirm("Clear all templates?")) return;
                  setTemplates([]);
                  localStorage.removeItem("queryTemplates");
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#fff",
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                title="Clear templates"
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <input
              placeholder="Search..."
              style={{
                padding: "8px 12px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                background: isDarkMode ? "#0e1726" : "#fff",
                color: isDarkMode ? "#fff" : "#000",
              }}
            />
            <button
              onClick={() => alert("Search (placeholder)")}
              style={{
                background: "#163a7b",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              🔍
            </button>
          </div>
        </div>

        {/* Main query + insights row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.45fr 0.65fr",
            gap: 12,
            alignItems: "start",
          }}
        >
          {/* Query Editor */}
          <div
            style={{
              background: isDarkMode ? "rgba(12,14,20,0.6)" : "rgba(255,255,255,0.7)",
              borderRadius: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: 260,
              boxShadow: isDarkMode ? "0 10px 30px rgba(0,0,0,0.6)" : "0 10px 30px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#dfefff" }}>Query Editor</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={runQuery}
                  style={{
                    background: "#243a66",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Run
                </button>
                <button
                  onClick={() => {
                    setQueryText("");
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flex: 1, minHeight: 160 }}>
              {/* line numbers column */}
              <div
                style={{
                  width: 48,
                  background: "transparent",
                  color: isDarkMode ? "#9fb2d9" : "#2b4a70",
                  padding: "8px 6px",
                  borderRadius: 6,
                  textAlign: "right",
                  userSelect: "none",
                  fontFamily: "monospace",
                  overflow: "hidden",
                }}
              >
                {Array.from({ length: lines }).map((_, i) => (
                  <div key={i} style={{ height: 20, lineHeight: "20px", fontSize: 12 }}>
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* textarea editor */}
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  ref={editorRef}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    padding: 12,
                    borderRadius: 8,
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: isDarkMode ? "#d7e6ff" : "#071c33",
                    background: isDarkMode ? "rgba(6,8,12,0.6)" : "rgba(255,255,255,0.95)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                    minHeight: 140,
                  }}
                />
              </div>
            </div>

            {/* Query Section label (decorative) */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: isDarkMode ? "rgba(8,10,15,0.4)" : "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ color: isDarkMode ? "#bcd8ff" : "#0b2540", fontWeight: 600 }}>Query Section</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => alert("Open query templates (placeholder)")} style={{ padding: "6px 8px", borderRadius: 6 }}>📄</button>
                <button onClick={() => alert("More options (placeholder)")} style={{ padding: "6px 8px", borderRadius: 6 }}>⋯</button>
              </div>
            </div>
          </div>

          {/* AI Insights side panel */}
          <div
            style={{
              background: isDarkMode ? "rgba(10,12,20,0.55)" : "rgba(255,255,255,0.85)",
              borderRadius: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: 260,
              boxShadow: isDarkMode ? "0 10px 30px rgba(0,0,0,0.6)" : "0 10px 30px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#dfefff" }}>AI Insights</h3>
              <button
                onClick={() => alert("AI input (placeholder)")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "#1f2b4a",
                  color: "#fff",
                  border: "none",
                }}
              >
                Ask
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Find users",
                "Query Optimization: Add index to",
                "Error Detection on line 8",
                "Show me top 10 users",
              ].map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQueryText((q) => q + `\n-- Suggestion: ${s}`);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: isDarkMode ? "#081226" : "#fff",
                    border: "1px solid rgba(255,255,255,0.04)",
                    color: isDarkMode ? "#bcd8ff" : "#0b2540",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
              <input
                placeholder="Type your Query/plain English"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setQueryText((q) => q + "\n-- AI: " + e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.04)",
                  flex: 1,
                  background: isDarkMode ? "#07122b" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              />
              <button
                onClick={() => alert("AI generate (placeholder)")}
                style={{ padding: "8px 10px", borderRadius: 8, background: "#163a7b", color: "#fff", border: "none" }}
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Lower results & chart row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 12,
            alignItems: "start",
          }}
        >
          {/* Results card */}
          <div
            style={{
              background: isDarkMode ? "rgba(12,14,20,0.6)" : "rgba(255,255,255,0.85)",
              borderRadius: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: 240,
              boxShadow: isDarkMode ? "0 10px 40px rgba(0,0,0,0.6)" : "0 10px 40px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#dfefff" }}>Results</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                  Table view
                </div>
                <div style={{ padding: "6px 8px", borderRadius: 8, background: "transparent" }}>
                  Chart view
                </div>
              </div>
            </div>

            <div style={{ overflow: "auto", borderRadius: 8, border: "1px solid rgba(255,255,255,0.02)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead style={{ background: isDarkMode ? "#0b2540" : "#f6fbff", color: isDarkMode ? "#bcd8ff" : "#06324f" }}>
                  <tr>
                    {Object.keys(results[0] || {}).map((k) => (
                      <th key={k} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "left" }}>
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      {Object.keys(results[0]).map((k) => (
                        <td key={k} style={{ padding: "8px 10px", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                          {String(r[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={exportCSV} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: 8, background: "#13294f", color: "#fff", border: "none" }}>
                CSV
              </button>
              <button onClick={handleJoin} style={{ padding: "8px 12px", borderRadius: 8, background: "#2d2d2d", color: "#fff", border: "none" }}>
                JOIN
              </button>
              <button onClick={handleExit} style={{ padding: "8px 12px", borderRadius: 8, background: "#6b1a1a", color: "#fff", border: "none" }}>
                EXIT
              </button>
            </div>
          </div>

          {/* Query Execution Time chart card */}
          <div
            style={{
              background: isDarkMode ? "rgba(12,14,20,0.6)" : "rgba(255,255,255,0.85)",
              borderRadius: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: 240,
              boxShadow: isDarkMode ? "0 10px 40px rgba(0,0,0,0.6)" : "0 10px 40px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, color: "#dfefff" }}>Query Execution Time (ms)</h3>
              <div style={{ width: 28, height: 14, borderRadius: 10, background: "#2fcb9c" }} title="status" />
            </div>
            <div style={{ flex: 1, minHeight: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={executionSeries}>
                  <CartesianGrid stroke={isDarkMode ? "#243a66" : "#e6eefc"} strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#93b9ff" : "#234d87"} />
                  <YAxis stroke={isDarkMode ? "#93b9ff" : "#234d87"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0d1a30" : "#fff",
                      borderRadius: 6,
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ height: 8, background: "rgba(255,255,255,0.02)", borderRadius: 6 }} />
          </div>
        </div>
      </div>
    </SideBar>
  );
}



// in this ai is remove and result functionality is given based on the query written in the editor. The query templates are fetched from supabase and can be applied to the editor. The user can save new templates to supabase as well. The execution time chart is updated based on the length of the query.
// src/QueryEditor.js
// import React, { useState, useEffect, useContext, useRef } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import { useNavigate } from "react-router-dom";
// import SideBar from "./SideBar";
// import { ThemeContext } from "./ThemeContext";
// import { supabase } from "./supabase-client"; // Supabase client import

// export default function QueryEditor() {
//   const { isDarkMode } = useContext(ThemeContext);
//   const navigate = useNavigate();
//   const editorRef = useRef(null);

//   const [queryText, setQueryText] = useState(
//     `CREATE DATABASE CompanyDB;
// USE CompanyDB;

// CREATE TABLE Employees (
//  EmpID INT PRIMARY KEY,
//  EmpName VARCHAR(50),
//  Department VARCHAR(30),
//  Salary DECIMAL(10,2)
// );

// INSERT INTO Employees VALUES
// (1, 'Aditi', 'HR', 45000),
// (2, 'Ravi', 'Finance', 55000),
// (3, 'Priya', 'IT', 60000);`
//   );

//   const [results, setResults] = useState([
//     { ID: 1, Name: "Aditi", Department: "HR", Salary: 45000 },
//     { ID: 2, Name: "Ravi", Department: "Finance", Salary: 55000 },
//     { ID: 3, Name: "Priya", Department: "IT", Salary: 60000 },
//   ]);

//   const [executionSeries, setExecutionSeries] = useState([
//     { name: "10", value: 8 },
//     { name: "20", value: 9 },
//     { name: "30", value: 10 },
//     { name: "40", value: 18 },
//     { name: "50", value: 11 },
//     { name: "60", value: 17 },
//     { name: "70", value: 19 },
//   ]);

//   const [templates, setTemplates] = useState([]);
//   const [loadingTemplates, setLoadingTemplates] = useState(true);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   // Fetch templates from Supabase
//   useEffect(() => {
//     const fetchTemplates = async () => {
//       const { data, error } = await supabase
//         .from("queries")
//         .select("*")
//         .order("created_at", { ascending: false });
//       if (error) console.error(error);
//       else setTemplates(data || []);
//       setLoadingTemplates(false);
//     };
//     fetchTemplates();
//   }, []);

//   // Parse INSERT INTO rows from SQL text
//   const parseInsertRows = (text) => {
//     const valuesBlockRegex = /INSERT\s+INTO\s+\w+\s+VALUES\s*([\s\S]*?);/i;
//     const match = text.match(valuesBlockRegex);
//     if (!match) return null;
//     const block = match[1];
//     const rowMatches = [...block.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].trim());
//     return rowMatches.map((r) =>
//       r.match(/('(.*?)'|[^,]+)/g).map((c) => {
//         const s = c.trim();
//         if (/^'.*'$/.test(s)) return s.slice(1, -1);
//         if (!isNaN(Number(s))) return Number(s);
//         return s;
//       })
//     );
//   };

//   // Run SQL query simulation
//   const runQuery = () => {
//     const rows = parseInsertRows(queryText);
//     if (rows && rows.length > 0) {
//       const mapped =
//         rows[0].length === 4
//           ? rows.map((r) => ({
//               ID: r[0],
//               Name: r[1],
//               Department: r[2],
//               Salary: r[3],
//             }))
//           : rows.map((r, idx) =>
//               r.reduce((acc, val, i) => {
//                 acc["c" + (i + 1)] = val;
//                 return acc;
//               }, { idx: idx + 1 })
//             );
//       setResults(mapped);
//     } else if (/SELECT/i.test(queryText)) {
//       const whereMatch = queryText.match(/WHERE\s+Salary\s*([<>=]+)\s*(\d+)/i);
//       if (whereMatch) {
//         const op = whereMatch[1];
//         const val = Number(whereMatch[2]);
//         const filtered = results.filter((r) => {
//           if (op === ">") return r.Salary > val;
//           if (op === "<") return r.Salary < val;
//           if (op === ">=") return r.Salary >= val;
//           if (op === "<=") return r.Salary <= val;
//           if (op === "=" || op === "==") return r.Salary === val;
//           return true;
//         });
//         setResults(filtered);
//       }
//     }

//     const newSeries = executionSeries.map((p) => ({
//       ...p,
//       value: Math.max(3, Math.round(p.value * (0.85 + Math.random() * 0.4))),
//     }));
//     const finalVal = Math.max(
//       5,
//       Math.round(8 + (queryText.length % 50) * (0.1 + Math.random() * 0.2) + Math.random() * 8)
//     );
//     const appended = [...newSeries.slice(1), { name: `${Math.floor(Math.random() * 70)}`, value: finalVal }];
//     setExecutionSeries(appended);
//   };

//   // Save SQL Template
//   const saveTemplate = async () => {
//     const name = prompt("Template name?");
//     if (!name) return;

//     const { data, error } = await supabase.from("queries").insert([{ name, sql: queryText }]).select();

//     if (error) {
//       alert("Error saving template: " + error.message);
//     } else {
//       setTemplates((prev) => [data[0], ...prev]);
//       alert("Saved template: " + name);
//     }
//   };

//   // Save results to Supabase
//   const saveResults = async () => {
//     if (!results || results.length === 0) return alert("No data to save");

//     const mappedResults = results.map((r) => ({
//       EmpID: r.ID,
//       EmpName: r.Name,
//       Department: r.Department,
//       Salary: r.Salary,
//     }));

//     const { data, error } = await supabase.from("results").insert(mappedResults).select();

//     if (error) {
//       alert("Error saving results: " + error.message);
//     } else {
//       alert("Saved " + data.length + " rows to Supabase!");
//     }
//   };

//   const applyTemplate = (t) => {
//     setSelectedTemplate(t.id);
//     setQueryText(t.sql);
//   };

//   const deleteTemplate = async (t) => {
//     if (!window.confirm("Delete template " + t.name + "?")) return;

//     const { error } = await supabase.from("queries").delete().eq("id", t.id);

//     if (error) alert("Error deleting template: " + error.message);
//     else {
//       setTemplates((prev) => prev.filter((x) => x.id !== t.id));
//       if (selectedTemplate === t.id) setSelectedTemplate(null);
//     }
//   };

//   // Export results to CSV
//   const exportCSV = () => {
//     if (!results || results.length === 0) {
//       alert("No results to export");
//       return;
//     }
//     const keys = Object.keys(results[0]);
//     const csv = [
//       keys.join(","),
//       ...results.map((r) => keys.map((k) => `"${r[k] ?? ""}"`).join(",")),
//     ].join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "results.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleJoin = () => alert("JOIN clicked — placeholder");
//   const handleExit = () => navigate("/");

//   const lines = queryText.split("\n").length;

//   return (
//     <SideBar>
//       <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 12, minHeight: "100vh" }}>
//         {/* Top Bar */}
//         <div style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 12,
//           padding: 12,
//           background: isDarkMode ? "rgba(10,12,20,0.5)" : "rgba(255,255,255,0.5)",
//           borderRadius: 12,
//           border: "1px solid rgba(255,255,255,0.06)",
//           color: isDarkMode ? "#fff" : "#0b2540",
//           boxShadow: isDarkMode ? "0 6px 20px rgba(0,0,0,0.6)" : "0 6px 20px rgba(0,0,0,0.08)"
//         }}>
//           <button onClick={saveTemplate} style={{ background: "#1f2b4a", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
//             Save Template
//           </button>
//           <button onClick={saveResults} style={{ background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
//             Save Results
//           </button>
//           <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
//             <select value={selectedTemplate || ""} onChange={(e) => {
//               const t = templates.find((x) => String(x.id) === e.target.value);
//               if (t) applyTemplate(t);
//             }} style={{ padding: "8px 10px", borderRadius: 8 }}>
//               <option value="">Choose template...</option>
//               {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//             </select>
//             {templates.length > 0 && (
//               <button onClick={() => { if (!window.confirm("Clear all templates?")) return; setTemplates([]); }} style={{ padding: "8px 10px", borderRadius: 8 }}>
//                 Clear Templates
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Query Editor */}
//         <div style={{
//           background: isDarkMode ? "rgba(12,14,20,0.6)" : "rgba(255,255,255,0.7)",
//           borderRadius: 12,
//           padding: 12,
//           border: "1px solid rgba(255,255,255,0.06)",
//           minHeight: 260,
//           boxShadow: isDarkMode ? "0 10px 30px rgba(0,0,0,0.6)" : "0 10px 30px rgba(0,0,0,0.06)",
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//         }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <h3 style={{ margin: 0, color: "#dfefff" }}>Query Editor</h3>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button onClick={runQuery} style={{ background: "#243a66", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Run</button>
//               <button onClick={() => setQueryText("")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#fff", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>Clear</button>
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: 8, flex: 1, minHeight: 160 }}>
//             {/* Line Numbers */}
//             <div style={{ width: 48, background: "transparent", color: isDarkMode ? "#9fb2d9" : "#2b4a70", padding: "8px 6px", borderRadius: 6, textAlign: "right", userSelect: "none", fontFamily: "monospace", overflow: "hidden" }}>
//               {Array.from({ length: lines }).map((_, i) => <div key={i} style={{ height: 20, lineHeight: "20px", fontSize: 12 }}>{i + 1}</div>)}
//             </div>
//             {/* Textarea */}
//             <textarea
//               ref={editorRef}
//               value={queryText}
//               onChange={(e) => setQueryText(e.target.value)}
//               spellCheck={false}
//               style={{
//                 flex: 1,
//                 width: "100%",
//                 height: "100%",
//                 resize: "none",
//                 padding: 12,
//                 borderRadius: 8,
//                 fontFamily: "monospace",
//                 fontSize: 13,
//                 color: isDarkMode ? "#d7e6ff" : "#071c33",
//                 background: isDarkMode ? "rgba(6,8,12,0.6)" : "rgba(255,255,255,0.95)",
//                 border: "1px solid rgba(255,255,255,0.04)",
//                 boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
//                 minHeight: 140,
//               }}
//             />
//           </div>
//         </div>

//         {/* Results + Chart */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 12, alignItems: "start" }}>
//           {/* Results Card */}
//           <div style={{ background: isDarkMode ? "rgba(12,14,20,0.6)" : "rgba(255,255,255,0.85)", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,0.06)", minHeight: 240, boxShadow: isDarkMode ? "0 10px 40px rgba(0,0,0,0.6)" : "0 10px 40px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <h3 style={{ margin: 0, color: "#dfefff" }}>Results</h3>
//             </div>
//             <div style={{ overflow: "auto", borderRadius: 8, border: "1px solid rgba(255,255,255,0.02)" }}>
//               <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
//                 <thead style={{ background: isDarkMode ? "#0b2540" : "#f6fbff", color: isDarkMode ? "#bcd8ff" : "#06324f" }}>
//                   <tr>{Object.keys(results[0] || {}).map((k) => <th key={k} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "left" }}>{k}</th>)}</tr>
//                 </thead>
//                 <tbody>
//                   {results.map((r, i) => (
//                     <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
//                       {Object.keys(results[0]).map((k) => <td key={k} style={{ padding: "8px 10px", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>{String(r[k] ?? "")}</td>)}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//               <button onClick={exportCSV} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: 8, background: "#13294f", color: "#fff", border: "none" }}>CSV</button>
//               <button onClick={handleJoin} style={{ padding: "8px 12px", borderRadius: 8, background: "#2d2d2d", color: "#fff", border: "none" }}>JOIN</button>
//               <button onClick={handleExit} style={{ padding: "8px 12px", borderRadius: 8, background: "#6b1a1a", color: "#fff", border: "none" }}>EXIT</button>
//             </div>
//           </div>

//           {/* Execution Time Chart */}
//           <div style={{ background: isDarkMode ? "rgba(12,14,20,0.6)" : "rgba(255,255,255,0.85)", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,0.06)", minHeight: 240, boxShadow: isDarkMode ? "0 10px 40px rgba(0,0,0,0.6)" : "0 10px 40px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
//             <h3 style={{ margin: 0, color: "#dfefff" }}>Query Execution Time (ms)</h3>
//             <div style={{ flex: 1, minHeight: 150 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={executionSeries}>
//                   <CartesianGrid stroke={isDarkMode ? "#243a66" : "#e6eefc"} strokeDasharray="3 3" />
//                   <XAxis dataKey="name" stroke={isDarkMode ? "#93b9ff" : "#234d87"} />
//                   <YAxis stroke={isDarkMode ? "#93b9ff" : "#234d87"} />
//                   <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#0d1a30" : "#fff", borderRadius: 6, color: isDarkMode ? "#fff" : "#000" }} />
//                   <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 4 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       </div>
//     </SideBar>
//   );
// }
