import React from "react";

export default function StaffToolbar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  activeFilter,
  onActiveFilterChange,
  totalCount,
  filteredCount,
}) {
  return (
    <div className="card">
      <div className="card-body d-flex flex-wrap gap-3 align-items-end">
        <div className="flex-grow-1">
          <label className="form-label">Search (name or email)</label>
          <input
            type="text"
            className="form-control"
            placeholder="E.g. Jean, admin@servesmart.com"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={activeFilter}
            onChange={(e) => onActiveFilterChange(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="ms-auto text-end small text-muted">
          <div>Total: {totalCount}</div>
          <div>Filtered: {filteredCount}</div>
        </div>
      </div>
    </div>
  );
}
