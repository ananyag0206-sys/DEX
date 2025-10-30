import { CircleUserRound, Cog, SunMoon } from "lucide-react";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bkg from "./bkg.jpg";
import bkg2 from "./bkg2.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { supabase } from "./supabase-client";
import { ThemeContext } from "./ThemeContext";

export default function Signup() {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const username = e.target.username.value.trim();
        const email = e.target.email.value.trim();
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        // ✅ Validation
        if (!username || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            // ✅ Check if username already exists
            const { data: existingUser, error: usernameCheckError } = await supabase
                .from("Users")
                .select("username")
                .eq("username", username)
                .maybeSingle();

            if (usernameCheckError) {
                console.error("Error checking username:", usernameCheckError);
                throw usernameCheckError;
            }

            if (existingUser) {
                setError("Username already taken. Please choose another one.");
                setLoading(false);
                return;
            }

            // ✅ Create Supabase Auth user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                    emailRedirectTo: window.location.origin,
                },
            });

            if (signUpError) {
                console.error("Signup error:", signUpError.message);
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            // ✅ Insert into Users table
            if (data?.user) {
                const { error: insertError } = await supabase.from("Users").insert([
                    {
                        user_id: data.user.id,
                        username,
                        email,
                        name: username || null, // ✅ prevent null violation
                    },
                ]);

                if (insertError) {
                    console.error("Insert error:", insertError.message);
                    setError("Signup successful, but failed to save user info.");
                } else {
                    alert("Signup successful! Check your email for verification before logging in.");
                    navigate("/");
                }
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
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
            width: "55%",
            minWidth: "40vw",
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
        navbtn: { background: "none", border: "none", cursor: "pointer", color: "#000" },
        circleIcon: {
            minWidth: "2vw",
            minHeight: "4vh",
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        iconGroup: { display: "flex", alignItems: "center", gap: "30px", color: isDarkMode ? "#fff" : "#000" },
        errorText: { color: "#ff6b6b", marginBottom: "10px", fontWeight: "500" },
    };

    return (
        <div style={styles.container}>
            {/* Top Icon Bar */}
            <div style={styles.boxx}>
                <div style={styles.iconGroup}>
                    <div style={styles.circleIcon}><button style={styles.navbtn}><Cog /></button></div>
                    <div style={styles.circleIcon}><button style={styles.navbtn} onClick={() => navigate("/")}><CircleUserRound /></button></div>
                    <div style={styles.circleIcon}><button style={styles.navbtn} onClick={toggleTheme}><SunMoon size={28} strokeWidth={1.75} /></button></div>
                </div>
            </div>

            {/* Signup Box */}
            <div style={styles.box}>
                <h1 style={styles.heading}>DEX</h1>
                {error && <p style={styles.errorText}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" style={styles.input} required />
                    <input type="email" name="email" placeholder="Email" style={styles.input} required />
                    <input type="password" name="password" placeholder="Password" style={styles.input} required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" style={styles.input} required />

                    <div style={styles.options}>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Remember me</label>
                        </div>
                    </div>

                    <button type="submit" style={styles.signupBtn}>
                        {loading ? "Loading..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}
