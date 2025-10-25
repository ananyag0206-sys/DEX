import { CircleUserRound, Cog, SunMoon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bkg from "./bkg.jpg";
import bkg2 from "./bkg2.png"; // Light theme background
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

function Login() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode by default

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        if (username === "admin" && password === "1234") {
            navigate("/connecteddatabase");
        } else {
            alert("Invalid Username/Password");
        }
    };

    const handleGoogleLogin = () => {
        alert("Google Login Clicked!");
    };

    const ForgotPassword = () => {
        alert("Forgot Password Clicked!");
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

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
        iconGroup: { display: "flex", alignItems: "center", gap: "30px" },
        circleIcon: {
            minWidth: "2vw",
            minHeight: "4vh",
            borderRadius: "50%",
            background: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
        },
        navbtn: { background: "none", border: "none", cursor: "pointer" },
        boxx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "10px 20px",
            minWidth: "10vw",
            borderRadius: "35px",
            border: "2px solid transparent",
            backgroundImage:
                "linear-gradient(#25257F, #1B1B37), linear-gradient(45deg, #D9B8DF, #5E15D4)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            color: "white",
            fontWeight: "bold",
            position: "fixed",
            top: "20px",
            right: "20px",
        },
        forgotbtn: {
            background: "none",
            border: "none",
            padding: "0",
            color: isDarkMode ? "#cfcfcf" : "#000000",
            cursor: "pointer",
            fontSize: "1rem",
        },
        box: {
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "35px",
            padding: "40px",
            minWidth: "50vw",
            minHeight: "30vh",
            textAlign: "center",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        heading: { fontSize: "2rem", fontWeight: "700", color: isDarkMode ? "#d0d0d0" : "#000000ff", marginBottom: "25px" },
        subtitle: { fontSize: "1.1rem", color: isDarkMode ? "#d0d0d0" : "#000000ff", marginBottom: "25px" },
        input: {
            minWidth: "70%",
            padding: "12px 15px",
            marginBottom: "15px",
            border: "2px solid transparent",
            borderRadius: "15px",
            outline: "none",
            fontSize: "0.95rem",
            color: "white",
            backgroundImage:
                isDarkMode ? "linear-gradient(90deg, #25257F, #1B1B37), linear-gradient(45deg, #003CFF, #E3DBE5)" : "linear-gradient(90deg, #DDE3FF, #F5F7FF), linear-gradient(45deg, #6A9CFF, #F5F3FA)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
        },
        options: {
            width: "70%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: isDarkMode ? "#cfcfcf" : "#000000",
            margin: "0 auto 20px",
        },
        signupBtn: {
            minWidth: "30%",
            padding: "10px",
            borderRadius: "55px",
            border: "2.5px solid transparent",
            backgroundImage:
                isDarkMode ? "linear-gradient(90deg, #7FE7FF, #37376F), linear-gradient(92deg, #D9B8DF, #5E15D4)" : "linear-gradient(90deg, #aff2feff, #A3A3FF), linear-gradient(92deg, #e9b2efff, #a979fbff)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            position: "relative",
        },
        googleBtn: {
            marginTop: "15px",
            color: isDarkMode ? "#fff" : "#000",
            borderRadius: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            gap: "10px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "0.3s",
        },
        googleIcon: { width: "20px" },
    };

    return (
        <div style={styles.container}>
            {/* Top Icon Bar */}
            <div style={styles.boxx}>
                <div style={styles.iconGroup}>
                    <div style={styles.circleIcon}>
                        <button style={styles.navbtn}><Cog /></button>
                    </div>
                    <div style={styles.circleIcon}>
                        <button style={styles.navbtn}><CircleUserRound /></button>
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
                {/* <p style={styles.subtitle}>Secure Access</p> */}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Email / Username"
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
                            />
                            <label
                                className="form-check-label"
                                htmlFor="flexSwitchCheckDefault"
                            >
                                Remember me
                            </label>
                        </div>

                        <button type="button" onClick={ForgotPassword} style={styles.forgotbtn}>
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" style={styles.signupBtn}>
                        LOGIN
                    </button>
                </form>

                <div style={styles.googleBtn} onClick={handleGoogleLogin}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={styles.googleIcon}
                    />
                    <span>Continue with Google</span>
                </div>
            </div>
        </div>
    );
}

export default Login;
