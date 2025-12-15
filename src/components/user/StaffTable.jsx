import React from "react";

export default function StaffTable({ users, onEditUser, onDeleteUser, onViewLogs }) {
  if (!users.length) {
    return <div className="p-3 text-muted">No staff members found.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm mb-0 align-middle table-bordered">
        <thead className="table-light">
          <tr>
            <th
              style={{ width: "5%" }}
              className="text-center"
            >
              #
            </th>
            <th>Name</th>
            <th>Email</th>
            <th style={{ width: "10%" }}>Role</th>
            <th
              style={{ width: "10%" }}
              className="text-center"
            >
              Status
            </th>
            <th style={{ width: "12%" }}>Phone</th>
            <th
              style={{ width: "18%" }}
              className="text-center"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u.id ?? index}>
              <td className="text-center">{index + 1}</td>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td className="text-center">
                {u.active ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-secondary">Inactive</span>
                )}
              </td>
              <td>{u.phoneNumber || "-"}</td>

              {/* 🌟 UPDATED ACTIONS COLUMN */}
              <td className="text-center">
                <div className="d-flex justify-content-center align-items-center gap-3">

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEditUser(u)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDeleteUser(u)}
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => onViewLogs(u)}
                  >
                    Logs
                  </button>

                </div>
              </td>
              {/* END ACTIONS */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
