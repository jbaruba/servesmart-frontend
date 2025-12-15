import React, { useEffect, useMemo, useState } from "react";
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from "../../services/reservationsApi";
import {
  getActiveRestaurantTables,
} from "../../services/restaurantTablesApi";

const emptyForm = {
  restaurantTableId: "",
  fullName: "",
  partySize: "",
  phoneNumber: "",
  date: "",
  time: "",
  statusName: "PENDING",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tableFilter, setTableFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ------------------------------
  // Load reservations + tables
  // ------------------------------
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setLoadError(null);

      try {
        const [resRes, resTables] = await Promise.all([
          getReservations(),
          getActiveRestaurantTables(),
        ]);

        const resList = resRes.data?.data ?? resRes.data;
        const tableList = resTables.data?.data ?? resTables.data;

        setReservations(Array.isArray(resList) ? resList : []);
        setTables(Array.isArray(tableList) ? tableList : []);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Could not load reservations.";
        setLoadError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // ------------------------------
  // Helpers
  // ------------------------------
  function splitDateTime(dt) {
    if (!dt) return { date: "", time: "" };
    const [d, t] = dt.split("T");
    return { date: d, time: t?.slice(0, 5) ?? "" };
  }

  function buildDateTimeString(date, time) {
    if (!date || !time) return null;
    // LocalDateTime-achtige string zonder tijdzone
    return `${date}T${time}:00`;
  }

  // ------------------------------
  // Filters
  // ------------------------------
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const status = (r.statusName || "").toUpperCase();
      const tableId = r.restaurantTableId;

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      const matchesTable =
        tableFilter === "ALL" ||
        (tableFilter && Number(tableFilter) === Number(tableId));

      let matchesDate = true;
      if (fromDate || toDate) {
        const dtStr = r.eventDateTime;
        const resDate = dtStr ? dtStr.split("T")[0] : null;

        if (fromDate && resDate && resDate < fromDate) {
          matchesDate = false;
        }
        if (toDate && resDate && resDate > toDate) {
          matchesDate = false;
        }
      }

      return matchesStatus && matchesTable && matchesDate;
    });
  }, [reservations, statusFilter, tableFilter, fromDate, toDate]);

  // ------------------------------
  // Form handlers
  // ------------------------------
  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(null);
  }

  function handleEdit(res) {
    setEditId(res.id);
    const { date, time } = splitDateTime(res.eventDateTime);

    setFormData({
      restaurantTableId: res.restaurantTableId ?? "",
      fullName: res.fullName ?? "",
      partySize: res.partySize != null ? String(res.partySize) : "",
      phoneNumber: res.phoneNumber ?? "",
      date,
      time,
      statusName: res.statusName || "PENDING",
    });
    setFormError(null);
    setFormSuccess(null);
  }

  function handleCancelEdit() {
    setEditId(null);
    setFormData(emptyForm);
    setFormError(null);
    setFormSuccess(null);
  }

  async function handleDelete(res) {
    if (!window.confirm(`Delete reservation for ${res.fullName}?`)) return;

    setFormError(null);
    setFormSuccess(null);

    try {
      await deleteReservation(res.id);
      setReservations((prev) => prev.filter((r) => r.id !== res.id));
      setFormSuccess("Reservation deleted successfully.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not delete reservation.";
      setFormError(msg);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.restaurantTableId) {
      setFormError("Table is required.");
      return;
    }
    if (!formData.fullName) {
      setFormError("Full name is required.");
      return;
    }
    const party = Number(formData.partySize);
    if (!Number.isFinite(party) || party <= 0) {
      setFormError("Party size must be a number greater than 0.");
      return;
    }

    const dtStr = buildDateTimeString(formData.date, formData.time);
    if (!dtStr) {
      setFormError("Date and time are required.");
      return;
    }

    const payload = {
      restaurantTableId: Number(formData.restaurantTableId),
      fullName: formData.fullName.trim(),
      partySize: party,
      phoneNumber: formData.phoneNumber?.trim() || null,
      eventDateTime: dtStr,
      statusName: formData.statusName || "PENDING",
    };

    setSubmitting(true);

    try {
      if (!editId) {
        // CREATE
        const res = await createReservation(payload);
        const created = res.data?.data ?? res.data;
        setReservations((prev) => [...prev, created]);
        setFormSuccess("Reservation created successfully.");
      } else {
        // UPDATE
        const res = await updateReservation(editId, payload);
        const updated = res.data?.data ?? res.data;
        setReservations((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        setFormSuccess("Reservation updated successfully.");
      }

      setEditId(null);
      setFormData(emptyForm);
    } catch (err) {
      const status = err.response?.status;
      let msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not save reservation.";

      // bv clash / 1 uur regel → vaak 409 in backend
      if (status === 409) {
        msg =
          "This table already has a reservation around this time (minimum 1 hour apart).";
      }

      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h2 className="mb-3">Reservations</h2>

      {/* Toolbar */}
      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No-show</option>
            </select>
          </div>

          <div>
            <label className="form-label">Table</label>
            <select
              className="form-select"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
            >
              <option value="ALL">All tables</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">From date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">To date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="ms-auto text-end small text-muted">
            <div>Total: {reservations.length}</div>
            <div>Filtered: {filteredReservations.length}</div>
          </div>
        </div>
      </div>

      {/* Overzicht + formulier */}
      <div className="row flex-grow-1">
        {/* Overzicht links */}
        <div className="col-lg-7 mb-3 mb-lg-0 d-flex flex-column">
          <div className="card flex-grow-1">
            <div className="card-header">Reservation overview</div>
            <div className="card-body p-0">
              {loading && <div className="p-3 text-muted">Loading...</div>}
              {loadError && !loading && (
                <div className="p-3 text-danger">
                  Error: {loadError}
                </div>
              )}
              {!loading && !loadError && (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{ width: "5%" }}>
                          #
                        </th>
                        <th>Table</th>
                        <th>Guest</th>
                        <th style={{ width: "8%" }}>Size</th>
                        <th style={{ width: "16%" }}>Date</th>
                        <th style={{ width: "12%" }}>Time</th>
                        <th style={{ width: "12%" }} className="text-center">
                          Status
                        </th>
                        <th
                          style={{ width: "16%" }}
                          className="text-center"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((r, index) => {
                        const { date, time } = splitDateTime(
                          r.eventDateTime
                        );
                        const tableLabel =
                          tables.find((t) => t.id === r.restaurantTableId)
                            ?.label || `#${r.restaurantTableId}`;

                        const status = (r.statusName || "").toUpperCase();
                        let badgeClass = "bg-secondary";
                        if (status === "PENDING") badgeClass = "bg-warning text-dark";
                        if (status === "CONFIRMED") badgeClass = "bg-success";
                        if (status === "CANCELLED" || status === "NO_SHOW")
                          badgeClass = "bg-danger";

                        return (
                          <tr key={r.id ?? index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{tableLabel}</td>
                            <td>{r.fullName}</td>
                            <td>{r.partySize}</td>
                            <td>{date}</td>
                            <td>{time}</td>
                            <td className="text-center">
                              <span className={`badge ${badgeClass}`}>
                                {status}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(r)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(r)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {!filteredReservations.length && (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-3 text-muted"
                          >
                            No reservations found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form rechts */}
        <div className="col-lg-5 d-flex flex-column">
          <div className="card">
            <div className="card-header">
              {editId ? "Edit reservation" : "Create reservation"}
            </div>
            <div className="card-body">
              {formError && (
                <div className="alert alert-danger py-2">{formError}</div>
              )}
              {formSuccess && (
                <div className="alert alert-success py-2">{formSuccess}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Table *</label>
                  <select
                    name="restaurantTableId"
                    className="form-select"
                    value={formData.restaurantTableId}
                    onChange={handleFormChange}
                  >
                    <option value="">Choose a table</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} (seats: {t.seats})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label">Full name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Party size *</label>
                  <input
                    type="number"
                    name="partySize"
                    className="form-control"
                    value={formData.partySize}
                    onChange={handleFormChange}
                    min={1}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Phone number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={formData.date}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      name="time"
                      className="form-control"
                      value={formData.time}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="statusName"
                    className="form-select"
                    value={formData.statusName}
                    onChange={handleFormChange}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="NO_SHOW">NO_SHOW</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-dark flex-grow-1"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Processing..."
                      : editId
                      ? "Save changes"
                      : "Create reservation"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
