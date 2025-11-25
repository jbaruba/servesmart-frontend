import ItemRow from "./ItemRow";

export default function ItemsList({
  items,
  loading,
  catId,
  editItemId,
  editItemCatId,
  onStartEditItem,
  onSaveItem,
  onCancelItem,
  onDeleteItem,
  editName,
  setEditName,
  editPrice,
  setEditPrice,
  editDesc,
  setEditDesc,
}) {
  if (loading) return <div>Loading items…</div>;
  if (!items || items.length === 0)
    return <div className="text-muted">No items in this category.</div>;

  return (
    <ul className="list-group">
      {items.map((it) => (
        <ItemRow
          key={it.id}
          item={it}
          isEditing={editItemId === it.id && editItemCatId === catId}
          onStartEdit={(item) => onStartEditItem(catId, item)}
          onSave={onSaveItem}
          onCancel={onCancelItem}
          onDelete={(itemId) => onDeleteItem(catId, itemId)}
          editName={editName}
          setEditName={setEditName}
          editPrice={editPrice}
          setEditPrice={setEditPrice}
          editDesc={editDesc}
          setEditDesc={setEditDesc}
        />
      ))}
    </ul>
  );
}
