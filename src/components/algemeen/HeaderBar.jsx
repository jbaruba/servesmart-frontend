import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function HeaderBar() {
  const { user, logout } = useAuth();

  const displayName =
    user && (user.firstName || user.lastName)
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.email ?? "Onbekende gebruiker";

  const roleLabel = user?.role ?? "Onbekende rol";

  return (
    <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
      <div>
        <div className="fs-4">Name: {displayName}</div>
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          Role: {roleLabel}
        </div>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary">🔔 Notification</button>
        <button className="btn btn-outline-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
