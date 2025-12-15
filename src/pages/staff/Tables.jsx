// src/pages/staff/Tables.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getRestaurantTables,
} from "../../services/restaurantTablesApi";
import {
  getOpenOrdersByTable,
  startOrderForTable,
} from "../../services/ordersApi";

function statusBadge(status) {
  const s = (status || "").toUpperCase();
  if (s === "AVAILABLE") return <span className="badge bg-success">Available</span>;
  if (s === "OCCUPIED") return <span className="badge bg-danger">Occupied</span>;
  if (s === "RESERVED") return <span className="badge bg-warning text-dark">Reserved</span>;
  return <span className="badge bg-secondary">{status || "Unknown"}</span>;
}

export default function StaffTablesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [openOrders, setOpenOrders] = useState([]); // open orders gekoppeld aan tafels
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [actionError, setActionError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const staffId = user?.id;

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      const [tablesRes, openOrdersRes] = await Promise.all([
        getRestaurantTables(),
        getOpenOrdersByTable(),
      ]);

      const tData = tablesRes.data?.data ?? tablesRes.data ?? [];
      const oData = openOrdersRes.data?.data ?? openOrdersRes.data ?? [];

      setTables(Array.isArray(tData) ? tData : []);
      setOpenOrders(Array.isArray(oData) ? oData : []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not load tables.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Table + order gecombineerd
  const merged = useMemo(() => {
    const mapOrders = new Map();
    openOrders.forEach((o) => {
      if (o.tableId != null) {
        mapOrders.set(o.tableId, o);
      }
    });

    return tables
      .filter((t) => t.active !== false) // alleen actieve tafels
      .map((t) => {
        const order = mapOrders.get(t.id);
        return {
          ...t,
          currentOrder: order || null,
        };
      });
  }, [tables, openOrders]);

  const filtered = useMemo(() => {
    return merged.filter((t) => {
      if (filterStatus === "ALL") return true;
      const s = (t.statusName || "").toUpperCase();
      return s === filterStatus;
    });
  }, [merged, filterStatus]);

  async function handleTakeTable(table) {
    if (!staffId) {
      setActionError("No staff id found for current user.");
      return;
    }

    setActionError(null);
    setActionLoadingId(table.id);

    try {
      const res = await startOrderForTable({
        tableId: table.id,
        staffId: staffId,
      });

      const order = res.data?.data ?? res.data;
      if (!order || !order.id) {
        throw new Error("Order could not be created.");
      }

      // opnieuw laden zodat status klopt
      await loadData();

      // naar order pagina
      navigate(`/staff/orders/${order.id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not start order for this table.";
      setActionError(msg);
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleOpenOrder(orderId) {
    if (!orderId) return;
    navigate(`/staff/orders/${orderId}`);
  }

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h2 className="mb-3">Table overview (staff)</h2>

      {loadError && (
        <div className="alert alert-danger py-2 mb-2">{loadError}</div>
      )}
      {actionError && (
        <div className="alert alert-danger py-2 mb-2">{actionError}</div>
      )}

      {/* Filter */}
      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label className="form-label">Table status</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>
          <div className="ms-auto small text-muted">
            Total tables: {merged.length} | Filtered: {filtered.length}
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="card flex-grow-1">
        <div className="card-header">
          <span className="fw-semibold">Tables</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-muted">No tables found.</div>
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
                    <th style={{ width: "15%" }}>Label</th>
                    <th style={{ width: "10%" }}>Seats</th>
                    <th style={{ width: "15%" }}>Status</th>
                    <th style={{ width: "20%" }}>Current staff</th>
                    <th
                      style={{ width: "20%" }}
                      className="text-end align-middle"
                    >
                      Current total
                    </th>
                    <th
                      style={{ width: "14%" }}
                      className="text-center align-middle"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, index) => {
                    const s = (t.statusName || "").toUpperCase();
                    const currentOrder = t.currentOrder;
                    const staffName =
                      currentOrder?.staffName ||
                      (currentOrder?.staffFirstName || currentOrder?.staffLastName
                        ? `${currentOrder.staffFirstName ?? ""} ${
                            currentOrder.staffLastName ?? ""
                          }`.trim()
                        : "-");

                    const total = currentOrder?.totalAmount ?? 0;
                    const isMine =
                      currentOrder && currentOrder.staffId === staffId;

                    const canTake =
                      !currentOrder &&
                      (s === "AVAILABLE" || s === "RESERVED");

                    const canOpen = currentOrder && isMine;

                    return (
                      <tr key={t.id ?? index}>
                        <td className="text-center align-middle">
                          {index + 1}
                        </td>
                        <td className="align-middle">{t.label}</td>
                        <td className="align-middle">{t.seats ?? "-"}</td>
                        <td className="align-middle">
                          {statusBadge(t.statusName)}
                        </td>
                        <td className="align-middle">{staffName}</td>
                        <td className="text-end align-middle">
                          {total
                            ? total.toLocaleString("nl-NL", {
                                style: "currency",
                                currency: "EUR",
                              })
                            : "-"}
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex justify-content-center gap-2">
                            {canTake && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                disabled={actionLoadingId === t.id}
                                onClick={() => handleTakeTable(t)}
                              >
                                {actionLoadingId === t.id
                                  ? "Starting..."
                                  : "Take table"}
                              </button>
                            )}

                            {canOpen && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleOpenOrder(currentOrder.id)
                                }
                              >
                                Open order
                              </button>
                            )}

                            {currentOrder && !isMine && (
                              <span className="badge bg-secondary">
                                Taken by other
                              </span>
                            )}

                            {!canTake && !currentOrder && s === "OCCUPIED" && (
                              <span className="badge bg-secondary">
                                Busy
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
