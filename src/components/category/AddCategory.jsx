export default function AddCategory({ name, onNameChange, position, onPositionChange, onAdd }) {
  return (
    <div className="input-group" style={{ maxWidth: 420 }}>
      <input
        className="form-control"
        placeholder="Add new category"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <input
        className="form-control"
        style={{ maxWidth: 50 }}
        type="number"
        placeholder="Position"
        value={position}
        onChange={(e) => onPositionChange(e.target.value)}
      />
      <button className="btn btn-dark" onClick={onAdd}>
        Add
      </button>
    </div>
  );
}
