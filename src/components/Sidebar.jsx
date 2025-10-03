import { Link, useLocation } from "react-router-dom";

export default function Sidebar(){
  const { pathname } = useLocation();
  const Item = ({ to, label }) => (
    <Link
      to={to}
      className={`btn w-100 text-start my-2 ${pathname===to ? 'btn-dark' : 'btn-outline-dark'}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="p-3 border-end" style={{ width: 220, minHeight: '100vh' }}>
      <div className="fw-bold mb-3">ServeSmart</div>
      <Item to="/" label="Home" />
      <Item to="/menu" label="Menu" />
      <Item to="/staff" label="Medewerker" />
      <Item to="/tables" label="Table overview" />
      <Item to="/profit" label="Profit overview" />
    </div>
  );
}
