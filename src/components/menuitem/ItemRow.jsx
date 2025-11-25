import { Edit3, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import "../../styles/App.css";

export default function ItemRow({
  item,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  editName,
  setEditName,
  editPrice,
  setEditPrice,
  editDesc,
  setEditDesc,
}) {

  const [isActive, setIsActive] = useState(true);
  const [gluten, setGluten] = useState(false);
  const [nuts, setNuts] = useState(false);
  const [dairy, setDairy] = useState(false);
  const [alcohol, setAlcohol] = useState(false);

  useEffect(() => {

    setIsActive(item?.active ?? true);
    setGluten(item?.gluten ?? false);
    setNuts(item?.nuts ?? false);
    setDairy(item?.dairy ?? false);
    setAlcohol(item?.alcohol ?? false);
  }, [item, isEditing]);

  function SmallToggle({ label, on, onToggle }) {
    return (
      <div className="mini-toggle-wrapper">
        <span className="mini-toggle-label">{label}</span>
        <div
          className={`mini-toggle ${on ? "on" : "off"}`}
          onClick={onToggle}
          role="button"
        >
          <div className="mini-toggle-circle" />
        </div>
      </div>
    );
  }


  if (isEditing) {
    return (
      <li className="list-group-item bg-light rounded-3 shadow-sm my-2">
        <div className="d-flex flex-column gap-3">
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control"
              style={{ maxWidth: 240 }}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Item name"
            />
            <input
              className="form-control"
              style={{ maxWidth: 140 }}
              type="number"
              min="0"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="€"
            />
          </div>

          <textarea
            className="form-control"
            rows={2}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description..."
          />

          <div className="d-flex flex-wrap gap-3 align-items-center">
            <SmallToggle
              label="Available"
              on={isActive}
              onToggle={() => setIsActive((v) => !v)}
            />
            <SmallToggle
              label="Gluten"
              on={gluten}
              onToggle={() => setGluten((v) => !v)}
            />
            <SmallToggle
              label="Nuts"
              on={nuts}
              onToggle={() => setNuts((v) => !v)}
            />
            <SmallToggle
              label="Dairy"
              on={dairy}
              onToggle={() => setDairy((v) => !v)}
            />
            <SmallToggle
              label="18+"
              on={alcohol}
              onToggle={() => setAlcohol((v) => !v)}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-success"
              onClick={() => {
              
                onSave({
                  ...item,
                  name: editName,
                  price: editPrice,
                  description: editDesc,
                  active: isActive,
                  gluten,
                  nuts,
                  dairy,
                  alcohol,
                });
              }}
            >
              Save
            </button>

            <button className="btn btn-outline-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  // READ MODE
  return (
    <li className="list-group-item bg-white rounded-3 shadow-sm my-2">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <div className="fw-medium d-flex align-items-center gap-2 flex-wrap">
            <span>{item.name}</span>

            <div className="d-flex align-items-center gap-1 flex-wrap item-flags">
              {(item.active ?? true) && (
                <span className="flag-chip available-chip">LIVE</span>
              )}
              {item.gluten && (
                <span className="flag-chip gluten-chip">🌾 gluten</span>
              )}
              {item.nuts && (
                <span className="flag-chip nuts-chip">🥜 nuts</span>
              )}
              {item.dairy && (
                <span className="flag-chip dairy-chip">🥛 dairy</span>
              )}
              {item.alcohol && (
                <span className="flag-chip adult-chip">🔞 18+</span>
              )}
            </div>
          </div>

          {item.description && (
            <small className="text-muted d-block">{item.description}</small>
          )}
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="fw-semibold">
            € {Number(item.price ?? 0).toFixed(2)}
          </div>

          <button
            className="action-btn edit"
            title="Edit Item"
            onClick={() => onStartEdit(item)}
          >
            <Edit3 size={16} />
          </button>

          <button
            className="action-btn delete"
            title="Delete Item"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
