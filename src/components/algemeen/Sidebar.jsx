import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const role = user?.role?.toUpperCase() ?? "UNKNOWN";

  const Item = ({ to, label }) => (
    <Link
      to={to}
      className={`btn w-100 text-start my-2 ${
        pathname === to ? "btn-dark" : "btn-outline-dark"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="p-3 border-end vh-100" style={{ width: 220 }}>
      <div className="fw-bold mb-3">ServeSmart</div>

      {/* ALWAYS visible */}
      <Item to="/home" label="Home" />

      {/* ADMIN MENU */}
      {role === "ADMIN" && (
        <>
          <Item to="/menu" label="Menu" />
          <Item to="/staff" label="Staff" />
          <Item to="/tables" label="Table overview" />
          <Item to="/profit" label="Profit overview" />
        </>
      )}

      {/* STAFF MENU */}
      {role === "STAFF" && (
        <>
          <Item to="/tables" label="Table overview" />
          <Item to="/menu" label="Menu (view only)" />
        </>
      )}
    </div>
  );
}
