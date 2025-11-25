import { useEffect, useMemo, useState } from "react";
import AddCategoryForm from "../../components/category/AddCategory";
import SearchBox from "../../components/category/SearchBox";
import CategorySection from "../../components/category/CategorySection";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryApi";

import {
  createMenuItem,
  listMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/menuItemApi";

function toNumberSafe(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export default function MenuPage() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");

  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPosition, setEditingPosition] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState(() => new Set());
  const [itemsByCat, setItemsByCat] = useState({});
  const [itemsLoading, setItemsLoading] = useState({});

  const [addingForId, setAddingForId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");

  const [editItemId, setEditItemId] = useState(null);
  const [editItemCatId, setEditItemCatId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");

// laad menu categorie
  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const res = await getCategories();
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setData(list);
    } catch (e) {
      setError("Kon categorieën niet laden");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

//  zoek functie
  const filtered = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    const term = (q || "").toLowerCase();
    if (!term) return arr;

    return arr.filter((c) => (c?.name || "").toLowerCase().includes(term));
  }, [data, q]);

//  maakt menu category 
  async function handleAddCategory() {
    setError("");

    const name = newName.trim();
    if (!name) return;

    const posNum = newPosition === "" ? 0 : Number(newPosition);
    if (!Number.isFinite(posNum) || posNum < 0) {
      alert("Position moet een geldig getal zijn (0 of hoger).");
      return;
    }

    try {
      await createCategory({ name, position: posNum, active: true });
      setNewName("");
      setNewPosition("");
      await loadCategories();
    } catch (e) {
      const status = e?.response?.status;

      if (status === 409) {
        setError("Category name already exists");
      } else if (status === 400) {
        setError("Invalid category data");
      } else {
        setError("Something went wrong while creating the category");
      }
    }
  }

// category update
  async function handleSaveCategory(id) {
    setError("");

    const name = editingName.trim();
    if (!name) return;

    const body = { name };

    if (editingPosition !== "") {
      const posNum = Number(editingPosition);
      if (!Number.isFinite(posNum) || posNum < 0) {
        alert("Position moet een geldig getal zijn (0 of hoger).");
        return;
      }
      body.position = posNum;
    }

    try {
      await updateCategory(id, body);
      setEditingId(null);
      setEditingName("");
      setEditingPosition("");
      await loadCategories();
    } catch (e) {
      const status = e?.response?.status;

      if (status === 409) {
        setError("Category name already exists");
      } else if (status === 400) {
        setError("Invalid category data");
      } else if (status === 404) {
        setError("Category not found");
      } else {
        setError("Something went wrong while updating the category");
      }
    }
  }

  // delete menu vcategorie
  async function handleDeleteCategory(id) {
    if (!window.confirm("Delete this category?")) return;

    setError("");
    try {
      await deleteCategory(id);

      setExpanded((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });

      setItemsByCat((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      await loadCategories();
    } catch (e) {
      const status = e?.response?.status;

      if (status === 404) setError("Category not found");
      else if (status === 400) setError("Invalid category data");
      else setError("Something went wrong while deleting the category");
    }
  }
// laad menu item
  async function loadItems(catId) {
    try {
      setItemsLoading((prev) => ({ ...prev, [catId]: true }));
      const res = await listMenuItems(catId);

      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setItemsByCat((prev) => ({ ...prev, [catId]: list }));
    } catch {
      setItemsByCat((prev) => ({ ...prev, [catId]: [] }));
    } finally {
      setItemsLoading((prev) => ({ ...prev, [catId]: false }));
    }
  }

  function toggleExpand(catId) {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(catId)) s.delete(catId);
      else {
        s.add(catId);
        if (!itemsByCat[catId]) loadItems(catId);
      }
      return s;
    });
  }

  function toggleAddItem(catId) {
    setAddingForId((prev) => (prev === catId ? null : catId));
    setItemName("");
    setItemPrice("");
    setItemDesc("");
  }
// create menu item
  async function handleAddItem(categoryId) {
    setError("");

    const priceNumber = toNumberSafe(itemPrice);
    if (!itemName.trim() || priceNumber === null) {
      alert("Naam en geldige prijs zijn verplicht.");
      return;
    }

    try {
      await createMenuItem({
        name: itemName.trim(),
        price: priceNumber,
        description: itemDesc?.trim() || "",
        active: true,
        gluten: false,
        nuts: false,
        dairy: false,
        alcohol: false,
        categoryId,
      });

      setItemName("");
      setItemPrice("");
      setItemDesc("");
      setAddingForId(null);

      await loadItems(categoryId);
    } catch (e) {
      const status = e?.response?.status;

      if (status === 409) {
        setError("Menu item with this name already exists in this category");
      } else if (status === 400) {
        setError("Invalid menu item data");
      } else if (status === 404) {
        setError("Category not found");
      } else {
        setError("Something went wrong while creating menu item");
      }
    }
  }
// wijzigen van menu item
  function startEditItem(catId, item) {
    setAddingForId(null);

    setEditItemId(item.id);
    setEditItemCatId(catId);
    setEditName(item.name ?? "");
    setEditPrice(
      item.price !== undefined && item.price !== null ? String(item.price) : ""
    );
    setEditDesc(item.description ?? "");
  }

  function cancelEditItem() {
    setEditItemId(null);
    setEditItemCatId(null);
    setEditName("");
    setEditPrice("");
    setEditDesc("");
  }

//  menu item update
  async function saveEditItem(patch) {
    setError("");

    const nextName = (patch?.name ?? editName).trim();
    const nextPrice = toNumberSafe(patch?.price ?? editPrice);
    const nextDesc = (patch?.description ?? editDesc)?.trim() || "";

    if (!editItemId) return;
    if (!nextName || nextPrice === null) {
      alert("Naam en geldige prijs zijn verplicht.");
      return;
    }

    try {
      const body = {
        name: nextName,
        price: nextPrice,
        description: nextDesc,
      };

      if (patch && "active" in patch) body.active = !!patch.active;
      if (patch && "gluten" in patch) body.gluten = !!patch.gluten;
      if (patch && "nuts" in patch) body.nuts = !!patch.nuts;
      if (patch && "dairy" in patch) body.dairy = !!patch.dairy;
      if (patch && "alcohol" in patch) body.alcohol = !!patch.alcohol;

      await updateMenuItem(editItemId, body);

      const catId = editItemCatId;
      cancelEditItem();
      await loadItems(catId);
    } catch (e) {
      const status = e?.response?.status;

      if (status === 409) {
        setError("Another menu item with this name exists in this category");
      } else if (status === 400) {
        setError("Invalid menu item data");
      } else if (status === 404) {
        setError("Menu item or category not found");
      } else {
        setError("Failed to update menu item");
      }
    }
  }


  // delete van menu item
  async function handleDeleteItem(catId, itemId) {
    if (!window.confirm("Delete this item?")) return;

    setError("");

    try {
      await deleteMenuItem(itemId);
      await loadItems(catId);
    } catch (e) {
      const status = e?.response?.status;

      if (status === 404) {
        setError("Menu item not found");
      } else {
        setError("Failed to delete menu item");
      }
    }
  }


  return (
    <div className="p-3 w-100">
      <h2 className="text-center my-3">Category</h2>

      <div className="d-flex gap-2 mb-3">
        <AddCategoryForm
          name={newName}
          onNameChange={setNewName}
          position={newPosition}
          onPositionChange={setNewPosition}
          onAdd={handleAddCategory}
        />
        <SearchBox value={q} onChange={setQ} />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Loading…</div>}

      <div className="d-flex flex-column gap-2" style={{ maxWidth: 720 }}>
        {filtered.map((cat) => {
          const isOpen = expanded.has(cat.id);
          const catItems = itemsByCat[cat.id] ?? [];
          const catItemsLoading = !!itemsLoading[cat.id];

          return (
            <CategorySection
              key={cat.id}
              cat={cat}
              isOpen={isOpen}
              isEditing={editingId === cat.id}
              editingName={editingName}
              setEditingName={setEditingName}
              editingPosition={editingPosition}
              setEditingPosition={setEditingPosition}
              onToggleExpand={() => toggleExpand(cat.id)}
              onStartEdit={() => {
                setEditingId(cat.id);
                setEditingName(cat.name);
                setEditingPosition(
                  cat.position !== null && cat.position !== undefined
                    ? String(cat.position)
                    : ""
                );
              }}
              onCancelEdit={() => {
                setEditingId(null);
                setEditingName("");
                setEditingPosition("");
              }}
              onSaveEdit={() => handleSaveCategory(cat.id)}
              onAddItemClick={() => toggleAddItem(cat.id)}
              onDeleteCategory={() => handleDeleteCategory(cat.id)}
              addingForId={addingForId}
              itemName={itemName}
              setItemName={setItemName}
              itemPrice={itemPrice}
              setItemPrice={setItemPrice}
              itemDesc={itemDesc}
              setItemDesc={setItemDesc}
              onSaveItem={() => handleAddItem(cat.id)}
              onCancelAddItem={() => toggleAddItem(null)}
              items={catItems}
              itemsLoading={catItemsLoading}
              editItemId={editItemId}
              editItemCatId={editItemCatId}
              onStartEditItem={startEditItem}
              onSaveEditItem={saveEditItem}
              onCancelEditItem={cancelEditItem}
              onDeleteItem={handleDeleteItem}
              editName={editName}
              setEditName={setEditName}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              editDesc={editDesc}
              setEditDesc={setEditDesc}
            />
          );
        })}
      </div>
    </div>
  );
}
