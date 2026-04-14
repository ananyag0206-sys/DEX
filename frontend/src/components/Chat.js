import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Send,
    Plus,
    Copy,
    MessageSquare,
    Settings,
    Check,
    Square,
} from "lucide-react";
import axios from "axios";
import SideBar from "./SideBar";
import { ThemeContext } from "./ThemeContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Chat() {
    const { isDarkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "👋 Hello! I’m DEX Chat. How can I assist you today?" },
    ]);
    const [input, setInput] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const typingCancelRef = useRef({ cancelled: false });
    const chatApiUrl = `${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/chat`;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Typing animation
    const simulateTypingCharByChar = (fullText) => {
        typingCancelRef.current.cancelled = true;
        typingCancelRef.current = { cancelled: false };
        setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: "" }]);
        setIsThinking(false);
        setIsGenerating(true);
        let i = 0;
        let current = "";
        const addChar = () => {
            if (typingCancelRef.current.cancelled) {
                setIsGenerating(false);
                return;
            }
            if (i < fullText.length) {
                current += fullText[i];
                i++;
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { sender: "bot", text: current };
                    return updated;
                });
                setTimeout(addChar, 10);
            } else {
                setIsGenerating(false);
            }
        };
        addChar();
    };

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;
        typingCancelRef.current.cancelled = true;
        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsThinking(true);
        setMessages((prev) => [...prev, { sender: "bot", text: "..." }]);

        try {
            const res = await axios.post(chatApiUrl, { message: input });
            simulateTypingCharByChar(res.data.reply || "🤖 Sorry, I didn’t understand that.");
        } catch (err) {
            console.error(err);
            setIsThinking(false);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { sender: "bot", text: "⚠️ Connection failed." },
            ]);
        }
    };

    const handleStop = () => {
        typingCancelRef.current.cancelled = true;
        setIsGenerating(false);
        setIsThinking(false);
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleNewChat = () => {
        typingCancelRef.current.cancelled = true;
        setIsGenerating(false);
        setMessages([{ sender: "bot", text: "🆕 New chat started! How can I help?" }]);
        setShowMenu(false);
    };

    const styles = {
        mainContainer: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: isDarkMode ? "#0a0f2c" : "#f4f6fb",
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
            background: isDarkMode ? "#0d122e" : "#ffffff",
            borderRadius: "16px 16px 0 0",
        },
        message: {
            maxWidth: "80%",
            padding: "12px 16px",
            borderRadius: "18px",
            fontSize: "15px",
            lineHeight: "1.5",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
        },
    };

    return (
        <SideBar isMobile={isMobile} handleNavigate={navigate}>
            <style>{`
                @keyframes blink {
                    0% { opacity: 0.2; transform: translateY(0); }
                    20% { opacity: 1; transform: translateY(-2px); }
                    100% { opacity: 0.2; transform: translateY(0); }
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 10px;
                }
                th, td {
                    border: 1px solid ${isDarkMode ? "#334155" : "#cbd5e1"};
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background: ${isDarkMode ? "#1e293b" : "#e0f2ff"};
                    color: ${isDarkMode ? "#fff" : "#000"};
                }
                pre {
                    background: ${isDarkMode ? "#1e293b" : "#f3f4f6"};
                    border-radius: 8px;
                    overflow-x: auto;
                    padding: 10px;
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                }
            `}</style>

            <div style={styles.mainContainer}>
                <div style={styles.chatWindow}>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                justifyContent:
                                    msg.sender === "user" ? "flex-end" : "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    ...styles.message,
                                    background:
                                        msg.sender === "user"
                                            ? "linear-gradient(90deg, #2575fc, #6a11cb)"
                                            : isDarkMode
                                            ? "#1b213e"
                                            : "#e8f0fe",
                                    color:
                                        msg.sender === "user"
                                            ? "#fff"
                                            : isDarkMode
                                            ? "#fff"
                                            : "#000",
                                }}
                            >
                                {msg.text === "..." && isThinking ? (
                                    <div>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "6px",
                                                height: "6px",
                                                margin: "0 4px",
                                                borderRadius: "50%",
                                                backgroundColor: "#60a5fa",
                                                animation: "blink 1.2s infinite both",
                                            }}
                                        />
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "6px",
                                                height: "6px",
                                                margin: "0 4px",
                                                borderRadius: "50%",
                                                backgroundColor: "#60a5fa",
                                                animation: "blink 1.2s infinite both",
                                                animationDelay: "0.2s",
                                            }}
                                        />
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "6px",
                                                height: "6px",
                                                margin: "0 4px",
                                                borderRadius: "50%",
                                                backgroundColor: "#60a5fa",
                                                animation: "blink 1.2s infinite both",
                                                animationDelay: "0.4s",
                                            }}
                                        />
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                opacity: 0.7,
                                                marginTop: "5px",
                                            }}
                                        >
                                            💭 Thinking...
                                        </div>
                                    </div>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(
                                                    className || ""
                                                );
                                                const codeString = String(children).replace(
                                                    /\n$/,
                                                    ""
                                                );
                                                return !inline && match ? (
                                                    <div style={{ position: "relative" }}>
                                                        <SyntaxHighlighter
                                                            language={match[1]}
                                                            style={
                                                                isDarkMode ? oneDark : oneLight
                                                            }
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {codeString}
                                                        </SyntaxHighlighter>
                                                        <button
                                                            onClick={() =>
                                                                handleCopy(codeString)
                                                            }
                                                            style={{
                                                                position: "absolute",
                                                                top: "6px",
                                                                right: "6px",
                                                                background:
                                                                    "rgba(0,0,0,0.6)",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                padding: "4px 8px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            {copiedCode === codeString ? (
                                                                <Check size={14} />
                                                            ) : (
                                                                <Copy size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <code
                                                        style={{
                                                            background: "rgba(0,0,0,0.1)",
                                                            padding: "3px 6px",
                                                            borderRadius: "4px",
                                                            fontSize: "90%",
                                                        }}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: isDarkMode ? "#0f1535" : "#eef3ff",
                        borderRadius: "30px",
                        margin: "10px 20px 20px 20px",
                        padding: "8px 50px",
                        boxShadow: "0 0 15px rgba(37,117,252,0.3)",
                        position: "relative",
                    }}
                >
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            position: "absolute",
                            left: "10px",
                            background: "linear-gradient(90deg, #002852ff, #000219ff)",
                            borderRadius: "50%",
                            color: "#fff",
                            width: "34px",
                            height: "34px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <Plus size={18} />
                    </button>

                    {showMenu && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "70px",
                                left: "15px",
                                background: isDarkMode ? "#0f1535" : "#eaf0ff",
                                borderRadius: "12px",
                                color: isDarkMode ? "#fff" : "#000",
                                boxShadow: "0 0 12px rgba(0,0,0,0.3)",
                                padding: "8px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                            }}
                        >
                            <button onClick={handleNewChat}>
                                <MessageSquare size={16} /> New Chat
                            </button>
                            <button>
                                <Settings size={16} /> Settings
                            </button>
                        </div>
                    )}

                    <input
                        type="text"
                        value={input}
                        placeholder="Type your message..."
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            padding: "12px 40px",
                            borderRadius: "30px",
                            fontSize: "15px",
                            color: isDarkMode ? "#fff" : "#000",
                            background: "transparent",
                        }}
                    />

                    {isGenerating ? (
                        <button
                            onClick={handleStop}
                            style={{
                                position: "absolute",
                                right: "10px",
                                background: "linear-gradient(90deg, #ff5858, #f09819)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "36px",
                                height: "36px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Square size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            style={{
                                position: "absolute",
                                right: "10px",
                                background: "linear-gradient(90deg, #002852ff, #000219ff)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "36px",
                                height: "36px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Send size={18} />
                        </button>
                    )}
                </div>
            </div>
        </SideBar>
    );
}
