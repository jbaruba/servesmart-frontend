import React from "react";

export default function StaffCreateForm({
  formData,
  onChange,
  onSubmit,
  submitting,
  error,
  success,
  isEditing,
  onCancelEdit,
}) {
  return (
    <form onSubmit={onSubmit}>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="mb-2">
        <label className="form-label">Email *</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>

      <div className="mb-2">
        <label className="form-label">
          Password {isEditing ? "(leave unchanged if you don't fill anything in)" : "*"}
        </label>
        <input
          type="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={onChange}
          placeholder={isEditing ? "Leave empty to keep the current password" : ""}
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <label className="form-label">First name *</label>
          <input
            type="text"
            name="firstName"
            className="form-control"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label">Last name *</label>
          <input
            type="text"
            name="lastName"
            className="form-control"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="mb-2">
        <label className="form-label">Address</label>
        <input
          type="text"
          name="address"
          className="form-control"
          value={formData.address}
          onChange={onChange}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Phone number</label>
        <input
          type="text"
          name="phoneNumber"
          className="form-control"
          value={formData.phoneNumber}
          onChange={onChange}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Role</label>
        <select
          name="role"
          className="form-select"
          value={formData.role}
          onChange={onChange}
        >
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
        </select>
      </div>

      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="activeSwitch"
          checked={!!formData.active}
          onChange={(e) =>
            onChange({
              target: { name: "active", value: e.target.checked },
            })
          }
        />
        <label className="form-check-label" htmlFor="activeSwitch">
          Active account
        </label>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-dark flex-grow-1"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : isEditing
            ? "Save changes"
            : "Create account"}
        </button>

        {isEditing && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
