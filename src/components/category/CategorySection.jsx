import CategoryHeader from "./CategoryHeader";
import CategoryEditRow from "./CategoryEditRow";
import AddItemForm from "../menuitem/AddItem";
import ItemsList from "../menuitem/ItemsList";

export default function CategorySection({
  cat,
  isOpen,
  isEditing,
  editingName,
  setEditingName,
  editingPosition,
  setEditingPosition,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onAddItemClick,
  onDeleteCategory,
  addingForId,
  itemName,
  setItemName,
  itemPrice,
  setItemPrice,
  itemDesc,
  setItemDesc,
  onSaveItem,
  onCancelAddItem,
  items,
  itemsLoading,
  editItemId,
  editItemCatId,
  onStartEditItem,
  onSaveEditItem,
  onCancelEditItem,
  onDeleteItem,
  editName,
  setEditName,
  editPrice,
  setEditPrice,
  editDesc,
  setEditDesc,
}) {
  return (
    <div className="border rounded-3 p-2">
      {isEditing ? (
        <CategoryEditRow
          editingName={editingName}
          setEditingName={setEditingName}
          editingPosition={editingPosition}
          setEditingPosition={setEditingPosition}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        <CategoryHeader
          cat={cat}
          isOpen={isOpen}
          onToggleExpand={onToggleExpand}
          onAddItemClick={onAddItemClick}
          onStartEdit={onStartEdit}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {/* rest ongewijzigd */}
      {addingForId === cat.id && (
        <AddItemForm
          name={itemName}
          setName={setItemName}
          price={itemPrice}
          setPrice={setItemPrice}
          desc={itemDesc}
          setDesc={setItemDesc}
          onSave={onSaveItem}
          onCancel={onCancelAddItem}
        />
      )}

      {isOpen && (
        <div className="mt-2">
          <ItemsList
            items={items}
            loading={itemsLoading}
            catId={cat.id}
            editItemId={editItemId}
            editItemCatId={editItemCatId}
            onStartEditItem={onStartEditItem}
            onSaveItem={onSaveEditItem}
            onCancelItem={onCancelEditItem}
            onDeleteItem={onDeleteItem}
            editName={editName}
            setEditName={setEditName}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
          />
        </div>
      )}
    </div>
  );
}
