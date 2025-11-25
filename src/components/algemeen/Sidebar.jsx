import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const role = user?.role?.toUpperCase() ?? "ADMIN";

  // Basis pad en menu-items op basis van rol
  let basePath = "/admin";
  let items = [
    { to: "/home", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/staff", label: "Staff" },
    { to: "/tables", label: "Table overview" },
    { to: "/reservations", label: "Reservations" },
    { to: "/profit", label: "Profit overview" },
  ];

  if (role === "STAFF") {
    basePath = "/staff";
    items = [
      { to: "/tables", label: "Table overview" },
      { to: "/reservations", label: "Reservations" },
      // Order/Payment pagina's komen via flow (bijv. knop op tabel),
      // niet direct in de sidebar.
    ];
  }

  const Item = ({ to, label }) => {
    const fullPath = `${basePath}${to}`;
    const isActive = pathname === fullPath;

    return (
      <Link
        to={fullPath}
        className={`btn w-100 text-start my-2 ${
          isActive ? "btn-dark" : "btn-outline-dark"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="p-3 border-end vh-100" style={{ width: 220 }}>
      <div className="fw-bold mb-3">ServeSmart</div>
      {items.map((item) => (
        <Item key={item.to} to={item.to} label={item.label} />
      ))}
    </div>
  );
}
