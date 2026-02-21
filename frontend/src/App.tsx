// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientsPage from "./pages/Patients";
import NotesPage from "./pages/Notes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default route -> HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* login & register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* patients page */}
        <Route path="/patients" element={<PatientsPage />} />
        {/* clinical notes page */}
        <Route path="/notes" element={<NotesPage />} />

        {/* example: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
