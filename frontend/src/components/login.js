// Login.js
import { CircleUserRound, Cog, SunMoon } from "lucide-react";
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

    // ✅ Handle login by email or username
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
            // If user entered a username instead of an email, fetch email from Users table
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

            // Sign in user with Supabase Auth
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

            // ✅ Manage session storage
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

    // ✅ Google OAuth
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin + "/connecteddatabase" },
        });
        if (error) setError(error.message);
    };

    // ✅ GitHub OAuth
    const handleGitHubLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: { redirectTo: window.location.origin + "/connecteddatabase" },
        });
        if (error) setError(error.message);
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
        oauthBtn: {
            color: isDarkMode ? "#fff" : "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "9px",
            gap: "9px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "0.3s",
        },
        googleIcon: { width: "20px" },
        boxx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "10px 20px",
            minWidth: "10vw",
            borderRadius: "35px",
            border: "2px solid transparent",
            backgroundImage: isDarkMode
                ? "linear-gradient(#25257F, #1B1B37), linear-gradient(45deg, #D9B8DF, #5E15D4)"
                : "linear-gradient(45deg, #ccd6fcff, #F5F7FF), linear-gradient(45deg, #6A9CFF, #F5F3FA)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            color: isDarkMode ? "#fff" : "#000",
            fontWeight: "bold",
            position: "fixed",
            top: "20px",
            right: "20px",
        },
        navbtn: {
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isDarkMode ? "#000" : "#000",
        },
        circleIcon: {
            minWidth: "2vw",
            minHeight: "4vh",
            borderRadius: "50%",
            background: isDarkMode ? "#ffffff" : "#ffffffff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        iconGroup: {
            display: "flex",
            alignItems: "center",
            gap: "30px",
            color: isDarkMode ? "#fff" : "#000",
        },
        errorText: {
            color: "#ff6b6b",
            marginBottom: "10px",
            fontWeight: "500",
        },
    };

    return (
        <div style={styles.container}>
            {/* Top bar */}
            <div style={styles.boxx}>
                <div style={styles.iconGroup}>
                    <div style={styles.circleIcon}>
                        <button style={styles.navbtn}><Cog /></button>
                    </div>
                    <div style={styles.circleIcon}>
                        <button style={styles.navbtn} onClick={() => navigate("/signup")}>
                            <CircleUserRound />
                        </button>
                    </div>
                    <div style={styles.circleIcon}>
                        <button style={styles.navbtn} onClick={toggleTheme}>
                            <SunMoon size={28} strokeWidth={1.75} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Login Box */}
            <div style={styles.box}>
                <h1 style={styles.heading}>DEX</h1>
                {error && <p style={styles.errorText}>{error}</p>}

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
                                id="flexSwitchCheckDefault"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="flexSwitchCheckDefault"
                            >
                                Remember me
                            </label>
                        </div>
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
                            textAlign: "center",
                        }}
                    >
                        — OR —
                    </div>
                </form>

                {/* OAuth Buttons */}
                <div style={styles.oauthBtn} onClick={handleGoogleLogin}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={styles.googleIcon}
                    />
                    <span>Continue with Google</span>
                </div>

                <div style={styles.oauthBtn} onClick={handleGitHubLogin}>
                    <img
                        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        alt="GitHub"
                        style={{ ...styles.googleIcon, filter: "invert(1)" }}
                    />
                    <span>Continue with GitHub</span>
                </div>
            </div>
        </div>
    );
}
