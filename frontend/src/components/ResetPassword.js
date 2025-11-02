import React, { useState } from "react";
import { supabase } from "./supabase-client";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState("request"); // "request" → "update"
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Step 1: Send reset email
    const handlePasswordReset = async () => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`, // ✅ Auto-detects http://localhost:3000
        });

        if (error) setMessage(error.message);
        else {
            setMessage("Check your email for the reset link.");
            setStep("update");
        }
    };

    // Step 2: Update password after redirect
    const handleUpdatePassword = async () => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) setMessage(error.message);
        else {
            setMessage("Password updated successfully!");
            setTimeout(() => navigate("/login"), 2000);
        }
    };

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "auto",
                marginTop: "10%",
                background: "#191C28",
                padding: "24px",
                borderRadius: "12px",
                color: "#fff",
                textAlign: "center",
            }}
        >
            <h2>Password Reset</h2>

            {step === "request" && (
                <>
                    <p>Enter your email to receive a password reset link:</p>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            margin: "10px 0",
                            borderRadius: "6px",
                            border: "1px solid #555",
                            background: "#10131E",
                            color: "#fff",
                        }}
                    />
                    <button
                        onClick={handlePasswordReset}
                        style={{
                            background: "#48a2ff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "#fff",
                        }}
                    >
                        Send Reset Link
                    </button>
                </>
            )}

            {step === "update" && (
                <>
                    <p>Enter your new password below:</p>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            margin: "10px 0",
                            borderRadius: "6px",
                            border: "1px solid #555",
                            background: "#10131E",
                            color: "#fff",
                        }}
                    />
                    <button
                        onClick={handleUpdatePassword}
                        style={{
                            background: "#48a2ff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "#fff",
                        }}
                    >
                        Update Password
                    </button>
                </>
            )}

            {message && <p style={{ marginTop: "12px" }}>{message}</p>}
        </div>
    );
}
