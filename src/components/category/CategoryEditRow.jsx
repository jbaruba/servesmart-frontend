
export default function CategoryEditRow({
  editingName,
  setEditingName,
  editingPosition,
  setEditingPosition,
  onSaveEdit,
  onCancelEdit,
}) {
  return (
    <div className="d-flex gap-2 align-items-center w-100">
      <input
        className="form-control"
        placeholder="Category name"
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
      />

      <input
        className="form-control"
        style={{ maxWidth: 110 }}
        type="number"
        placeholder="Position"
        value={editingPosition}
        onChange={(e) => setEditingPosition(e.target.value)}
      />

      <button className="btn btn-success" onClick={onSaveEdit}>
        Save
      </button>
      <button className="btn btn-outline-secondary" onClick={onCancelEdit}>
        Cancel
      </button>
    </div>
  );
}
