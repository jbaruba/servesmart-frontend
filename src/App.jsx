import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/algemeen/Sidebar";
import HeaderBar from "./components/algemeen/HeaderBar";

import Home from "./pages/admin/Home";
import Menu from "./pages/admin/Menu";
import Staff from "./pages/admin/Staff";
import Tables from "./pages/admin/Tables";
import Profit from "./pages/admin/Profit";
import AdminReservations from "./pages/admin/Reservations";
import OrderDetails from "./pages/admin/OrderDetails";

import StaffTables from "./pages/staff/Tables";
import StaffReservations from "./pages/staff/Reservations";
import StaffOrder from "./pages/staff/Order";
import StaffPayment from "./pages/staff/Payment";

import Login from "./pages/login";

import { useAuth } from "./context/AuthContext";
import "./styles/App.css";

function AdminLayout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <HeaderBar />
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="staff" element={<Staff />} />
          <Route path="tables" element={<Tables />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="profit" element={<Profit />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function StaffLayout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <HeaderBar />
        <Routes>
          <Route path="tables" element={<StaffTables />} />
          <Route path="reservations" element={<StaffReservations />} />
          <Route path="orders/:orderId" element={<StaffOrder />} />
          <Route path="payment/:orderId" element={<StaffPayment />} />
          <Route path="*" element={<Navigate to="tables" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function RequireRole({ role, children }) {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toUpperCase() ?? "";
  if (userRole !== role.toUpperCase()) {
    if (userRole === "ADMIN") {
      return <Navigate to="/admin/home" replace />;
    }
    if (userRole === "STAFF") {
      return <Navigate to="/staff/tables" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, initializing, user } = useAuth();

  if (initializing) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return children;
  }

  const role = user?.role?.toUpperCase();
  if (role === "ADMIN") {
    return <Navigate to="/admin/home" replace />;
  }
  if (role === "STAFF") {
    return <Navigate to="/staff/tables" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, user, initializing } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <RequireRole role="ADMIN">
              <AdminLayout />
            </RequireRole>
          }
        />

        {/* Staff routes */}
        <Route
          path="/staff/*"
          element={
            <RequireRole role="STAFF">
              <StaffLayout />
            </RequireRole>
          }
        />

        {/* Root redirect afhankelijk van rol */}
        <Route
          path="/"
          element={
            initializing ? (
              <div>Loading...</div>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : user?.role?.toUpperCase() === "ADMIN" ? (
              <Navigate to="/admin/home" replace />
            ) : user?.role?.toUpperCase() === "STAFF" ? (
              <Navigate to="/staff/tables" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
