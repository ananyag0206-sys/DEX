// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import ConnectedDatabase from "./components/ConnectedDatabase";
import AI from "./components/AI";
import Chat from "./components/Chat";
import AccountSettings from "./components/AccountSettings";
import SideBar from "./components/SideBar";
import Signup from "./components/Signup";
import { ThemeProvider } from "./components/ThemeContext";
import QueryEditor from "./components/QueryEditor";
import AccountResetPage from "./components/AccountResetPage"; // ✅ Added back

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main app pages */}
          <Route path="/connecteddatabase" element={<ConnectedDatabase />} />
          <Route path="/AIinsights" element={<AI />} />
          <Route path="/NewChat" element={<Chat />} />
          <Route path="/queryeditor" element={<QueryEditor />} />

          {/* Account Settings & Password Reset */}
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/account-reset" element={<AccountResetPage />} /> {/* ✅ Password reset page */}

          {/* Sidebar */}
          <Route path="/sidebar" element={<SideBar />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
