// src/pages/admin/Profit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaidOrders } from "../../services/ordersApi"; 
// verwacht een endpoint dat alle betaalde orders teruggeeft

// Helper om een datum uit de order te halen (zo flexibel mogelijk)
function getOrderDate(order) {
  const raw =
    order.paidAt ||
    order.paymentDate ||
    order.orderDateTime ||
    order.createdAt ||
    order.date;

  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatCurrency(value) {
  if (value == null) return "-";
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export default function ProfitPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickRange, setQuickRange] = useState("ALL"); // ALL | TODAY | WEEK | MONTH

  const navigate = useNavigate();

  // Laden van betaalde orders
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    getPaidOrders()
      .then((res) => {
        if (!isMounted) return;
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Could not load profit data.";
        setLoadError(msg);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Quick range knoppen (vandaag / week / maand / alles)
  function applyQuickRange(type) {
    setQuickRange(type);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    if (type === "TODAY") {
      const iso = `${yyyy}-${mm}-${dd}`;
      setFromDate(iso);
      setToDate(iso);
    } else if (type === "WEEK") {
      const day = now.getDay() || 7; // maandag = 1
      const start = new Date(now);
      start.setDate(now.getDate() - (day - 1));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const sY = start.getFullYear();
      const sM = String(start.getMonth() + 1).padStart(2, "0");
      const sD = String(start.getDate()).padStart(2, "0");

      const eY = end.getFullYear();
      const eM = String(end.getMonth() + 1).padStart(2, "0");
      const eD = String(end.getDate()).padStart(2, "0");

      setFromDate(`${sY}-${sM}-${sD}`);
      setToDate(`${eY}-${eM}-${eD}`);
    } else if (type === "MONTH") {
      const start = `${yyyy}-${mm}-01`;
      setFromDate(start);
      setToDate("");
    } else {
      // ALL
      setFromDate("");
      setToDate("");
    }
  }

  // Filteren van orders op datum
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = getOrderDate(o);
      if (!d) return false;

      let ok = true;

      if (fromDate) {
        const from = new Date(fromDate + "T00:00:00");
        if (d < from) ok = false;
      }

      if (toDate) {
        const to = new Date(toDate + "T23:59:59");
        if (d > to) ok = false;
      }

      return ok;
    });
  }, [orders, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.totalAmount ?? o.total ?? 0),
      0
    );
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

    return { totalOrders, totalRevenue, avgOrder };
  }, [filteredOrders]);

  function handleViewOrder(orderId) {
    if (!orderId) return;
    navigate(`/admin/orders/${orderId}`);
  }

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h2 className="mb-3">Profit overview</h2>

      {/* Filters + stats */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">From date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setQuickRange("CUSTOM");
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">To date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setQuickRange("CUSTOM");
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label d-block">Quick range</label>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={
                    "btn btn-sm " +
                    (quickRange === "ALL"
                      ? "btn-dark"
                      : "btn-outline-secondary")
                  }
                  onClick={() => applyQuickRange("ALL")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={
                    "btn btn-sm " +
                    (quickRange === "TODAY"
                      ? "btn-dark"
                      : "btn-outline-secondary")
                  }
                  onClick={() => applyQuickRange("TODAY")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={
                    "btn btn-sm " +
                    (quickRange === "WEEK"
                      ? "btn-dark"
                      : "btn-outline-secondary")
                  }
                  onClick={() => applyQuickRange("WEEK")}
                >
                  This week
                </button>
                <button
                  type="button"
                  className={
                    "btn btn-sm " +
                    (quickRange === "MONTH"
                      ? "btn-dark"
                      : "btn-outline-secondary")
                  }
                  onClick={() => applyQuickRange("MONTH")}
                >
                  This month
                </button>
              </div>
            </div>

            <div className="col-md-2 text-end small text-muted">
              <div>Total orders: {stats.totalOrders}</div>
              <div>Total revenue: {formatCurrency(stats.totalRevenue)}</div>
              <div>Avg / order: {formatCurrency(stats.avgOrder)}</div>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="alert alert-danger py-2 mb-2">{loadError}</div>
      )}

      {/* Tabel met orders */}
      <div className="card flex-grow-1">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Paid orders</span>
          <span className="small text-muted">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-muted">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-3 text-muted">
              No paid orders found for this period.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th
                      style={{ width: "5%" }}
                      className="text-center align-middle"
                    >
                      #
                    </th>
                    <th style={{ width: "18%" }}>Date</th>
                    <th style={{ width: "15%" }}>Time</th>
                    <th style={{ width: "15%" }}>Table</th>
                    <th style={{ width: "20%" }}>Staff</th>
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
                  {filteredOrders.map((o, index) => {
                    const d = getOrderDate(o);
                    const dateStr = d
                      ? d.toLocaleDateString("nl-NL")
                      : "-";
                    const timeStr = d
                      ? d.toLocaleTimeString("nl-NL")
                      : "-";

                    const tableLabel =
                      o.tableLabel || o.tableName || o.restaurantTableLabel;
                    const staffName =
                      o.staffName ||
                      o.takenBy ||
                      [o.staffFirstName, o.staffLastName]
                        .filter(Boolean)
                        .join(" ");

                    const total =
                      o.totalAmount ?? o.total ?? o.totalPrice ?? 0;

                    return (
                      <tr key={o.id ?? index}>
                        <td className="text-center align-middle">
                          {index + 1}
                        </td>
                        <td className="align-middle">{dateStr}</td>
                        <td className="align-middle">{timeStr}</td>
                        <td className="align-middle">
                          {tableLabel || "-"}
                        </td>
                        <td className="align-middle">
                          {staffName || "-"}
                        </td>
                        <td className="text-end align-middle">
                          {formatCurrency(total)}
                        </td>
                        <td className="text-center align-middle">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewOrder(o.id)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={5}
                      className="text-end fw-semibold"
                    >
                      Total:
                    </td>
                    <td className="text-end fw-semibold">
                      {formatCurrency(stats.totalRevenue)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
