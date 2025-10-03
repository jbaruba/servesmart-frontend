import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryApi";
import {
  createMenuItem,
  listMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "../services/menuItemApi";

export default function CategoryPage() {
  // category state
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // expand/collapse + items per category
  const [expanded, setExpanded] = useState(() => new Set());       // Set<catId>
  const [itemsByCat, setItemsByCat] = useState({});                // { [catId]: MenuItem[] }
  const [itemsLoading, setItemsLoading] = useState({});            // { [catId]: boolean }

  // add item inline per category
  const [addingForId, setAddingForId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");

  // edit item inline
  const [editItemId, setEditItemId] = useState(null);              // which item
  const [editItemCatId, setEditItemCatId] = useState(null);        // in which category
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // ----- load categories -----
  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const res = await getCategories(q);
      setData(res.data);
    } catch (e) {
      setError("Kon categorieën niet laden");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadCategories(); }, [q]);
  const filtered = useMemo(() => data, [data]);

  // ----- category handlers -----
  async function handleAddCategory() {
    if (!newName.trim()) return;
    await createCategory({ name: newName.trim() });
    setNewName("");
    await loadCategories();
  }

  async function handleSaveCategory(id) {
    if (!editingName.trim()) return;
    await updateCategory(id, { name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
    await loadCategories();
  }

  async function handleDeleteCategory(id) {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(id);
    // clean local caches
    setExpanded(prev => { const s = new Set(prev); s.delete(id); return s; });
    setItemsByCat(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    await loadCategories();
  }

  // ----- items per category -----
  async function loadItems(catId) {
    try {
      setItemsLoading(prev => ({ ...prev, [catId]: true }));
      const res = await listMenuItems({ categoryId: catId });
      setItemsByCat(prev => ({ ...prev, [catId]: res.data }));
    } catch {
      setItemsByCat(prev => ({ ...prev, [catId]: [] }));
    } finally {
      setItemsLoading(prev => ({ ...prev, [catId]: false }));
    }
  }

  function toggleExpand(catId) {
    setExpanded(prev => {
      const s = new Set(prev);
      if (s.has(catId)) s.delete(catId);
      else {
        s.add(catId);
        if (!itemsByCat[catId]) loadItems(catId);
      }
      return s;
    });
  }

  // ----- add item -----
  function toggleAddItem(catId) {
    setAddingForId(prev => (prev === catId ? null : catId));
    setItemName(""); setItemPrice(""); setItemDesc("");
  }
  async function handleAddItem(categoryId) {
    if (!itemName.trim() || !itemPrice) return;
    await createMenuItem({
      name: itemName.trim(),
      price: Number(itemPrice),
      description: itemDesc?.trim() || "",
      active: true,
      categoryId
    });
    setItemName(""); setItemPrice(""); setItemDesc("");
    setAddingForId(null);
    await loadItems(categoryId);
  }

  // ----- edit item -----
  function startEditItem(catId, item) {
    setEditItemId(item.id);
    setEditItemCatId(catId);
    setEditName(item.name ?? "");
    setEditPrice(item.price ?? "");
    setEditDesc(item.description ?? "");
  }
  function cancelEditItem() {
    setEditItemId(null);
    setEditItemCatId(null);
    setEditName(""); setEditPrice(""); setEditDesc("");
  }
  async function saveEditItem() {
    if (!editItemId) return;
    await updateMenuItem(editItemId, {
      name: editName.trim(),
      price: Number(editPrice),
      description: editDesc?.trim() || ""
      // categoryId could be added to move item to another category later
    });
    const catId = editItemCatId;
    cancelEditItem();
    await loadItems(catId);
  }

  // ----- delete item -----
  async function handleDeleteItem(catId, itemId) {
    if (!window.confirm("Delete this item?")) return;
    await deleteMenuItem(itemId);
    await loadItems(catId);
  }

  return (
    <div className="p-3 w-100">
      <h2 className="text-center my-3">Category</h2>

      {/* add + search */}
      <div className="d-flex gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <input
            className="form-control"
            placeholder="Add new category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn btn-dark" onClick={handleAddCategory}>Add</button>
        </div>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Loading…</div>}

      <div className="d-flex flex-column gap-2" style={{ maxWidth: 720 }}>
        {filtered.map((cat) => {
          const isOpen = expanded.has(cat.id);
          const catItems = itemsByCat[cat.id];
          const catItemsLoading = !!itemsLoading[cat.id];

          return (
            <div key={cat.id} className="border rounded-3 p-2">
              {/* header */}
              <div className="d-flex align-items-center justify-content-between">
                {editingId === cat.id ? (
                  <div className="d-flex gap-2 align-items-center w-100">
                    <input
                      className="form-control"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    <button className="btn btn-success" onClick={() => handleSaveCategory(cat.id)}>Save</button>
                    <button className="btn btn-outline-secondary" onClick={() => { setEditingId(null); setEditingName(""); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title={isOpen ? "Collapse" : "Expand"}
                        onClick={() => toggleExpand(cat.id)}
                      >
                        {isOpen ? "▾" : "▸"}
                      </button>
                      <div className="fw-semibold">Name: {cat.name}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-dark" title="Add menu item" onClick={() => toggleAddItem(cat.id)}>+</button>
                      <button className="btn btn-outline-primary" title="Edit" onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}>✏️</button>
                      <button className="btn btn-outline-danger" title="Delete" onClick={() => handleDeleteCategory(cat.id)}>🗑️</button>
                    </div>
                  </>
                )}
              </div>

              {/* add item form */}
              {addingForId === cat.id && (
                <div className="mt-2 d-flex flex-column gap-2">
                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      style={{ maxWidth: 240 }}
                      placeholder="Item name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />
                    <input
                      className="form-control"
                      style={{ maxWidth: 140 }}
                      type="number" min="0" step="0.01"
                      placeholder="Price"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                    />
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Description (optional)"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={() => handleAddItem(cat.id)}>Save item</button>
                    <button className="btn btn-outline-secondary" onClick={() => toggleAddItem(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* items list */}
              {isOpen && (
                <div className="mt-2">
                  {catItemsLoading && <div>Loading items…</div>}
                  {!catItemsLoading && (!catItems || catItems.length === 0) && (
                    <div className="text-muted">No items in this category.</div>
                  )}

                  {!catItemsLoading && catItems && catItems.length > 0 && (
                    <ul className="list-group">
                      {catItems.map((it) => {
                        const isEditing = editItemId === it.id && editItemCatId === cat.id;
                        return (
                          <li key={it.id} className="list-group-item">
                            {isEditing ? (
                              <div className="d-flex flex-column gap-2">
                                <div className="d-flex gap-2">
                                  <input
                                    className="form-control"
                                    style={{ maxWidth: 240 }}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                  />
                                  <input
                                    className="form-control"
                                    style={{ maxWidth: 140 }}
                                    type="number" min="0" step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                  />
                                </div>
                                <textarea
                                  className="form-control"
                                  rows={2}
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                />
                                <div className="d-flex gap-2">
                                  <button className="btn btn-success" onClick={saveEditItem}>Save</button>
                                  <button className="btn btn-outline-secondary" onClick={cancelEditItem}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-medium">{it.name}</div>
                                  {it.description && <small className="text-muted">{it.description}</small>}
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                  <div>€ {Number(it.price).toFixed(2)}</div>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => startEditItem(cat.id, it)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteItem(cat.id, it.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
