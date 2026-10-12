import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./components/Dashboard";
import InventoryPage from "./components/InventoryPage";
import InvoiceCreator from "./components/InvoiceCreator";
import InvoiceDetailView from "./components/InvoiceDetailView";
import LandingPage from "./components/LandingPage";
import ScrollToTop from "./components/ScrollToTop";
import LoginPage from "./components/LoginPage";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./components/AuthContext";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/inventory" element={<RequireAuth><InventoryPage /></RequireAuth>} />
            <Route path="/invoices/new" element={<RequireAuth><InvoiceCreator /></RequireAuth>} />
            <Route path="/invoices/:id" element={<RequireAuth><InvoiceDetailView /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

