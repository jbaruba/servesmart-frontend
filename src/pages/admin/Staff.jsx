import React, { useEffect, useMemo, useState } from "react";
import StaffToolbar from "../../components/user/StaffToolbar";
import StaffTable from "../../components/user/StaffTable";
import StaffCreateForm from "../../components/user/StaffCreateForm";
import { getUsers, registerUser, updateUser, deleteUser } from "../../services/usersApi";
import { getLoginLogsForUser } from "../../services/loginLogApi";
import UserLoginLogToolbar from "../../components/user/UserLoginLogToolbar";
import UserLoginLogTable from "../../components/user/UserLoginLogTable";

const emptyForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  address: "",
  phoneNumber: "",
  role: "STAFF",
  active: true,
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  // Login log state
  const [logUser, setLogUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    getUsers()
      .then((res) => {
        if (!isMounted) return;
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) setStaff(data);
        else setStaff([]);
      })
      .catch((err) => {
        if (!isMounted) return;
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Could not load staff members.";
        setLoadError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        [user.firstName, user.lastName, user.email]
          .filter(Boolean)
          .some((value) =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
          );

      const matchesRole =
        roleFilter === "ALL" ||
        (user.role && user.role.toUpperCase() === roleFilter);

      const matchesActive =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && user.active) ||
        (activeFilter === "INACTIVE" && !user.active);

      return matchesSearch && matchesRole && matchesActive;
    });
  }, [staff, searchTerm, roleFilter, activeFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (logStatusFilter === "ALL") return true;
      if (!log.status) return false;
      return log.status.toUpperCase() === logStatusFilter;
    });
  }, [logs, logStatusFilter]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
    setFormSuccess(null);
  }

  function handleEditUser(user) {
    setEditUserId(user.id);
    setFormData({
      email: user.email || "",
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      address: user.address || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "STAFF",
      active: user.active ?? true,
    });
    setFormError(null);
    setFormSuccess(null);
  }

  function handleCancelEdit() {
    setEditUserId(null);
    setFormData(emptyForm);
    setFormError(null);
    setFormSuccess(null);
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`Are you sure you want to delete ${user.email}?`)) return;

    setFormError(null);
    setFormSuccess(null);

    try {
      await deleteUser(user.id);
      setStaff((prev) => prev.filter((u) => u.id !== user.id));
      setFormSuccess("Account deleted successfully.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong while deleting.";
      setFormError(message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.email || !formData.firstName || !formData.lastName) {
      setFormError("Email, first name and last name are required.");
      return;
    }

    setSubmitting(true);

    try {
      if (editUserId == null) {
        if (!formData.password) {
          setFormError("Password is required for a new account.");
          setSubmitting(false);
          return;
        }

        const res = await registerUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          active: formData.active,
        });

        const created = res.data?.data ?? res.data;
        setStaff((prev) => [...prev, created]);
        setFormSuccess("Account created successfully.");
        setFormData(emptyForm);
      } else {
        const payload = {
          email: formData.email || null,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          address: formData.address || null,
          phoneNumber: formData.phoneNumber || null,
          role: formData.role || null,
          active:
            typeof formData.active === "boolean" ? formData.active : null,
        };

        const res = await updateUser(editUserId, payload);
        const updated = res.data?.data ?? res.data;

        setStaff((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        setFormSuccess("Account updated successfully.");
        setEditUserId(null);
        setFormData(emptyForm);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong while saving.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewLogs(user) {
    setLogUser(user);
    setLogs([]);
    setLogsError(null);
    setLogStatusFilter("ALL");
    setLogsLoading(true);

    try {
      const res = await getLoginLogsForUser(user.id);
      const data = res.data?.data ?? res.data;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not load login activity.";
      setLogsError(message);
    } finally {
      setLogsLoading(false);
    }
  }

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h2 className="mb-3">Staff Management</h2>

      <StaffToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        totalCount={staff.length}
        filteredCount={filteredStaff.length}
      />

      {/* Boven: brede staff overview */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Staff overview</span>
            </div>
            <div className="card-body p-0">
              {loading && <div className="p-3 text-muted">Loading...</div>}
              {loadError && !loading && (
                <div className="p-3 text-danger">
                  Error while loading: {loadError}
                </div>
              )}
              {!loading && !loadError && (
                <StaffTable
                  users={filteredStaff}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onViewLogs={handleViewLogs}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onder: links edit, rechts logs */}
      <div className="row mt-3">
        <div className="col-lg-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <span className="fw-semibold">
                {editUserId ? "Edit staff member" : "Create new account"}
              </span>
            </div>
            <div className="card-body">
              <StaffCreateForm
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={formError}
                success={formSuccess}
                isEditing={editUserId != null}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-3">
          {logUser && (
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  Login activity – {logUser.email}
                </span>
              </div>
              <div className="card-body d-flex flex-column">
                <UserLoginLogToolbar
                  statusFilter={logStatusFilter}
                  onStatusFilterChange={setLogStatusFilter}
                  totalCount={logs.length}
                  filteredCount={filteredLogs.length}
                />

                {logsLoading && (
                  <div className="text-muted small mb-2">Loading logs…</div>
                )}

                {logsError && (
                  <div className="alert alert-danger py-1 small">
                    {logsError}
                  </div>
                )}

                {!logsLoading && !logsError && (
                  <UserLoginLogTable logs={filteredLogs} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
