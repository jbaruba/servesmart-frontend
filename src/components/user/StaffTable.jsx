import React from "react";

export default function StaffTable({ users, onEditUser, onDeleteUser }) {
  if (!users.length) {
    return <div className="p-3 text-muted">No staff members found.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "5%" }}>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Phone</th>
            <th style={{ width: "1%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u.id ?? index}>
              <td>{index + 1}</td>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                {u.active ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-secondary">Inactive</span>
                )}
              </td>
              <td>{u.phoneNumber || "-"}</td>
              <td className="d-flex gap-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
