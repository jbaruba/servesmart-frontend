// src/pages/staff/Reservations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReservations } from "../../services/reservationsApi";

function statusBadge(status) {
  const s = (status || "").toUpperCase();
  if (s === "CONFIRMED") return <span className="badge bg-success">Confirmed</span>;
  if (s === "PENDING") return <span className="badge bg-warning text-dark">Pending</span>;
  if (s === "CANCELLED") return <span className="badge bg-danger">Cancelled</span>;
  if (s === "NO_SHOW") return <span className="badge bg-secondary">No-show</span>;
  return <span className="badge bg-light text-dark">{status}</span>;
}

function splitDateTime(dt) {
  if (!dt) return { date: "-", time: "-" };
  const [d, t] = dt.split("T");
  return { date: d, time: t?.slice(0, 5) ?? "-" };
}

export default function StaffReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getReservations();
        const list = res.data?.data ?? res.data ?? [];
        setReservations(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(
          e.response?.data?.message ||
            e.response?.data?.error ||
            "Could not load reservations"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const statusOk =
        filterStatus === "ALL" ||
        (r.statusName || "").toUpperCase() === filterStatus;

      let dateOk = true;
      if (filterDate) {
        const resDate = r.eventDateTime?.split("T")[0];
        dateOk = resDate === filterDate;
      }

      return statusOk && dateOk;
    });
  }, [reservations, filterDate, filterStatus]);

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h2 className="mb-3">Reservations (staff)</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body d-flex gap-3 align-items-end flex-wrap">
          <div>
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No-show</option>
            </select>
          </div>

          <div className="ms-auto small text-muted">
            Total: {filtered.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card flex-grow-1">
        <div className="card-header fw-semibold">Reservation list</div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-muted">No reservations found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Table</th>
                    <th>Guest</th>
                    <th>Size</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const { date, time } = splitDateTime(r.eventDateTime);
                    return (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>{r.restaurantTableLabel || r.restaurantTableId}</td>
                        <td>{r.fullName}</td>
                        <td>{r.partySize}</td>
                        <td>{date}</td>
                        <td>{time}</td>
                        <td>{statusBadge(r.statusName)}</td>
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
