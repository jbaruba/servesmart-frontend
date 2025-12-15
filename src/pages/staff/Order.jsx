// src/pages/staff/Order.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getOrder,
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
} from "../../services/ordersApi";
import { listAllItems } from "../../services/menuItemApi";

function formatCurrency(value) {
  if (value == null) return "-";
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export default function StaffOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  async function loadData() {
    if (!orderId) return;
    setLoading(true);
    setLoadError(null);

    try {
      const [orderRes, menuRes] = await Promise.all([
        getOrder(orderId),
        listAllItems(),
      ]);

      const orderData = orderRes.data?.data ?? orderRes.data;
      const menuData = menuRes.data?.data ?? menuRes.data;

      setOrder(orderData || null);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
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

  const items = useMemo(
    () => (order && Array.isArray(order.items) ? order.items : []),
    [order]
  );

  const totalAmount = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce(
      (sum, it) => sum + (it.totalPrice ?? it.total ?? 0),
      0
    );
  }, [items]);

  function findMenuItem(id) {
    return menuItems.find((m) => String(m.id) === String(id));
  }

  async function handleAddItem(e) {
    e?.preventDefault();
    setActionError(null);

    const id = selectedItemId;
    const qty = Number(quantity);

    if (!id || !qty || qty <= 0) {
      setActionError("Please select an item and a valid quantity.");
      return;
    }

    setActionLoading(true);
    try {
      await addItemToOrder(orderId, {
        menuItemId: Number(id),
        quantity: qty,
      });
      setQuantity(1);
      // herladen
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not add item.";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateQuantity(itemId, newQty) {
    const qty = Number(newQty);
    if (!qty || qty <= 0) {
      // eventueel directe delete als 0
      return;
    }
    setActionError(null);
    setActionLoading(true);
    try {
      await updateOrderItem(orderId, itemId, { quantity: qty });
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not update quantity.";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveItem(itemId) {
    if (!window.confirm("Remove this item from the order?")) return;

    setActionError(null);
    setActionLoading(true);
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
      setActionLoading(false);
    }
  }

  function handleGoToPayment() {
    navigate(`/staff/payment/${orderId}`);
  }

  function handleBackToTables() {
    navigate("/staff/tables");
  }

  const tableLabel = order?.tableLabel || order?.restaurantTableLabel || "-";
  const statusName = (order?.statusName || "").toUpperCase();

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">
          Order for table <span className="fw-bold">{tableLabel}</span>
        </h2>
        <div className="d-flex flex-column align-items-end">
          <span>
            Status:{" "}
            <span className="badge bg-secondary">
              {statusName || "UNKNOWN"}
            </span>
          </span>
          <span className="small text-muted">
            Total: {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {loadError && (
        <div className="alert alert-danger py-2 mb-2">{loadError}</div>
      )}
      {actionError && (
        <div className="alert alert-danger py-2 mb-2">{actionError}</div>
      )}

      {loading ? (
        <div className="p-3 text-muted">Loading...</div>
      ) : !order ? (
        <div className="p-3 text-muted">Order not found.</div>
      ) : (
        <>
          {/* Add item form */}
          <div className="card mb-3">
            <div className="card-header">
              <span className="fw-semibold">Add item</span>
            </div>
            <div className="card-body">
              <form
                className="row g-3 align-items-end"
                onSubmit={handleAddItem}
              >
                <div className="col-md-6">
                  <label className="form-label">Menu item</label>
                  <select
                    className="form-select"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                  >
                    <option value="">Choose item...</option>
                    {menuItems.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}{" "}
                        {m.price != null
                          ? `(${formatCurrency(m.price)})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="col-md-4 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-dark flex-grow-1"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Add to order"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleBackToTables}
                  >
                    Back to tables
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Items table */}
          <div className="card flex-grow-1">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Order items</span>
              <span className="small text-muted">
                Items: {items.length} | Total: {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="card-body p-0">
              {items.length === 0 ? (
                <div className="p-3 text-muted">
                  No items in this order yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th
                          style={{ width: "6%" }}
                          className="text-center align-middle"
                        >
                          #
                        </th>
                        <th>Item</th>
                        <th
                          style={{ width: "15%" }}
                          className="text-center align-middle"
                        >
                          Quantity
                        </th>
                        <th
                          style={{ width: "15%" }}
                          className="text-end align-middle"
                        >
                          Unit price
                        </th>
                        <th
                          style={{ width: "15%" }}
                          className="text-end align-middle"
                        >
                          Total
                        </th>
                        <th
                          style={{ width: "12%" }}
                          className="text-center align-middle"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, index) => {
                        const unit =
                          it.unitPrice ?? it.price ?? it.menuItemPrice ?? 0;
                        const total = it.totalPrice ?? it.total ?? unit * (it.quantity ?? 1);
                        const name =
                          it.menuItemName || it.name || "Unknown item";

                        return (
                          <tr key={it.id ?? index}>
                            <td className="text-center align-middle">
                              {index + 1}
                            </td>
                            <td className="align-middle">{name}</td>
                            <td className="text-center align-middle">
                              <input
                                type="number"
                                min="1"
                                className="form-control form-control-sm d-inline-block"
                                style={{ width: 70 }}
                                value={it.quantity ?? 1}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    it.id,
                                    e.target.value
                                  )
                                }
                                disabled={actionLoading}
                              />
                            </td>
                            <td className="text-end align-middle">
                              {formatCurrency(unit)}
                            </td>
                            <td className="text-end align-middle">
                              {formatCurrency(total)}
                            </td>
                            <td className="text-center align-middle">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                disabled={actionLoading}
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
                        <td colSpan={4} className="text-end fw-semibold">
                          Total:
                        </td>
                        <td className="text-end fw-semibold">
                          {formatCurrency(totalAmount)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleBackToTables}
              >
                Back to tables
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
        </>
      )}
    </div>
  );
}
