import { CircleUserRound, SunMoon, MailCheck } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bkg from "./bkg.jpg";
import bkg2 from "./bkg2.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { supabase } from "./supabase-client";
import { ThemeContext } from "./ThemeContext";

export default function Login() {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetStatus, setResetStatus] = useState("");

    // ✅ Auto redirect if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) navigate("/connecteddatabase");
        };

        checkSession();

        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) navigate("/connecteddatabase");
            }
        );

        return () => subscription.subscription.unsubscribe();
    }, [navigate]);

    // ✅ Handle login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const input = e.target.username.value.trim();
        const password = e.target.password.value;

        if (!input || !password) {
            setError("Please enter both username/email and password.");
            setLoading(false);
            return;
        }

        let email = input;

        try {
            if (!input.includes("@")) {
                const { data: user, error: fetchError } = await supabase
                    .from("Users")
                    .select("email")
                    .eq("username", input)
                    .single();

                if (fetchError || !user) {
                    setError("No account found with that username.");
                    setLoading(false);
                    return;
                }
                email = user.email;
            }

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes("Email not confirmed")) {
                    setError("Please verify your email before logging in.");
                } else if (authError.message.includes("Invalid login credentials")) {
                    setError("Invalid email/username or password.");
                } else {
                    setError(authError.message);
                }
                setLoading(false);
                return;
            }

            if (rememberMe) {
                localStorage.setItem("supabase_session", JSON.stringify(data.session));
            } else {
                sessionStorage.setItem("supabase_session", JSON.stringify(data.session));
            }

            navigate("/connecteddatabase");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again later.");
        }

        setLoading(false);
    };

    // ✅ Forgot Password (send reset link)
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError("");
        setResetStatus("");

        if (!resetEmail) {
            setError("Please enter your registered email.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/account-reset`,
        });

        if (error) {
            setError(error.message);
        } else {
            setResetStatus("✅ Password reset email sent! Check your inbox.");
            setShowReset(false);
            setResetEmail("");
            setTimeout(() => setResetStatus(""), 4000);
        }
    };

    // ✅ OAuth
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin + "/connecteddatabase" },
        });
        if (error) setError(error.message);
    };

    const handleGitHubLogin = async () => {
        // const { error } = await supabase.auth.signInWithOAuth({
        //     provider: "github",
        //     options: { redirectTo: window.location.origin + "/connecteddatabase" },
        // });
        // if (error) setError(error.message);
        alert("Its comming soon!!")
    };

    // 🎨 Styles
    const styles = {
        container: {
            minHeight: "100vh",
            minWidth: "100vw",
            backgroundImage: `url(${isDarkMode ? bkg : bkg2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Poppins, sans-serif",
            color: "white",
            gap: "20px",
            transition: "background 0.5s ease",
        },
        box: {
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "35px",
            padding: "40px",
            minWidth: "55vw",
            minHeight: "30vh",
            textAlign: "center",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        heading: {
            fontSize: "2rem",
            fontWeight: "700",
            color: isDarkMode ? "#d0d0d0" : "#000",
            marginBottom: "25px",
        },
        input: {
            minWidth: "70%",
            padding: "12px 15px",
            marginBottom: "15px",
            border: "2px solid transparent",
            borderRadius: "15px",
            outline: "none",
            fontSize: "0.95rem",
            color: "white",
            backgroundImage: isDarkMode
                ? "linear-gradient(90deg, #25257F, #1B1B37), linear-gradient(45deg, #003CFF, #E3DBE5)"
                : "linear-gradient(90deg, #DDE3FF, #F5F7FF), linear-gradient(45deg, #6A9CFF, #F5F3FA)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
        },
        options: {
            width: "70%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: isDarkMode ? "#cfcfcf" : "#000",
            margin: "0 auto 20px",
        },
        signupBtn: {
            minWidth: "30%",
            padding: "10px",
            borderRadius: "55px",
            border: "2.5px solid transparent",
            backgroundImage: isDarkMode
                ? "linear-gradient(90deg, #7FE7FF, #37376F), linear-gradient(92deg, #D9B8DF, #5E15D4)"
                : "linear-gradient(90deg, #aff2feff, #A3A3FF), linear-gradient(92deg, #e9b2efff, #a979fbff)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
        },
        link: {
            color: "#7FE7FF",
            cursor: "pointer",
            padding: "5px",
            textDecoration: "underline",
            marginLeft: "5px",
        },
        successText: {
            color: "#00e676",
            marginBottom: "10px",
            fontWeight: "500",
        },
        errorText: {
            color: "#ff6b6b",
            marginBottom: "10px",
            fontWeight: "500",
        },
        oauthBtn: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "15px",
            cursor: "pointer",
            fontWeight: "600",
            color: isDarkMode ? "#fff" : "#000",
        },
    };

    return (
        <div style={styles.container}>
            {/* Top Bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    gap: "20px",
                }}
            >
                <div style={{ cursor: "pointer" }} onClick={() => navigate("/signup")}>
                    <CircleUserRound />
                </div>
                <div style={{ cursor: "pointer" }} onClick={toggleTheme}>
                    <SunMoon size={28} strokeWidth={1.75} />
                </div>
            </div>

            <div style={styles.box}>
                <h1 style={styles.heading}>DEX</h1>
                {error && <p style={styles.errorText}>{error}</p>}
                {resetStatus && <p style={styles.successText}>{resetStatus}</p>}

                {/* Main Login Form */}
                {!showReset ? (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Email or Username"
                            style={styles.input}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            style={styles.input}
                            required
                        />

                        <div style={styles.options}>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="rememberMe">
                                    Remember me
                                </label>
                            </div>
                            <span style={styles.link} onClick={() => setShowReset(true)}>
                                Forgot password?
                            </span>
                        </div>

                        <button type="submit" style={styles.signupBtn}>
                            {loading ? "Loading..." : "LOGIN"}
                        </button>

                        <div
                            style={{
                                margin: "8px 0",
                                color: isDarkMode ? "#cfcfcf" : "#000",
                                fontWeight: "600",
                                fontSize: "1rem",
                            }}
                        >
                            — OR —
                        </div>
                    </form>
                ) : (
                    /* Forgot Password Form */
                    <form onSubmit={handlePasswordReset}>
                        <h3 style={{ marginBottom: "10px", color: isDarkMode ? "#ddd" : "#111" }}>
                            Reset your password
                        </h3>
                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <div>
                        <button type="submit" style={styles.signupBtn}>
                            <MailCheck /> Send Reset Link
                        </button>
                        </div>
                        <p style={styles.link} onClick={() => setShowReset(false)}>
                            ← Back to Login
                        </p>
                    </form>
                )}

                {/* OAuth Buttons */}
                {!showReset && (
                    <>
                        <div style={styles.oauthBtn} onClick={handleGoogleLogin}>
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                style={{ width: "20px" }}
                            />
                            <span>Continue with Google</span>
                        </div>

                        <div style={styles.oauthBtn} onClick={handleGitHubLogin}>
                            <img
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                alt="GitHub"
                                style={{ width: "20px", filter: "invert(1)" }}
                            />
                            <span>Continue with GitHub</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
