import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Plus } from "lucide-react";
import axios from "axios";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";

export default function Chat() {
    const { isDarkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "👋 Hello! I’m DEX Chat. How can I assist you today?" },
    ]);
    const [input, setInput] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsThinking(true);

        // temporary placeholder
        setMessages((prev) => [...prev, { sender: "bot", text: "..." }]);

        try {
            const res = await axios.post("http://localhost:5000/api/chat", {
                message: input,
            });
            const botReply = res.data.reply || "🤖 Sorry, I didn’t understand that.";
            setIsThinking(false);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { sender: "bot", text: botReply },
            ]);
        } catch (err) {
            console.error(err);
            setIsThinking(false);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { sender: "bot", text: "⚠️ Connection failed." },
            ]);
        }
    };

    const menuOptions = [
        { key: "new", label: "🆕 New Chat" },
        { key: "research", label: "🧠 Deep Research" },
        { key: "Database 1", label: "💾 Database 1" },
        { key: "Database 2", label: "💾 Database 2" },
        { key: "Database 3", label: "💾 Database 3" },
    ];

    const handleMenuClick = (option) => {
        setShowMenu(false);
        if (option === "new")
            setMessages([{ sender: "bot", text: "🆕 New chat started! How can I help?" }]);
        else if (option === "research")
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "🔍 Enter your query for deep research mode." },
            ]);
        else
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: `✅ Connected to ${option}` },
            ]);
    };

    // ---------- Dynamic Inline Styles ----------
    const styles = {
        mainContainer: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "1px",
            background: isDarkMode ? "#ffffffff" : "#000000ff",
            borderRadius: "16px",
                
            color: isDarkMode ? "#fff" : "#000",
            overflow: "hidden",
        },
        chatWindow: {
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            gap: "12px",
            background: isDarkMode ? "rgba(11, 19, 53, 0.95)" : "#f9f9f9",
            borderRadius: "16px 16px 0 0",
            backdropfilter: isDarkMode ? "blur(1px)" : "none",
            boxShadow: isDarkMode
                ? "0 0 15px rgba(255,255,255,0.05)"
                : "0 0 10px rgba(0,0,0,0.1)",
        },
        messageWrapper: {
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-end",
        },
        userWrapper: { justifyContent: "flex-end" },
        message: {
            maxWidth: "70%",
            padding: "12px 16px",
            borderRadius: "18px",
            fontSize: "15px",
            lineHeight: "1.5",
            wordWrap: "break-word",
            transition: "0.2s",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        },
        userMessage: {
            background: "#007bff",
            color: "#fff",
            borderBottomRightRadius: "6px",
        },
        botMessage: {
            background: isDarkMode ? "#30363d" : "#e5e7eb",
            color: isDarkMode ? "#fff" : "#000",
            borderBottomLeftRadius: "6px",
        },
        typingDots: {
            display: "inline-block",
            width: "5px",
            height: "5px",
            margin: "0 2px",
            borderRadius: "50%",
            backgroundColor: isDarkMode ? "#ccc" : "#333",
            animation: "blink 1.4s infinite both",
        },
        inputContainer: {
            display: "flex",
            alignItems: "center",
            background: isDarkMode ? "#161b22" : "#f0f0f0",
            borderRadius: "0 0 12px",
            padding: "5px",
            marginTop: "1px",
            border: `1px solid ${isDarkMode ? "#30363d" : "#ccc"}`,
            position: "relative",
        },
        plusButton: {
            background: "transparent",
            border: "none",
            color: isDarkMode ? "#fff" : "#000",
            cursor: "pointer",
            marginRight: "10px",
        },
        dropdownMenu: {
            position: "absolute",
            bottom: "55px",
            left: "10px",
            background: isDarkMode ? "#161b22" : "#fff",
            border: `1px solid ${isDarkMode ? "#30363d" : "#ccc"}`,
            borderRadius: "10px",
            width: "180px",
            zIndex: 10,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        },
        dropdownItem: {
            padding: "10px 14px",
            cursor: "pointer",
            fontSize: "14px",
        },
        input: {
            flex: 1,
            border: "none",
            background: "transparent",
            color: isDarkMode ? "#fff" : "#000",
            fontSize: "15px",
            outline: "none",
        },
        sendButton: {
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 12px",
            cursor: "pointer",
            transition: "background 0.2s",
        },
    };

    return (
        <SideBar isMobile={isMobile} handleNavigate={navigate}>
            <div style={styles.mainContainer}>
                <div style={styles.chatWindow}>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                ...styles.messageWrapper,
                                ...(msg.sender === "user" ? styles.userWrapper : {}),
                            }}
                        >
                            <div
                                style={{
                                    ...styles.message,
                                    ...(msg.sender === "user"
                                        ? styles.userMessage
                                        : styles.botMessage),
                                }}
                            >
                                {msg.text === "..." && isThinking ? (
                                    <div>
                                        <span style={{ ...styles.typingDots, animationDelay: "0s" }} />
                                        <span style={{ ...styles.typingDots, animationDelay: "0.2s" }} />
                                        <span style={{ ...styles.typingDots, animationDelay: "0.4s" }} />
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div style={styles.inputContainer}>
                    <button onClick={() => setShowMenu(!showMenu)} style={styles.plusButton}>
                        <Plus size={20} />
                    </button>

                    {showMenu && (
                        <div style={styles.dropdownMenu}>
                            {menuOptions.map((opt) => (
                                <div
                                    key={opt.key}
                                    style={styles.dropdownItem}
                                    onClick={() => handleMenuClick(opt.key)}
                                >
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
            </div>
        </SideBar>
    );
}




// // Chat.js
// import React, { useState, useEffect, useRef, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { Send, Plus } from "lucide-react";
// import axios from "axios";
// import SideBar from "./SideBar";
// import { ThemeContext } from "./ThemeContext";

// export default function Chat() {
//     const { isDarkMode } = useContext(ThemeContext);
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//     const [messages, setMessages] = useState([
//         { sender: "bot", text: "Hello 👋 I'm DEX Chat! How can I assist you today?" },
//     ]);
//     const [input, setInput] = useState("");
//     const [showMenu, setShowMenu] = useState(false);
//     const navigate = useNavigate();
//     const chatEndRef = useRef(null);

//     useEffect(() => {
//         const handleResize = () => setIsMobile(window.innerWidth < 768);
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     const handleSend = async () => {
//         if (!input.trim()) return;

//         const userMessage = { sender: "user", text: input };
//         setMessages((prev) => [...prev, userMessage]);
//         setInput("");

//         // Show "thinking"
//         setMessages((prev) => [...prev, { sender: "bot", text: "⏳ Thinking..." }]);

//         try {
//             const res = await axios.post("http://localhost:5000/api/chat", { message: input });
//             const botReply = res.data.reply || "🤖 Sorry, I didn’t understand that.";
//             setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: botReply }]);
//         } catch (err) {
//             console.error(err);
//             setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: "⚠️ API request failed." }]);
//         }
//     };

//     const menuOptions = [
//         { key: "new", label: "🆕 New Chat" },
//         { key: "research", label: "🧠 Deep Research" },
//         { key: "Database 1", label: "💾 Database 1" },
//         { key: "Database 2", label: "💾 Database 2" },
//         { key: "Database 3", label: "💾 Database 3" },
//     ];

//     const handleMenuClick = (option) => {
//         setShowMenu(false);
//         if (option === "new")
//             setMessages([{ sender: "bot", text: "🆕 New chat started! How can I assist?" }]);
//         else if (option === "research")
//             setMessages((prev) => [...prev, { sender: "bot", text: "🔍 Starting deep research mode..." }]);
//         else
//             setMessages((prev) => [...prev, { sender: "bot", text: `Connected to ${option}` }]);
//     };

//     // ---------- Dynamic Styles ----------
//     const styles = {
//         mainContainer: {
//             display: "flex",
//             flexDirection: "column",
//             height: "100%",
//         },
//         chatWindow: {
//             flex: 1,
//             overflowY: "auto",
//             padding: "10px",
//             borderRadius: "12px",
//             background: isDarkMode ? "rgba(25,28,40,0.8)" : "#f9f9f9",
//             border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
//             marginBottom: "10px",
//         },
//         message: {
//             marginBottom: "12px",
//             padding: "10px 14px",
//             borderRadius: "12px",
//             maxWidth: "80%",
//             fontSize: "14px",
//             lineHeight: "1.4",
//         },
//         userMessage: {
//             background: isDarkMode ? "#3b82f6" : "#2563eb",
//             color: "#fff",
//             alignSelf: "flex-end",
//             border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
//         },
//         botMessage: {
//             background: isDarkMode ? "#191C28" : "#e5e7eb",
//             color: isDarkMode ? "#fff" : "#000",
//             border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
//             alignSelf: "flex-start",
//         },
//         inputContainer: {
//             display: "flex",
//             alignItems: "center",
//             background: isDarkMode ? "#10131E" : "#f0f0f0",
//             border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
//             borderRadius: "12px",
//             padding: "6px 10px",
//             position: "relative",
//         },
//         plusButton: {
//             background: "transparent",
//             border: "none",
//             color: isDarkMode ? "#fff" : "#000",
//             cursor: "pointer",
//             marginRight: "8px",
//         },
//         dropdownMenu: {
//             position: "absolute",
//             bottom: "50px",
//             left: "10px",
//             background: isDarkMode ? "rgba(25,28,40,0.95)" : "#fff",
//             border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
//             borderRadius: "10px",
//             padding: "8px 0",
//             width: "180px",
//             zIndex: 100,
//             color: isDarkMode ? "#fff" : "#000",
//         },
//         dropdownItem: {
//             padding: "8px 12px",
//             fontSize: "14px",
//             color: isDarkMode ? "#fff" : "#000",
//             cursor: "pointer",
//         },
//         input: {
//             flex: 1,
//             background: "transparent",
//             border: "none",
//             outline: "none",
//             color: isDarkMode ? "#fff" : "#000",
//             fontSize: "14px",
//             padding: "6px",
//         },
//         sendButton: {
//             background: isDarkMode ? "#3b82f6" : "#2563eb",
//             border: "none",
//             borderRadius: "8px",
//             color: "#fff",
//             padding: "6px 10px",
//             cursor: "pointer",
//         },
//     };

//     return (
//         <SideBar isMobile={isMobile} handleNavigate={navigate}>
//             <div style={styles.mainContainer}>
//                 <div style={styles.chatWindow}>
//                     {messages.map((msg, i) => (
//                         <div
//                             key={i}
//                             style={{
//                                 ...styles.message,
//                                 ...(msg.sender === "user" ? styles.userMessage : styles.botMessage),
//                             }}
//                         >
//                             {msg.text}
//                         </div>
//                     ))}
//                     <div ref={chatEndRef} />
//                 </div>

//                 <div style={styles.inputContainer}>
//                     <button onClick={() => setShowMenu(!showMenu)} style={styles.plusButton}>
//                         <Plus size={20} />
//                     </button>

//                     {showMenu && (
//                         <div style={styles.dropdownMenu}>
//                             {menuOptions.map((opt) => (
//                                 <div key={opt.key} style={styles.dropdownItem} onClick={() => handleMenuClick(opt.key)}>
//                                     {opt.label}
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     <input
//                         type="text"
//                         value={input}
//                         placeholder="Type your message..."
//                         onChange={(e) => setInput(e.target.value)}
//                         onKeyDown={(e) => e.key === "Enter" && handleSend()}
//                         style={styles.input}
//                     />
//                     <button onClick={handleSend} style={styles.sendButton}>
//                         <Send size={18} />
//                     </button>
//                 </div>
//             </div>
//         </SideBar>
//     );
// }


