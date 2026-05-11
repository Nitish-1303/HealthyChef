import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./components/Dashboard";
import InventoryPage from "./components/InventoryPage";
import InvoiceCreator from "./components/InvoiceCreator";
import InvoiceDetailView from "./components/InvoiceDetailView";
import LandingPage from "./components/LandingPage";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/invoices/new" element={<InvoiceCreator />} />
          <Route path="/invoices/:id" element={<InvoiceDetailView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

