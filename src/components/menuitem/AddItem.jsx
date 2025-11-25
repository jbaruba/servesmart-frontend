export default function AddItem({
  name,
  setName,
  price,
  setPrice,
  desc,
  setDesc,
  onSave,
  onCancel,
}) {
  return (
    <div className="mt-2 d-flex flex-column gap-2">
      <div className="d-flex gap-2">
        <input
          className="form-control"
          style={{ maxWidth: 240 }}
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-control"
          style={{ maxWidth: 140 }}
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <textarea
        className="form-control"
        rows={2}
        placeholder="Description (optional)"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="d-flex gap-2">
        <button className="btn btn-success" onClick={onSave}>Save item</button>
        <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
