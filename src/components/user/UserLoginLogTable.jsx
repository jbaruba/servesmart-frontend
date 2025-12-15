import React from "react";

export default function UserLoginLogTable({ logs }) {
  const safeLogs = Array.isArray(logs) ? logs : [];

  // --- STATUS MAPPING ---
  function mapStatus(raw) {
    const s = (raw || "").toUpperCase().trim();

    // LOGIN SUCCESS -> LOGIN
    if (s === "LOGIN_SUCCESS") {
      return { label: "LOGIN", type: "login" };
    }

    // LOGOUT
    if (s === "LOGOUT") {
      return { label: "LOGOUT", type: "logout" };
    }

    // Errors
    if (
      s.includes("FAIL") || s.includes("FAILED") || s.includes("ERROR")
    ) {
      return { label: "FAILED", type: "failed" };
    }

    // Als backend ooit SUCCESS stuurt → LOGIN
    if (s === "SUCCESS") {
      return { label: "LOGIN", type: "login" };
    }

    return { label: s || "UNKNOWN", type: "unknown" };
  }

  function badgeClass(type) {
    switch (type) {
      case "login":
        return "badge bg-success";      // groen
      case "logout":
        return "badge bg-secondary";    // grijs
      case "failed":
        return "badge bg-danger";       // rood
      default:
        return "badge bg-warning text-dark";
    }
  }

  return (
    <div
      className="table-responsive"
      style={{ maxHeight: 430, overflowY: "auto" }}
    >
      <table className="table table-sm table-bordered mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "6%" }} className="text-center align-middle">
              #
            </th>
            <th style={{ width: "18%" }} className="text-center align-middle">
              Status
            </th>
            <th style={{ width: "20%" }}>Date</th>
            <th style={{ width: "20%" }}>Time</th>
          </tr>
        </thead>

        <tbody>
          {safeLogs.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted py-3">
                No logs for this user.
              </td>
            </tr>
          ) : (
            safeLogs.map((log, index) => {
              const dateObj = log.date ? new Date(log.date) : null;
              const dateStr = dateObj
                ? dateObj.toLocaleDateString("nl-NL")
                : "-";
              const timeStr = dateObj
                ? dateObj.toLocaleTimeString("nl-NL")
                : "-";

              const uiStatus = mapStatus(log.status);

              return (
                <tr key={log.id ?? index}>
                  <td className="text-center align-middle">{index + 1}</td>

                  <td className="text-center align-middle">
                    <span className={badgeClass(uiStatus.type)}>
                      {uiStatus.label}
                    </span>
                  </td>

                  <td className="align-middle">{dateStr}</td>
                  <td className="align-middle">{timeStr}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
