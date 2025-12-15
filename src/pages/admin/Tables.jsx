import React, { useEffect, useMemo, useState } from "react";
import {
  getRestaurantTables,
  createRestaurantTable,
  updateRestaurantTable,
  deleteRestaurantTable,
} from "../../services/restaurantTablesApi";

const emptyForm = {
  label: "",
  seats: "",
  active: true,
  statusName: "AVAILABLE",
};

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editTableId, setEditTableId] = useState(null);

  // LOAD TABLES
  useEffect(() => {
    setLoading(true);
    setLoadError(null);

    getRestaurantTables()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setTables(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setLoadError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Could not load tables."
        );
      })
      .finally(() => setLoading(false));
  }, []);


  // FILTER

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const label = (t.label || "").toLowerCase();
      const status = (t.statusName || "").toLowerCase();

      const matchesSearch =
        !searchTerm ||
        label.includes(searchTerm.toLowerCase()) ||
        status.includes(searchTerm.toLowerCase());

      const matchesActive =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && t.active) ||
        (activeFilter === "INACTIVE" && !t.active);

      return matchesSearch && matchesActive;
    });
  }, [tables, searchTerm, activeFilter]);

  // FORM HANDLERS
  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(null);
  }

  function handleToggleActive(e) {
    setFormData((prev) => ({ ...prev, active: e.target.checked }));
  }

  function handleEditTable(table) {
    setEditTableId(table.id);
    setFormData({
      label: table.label,
      seats: table.seats,
      active: table.active,
      statusName: table.statusName,
    });
  }

  function handleCancelEdit() {
    setEditTableId(null);
    setFormData(emptyForm);
  }

  async function handleDelete(table) {
    if (!window.confirm(`Delete ${table.label}?`)) return;

    try {
      await deleteRestaurantTable(table.id);
      setTables((prev) => prev.filter((t) => t.id !== table.id));
      setFormSuccess("Table deleted.");
    } catch (err) {
      setFormError("Could not delete.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        label: formData.label,
        seats: Number(formData.seats),
        active: formData.active,
        statusName: formData.statusName,
      };

      if (!editTableId) {
        // CREATE
        const res = await createRestaurantTable(payload);
        const created = res.data?.data ?? res.data;

        setTables((prev) => [...prev, created]);
        setFormSuccess("Table created.");
      } else {
        // UPDATE
        const res = await updateRestaurantTable(editTableId, payload);
        const updated = res.data?.data ?? res.data;

        setTables((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        setFormSuccess("Table updated.");
      }

      setFormData(emptyForm);
      setEditTableId(null);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="p-3">
      <h2 className="mb-3">Restaurant Tables</h2>

      {/* Toolbar */}
      <div className="card mb-3">
        <div className="card-body d-flex gap-3 align-items-end flex-wrap">
          <div className="flex-grow-1">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Table name, seat count, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Availability</label>
            <select
              className="form-select"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {/* TABLES OVERVIEW */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header">Tables</div>
            <div className="card-body p-0">
              {loading && <div className="p-3 text-muted">Loading...</div>}

              {!loading && (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">#</th>
                        <th>Label</th>
                        <th>Seats</th>
                        <th>Status</th>
                        <th className="text-center">Active</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTables.map((t, index) => (
                        <tr key={t.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{t.label}</td>
                          <td>{t.seats}</td>
                          <td>{t.statusName}</td>
                          <td className="text-center">
                            {t.active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditTable(t)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(t)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!filteredTables.length && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-3 text-muted"
                          >
                            No tables found.
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

        {/* FORM */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header">
              {editTableId ? "Edit Table" : "Create Table"}
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
                  <label className="form-label">Label *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="label"
                    value={formData.label}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Seats *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="seats"
                    value={formData.seats}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    name="statusName"
                    value={formData.statusName}
                    onChange={handleFormChange}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="CLEANING">CLEANING</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleToggleActive}
                  />
                  <label className="form-check-label">Active</label>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={submitting}
                >
                  {editTableId ? "Save Changes" : "Create Table"}
                </button>

                {editTableId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
