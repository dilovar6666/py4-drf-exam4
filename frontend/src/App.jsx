import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import StaffRoute from "./components/StaffRoute";
import PageState from "./components/ui/PageState";
import AuthProvider from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const MedicinePage = lazy(() => import("./pages/MedicinePage"));
const PharmacyPage = lazy(() => import("./pages/PharmacyPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ReservationsPage = lazy(() => import("./pages/ReservationsPage"));
const ChatsPage = lazy(() => import("./pages/ChatsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const PharmacistPage = lazy(() => import("./pages/PharmacistPage"));
const PharmacyApplicationsPage = lazy(() => import("./pages/PharmacyApplicationsPage"));
const PharmacistWorkspacePage = lazy(() => import("./pages/PharmacistWorkspacePage"));
const MedicineAiAssistant = lazy(() => import("./components/MedicineAiAssistant"));

const protectedPage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return <AuthProvider><NotificationProvider><div className="min-h-screen bg-[#f7f9f8] text-slate-900"><Navbar /><main><Suspense fallback={<PageState type="loading" />}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/leaderboard" element={<LeaderboardPage />} />
    <Route path="/pharmacists/:id" element={<PharmacistPage />} />
    <Route path="/medicines/:id" element={<><MedicinePage /><MedicineAiAssistant /></>} />
    <Route path="/pharmacies/:id" element={<PharmacyPage />} />
    <Route path="/profile" element={protectedPage(<ProfilePage />)} />
    <Route path="/pharmacy-applications" element={protectedPage(<PharmacyApplicationsPage />)} />
    <Route path="/pharmacist-workspace" element={protectedPage(<PharmacistWorkspacePage />)} />
    <Route path="/reservations" element={protectedPage(<ReservationsPage />)} />
    <Route path="/chats" element={protectedPage(<ChatsPage />)} />
    <Route path="/messages/:chatId" element={protectedPage(<ChatsPage />)} />
    <Route path="/notifications" element={protectedPage(<NotificationsPage />)} />
    <Route path="/admin-panel" element={<StaffRoute><AdminPanelPage /></StaffRoute>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense></main><Footer /><MobileNav /></div></NotificationProvider></AuthProvider>;
}
