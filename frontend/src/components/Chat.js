// Chat.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Plus } from "lucide-react";
import axios from "axios";
import bkg from "./bkg.jpg";
import SideBar from "./SideBar"; // ✅ use existing sidebar

export default function Chat() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello 👋 I'm DEX Chat! How can I assist you today?" },
    ]);
    const [input, setInput] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        setMessages((prev) => [...prev, { sender: "bot", text: "⏳ Thinking..." }]);

        try {
            const res = await axios.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
                { prompt: [{ content: input }], max_output_tokens: 500 },
                { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}` } }
            );

            const botReply =
                res.data?.candidates?.[0]?.content?.[0]?.text ||
                res.data?.output_text ||
                "🤖 Sorry, I didn’t understand that.";

            setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: botReply }]);
        } catch (error) {
            console.error("API error:", error);
            setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: "⚠️ Oops! API request failed." }]);
        }
    };

    const handleMenuClick = (option) => {
        setShowMenu(false);
        if (option === "new") setMessages([{ sender: "bot", text: "🆕 New chat started! How can I assist?" }]);
        else if (option === "research")
            setMessages((prev) => [...prev, { sender: "bot", text: "🔍 Starting deep research mode..." }]);
        else setMessages((prev) => [...prev, { sender: "bot", text: `Connected to ${option}` }]);
    };

    const menuOptions = [
        { key: "new", label: "🆕 New Chat" },
        { key: "research", label: "🧠 Deep Research" },
        { key: "Database 1", label: "💾 Database 1" },
        { key: "Database 2", label: "💾 Database 2" },
        { key: "Database 3", label: "💾 Database 3" },
    ];

    const styles = {
        container: {
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url(${bkg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            fontFamily: "Inter, sans-serif",
            color: "#fff",
            padding: isMobile ? "10px 0" : "0px",
        },
        contentBox: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "95%",
            height: isMobile ? "auto" : "95vh",
            borderRadius: "16px",
            border: "2px solid rgba(255, 255, 255, 1)",
            overflow: "hidden",
            background: "rgba(30,30,30,0.30)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        },
        mainContent: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px" },
        chatWindow: {
            flex: 1,
            overflowY: "auto",
            padding: "10px",
            borderRadius: "12px",
            background: "rgba(25,28,40,0.8)",
            border: "1px solid #fff",
            marginBottom: "10px",
        },
        message: { marginBottom: "12px", padding: "10px 14px", borderRadius: "12px", maxWidth: "80%", fontSize: "14px", lineHeight: "1.4" },
        userMessage: { background: "#3b82f6", color: "#fff", alignSelf: "flex-end", border: "1px solid #fff" },
        botMessage: { background: "#191C28", color: "#fff", border: "1px solid #fff", alignSelf: "flex-start" },
        inputContainer: {
            display: "flex",
            alignItems: "center",
            background: "#10131E",
            border: "1px solid #fff",
            borderRadius: "12px",
            padding: "6px 10px",
            position: "relative",
        },
        plusButton: { background: "transparent", border: "none", color: "#fff", cursor: "pointer", marginRight: "8px" },
        dropdownMenu: {
            position: "absolute",
            bottom: "50px",
            left: "10px",
            background: "rgba(25,28,40,0.95)",
            border: "1px solid #fff",
            borderRadius: "10px",
            padding: "8px 0",
            width: "180px",
            zIndex: 100,
        },
        dropdownItem: { padding: "8px 12px", fontSize: "14px", color: "#fff", cursor: "pointer" },
        input: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", padding: "6px" },
        sendButton: { background: "#3b82f6", border: "none", borderRadius: "8px", color: "#fff", padding: "6px 10px", cursor: "pointer" },
    };

    return (
        <div style={styles.container}>
            <div style={styles.contentBox}>
                {/* Sidebar */}
                <SideBar isMobile={isMobile} handleNavigate={navigate} />

                {/* Chat Window */}
                <main style={styles.mainContent}>
                    <div style={styles.chatWindow}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.message,
                                    ...(msg.sender === "user" ? styles.userMessage : styles.botMessage),
                                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div style={styles.inputContainer}>
                        <button onClick={() => setShowMenu(!showMenu)} style={styles.plusButton}>
                            <Plus size={20} />
                        </button>

                        {showMenu && (
                            <div style={styles.dropdownMenu}>
                                {menuOptions.map((opt) => (
                                    <div key={opt.key} style={styles.dropdownItem} onClick={() => handleMenuClick(opt.key)}>
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        <input
                            type="text"
                            value={input}
                            placeholder="Type your message..."
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            style={styles.input}
                        />
                        <button onClick={handleSend} style={styles.sendButton}>
                            <Send size={18} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
