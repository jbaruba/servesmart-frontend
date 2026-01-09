// src/pages/staff/Payment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, payOrder } from "../../services/ordersApi";

function formatCurrency(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

export default function StaffPaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [method, setMethod] = useState("CARD"); // CARD | CASH | OTHER
  const [paidAmount, setPaidAmount] = useState("");
  const [tip, setTip] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function load() {
    if (!orderId) return;

    setLoading(true);
    setLoadError(null);

    try {
      const res = await getOrder(orderId);
      const data = res.data?.data ?? res.data;

      setOrder(data || null);

      // default paid amount = total
      const items = Array.isArray(data?.items) ? data.items : [];
      const total = items.reduce((sum, it) => {
        const unit = Number(it.itemsPrice ?? 0);
        const qty = Number(it.itemsQuantity ?? 0);
        return sum + unit * qty;
      }, 0);

      setPaidAmount(total ? String(total.toFixed(2)) : "");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not load payment data.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [orderId]);

  const items = useMemo(() => (order?.items && Array.isArray(order.items) ? order.items : []), [order]);

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const unit = Number(it.itemsPrice ?? 0);
      const qty = Number(it.itemsQuantity ?? 0);
      return sum + unit * qty;
    }, 0);
  }, [items]);

  const tipNum = useMemo(() => {
    const n = Number(String(tip).replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [tip]);

  const paidNum = useMemo(() => {
    const n = Number(String(paidAmount).replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [paidAmount]);

  const grandTotal = useMemo(() => total + tipNum, [total, tipNum]);
  const change = useMemo(() => Math.max(0, paidNum - grandTotal), [paidNum, grandTotal]);
  const remaining = useMemo(() => Math.max(0, grandTotal - paidNum), [paidNum, grandTotal]);

  function goBack() {
    navigate(`/staff/orders/${orderId}`);
  }

  async function handlePay() {
    setActionError(null);
    setSuccess(null);

    if (!order) {
      setActionError("Order not found.");
      return;
    }
    if (!items.length) {
      setActionError("This order has no items.");
      return;
    }
    if (paidNum <= 0) {
      setActionError("Paid amount must be greater than 0.");
      return;
    }
    if (remaining > 0) {
      setActionError("Paid amount is not enough.");
      return;
    }

    setSaving(true);
    try {
      // ✅ backend call
      await payOrder(orderId, {
        method,                // "CARD" | "CASH" | ...
        paidAmount: paidNum,   // amount customer gave
        tip: tipNum,           // tip
        note: note?.trim() || null,
      });

      setSuccess("Payment successful. Order is closed.");
      // after short moment go back to tables
      setTimeout(() => {
        navigate("/staff/tables");
      }, 600);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Payment failed.";
      setActionError(msg);
    } finally {
      setSaving(false);
    }
  }

  const tableLabel = order?.restaurantTableLabel || order?.tableLabel || "-";
  const statusName = (order?.statusName || "").toUpperCase();

  return (
    <div className="p-3 h-100 d-flex flex-column" style={{ maxWidth: 1000 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">
          Payment — table <span className="fw-bold">{tableLabel}</span>
        </h2>
        <div className="text-end">
          <div>
            Status: <span className="badge bg-secondary">{statusName || "UNKNOWN"}</span>
          </div>
          <div className="small text-muted">Order #{orderId}</div>
        </div>
      </div>

      {loadError && <div className="alert alert-danger py-2 mb-2">{loadError}</div>}
      {actionError && <div className="alert alert-danger py-2 mb-2">{actionError}</div>}
      {success && <div className="alert alert-success py-2 mb-2">{success}</div>}

      {loading ? (
        <div className="p-3 text-muted">Loading...</div>
      ) : !order ? (
        <div className="p-3 text-muted">Order not found.</div>
      ) : (
        <div className="row g-3 flex-grow-1">
          {/* LEFT: Summary */}
          <div className="col-lg-7 d-flex flex-column">
            <div className="card flex-grow-1">
              <div className="card-header fw-semibold">Order summary</div>

              <div className="card-body p-0">
                {items.length === 0 ? (
                  <div className="p-3 text-muted">No items.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th style={{ width: 70 }} className="text-center">
                            Qty
                          </th>
                          <th style={{ width: 120 }} className="text-end">
                            Unit
                          </th>
                          <th style={{ width: 120 }} className="text-end">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => {
                          const name = it.itemsName || "Unknown";
                          const unit = Number(it.itemsPrice ?? 0);
                          const qty = Number(it.itemsQuantity ?? 0);
                          const line = unit * qty;

                          return (
                            <tr key={it.id}>
                              <td>
                                <div className="fw-semibold">{name}</div>
                                {it.notes ? <div className="small text-muted">{it.notes}</div> : null}
                              </td>
                              <td className="text-center">{qty}</td>
                              <td className="text-end">{formatCurrency(unit)}</td>
                              <td className="text-end">{formatCurrency(line)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-end fw-semibold">
                            Subtotal:
                          </td>
                          <td className="text-end fw-semibold">{formatCurrency(total)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-end fw-semibold">
                            Tip:
                          </td>
                          <td className="text-end fw-semibold">{formatCurrency(tipNum)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-end fw-semibold">
                            Total to pay:
                          </td>
                          <td className="text-end fw-semibold">{formatCurrency(grandTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              <div className="card-footer d-flex justify-content-end">
                <button className="btn btn-outline-secondary" type="button" onClick={goBack}>
                  Back to order
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment form */}
          <div className="col-lg-5 d-flex flex-column">
            <div className="card">
              <div className="card-header fw-semibold">Payment</div>
              <div className="card-body">
                <div className="mb-2">
                  <label className="form-label">Method</label>
                  <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Tip (€)</label>
                    <input
                      className="form-control"
                      inputMode="decimal"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label">Paid amount (€)</label>
                    <input
                      className="form-control"
                      inputMode="decimal"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-2 small">
                  {remaining > 0 ? (
                    <div className="text-danger">Remaining: {formatCurrency(remaining)}</div>
                  ) : (
                    <div className="text-success">Change: {formatCurrency(change)}</div>
                  )}
                </div>

                <div className="mt-3">
                  <label className="form-label">Note (optional)</label>
                  <input
                    className="form-control"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="bv: cash paid, split bill, ..."
                  />
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success flex-grow-1"
                    disabled={saving || !items.length}
                    onClick={handlePay}
                  >
                    {saving ? "Processing..." : `Pay ${formatCurrency(grandTotal)}`}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={goBack} disabled={saving}>
                    Back
                  </button>
                </div>
              </div>
            </div>

            <div className="text-muted small mt-2">
              Tip: If cash, fill “Paid amount” with what the customer gave. You’ll see the change automatically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
