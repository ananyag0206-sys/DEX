// App.js
// import Dashboard from "./Dashboard";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/login';
import ConnectedDatabase from "./components/ConnectedDatabase";
import AI from "./components/AI";
import Chat from "./components/Chat";
import AccountSettings from './components/AccountSettings';
import SideBar from "./components/SideBar";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="/connecteddatabase" element={<ConnectedDatabase />} />
        <Route path="/AIinsights" element={<AI />} />
        <Route path="/NewChat" element={<Chat />} />
        <Route path="/AccountSettings" element={<AccountSettings />} />
        <Route path="/sidebar" element={<SideBar />} />

      </Routes>
    </Router>
  );
}

export default App;





