import React from "react";

export default function UserLoginLogToolbar({
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}) {
  return (
    <div className="d-flex flex-wrap align-items-end gap-3 mb-2">
      <div>
        <label className="form-label mb-1">Status filter</label>
        <select
          className="form-select form-select-sm"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="ms-auto small text-muted text-end">
        <div>Total logs: {totalCount}</div>
        <div>Filtered: {filteredCount}</div>
      </div>
    </div>
  );
}
