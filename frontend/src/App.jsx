import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MedicinePage from "./pages/MedicinePage";
import NotFoundPage from "./pages/NotFoundPage";
import PharmacyPage from "./pages/PharmacyPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ReservationsPage from "./pages/ReservationsPage";

export default function App() {
  return (
    <AuthProvider><div className="min-h-screen bg-stone-50 text-slate-900"><Navbar /><main><Routes><Route path="/" element={<HomePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/medicines/:id" element={<MedicinePage />} /><Route path="/pharmacies/:id" element={<PharmacyPage />} /><Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /><Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} /><Route path="*" element={<NotFoundPage />} /></Routes></main></div></AuthProvider>
  );
}
