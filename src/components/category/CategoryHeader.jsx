import { ChevronDown, ChevronRight, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import "../../styles/App.css";
export default function CategoryHeader({
  cat,
  isOpen,
  onToggleExpand,
  onAddItemClick,
  onStartEdit,
  onDeleteCategory,
}) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setIsActive(Boolean(cat?.active ?? true));
  }, [cat]);

  return (
    <div className="category-header d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <button
          className="expand-btn"
          title={isOpen ? "Collapse" : "Expand"}
          onClick={onToggleExpand}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <div className="category-name">
          {cat.name}
          {typeof cat.position === "number" && (
            <span className="text-muted ms-2">#{cat.position}</span>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button className="action-btn add" title="Add Menu Item" onClick={onAddItemClick}>
          <PlusCircle size={18} />
        </button>

        <button className="action-btn edit" title="Edit Category" onClick={onStartEdit}>
          <Edit3 size={18} />
        </button>

        <button className="action-btn delete" title="Delete Category" onClick={onDeleteCategory}>
          <Trash2 size={18} />
        </button>

        <div
          className={`toggle-switch ${isActive ? "on" : "off"}`}
          onClick={() => setIsActive(!isActive)}
          role="button"
        >
          <div className="toggle-circle"></div>
          <span className="toggle-text">{isActive ? "ON" : "OFF"}</span>
        </div>
      </div>
    </div>
  );
}
