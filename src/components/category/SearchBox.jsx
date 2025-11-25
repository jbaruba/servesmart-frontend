import { Search } from "lucide-react";

export default function SearchBox({ value, onChange }) {
  return (
    <div className="input-group" style={{ maxWidth: 320 }}>
      <input
        className="form-control"
        placeholder="Search..."
        value={value}
        onChange={(searchinput) => onChange(searchinput.target.value)}
      />
      <span className="input-group-text bg-light">
        <Search size={18} className="text-secondary" />
      </span>
    </div>
  );
}
