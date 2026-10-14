
import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Users,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  BedDouble,
  Wallet,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ChevronRight,
  CalendarDays,
  Home,
  Filter,
  CircleCheck,
  Clock3,
  Activity,
} from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The interface remains available if browser storage is unavailable.
  }
};

function App() {
  const [authPage, setAuthPage] = useState("signin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => readStorage("smartstay_users", []));
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // All management sections start empty.
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);

  const [activePage, setActivePage] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState("");

  useEffect(() => {
    saveStorage("smartstay_users", users);
  }, [users]);

  const notify = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 2600);
  };

  const signUp = (event) => {
    event.preventDefault();
    setAuthError("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (!name || !email || !password) {
      setAuthError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("The passwords do not match.");
      return;
    }

    if (users.some((user) => user.email === email)) {
      setAuthError("An account with this email address already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveStorage("smartstay_users", updatedUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActivePage("Dashboard");
  };

  const signIn = (event) => {
    event.preventDefault();
    setAuthError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    const account = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!account) {
      setAuthError("Incorrect email or password. Please try again.");
      return;
    }

    setCurrentUser(account);
    setIsAuthenticated(true);
    setActivePage("Dashboard");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthPage("signin");
    setAuthError("");
    setActivePage("Dashboard");
    setSearchTerm("");
    setMobileMenu(false);
  };

  const occupiedRooms = rooms.filter((room) => room.status === "Occupied").length;
  const availableRooms = rooms.filter((room) => room.status === "Available").length;
  const occupancyRate = rooms.length
    ? Math.round((occupiedRooms / rooms.length) * 100)
    : 0;

  const collectedAmount = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesSearch = `${room.name} ${room.type} ${room.floor}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return (
          matchesSearch &&
          (statusFilter === "All" || room.status === statusFilter)
        );
      }),
    [rooms, searchTerm, statusFilter]
  );

  const filteredTenants = useMemo(
    () =>
      tenants.filter((tenant) => {
        const matchesSearch =
          `${tenant.name} ${tenant.email} ${tenant.room}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return (
          matchesSearch &&
          (statusFilter === "All" || tenant.status === statusFilter)
        );
      }),
    [tenants, searchTerm, statusFilter]
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const matchesSearch =
          `${payment.tenant} ${payment.room} ${payment.method}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return (
          matchesSearch &&
          (statusFilter === "All" || payment.status === statusFilter)
        );
      }),
    [payments, searchTerm, statusFilter]
  );

  const openAddModal = (type) => {
    setEditingItem(null);

    if (type === "Rooms") {
      setFormData({
        name: "",
        type: "Single",
        floor: "Ground Floor",
        rent: "",
        status: "Available",
      });
    } else if (type === "Tenants") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        room: "",
        joined: today(),
        status: "Active",
      });
    } else {
      setFormData({
        tenant: "",
        room: "",
        amount: "",
        date: today(),
        method: "UPI",
        status: "Pending",
      });
    }

    setModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setEditingItem({ type, id: item.id });
    setFormData({ ...item });
    setModalOpen(true);
  };

  const deleteItem = (type, id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    if (type === "Rooms") {
      setRooms((current) => current.filter((item) => item.id !== id));
    } else if (type === "Tenants") {
      setTenants((current) => current.filter((item) => item.id !== id));
    } else {
      setPayments((current) => current.filter((item) => item.id !== id));
    }

    notify("Record deleted successfully.");
  };

  const saveItem = (event) => {
    event.preventDefault();

    const type = editingItem?.type || activePage;
    const record = {
      ...formData,
      id: editingItem?.id || Date.now(),
    };

    if (type === "Rooms") {
      record.rent = Number(record.rent) || 0;
      setRooms((current) =>
        editingItem
          ? current.map((item) =>
              item.id === editingItem.id ? record : item
            )
          : [...current, record]
      );
    } else if (type === "Tenants") {
      setTenants((current) =>
        editingItem
          ? current.map((item) =>
              item.id === editingItem.id ? record : item
            )
          : [...current, record]
      );
    } else {
      record.amount = Number(record.amount) || 0;
      setPayments((current) =>
        editingItem
          ? current.map((item) =>
              item.id === editingItem.id ? record : item
            )
          : [...current, record]
      );
    }

    setModalOpen(false);
    setEditingItem(null);
    notify(editingItem ? "Changes saved successfully." : "Record added successfully.");
  };

  const navigate = (page) => {
    setActivePage(page);
    setSearchTerm("");
    setStatusFilter("All");
    setMobileMenu(false);
  };

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Rooms", icon: Building2 },
    { name: "Tenants", icon: Users },
    { name: "Payments", icon: CreditCard },
  ];

  const renderStatus = (status) => (
    <span className={`status-pill ${String(status).toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );

  const renderActions = (type, item) => (
    <div className="row-actions">
      <button
        className="icon-button"
        title="Edit record"
        onClick={() => openEditModal(type, item)}
      >
        <Pencil size={16} />
      </button>
      <button
        className="icon-button danger"
        title="Delete record"
        onClick={() => deleteItem(type, item.id)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  const pageTitle =
    activePage === "Dashboard"
      ? "Dashboard"
      : activePage === "Rooms"
      ? "Room Management"
      : activePage === "Tenants"
      ? "Tenant Management"
      : "Payment Management";

  const pageDescription =
    activePage === "Dashboard"
      ? "Here's what's happening with your property today."
      : activePage === "Rooms"
      ? "View and manage your property's rooms."
      : activePage === "Tenants"
      ? "Manage tenant details and room assignments."
      : "Track rent collection and payment records.";

  if (!isAuthenticated) {
    return (
      <>
        <style>{styles}</style>
        <div className="auth-layout">
          <section className="auth-visual">
            <div className="auth-brand">
              <div className="brand-mark"><Building2 size={26} /></div>
              <span>SmartStay</span>
            </div>

            <div className="visual-content">
              <span className="eyebrow">PROPERTY MANAGEMENT</span>
              <h1>A smarter way to manage your property.</h1>
              <p>
                Manage rooms, tenants and payments with a simple,
                organized workspace built for your everyday operations.
              </p>

              <div className="visual-preview">
                <div className="preview-top">
                  <span>Property overview</span>
                  <Activity size={17} />
                </div>
                <div className="preview-metrics">
                  <div><span>Rooms</span><strong>0</strong></div>
                  <div><span>Tenants</span><strong>0</strong></div>
                  <div><span>Payments</span><strong>0</strong></div>
                </div>
                <div className="preview-bars empty-preview-bars">
                  <span>No activity recorded</span>
                </div>
              </div>
            </div>

            <div className="visual-bottom">
              <span>Simple. Organized. Efficient.</span>
              <span>© {new Date().getFullYear()} SmartStay</span>
            </div>
          </section>

          <section className="auth-main">
            <div className="auth-mobile-brand">
              <div className="brand-mark"><Building2 size={23} /></div>
              <span>SmartStay</span>
            </div>

            <div className="auth-card">
              <div className="auth-heading">
                <span className="heading-icon">
                  {authPage === "signin" ? (
                    <LockKeyhole size={23} />
                  ) : (
                    <UserRound size={23} />
                  )}
                </span>
                <h2>
                  {authPage === "signin"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>
                <p>
                  {authPage === "signin"
                    ? "Sign in to continue to your workspace."
                    : "Enter your details to get started."}
                </p>
              </div>

              {authError && <div className="auth-error">{authError}</div>}

              <form
                className="auth-form"
                onSubmit={authPage === "signin" ? signIn : signUp}
              >
                {authPage === "signup" && (
                  <label className="field">
                    <span>Full name</span>
                    <div className="input-wrap">
                      <UserRound size={18} />
                      <input
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </label>
                )}

                <label className="field">
                  <span>Email address</span>
                  <div className="input-wrap">
                    <Mail size={18} />
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Password</span>
                  <div className="input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete={
                        authPage === "signin"
                          ? "current-password"
                          : "new-password"
                      }
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {authPage === "signup" && (
                  <label className="field">
                    <span>Confirm password</span>
                    <div className="input-wrap">
                      <LockKeyhole size={18} />
                      <input
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                  </label>
                )}

                {authPage === "signin" && (
                  <div className="form-extra">
                    <span className="remember-label">
                      <CheckCircle2 size={15} />
                      Your workspace, in one place
                    </span>
                  </div>
                )}

                <button className="primary-button auth-submit" type="submit">
                  {authPage === "signin" ? "Sign in" : "Create account"}
                  <ChevronRight size={19} />
                </button>
              </form>

              <div className="auth-switch">
                {authPage === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError("");
                        setAuthPage("signup");
                      }}
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError("");
                        setAuthPage("signin");
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="auth-legal">
              By continuing, you agree to use SmartStay responsibly.
            </p>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        {mobileMenu && (
          <button
            className="mobile-overlay"
            aria-label="Close navigation"
            onClick={() => setMobileMenu(false)}
          />
        )}

        <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
          <div className="sidebar-brand">
            <div className="brand-mark"><Building2 size={23} /></div>
            <div className="brand-copy">
              <strong>SmartStay</strong>
              <span>Property management</span>
            </div>
            <button
              className="mobile-close"
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-section-label">WORKSPACE</div>

          <nav className="side-nav">
            {navigation.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={`nav-item ${activePage === name ? "active" : ""}`}
                onClick={() => navigate(name)}
              >
                <Icon size={19} />
                <span>{name}</span>
                {activePage === name && <span className="nav-active-dot" />}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-help">
              <div className="help-icon"><Home size={19} /></div>
              <strong>Your property</strong>
              <p>Everything organized in one place.</p>
            </div>

            <button className="logout-button" onClick={logout}>
              <LogOut size={18} />
              <span>Sign out</span>
            </button>

            <div className="sidebar-profile">
              <div className="profile-avatar">
                {(currentUser?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div className="profile-copy">
                <strong>{currentUser?.name || "Property Manager"}</strong>
                <span>{currentUser?.email || "Account"}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="mobile-menu-button"
                onClick={() => setMobileMenu(true)}
                aria-label="Open navigation"
              >
                <Menu size={22} />
              </button>
              <div className="breadcrumb">
                <span>Workspace</span>
                <ChevronRight size={15} />
                <strong>{activePage}</strong>
              </div>
            </div>

            <div className="topbar-right">
              <span className="today-label">
                <CalendarDays size={16} />
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                className="notification-button"
                title="Notifications"
                onClick={() => notify("You're all caught up.")}
              >
                <Bell size={19} />
              </button>

              <div className="top-profile">
                <div className="profile-avatar">
                  {(currentUser?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="top-profile-copy">
                  <strong>{currentUser?.name || "Property Manager"}</strong>
                  <span>Administrator</span>
                </div>
              </div>
            </div>
          </header>

          <div className="page-content">
            <div className="page-heading">
              <div>
                <span className="eyebrow page-eyebrow">OVERVIEW</span>
                <h1>{pageTitle}</h1>
                <p>{pageDescription}</p>
              </div>

              {activePage !== "Dashboard" && (
                <button
                  className="primary-button add-button"
                  onClick={() => openAddModal(activePage)}
                >
                  <Plus size={18} />
                  Add {activePage === "Rooms" ? "Room" : activePage === "Tenants" ? "Tenant" : "Payment"}
                </button>
              )}
            </div>

            {activePage === "Dashboard" && (
              <>
                <div className="welcome-banner">
                  <div className="welcome-copy">
                    <span>PROPERTY OVERVIEW</span>
                    <h2>Welcome back, {currentUser?.name?.split(" ")[0] || "there"}!</h2>
                    <p>Your property management overview.</p>
                    <button className="welcome-link" onClick={() => navigate("Rooms")}>
                      Manage your rooms <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="welcome-illustration">
                    <div className="illustration-circle">
                      <Building2 size={70} strokeWidth={1.25} />
                    </div>
                    <div className="illustration-chip">
                      <CircleCheck size={16} /> Property overview
                    </div>
                  </div>
                </div>

                <div className="stats-grid">
                  <Stat label="Total Rooms" value={rooms.length} detail={`${availableRooms} available`} icon={Building2} tone="blue" onClick={() => navigate("Rooms")} />
                  <Stat label="Total Tenants" value={tenants.length} detail="Registered tenants" icon={Users} tone="purple" onClick={() => navigate("Tenants")} />
                  <Stat label="Rent Collected" value={money(collectedAmount)} detail="From paid records" icon={Wallet} tone="green" onClick={() => navigate("Payments")} />
                  <Stat label="Pending Payments" value={money(pendingAmount)} detail={`${payments.filter((item) => item.status === "Pending").length} payment records`} icon={CreditCard} tone="orange" onClick={() => navigate("Payments")} />
                </div>

                <div className="dashboard-grid">
                  <section className="panel occupancy-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Room Occupancy</h3>
                        <p>Current room availability</p>
                      </div>
                      <button className="subtle-button" onClick={() => navigate("Rooms")}>
                        View rooms <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="occupancy-body">
                      <div
                        className="donut"
                        style={{
                          background: `conic-gradient(#3559dc ${occupancyRate}%, #e8edf7 ${occupancyRate}% 100%)`,
                        }}
                      >
                        <div className="donut-inner">
                          <strong>{occupancyRate}%</strong>
                          <span>Occupied</span>
                        </div>
                      </div>
                      <div className="occupancy-legend">
                        <div><span className="legend-dot occupied-dot" /><span>Occupied rooms</span><strong>{occupiedRooms}</strong></div>
                        <div><span className="legend-dot available-dot" /><span>Available rooms</span><strong>{availableRooms}</strong></div>
                        <div className="occupancy-total"><span>Total rooms</span><strong>{rooms.length}</strong></div>
                      </div>
                    </div>

                    <div className="occupancy-progress">
                      <div><span>Occupancy rate</span><strong>{occupancyRate}%</strong></div>
                      <div className="progress-track"><div style={{ width: `${occupancyRate}%` }} /></div>
                    </div>
                  </section>

                  <section className="panel quick-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Quick Actions</h3>
                        <p>Common management tasks</p>
                      </div>
                    </div>
                    <div className="quick-actions">
                      <Quick icon={Building2} title="Add a room" description="Create a room record" onClick={() => { navigate("Rooms"); openAddModal("Rooms"); }} tone="blue" />
                      <Quick icon={Users} title="Add a tenant" description="Register a new tenant" onClick={() => { navigate("Tenants"); openAddModal("Tenants"); }} tone="purple" />
                      <Quick icon={CreditCard} title="Record payment" description="Add a rent payment" onClick={() => { navigate("Payments"); openAddModal("Payments"); }} tone="green" />
                    </div>
                  </section>
                </div>

                <section className="panel recent-panel">
                  <div className="panel-heading">
                    <div><h3>Recent Tenants</h3><p>Your latest tenant records</p></div>
                    <button className="subtle-button" onClick={() => navigate("Tenants")}>View all <ChevronRight size={16} /></button>
                  </div>
                  <TenantTable tenants={tenants.slice(0, 4)} renderStatus={renderStatus} renderActions={renderActions} emptyMessage="No tenant records yet." />
                </section>

                <section className="panel recent-panel">
                  <div className="panel-heading">
                    <div><h3>Recent Payments</h3><p>Latest payment activity</p></div>
                    <button className="subtle-button" onClick={() => navigate("Payments")}>View all <ChevronRight size={16} /></button>
                  </div>
                  <PaymentTable payments={payments.slice(0, 4)} renderStatus={renderStatus} renderActions={renderActions} />
                </section>
              </>
            )}

            {activePage === "Rooms" && (
              <>
                <div className="stats-grid compact-stats">
                  <Stat label="Total Rooms" value={rooms.length} detail="All room records" icon={Building2} tone="blue" />
                  <Stat label="Occupied" value={occupiedRooms} detail="Currently in use" icon={BedDouble} tone="purple" />
                  <Stat label="Available" value={availableRooms} detail="Ready for assignment" icon={CheckCircle2} tone="green" />
                  <Stat label="Occupancy" value={`${occupancyRate}%`} detail="Property occupancy" icon={Activity} tone="orange" />
                </div>

                <section className="panel data-panel">
                  <div className="table-toolbar">
                    <div><h3>All Rooms</h3><p>{filteredRooms.length} room records</p></div>
                    <TableFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} statuses={["All", "Occupied", "Available"]} placeholder="Search rooms..." />
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Monthly rent</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredRooms.map((room) => (
                          <tr key={room.id}>
                            <td><strong>{room.name}</strong><small className="sub-cell">ID: {room.id}</small></td>
                            <td>{room.type}</td><td>{room.floor}</td><td><strong>{money(room.rent)}</strong></td>
                            <td>{renderStatus(room.status)}</td><td>{renderActions("Rooms", room)}</td>
                          </tr>
                        ))}
                        {filteredRooms.length === 0 && <EmptyRow colSpan={6} message="No rooms added yet." />}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {activePage === "Tenants" && (
              <>
                <div className="stats-grid compact-stats">
                  <Stat label="Total Tenants" value={tenants.length} detail="Registered tenants" icon={Users} tone="blue" />
                  <Stat label="Active Tenants" value={tenants.filter((item) => item.status === "Active").length} detail="Current residents" icon={CheckCircle2} tone="green" />
                  <Stat label="Occupied Rooms" value={occupiedRooms} detail="Rooms in use" icon={Building2} tone="purple" />
                  <Stat label="Available Rooms" value={availableRooms} detail="Ready for tenants" icon={BedDouble} tone="orange" />
                </div>

                <section className="panel data-panel">
                  <div className="table-toolbar">
                    <div><h3>All Tenants</h3><p>{filteredTenants.length} tenant records</p></div>
                    <TableFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} statuses={["All", "Active", "Inactive"]} placeholder="Search tenants..." />
                  </div>
                  <div className="table-scroll">
                    <TenantTable tenants={filteredTenants} renderStatus={renderStatus} renderActions={renderActions} emptyMessage="No tenants added yet." />
                  </div>
                </section>
              </>
            )}

            {activePage === "Payments" && (
              <>
                <div className="stats-grid compact-stats">
                  <Stat label="Total Payments" value={payments.length} detail="All payment records" icon={CreditCard} tone="blue" />
                  <Stat label="Amount Collected" value={money(collectedAmount)} detail="Successfully paid" icon={Wallet} tone="green" />
                  <Stat label="Pending Amount" value={money(pendingAmount)} detail="Awaiting payment" icon={Clock3} tone="orange" />
                  <Stat label="Paid Records" value={payments.filter((item) => item.status === "Paid").length} detail="Completed payments" icon={CircleCheck} tone="purple" />
                </div>

                <section className="panel data-panel">
                  <div className="table-toolbar">
                    <div><h3>All Payments</h3><p>{filteredPayments.length} payment records</p></div>
                    <TableFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} statuses={["All", "Paid", "Pending"]} placeholder="Search payments..." />
                  </div>
                  <div className="table-scroll">
                    <PaymentTable payments={filteredPayments} renderStatus={renderStatus} renderActions={renderActions} />
                  </div>
                </section>
              </>
            )}

            <footer className="page-footer">
              <span>© {new Date().getFullYear()} SmartStay</span>
              <span>Property management made simple</span>
            </footer>
          </div>
        </main>
      </div>

      {notification && (
        <div className="toast-message">
          <CheckCircle2 size={18} />{notification}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <section className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <h2>
                  {editingItem ? "Edit" : "Add"}{" "}
                  {(editingItem?.type || activePage) === "Rooms"
                    ? "Room"
                    : (editingItem?.type || activePage) === "Tenants"
                    ? "Tenant"
                    : "Payment"}
                </h2>
                <p>Enter the details below to continue.</p>
              </div>
              <button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>

            <form className="modal-form" onSubmit={saveItem}>
              {(editingItem?.type || activePage) === "Rooms" && (
                <>
                  <label className="field"><span>Room name</span><input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Room 201" required /></label>
                  <div className="form-two-columns">
                    <label className="field"><span>Room type</span><select value={formData.type || "Single"} onChange={(e) => setFormData({ ...formData, type: e.target.value })}><option>Single</option><option>Double</option><option>Triple</option><option>Shared</option></select></label>
                    <label className="field"><span>Monthly rent (₹)</span><input type="number" min="0" value={formData.rent ?? ""} onChange={(e) => setFormData({ ...formData, rent: e.target.value })} required /></label>
                  </div>
                  <div className="form-two-columns">
                    <label className="field"><span>Floor</span><select value={formData.floor || "Ground Floor"} onChange={(e) => setFormData({ ...formData, floor: e.target.value })}><option>Ground Floor</option><option>First Floor</option><option>Second Floor</option><option>Third Floor</option></select></label>
                    <label className="field"><span>Status</span><select value={formData.status || "Available"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option>Available</option><option>Occupied</option></select></label>
                  </div>
                </>
              )}

              {(editingItem?.type || activePage) === "Tenants" && (
                <>
                  <label className="field"><span>Full name</span><input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></label>
                  <label className="field"><span>Email address</span><input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></label>
                  <div className="form-two-columns">
                    <label className="field"><span>Phone number</span><input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></label>
                    <label className="field"><span>Room</span><select value={formData.room || ""} onChange={(e) => setFormData({ ...formData, room: e.target.value })} required><option value="">Select room</option>{rooms.map((room) => <option key={room.id} value={room.name}>{room.name}</option>)}</select></label>
                  </div>
                  <div className="form-two-columns">
                    <label className="field"><span>Joining date</span><input type="date" value={formData.joined || today()} onChange={(e) => setFormData({ ...formData, joined: e.target.value })} required /></label>
                    <label className="field"><span>Status</span><select value={formData.status || "Active"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
                  </div>
                </>
              )}

              {(editingItem?.type || activePage) === "Payments" && (
                <>
                  <label className="field"><span>Tenant</span><select value={formData.tenant || ""} onChange={(e) => {
                    const tenant = tenants.find((item) => item.name === e.target.value);
                    const room = rooms.find((item) => item.name === tenant?.room);
                    setFormData({ ...formData, tenant: e.target.value, room: tenant?.room || "", amount: room?.rent ?? formData.amount ?? "" });
                  }} required><option value="">Select tenant</option>{tenants.map((tenant) => <option key={tenant.id} value={tenant.name}>{tenant.name}</option>)}</select></label>
                  <div className="form-two-columns">
                    <label className="field"><span>Room</span><select value={formData.room || ""} onChange={(e) => setFormData({ ...formData, room: e.target.value })} required><option value="">Select room</option>{rooms.map((room) => <option key={room.id} value={room.name}>{room.name}</option>)}</select></label>
                    <label className="field"><span>Amount (₹)</span><input type="number" min="0" value={formData.amount ?? ""} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></label>
                  </div>
                  <div className="form-two-columns">
                    <label className="field"><span>Payment date</span><input type="date" value={formData.date || today()} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></label>
                    <label className="field"><span>Payment method</span><select value={formData.method || "UPI"} onChange={(e) => setFormData({ ...formData, method: e.target.value })}><option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Card</option></select></label>
                  </div>
                  <label className="field"><span>Payment status</span><select value={formData.status || "Pending"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option>Paid</option><option>Pending</option></select></label>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-button"><CheckCircle2 size={17} />{editingItem ? "Save changes" : "Save record"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = "blue", onClick }) {
  return (
    <button
      className={`stat-card ${onClick ? "stat-clickable" : ""}`}
      onClick={onClick}
      disabled={!onClick}
      type="button"
    >
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}><Icon size={21} /></span>
      </div>
      <strong className="stat-value">{value}</strong>
      <div className="stat-detail">{detail}</div>
    </button>
  );
}

function Quick({ icon: Icon, title, description, onClick, tone }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span className={`quick-icon ${tone}`}><Icon size={21} /></span>
      <span className="quick-copy"><strong>{title}</strong><small>{description}</small></span>
      <ChevronRight size={17} className="quick-chevron" />
    </button>
  );
}

function TableFilters({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, statuses, placeholder }) {
  return (
    <div className="table-filters">
      <label className="search-box">
        <Search size={17} />
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={placeholder} />
        {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search"><X size={15} /></button>}
      </label>
      <label className="filter-select">
        <Filter size={15} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
    </div>
  );
}

function TenantTable({ tenants, renderStatus, renderActions, emptyMessage }) {
  return (
    <table>
      <thead><tr><th>Tenant</th><th>Room</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {tenants.map((tenant) => (
          <tr key={tenant.id}>
            <td><div className="tenant-cell"><div className="tenant-avatar">{tenant.name.charAt(0).toUpperCase()}</div><div><strong>{tenant.name}</strong><small>{tenant.email}</small></div></div></td>
            <td>{tenant.room}</td><td>{tenant.phone}</td><td>{tenant.joined}</td>
            <td>{renderStatus(tenant.status)}</td><td>{renderActions("Tenants", tenant)}</td>
          </tr>
        ))}
        {tenants.length === 0 && <EmptyRow colSpan={6} message={emptyMessage || "No tenant records yet."} />}
      </tbody>
    </table>
  );
}

function PaymentTable({ payments, renderStatus, renderActions }) {
  return (
    <table>
      <thead><tr><th>Tenant</th><th>Room</th><th>Amount</th><th>Payment date</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td><strong>{payment.tenant}</strong></td><td>{payment.room}</td><td><strong>{money(payment.amount)}</strong></td><td>{payment.date}</td><td>{payment.method}</td>
            <td>{renderStatus(payment.status)}</td><td>{renderActions("Payments", payment)}</td>
          </tr>
        ))}
        {payments.length === 0 && <EmptyRow colSpan={7} message="No payment records yet." />}
      </tbody>
    </table>
  );
}

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="empty-state">
          <Search size={23} />
          <strong>{message}</strong>
          <span>Add a new record whenever you're ready.</span>
        </div>
      </td>
    </tr>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

:root{font-family:'DM Sans',sans-serif;color:#18233b;background:#f6f8fc;font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;--blue:#3559dc;--blue-dark:#2748c8}
*{box-sizing:border-box}body{margin:0}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:default}
.auth-layout{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.03fr) minmax(420px,.97fr);background:#fff}
.auth-visual{position:relative;min-height:100vh;overflow:hidden;padding:38px clamp(32px,5vw,76px);display:flex;flex-direction:column;color:#fff;background:linear-gradient(145deg,#142650,#213b79 60%,#294bb0)}
.auth-visual:before{content:'';position:absolute;width:520px;height:520px;border-radius:50%;border:1px solid #ffffff17;right:-240px;top:100px;box-shadow:0 0 0 45px #ffffff08,0 0 0 100px #ffffff05}
.auth-brand,.sidebar-brand{display:flex;align-items:center;gap:12px;position:relative;z-index:1}
.auth-brand{font:800 22px 'Manrope',sans-serif;letter-spacing:-.7px}
.brand-mark{width:43px;height:43px;border-radius:13px;background:#fff;color:#2e50cc;display:grid;place-items:center;flex-shrink:0}
.visual-content{position:relative;z-index:1;max-width:530px;margin:auto 0;padding:56px 0}
.eyebrow{color:#7b92f4;font-size:10px;font-weight:800;letter-spacing:2px}
.visual-content h1{font:800 clamp(34px,4.2vw,53px)/1.13 'Manrope',sans-serif;letter-spacing:-1.9px;margin:18px 0}
.visual-content>p{max-width:440px;font-size:15px;line-height:1.8;color:#c6d3f4}
.visual-preview{margin-top:38px;border:1px solid #ffffff28;background:#ffffff0d;border-radius:17px;padding:20px 22px;backdrop-filter:blur(10px);box-shadow:0 18px 50px #09173833}
.preview-top{display:flex;justify-content:space-between;color:#e8edff;font-size:12px;font-weight:600}
.preview-top svg{color:#9db0ff}
.preview-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:23px}
.preview-metrics>div{display:flex;flex-direction:column;gap:7px}
.preview-metrics span{color:#b5c5eb;font-size:11px}
.preview-metrics strong{font:800 26px 'Manrope',sans-serif}
.preview-bars{display:flex;align-items:center;justify-content:center;height:65px;margin-top:22px;color:#c6d3f4;font-size:11px;border-top:1px solid #ffffff1b}
.visual-bottom{display:flex;justify-content:space-between;gap:15px;position:relative;z-index:1;color:#c1cdeb;font-size:11px}
.auth-main{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:48px clamp(24px,5vw,82px);background:#fff}
.auth-card{width:100%;max-width:420px}
.auth-heading{margin-bottom:31px}
.heading-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:#edf1ff;color:#3559dc;margin-bottom:23px}
.auth-heading h2{font:800 30px 'Manrope',sans-serif;letter-spacing:-.9px;margin:0 0 9px;color:#18233b}
.auth-heading p{color:#7d899e;font-size:13px;line-height:1.6;margin:0}
.auth-error{padding:12px 14px;border-radius:9px;margin-bottom:18px;background:#fff0f0;color:#b72d3b;font-size:12px;line-height:1.5}
.auth-form{display:flex;flex-direction:column;gap:19px}
.field{display:flex;flex-direction:column;gap:9px;min-width:0}
.field>span{color:#35415a;font-size:12px;font-weight:700}
.input-wrap{display:flex;align-items:center;gap:10px;height:48px;padding:0 13px;border:1px solid #e3e8f0;border-radius:9px;color:#8a97ac;background:#fff;transition:border .2s,box-shadow .2s}
.input-wrap:focus-within{border-color:#6681ec;box-shadow:0 0 0 3px #3559dc12}
.input-wrap input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#18233b;font-size:12px}
.input-wrap input::placeholder{color:#a2adbd}
.password-toggle{display:grid;place-items:center;padding:4px;border:0;background:transparent;color:#8793a7}
.form-extra{display:flex;justify-content:space-between;align-items:center;margin-top:-4px}
.remember-label{display:flex;gap:6px;align-items:center;color:#7c899f;font-size:11px}
.remember-label svg{color:#3aaf83}
.primary-button{border:0;border-radius:9px;min-height:43px;padding:0 16px;display:inline-flex;justify-content:center;align-items:center;gap:9px;color:#fff;background:var(--blue);font-weight:700;font-size:12px;transition:background .18s}
.primary-button:hover{background:var(--blue-dark)}
.auth-submit{width:100%;height:49px;margin-top:4px}
.auth-submit svg{margin-left:auto}
.auth-switch{text-align:center;margin-top:25px;color:#7c899f;font-size:12px}
.auth-switch button{border:0;padding:0;background:transparent;color:#3559dc;font-weight:700}
.auth-legal{color:#a2adbd;text-align:center;font-size:10px;margin-top:36px}
.auth-mobile-brand{display:none}
.app-shell{min-height:100vh;background:#f6f8fc}
.sidebar{width:250px;position:fixed;inset:0 auto 0 0;display:flex;flex-direction:column;background:#fff;border-right:1px solid #e9edf4;padding:25px 16px 15px;z-index:20}
.sidebar-brand{padding:0 6px 28px}
.sidebar-brand .brand-mark{width:39px;height:39px;border-radius:11px;background:#3559dc;color:#fff}
.brand-copy{display:flex;flex-direction:column;gap:3px}
.brand-copy strong{font:800 17px 'Manrope',sans-serif;letter-spacing:-.5px;color:#1b2946}
.brand-copy span{color:#8995a9;font-size:10px}
.sidebar-section-label{padding:10px 12px 12px;color:#a0aabc;font-size:9px;font-weight:800;letter-spacing:1.6px}
.side-nav{display:flex;flex-direction:column;gap:5px}
.nav-item{display:flex;align-items:center;gap:13px;height:46px;padding:0 13px;border:0;border-radius:9px;color:#7c899e;background:transparent;text-align:left;font-size:12px;font-weight:600;transition:.18s}
.nav-item:hover{color:#3559dc;background:#f5f7ff}
.nav-item.active{color:#3559dc;background:#edf1ff;font-weight:700}
.nav-active-dot{margin-left:auto;width:6px;height:6px;background:#3559dc;border-radius:50%}
.sidebar-bottom{margin-top:auto}
.sidebar-help{margin:0 3px 17px;padding:15px 13px;border-radius:11px;background:#f6f8ff;border:1px solid #edf0fa}
.help-icon{width:31px;height:31px;display:grid;place-items:center;border-radius:9px;color:#3559dc;background:#e5eaff;margin-bottom:10px}
.sidebar-help strong{font-size:11px}
.sidebar-help p{color:#8a96aa;font-size:10px;line-height:1.6;margin:5px 0 0}
.logout-button{width:100%;display:flex;gap:12px;align-items:center;padding:12px;border:0;background:transparent;color:#78869c;border-radius:8px;font-size:12px}
.logout-button:hover{color:#d84c59;background:#fff2f3}
.sidebar-profile{display:flex;align-items:center;gap:10px;padding:15px 4px 2px;margin-top:5px;border-top:1px solid #edf0f5}
.profile-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#e6ebff;color:#3559dc;font:800 13px 'Manrope',sans-serif;flex-shrink:0}
.profile-copy,.top-profile-copy{min-width:0;display:flex;flex-direction:column;gap:4px}
.profile-copy strong{font-size:11px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:155px}
.profile-copy span{font-size:9px;color:#8d99ad;overflow:hidden;text-overflow:ellipsis}
.main-area{min-height:100vh;margin-left:250px}
.topbar{height:73px;background:#fff;border-bottom:1px solid #e9edf4;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:0 34px}
.topbar-left,.topbar-right{display:flex;align-items:center;gap:19px}
.breadcrumb{display:flex;align-items:center;gap:10px;color:#a0aabd;font-size:11px}
.breadcrumb strong{color:#39465e;font-weight:700}
.topbar-right{gap:20px}
.today-label{display:flex;align-items:center;gap:8px;color:#7f8ca1;font-size:11px}
.notification-button{position:relative;width:36px;height:36px;display:grid;place-items:center;border:1px solid #edf0f5;background:#fff;color:#718098;border-radius:10px}
.top-profile{display:flex;align-items:center;gap:10px;border-left:1px solid #edf0f5;padding-left:18px}
.top-profile .profile-avatar{width:35px;height:35px}
.top-profile-copy strong{font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.top-profile-copy span{color:#8d99ad;font-size:10px}
.page-content{max-width:1500px;margin:0 auto;padding:31px 34px 20px}
.page-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:25px}
.page-eyebrow{color:#8c9be0;font-size:9px}
.page-heading h1{margin:7px 0;font:800 27px 'Manrope',sans-serif;letter-spacing:-.8px;color:#192744}
.page-heading p{color:#8490a5;margin:0;font-size:12px}
.add-button{min-height:42px;white-space:nowrap}
.welcome-banner{position:relative;display:flex;align-items:center;justify-content:space-between;min-height:188px;overflow:hidden;border-radius:14px;padding:26px 34px;color:#fff;background:linear-gradient(105deg,#263f91,#4267e3);box-shadow:0 10px 25px #3559dc17}
.welcome-banner:before{content:'';position:absolute;width:260px;height:260px;right:120px;top:-175px;border:1px solid #ffffff23;border-radius:50%;box-shadow:0 0 0 35px #ffffff09,0 0 0 70px #ffffff07}
.welcome-copy{position:relative;z-index:1}
.welcome-copy>span{color:#b8c6ff;font-size:9px;letter-spacing:1.6px;font-weight:800}
.welcome-copy h2{font:800 24px 'Manrope',sans-serif;margin:10px 0 7px;letter-spacing:-.6px}
.welcome-copy p{color:#d5ddff;font-size:11px;margin:0}
.welcome-link{display:flex;align-items:center;gap:7px;margin-top:17px;border:0;background:transparent;color:#fff;padding:0;font-size:11px;font-weight:700}
.welcome-illustration{position:relative;z-index:1;width:190px;height:135px;display:grid;place-items:center}
.illustration-circle{width:118px;height:118px;display:grid;place-items:center;color:#fff;border-radius:28px;background:#ffffff1b;border:1px solid #ffffff33;transform:rotate(-5deg)}
.illustration-chip{position:absolute;right:-2px;bottom:5px;padding:9px 12px;display:flex;gap:7px;align-items:center;background:#fff;color:#3a4e7e;border-radius:9px;font-size:9px;font-weight:700;box-shadow:0 5px 15px #172b5c25}
.illustration-chip svg{color:#31a77e}
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:22px 0}
.stat-card{min-width:0;border:1px solid #e9edf4;border-radius:12px;padding:19px 18px 17px;text-align:left;background:#fff;box-shadow:0 3px 12px #243a6505;color:inherit}
.stat-clickable{cursor:pointer;transition:transform .16s,box-shadow .16s}
.stat-clickable:hover{transform:translateY(-2px);box-shadow:0 7px 20px #243a6510}
.stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#7e8ba0;font-size:11px;font-weight:600}
.stat-icon{width:39px;height:39px;display:grid;place-items:center;border-radius:11px;flex-shrink:0}
.stat-icon.blue,.quick-icon.blue{color:#3559dc;background:#eaf0ff}
.stat-icon.purple,.quick-icon.purple{color:#8a5bd7;background:#f2eaff}
.stat-icon.green,.quick-icon.green{color:#209d76;background:#e4f8f0}
.stat-icon.orange,.quick-icon.orange{color:#db8b2b;background:#fff2df}
.stat-value{display:block;margin-top:17px;font:800 clamp(20px,1.9vw,27px) 'Manrope',sans-serif;color:#192744;letter-spacing:-.8px;overflow-wrap:anywhere}
.stat-detail{display:flex;align-items:center;gap:5px;margin-top:7px;color:#95a0b1;font-size:10px}
.dashboard-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;margin-bottom:20px}
.panel{min-width:0;background:#fff;border:1px solid #e9edf4;border-radius:12px;padding:22px;box-shadow:0 3px 12px #243a6504}
.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.panel-heading h3,.table-toolbar h3{margin:0;color:#23314d;font:800 14px 'Manrope',sans-serif;letter-spacing:-.2px}
.panel-heading p,.table-toolbar p{margin:6px 0 0;color:#96a0b0;font-size:10px}
.subtle-button{display:inline-flex;align-items:center;gap:3px;border:0;background:transparent;color:#3559dc;font-size:10px;font-weight:700;white-space:nowrap;padding:3px 0}
.occupancy-body{display:flex;align-items:center;justify-content:space-around;gap:22px;padding:27px 0 20px}
.donut{width:139px;height:139px;flex-shrink:0;border-radius:50%;display:grid;place-items:center}
.donut-inner{width:105px;height:105px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}
.donut-inner strong{font:800 24px 'Manrope',sans-serif;color:#22314d}
.donut-inner span{margin-top:3px;color:#8c98aa;font-size:10px}
.occupancy-legend{flex:1;display:flex;flex-direction:column;gap:16px;min-width:0}
.occupancy-legend>div{display:flex;align-items:center;gap:8px;color:#78869c;font-size:10px}
.occupancy-legend strong{margin-left:auto;color:#25334d;font-size:12px}
.legend-dot{width:8px;height:8px;border-radius:3px;flex-shrink:0}
.occupied-dot{background:#3559dc}.available-dot{background:#e1e7f3}
.occupancy-legend .occupancy-total{border-top:1px solid #edf0f5;padding-top:13px;margin-top:1px}
.occupancy-progress{border-top:1px solid #edf0f5;padding-top:15px}
.occupancy-progress>div:first-child{display:flex;justify-content:space-between;color:#8793a6;font-size:10px;margin-bottom:9px}
.occupancy-progress strong{color:#3559dc}
.progress-track{height:6px;background:#edf0f7;border-radius:20px;overflow:hidden}
.progress-track>div{height:100%;background:#3559dc;border-radius:20px;transition:width .25s}
.quick-actions{margin-top:15px;display:flex;flex-direction:column}
.quick-action{display:flex;align-items:center;gap:12px;padding:15px 0;text-align:left;background:transparent;border:0;border-bottom:1px solid #eff2f7}
.quick-action:last-child{border-bottom:0}
.quick-icon{width:39px;height:39px;display:grid;place-items:center;border-radius:11px;flex-shrink:0}
.quick-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.quick-copy strong{color:#35415a;font-size:11px}.quick-copy small{color:#95a0b1;font-size:10px}.quick-chevron{color:#9ba6b7}
.recent-panel{margin-bottom:19px;padding-bottom:8px}
.recent-panel>.panel-heading{padding-bottom:18px}
.table-scroll{overflow-x:auto;width:100%}
table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
thead{background:#f8f9fc}
th{padding:12px 14px;color:#8995a8;font-size:9px;font-weight:700}
td{padding:13px 14px;border-bottom:1px solid #f0f2f7;color:#748198;font-size:10px}
tbody tr:last-child td{border-bottom:0}
td strong{color:#34415a;font-size:10px;font-weight:700}
td small{display:block;margin-top:5px;color:#99a4b5;font-size:9px}
.tenant-cell{display:flex;align-items:center;gap:9px}
.tenant-avatar{width:32px;height:32px;flex-shrink:0;border-radius:10px;display:grid;place-items:center;color:#3559dc;background:#eaf0ff;font-weight:800;font-size:11px}
.tenant-cell>div:last-child{display:flex;flex-direction:column;gap:4px}
.tenant-cell small{margin:0}
.status-pill{display:inline-flex;align-items:center;gap:6px;border-radius:30px;padding:6px 9px;font-size:9px;font-weight:700}
.status-pill .status-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.status-pill.occupied,.status-pill.active,.status-pill.paid{color:#1b9a70;background:#e5f8f0}
.status-pill.available{color:#3559dc;background:#edf1ff}
.status-pill.pending{color:#c8872c;background:#fff3df}
.status-pill.inactive{color:#8490a4;background:#eff2f6}
.row-actions{display:flex;align-items:center;gap:5px}
.icon-button{width:30px;height:30px;display:inline-grid;place-items:center;border:1px solid #e9edf4;border-radius:8px;color:#7f8ba0;background:#fff}
.icon-button:hover{color:#3559dc;background:#f2f5ff;border-color:#dfe6ff}
.icon-button.danger:hover{color:#d64a59;background:#fff0f2;border-color:#ffdee2}
.compact-stats{margin-top:0}
.data-panel{padding:0;overflow:hidden}
.table-toolbar{padding:22px;display:flex;justify-content:space-between;align-items:center;gap:18px;border-bottom:1px solid #edf0f5}
.table-filters{display:flex;align-items:center;gap:9px}
.search-box{display:flex;align-items:center;gap:8px;width:210px;height:37px;padding:0 11px;border:1px solid #e7ebf3;border-radius:8px;color:#96a2b4;background:#fff}
.search-box input{border:0;outline:0;width:100%;min-width:0;color:#35415a;font-size:10px;background:transparent}
.search-box input::placeholder{color:#a2adbd}
.search-box button{display:grid;place-items:center;border:0;padding:0;color:#8d99ad;background:transparent}
.filter-select{display:flex;align-items:center;gap:5px;height:37px;padding:0 9px;border:1px solid #e7ebf3;border-radius:8px;color:#96a2b4}
.filter-select select{max-width:105px;border:0;outline:0;background:#fff;color:#67758b;font-size:10px}
.empty-state{min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#9aa5b6;white-space:normal;text-align:center}
.empty-state strong{color:#68768c;font-size:12px}.empty-state span{font-size:10px}
.page-footer{display:flex;justify-content:space-between;gap:15px;padding:22px 2px 8px;color:#a0aabc;font-size:10px}
.toast-message{position:fixed;right:24px;bottom:24px;z-index:100;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:14px 18px;border-radius:11px;background:#18315f;color:#fff;font-size:12px;box-shadow:0 12px 30px #17264a2b}
.toast-message svg{color:#78e0b4;flex-shrink:0}
.modal-backdrop{position:fixed;inset:0;z-index:80;background:#13203c80;backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}
.modal-card{width:100%;max-width:540px;max-height:calc(100vh - 40px);overflow-y:auto;border-radius:15px;background:#fff;box-shadow:0 25px 80px #0c183b30}
.modal-heading{display:flex;align-items:flex-start;justify-content:space-between;padding:23px 25px;border-bottom:1px solid #edf0f5}
.modal-heading h2{margin:0;color:#1d2a46;font:800 19px 'Manrope',sans-serif}
.modal-heading p{margin:6px 0 0;color:#8b97aa;font-size:11px}
.modal-form{padding:23px 25px 25px;display:flex;flex-direction:column;gap:17px}
.modal-form .field input,.modal-form .field select{width:100%;min-width:0;height:43px;padding:0 12px;border:1px solid #e3e8f0;border-radius:8px;outline:0;color:#35415a;background:#fff;font-size:11px}
.modal-form .field input:focus,.modal-form .field select:focus{border-color:#6681ec;box-shadow:0 0 0 3px #3559dc12}
.form-two-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.modal-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:8px}
.secondary-button{min-height:42px;padding:0 17px;border:1px solid #e3e8f0;border-radius:9px;color:#68768c;background:#fff;font-size:12px;font-weight:700}
.mobile-menu-button,.mobile-close,.mobile-overlay{display:none}
@media(max-width:1150px){.sidebar{width:220px}.main-area{margin-left:220px}.topbar{padding:0 23px}.page-content{padding:26px 23px 20px}.stats-grid{gap:11px}.stat-card{padding:15px 13px}.stat-top{font-size:10px}.stat-icon{width:34px;height:34px}.panel{padding:18px}.data-panel{padding:0}.occupancy-body{gap:12px}.donut{width:115px;height:115px}.donut-inner{width:87px;height:87px}.donut-inner strong{font-size:21px}.table-toolbar{flex-wrap:wrap}}
@media(max-width:850px){.auth-layout{grid-template-columns:1fr}.auth-visual{display:none}.auth-main{min-height:100vh;padding:30px 25px}.auth-mobile-brand{display:flex;align-items:center;gap:10px;margin-bottom:45px;font:800 20px 'Manrope',sans-serif;color:#1b2946}.auth-mobile-brand .brand-mark{background:#3559dc;color:#fff;width:39px;height:39px}.auth-card{max-width:430px}.sidebar{transform:translateX(-100%);transition:transform .25s ease;box-shadow:none}.sidebar.sidebar-open{transform:translateX(0);box-shadow:12px 0 40px #17264a20}.mobile-overlay{display:block;position:fixed;inset:0;z-index:19;border:0;background:#14234470}.mobile-close{display:grid;place-items:center;margin-left:auto;border:0;color:#738099;background:transparent}.main-area{margin-left:0}.mobile-menu-button{display:grid;place-items:center;border:0;background:transparent;color:#56657d;padding:4px}.topbar{height:65px;padding:0 20px}.topbar-left{gap:12px}.top-profile-copy{display:none}.top-profile{padding-left:13px}.page-content{padding:24px 20px}}
@media(max-width:650px){.today-label{display:none}.topbar-right{gap:12px}.page-heading{align-items:flex-start}.page-heading h1{font-size:24px}.page-heading p{max-width:270px;line-height:1.6}.add-button{min-height:39px;padding:0 11px;font-size:10px}.welcome-banner{min-height:170px;padding:23px 20px}.welcome-copy h2{font-size:20px}.welcome-illustration{width:95px}.illustration-circle{width:78px;height:78px;border-radius:22px}.illustration-circle svg{width:48px}.illustration-chip{right:-8px;font-size:8px;padding:7px 8px}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.stat-card{padding:15px 13px}.stat-value{font-size:22px;margin-top:12px}.stat-detail{font-size:9px}.dashboard-grid{grid-template-columns:1fr;gap:14px}.occupancy-body{justify-content:space-evenly}.panel{padding:17px}.data-panel{padding:0}.table-toolbar{padding:17px;align-items:flex-start}.table-filters{width:100%}.search-box{flex:1;width:auto}.filter-select{flex-shrink:0}.table-scroll table{min-width:680px}.page-footer{font-size:9px}}
@media(max-width:420px){.auth-main{padding:24px 20px}.auth-heading h2{font-size:27px}.page-content{padding:20px 13px}.topbar{padding:0 13px}.breadcrumb{gap:6px;font-size:10px}.notification-button{width:33px;height:33px}.page-heading{gap:8px}.page-heading h1{font-size:21px}.page-heading p{font-size:10px}.add-button{gap:5px;padding:0 8px}.welcome-illustration{display:none}.welcome-banner{padding:23px 18px}.stat-top{align-items:flex-start}.stat-icon{width:31px;height:31px}.stat-value{font-size:20px}.occupancy-body{gap:12px}.donut{width:108px;height:108px}.donut-inner{width:82px;height:82px}.donut-inner strong{font-size:19px}.occupancy-legend>div{font-size:9px;gap:6px}.form-two-columns{grid-template-columns:1fr}.modal-heading,.modal-form{padding-left:18px;padding-right:18px}}
`;

export default App;
