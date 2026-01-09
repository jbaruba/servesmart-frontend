// src/pages/staff/Order.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, addItemToOrder, removeOrderItem } from "../../services/ordersApi";
import { listAllItems } from "../../services/menuItemApi";

function formatCurrency(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

export default function StaffOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  // menu UI state
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("ALL");
  const [quickQty, setQuickQty] = useState(1);
  const [notes, setNotes] = useState("");

  async function loadData() {
    if (!orderId) return;
    setLoading(true);
    setLoadError(null);

    try {
      const [orderRes, menuRes] = await Promise.all([getOrder(orderId), listAllItems()]);
      setOrder(orderRes.data?.data ?? orderRes.data ?? null);

      const list = Array.isArray(menuRes.data?.data)
        ? menuRes.data.data
        : Array.isArray(menuRes.data)
        ? menuRes.data
        : [];

      setMenuItems(list);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not load order.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [orderId]);

  const items = useMemo(() => (order && Array.isArray(order.items) ? order.items : []), [order]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.itemsPrice ?? 0);
      const qty = Number(it.itemsQuantity ?? 0);
      return sum + price * qty;
    }, 0);
  }, [items]);

  // categories
  const categories = useMemo(() => {
    const map = new Map();
    for (const m of menuItems) {
      const name = m.categoryName || (m.categoryId != null ? `Category ${m.categoryId}` : "Other");
      if (!map.has(name)) map.set(name, true);
    }
    return ["ALL", ...Array.from(map.keys())];
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    const term = normalize(search);

    return menuItems
      .filter((m) => m.active !== false)
      .filter((m) => {
        if (activeCat === "ALL") return true;
        const c = m.categoryName || (m.categoryId != null ? `Category ${m.categoryId}` : "Other");
        return c === activeCat;
      })
      .filter((m) => {
        if (!term) return true;
        const hay = normalize(`${m.name} ${m.description || ""} ${m.categoryName || ""}`);
        return hay.includes(term);
      })
      .sort(
        (a, b) =>
          (a.categoryName || "").localeCompare(b.categoryName || "") ||
          (a.name || "").localeCompare(b.name || "")
      );
  }, [menuItems, search, activeCat]);

  async function handleAdd(menuItem) {
    setActionError(null);

    const qty = Number(quickQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setActionError("Quantity must be > 0");
      return;
    }

    setSaving(true);
    try {
      await addItemToOrder(orderId, {
        menuItemId: Number(menuItem.id),
        quantity: qty,
        notes: notes?.trim() || null,
      });

      setQuickQty(1);
      setNotes("");
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not add item.";
      setActionError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveItem(itemId) {
    if (!window.confirm("Remove this item?")) return;

    setActionError(null);
    setSaving(true);
    try {
      await removeOrderItem(orderId, itemId);
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not remove item.";
      setActionError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ✅ Pay button fixed: navigate to payment route
  function handleGoToPayment() {
    navigate(`/staff/payment/${orderId}`);
  }

  const tableLabel = order?.restaurantTableLabel || order?.tableLabel || "-";
  const statusName = (order?.statusName || "").toUpperCase();

  return (
    <div className="p-3 h-100 d-flex flex-column" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">
          Order for table <span className="fw-bold">{tableLabel}</span>
        </h2>

        {/* ✅ only status here */}
        <div className="text-end">
          <div>
            Status: <span className="badge bg-secondary">{statusName || "UNKNOWN"}</span>
          </div>
        </div>
      </div>

      {loadError && <div className="alert alert-danger py-2 mb-2">{loadError}</div>}
      {actionError && <div className="alert alert-danger py-2 mb-2">{actionError}</div>}

      {loading ? (
        <div className="p-3 text-muted">Loading...</div>
      ) : !order ? (
        <div className="p-3 text-muted">Order not found.</div>
      ) : (
        <div className="row g-3 flex-grow-1">
          {/* LEFT: Menu picker */}
          <div className="col-lg-7 d-flex flex-column">
            <div className="card mb-3">
              <div className="card-header fw-semibold">Menu</div>
              <div className="card-body">
                <div className="row g-2 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label">Search</label>
                    <input
                      className="form-control"
                      placeholder="Search item... (bv: ossenhaas)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={activeCat}
                      onChange={(e) => setActiveCat(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Qty</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={quickQty}
                      onChange={(e) => setQuickQty(e.target.value)}
                    />
                  </div>

                  <div className="col-md-10">
                    <label className="form-label">Notes (optional)</label>
                    <input
                      className="form-control"
                      placeholder="bv: zonder ui, extra saus..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card flex-grow-1">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Choose item</span>
                <span className="small text-muted">Showing: {filteredMenu.length}</span>
              </div>

              <div className="card-body">
                {filteredMenu.length === 0 ? (
                  <div className="text-muted">No menu items match your search.</div>
                ) : (
                  <div className="row g-2">
                    {filteredMenu.map((m) => (
                      <div key={m.id} className="col-md-6">
                        {/* ✅ fixed size item cards */}
                        <div className="border rounded p-3 d-flex flex-column" style={{ height: 170 }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="fw-semibold">{m.name}</div>
                            <div className="fw-semibold">{formatCurrency(m.price)}</div>
                          </div>

                          <div
                            className="small text-muted mt-1"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              minHeight: 34,
                            }}
                          >
                            {m.description || " "}
                          </div>

                          <div className="d-flex gap-2 mt-2 flex-wrap">
                            {m.gluten && <span className="badge bg-warning text-dark">Gluten</span>}
                            {m.nuts && <span className="badge bg-warning text-dark">Nuts</span>}
                            {m.dairy && <span className="badge bg-warning text-dark">Dairy</span>}
                            {m.alcohol && <span className="badge bg-info text-dark">Alcohol</span>}
                          </div>

                          <div className="mt-auto d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-dark"
                              disabled={saving}
                              onClick={() => handleAdd(m)}
                            >
                              {saving ? "Adding..." : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-footer text-muted small">Tip: search + add is fastest.</div>
            </div>
          </div>

          {/* RIGHT: Current order */}
          <div className="col-lg-5 d-flex flex-column">
            <div className="card flex-grow-1">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Current order</span>
                <span className="small text-muted">Items: {items.length}</span>
              </div>

              <div className="card-body p-0">
                {items.length === 0 ? (
                  <div className="p-3 text-muted">No items yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th style={{ width: 70 }} className="text-center">
                            Qty
                          </th>
                          <th style={{ width: 110 }} className="text-end">
                            Total
                          </th>
                          <th style={{ width: 90 }} className="text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => {
                          const name = it.itemsName || "Unknown";
                          const unit = Number(it.itemsPrice ?? 0);
                          const qty = Number(it.itemsQuantity ?? 0);
                          const lineTotal = unit * qty;

                          return (
                            <tr key={it.id}>
                              <td>
                                <div className="fw-semibold">{name}</div>
                                <div className="small text-muted">
                                  {formatCurrency(unit)} each
                                  {it.notes ? ` • ${it.notes}` : ""}
                                </div>
                              </td>
                              <td className="text-center">{qty}</td>
                              <td className="text-end">{formatCurrency(lineTotal)}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={saving}
                                  onClick={() => handleRemoveItem(it.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="text-end fw-semibold" colSpan={2}>
                            Total:
                          </td>
                          <td className="text-end fw-semibold">{formatCurrency(totalAmount)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* ✅ only one back button, pay works */}
              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/staff/tables")}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  disabled={items.length === 0}
                  onClick={handleGoToPayment}
                >
                  Go to payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
