import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/HeaderBar";
import CategoryPage from "./pages/CategoryPage";
import "./styles/App.css";

function Placeholder({ title }) {
  return <div className="p-3">{title}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <HeaderBar />
          <Routes>
            <Route path="/" element={<Placeholder title="Home" />} />
            <Route path="/menu" element={<CategoryPage />} />
            <Route path="/staff" element={<Placeholder title="Medewerkerbeheer" />} />
            <Route path="/tables" element={<Placeholder title="Table overview" />} />
            <Route path="/profit" element={<Placeholder title="Profit overview" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
