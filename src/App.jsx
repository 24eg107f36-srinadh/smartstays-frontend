
import { useEffect, useState } from 'react'
import {
  BedDouble,
  Users,
  Wallet,
  LayoutDashboard,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Home,
  ShieldCheck,
  Menu,
  X,
  LockKeyhole,
} from 'lucide-react'
import api from './api'

const emptyRoom = {
  roomNumber: '',
  beds: 1,
  occupiedBeds: 0,
  monthlyRent: 5000,
}

const emptyTenant = {
  fullName: '',
  phone: '',
  email: '',
  roomNumber: '',
}

const emptyPayment = {
  tenantName: '',
  amount: '',
  paidOn: new Date().toISOString().slice(0, 10),
  monthLabel: new Date().toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  }),
}

// Sample data is displayed only when no owner is signed in.
// It is not fetched from the private database.
const demoData = {
  rooms: [
    {
      id: 'demo-room-1',
      roomNumber: '101',
      beds: 4,
      occupiedBeds: 3,
      monthlyRent: 5000,
    },
    {
      id: 'demo-room-2',
      roomNumber: '102',
      beds: 3,
      occupiedBeds: 2,
      monthlyRent: 4500,
    },
    {
      id: 'demo-room-3',
      roomNumber: '103',
      beds: 2,
      occupiedBeds: 1,
      monthlyRent: 4000,
    },
  ],
  tenants: [
    {
      id: 'demo-tenant-1',
      fullName: 'Demo Tenant',
      phone: '0000000000',
      email: 'demo@example.com',
      roomNumber: '101',
    },
    {
      id: 'demo-tenant-2',
      fullName: 'Sample Resident',
      phone: '0000000001',
      email: 'resident@example.com',
      roomNumber: '102',
    },
  ],
  payments: [
    {
      id: 'demo-payment-1',
      tenantName: 'Demo Tenant',
      amount: 5000,
      paidOn: new Date().toISOString().slice(0, 10),
      monthLabel: new Date().toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric',
      }),
    },
  ],
  dashboard: {
    rooms: 3,
    beds: 9,
    tenants: 6,
    occupiedBeds: 6,
    availableBeds: 3,
    rentCollected: 25000,
    paymentsRecorded: 5,
  },
}

const emptyData = {
  rooms: [],
  tenants: [],
  payments: [],
  dashboard: {},
}

const configs = {
  Rooms: {
    key: 'rooms',
    label: 'Room',
    fields: [
      ['roomNumber', 'Room number', 'text'],
      ['beds', 'Total beds', 'number'],
      ['occupiedBeds', 'Occupied beds', 'number'],
      ['monthlyRent', 'Monthly rent (₹)', 'number'],
    ],
    empty: emptyRoom,
  },
  Tenants: {
    key: 'tenants',
    label: 'Tenant',
    fields: [
      ['fullName', 'Full name', 'text'],
      ['phone', 'Phone', 'tel'],
      ['email', 'Email', 'email'],
      ['roomNumber', 'Room number (optional)', 'text'],
    ],
    empty: emptyTenant,
  },
  Payments: {
    key: 'payments',
    label: 'Payment',
    fields: [
      ['tenantName', 'Tenant name', 'text'],
      ['amount', 'Amount (₹)', 'number'],
      ['paidOn', 'Payment date', 'date'],
      ['monthLabel', 'For month', 'text'],
    ],
    empty: emptyPayment,
  },
}

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem('smartstay_token')
  )

  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState('owner')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState('Dashboard')
  const [data, setData] = useState(
    () =>
      localStorage.getItem('smartstay_token')
        ? emptyData
        : demoData
  )
  const [modal, setModal] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const demoMode = !token

  async function loadAll() {
    try {
      const [r, t, p, d] = await Promise.all([
        api.get('/rooms'),
        api.get('/tenants'),
        api.get('/payments'),
        api.get('/dashboard'),
      ])

      setData({
        rooms: r.data,
        tenants: t.data,
        payments: p.data,
        dashboard: d.data,
      })

      setError('')
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        logout()
      } else {
        setError(
          'Could not load live data. Check the backend and database connection.'
        )
      }
    }
  }

  useEffect(() => {
    if (token) {
      loadAll()
    } else {
      setData(demoData)
    }
  }, [token])

  async function login(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      const endpoint = isRegister
        ? '/auth/register'
        : '/auth/login'

      const res = await api.post(endpoint, {
        username,
        password,
      })

      if (!res.data?.token) {
        throw new Error('The server did not return an authentication token.')
      }

      localStorage.setItem('smartstay_token', res.data.token)
      setToken(res.data.token)
      setShowLogin(false)
      setPassword('')
      setPage('Dashboard')
      setError('')
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        e.message

      setError(
        msg ||
          (isRegister
            ? 'Registration failed. Try another username.'
            : 'Login failed. Check your username and password.')
      )
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    localStorage.removeItem('smartstay_token')
    setToken(null)
    setPassword('')
    setShowLogin(false)
    setModal('')
    setEditing(null)
    setPage('Dashboard')
    setData(demoData)
    setError('')
  }

  function openForm(section, item = null) {
    if (demoMode) {
      setError('Please sign in as the owner to manage records.')
      return
    }

    setPage(section)
    setEditing(item)
    setForm(
      item
        ? { ...item }
        : { ...configs[section].empty }
    )
    setModal(section)
    setError('')
  }

  async function save(e) {
    e.preventDefault()

    if (demoMode) {
      setError('Owner authentication is required to save records.')
      return
    }

    const c = configs[modal]
    if (!c) return

    setBusy(true)
    setError('')

    try {
      const payload = { ...form }

      for (const field of c.fields) {
        if (field[2] === 'number') {
          payload[field[0]] = Number(payload[field[0]])
        }
      }

      if (editing) {
        await api.put(`/${c.key}/${editing.id}`, payload)
      } else {
        await api.post(`/${c.key}`, payload)
      }

      setModal('')
      setEditing(null)
      await loadAll()
    } catch (e) {
      setError(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          'Save failed. Check the required fields and server connection.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove(section, item) {
    if (demoMode) {
      setError('Owner authentication is required to delete records.')
      return
    }

    if (
      !window.confirm(
        `Delete this ${section.toLowerCase().slice(0, -1)}?`
      )
    ) {
      return
    }

    try {
      await api.delete(`/${configs[section].key}/${item.id}`)
      await loadAll()
    } catch {
      setError('Delete failed. Please try again.')
    }
  }

  const nav = [
    ['Dashboard', LayoutDashboard],
    ['Rooms', BedDouble],
    ['Tenants', Users],
    ['Payments', Wallet],
  ]

  const d = data.dashboard || {}

  const list =
    page === 'Rooms'
      ? data.rooms
      : page === 'Tenants'
        ? data.tenants
        : data.payments

  const cfg = configs[page]

  // The login form is optional. It is never the initial landing screen.
  if (showLogin && demoMode) {
    return (
      <main className="login-page">
        <div className="login-art">
          <div className="brand">
            <span className="brand-icon">
              <Home size={24} />
            </span>
            SmartStay
          </div>

          <div className="art-copy">
            <span className="eyebrow">
              HOSTEL MANAGEMENT, SIMPLIFIED
            </span>

            <h1>
              Your hostel.
              <br />
              <em>Under control.</em>
            </h1>

            <p>
              One clear space to manage rooms, residents and rent.
            </p>

            <div className="art-stats">
              <div>
                <b>01</b>
                <span>Simple dashboard</span>
              </div>
              <div>
                <b>02</b>
                <span>Easy room tracking</span>
              </div>
              <div>
                <b>03</b>
                <span>Clear rent records</span>
              </div>
            </div>
          </div>

          <div className="art-footer">
            SMARTER HOSTEL OPERATIONS · OWNER PORTAL
          </div>
        </div>

        <div className="login-side">
          <form className="login-card" onSubmit={login}>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setShowLogin(false)
                setError('')
              }}
            >
              ← Back to public dashboard
            </button>

            <div className="mobile-brand">
              <Home /> SmartStay
            </div>

            <div className="login-symbol">
              <ShieldCheck size={27} />
            </div>

            <span className="eyebrow">
              {isRegister ? 'CREATE YOUR ACCOUNT' : 'OWNER ACCESS'}
            </span>

            <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>

            <p className="muted">
              {isRegister
                ? 'Register to create your SmartStay account.'
                : 'Sign in to manage your hostel records.'}
            </p>

            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={80}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                isRegister ? 'new-password' : 'current-password'
              }
              minLength={isRegister ? 8 : 1}
              maxLength={72}
              required
            />

            <button className="primary full" disabled={busy}>
              {busy
                ? 'Please wait…'
                : isRegister
                  ? 'Create account'
                  : 'Sign in to dashboard'}
              <span> →</span>
            </button>

            {error && <p className="error">{error}</p>}

            <p className="secure-note">
              <ShieldCheck size={15} />
              Protected owner access
            </p>

            <p className="muted auth-switch">
              {isRegister
                ? 'Already have an account?'
                : 'New to SmartStay?'}{' '}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                  setPassword('')
                }}
              >
                {isRegister ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </form>

          <div className="login-bottom">
            SmartStay · Hostel Management System
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'show' : ''}`}>
        <div className="brand">
          <span className="brand-icon">
            <Home size={23} />
          </span>

          <span>
            SmartStay
            <small>
              {demoMode ? 'PUBLIC DEMO' : 'HOSTEL OWNER'}
            </small>
          </span>

          <button
            className="mobile-close"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        {nav.map(([label, Icon]) => (
          <button
            key={label}
            onClick={() => {
              setPage(label)
              setMobileNav(false)
              setError('')
            }}
            className={`nav-item ${page === label ? 'active' : ''}`}
          >
            <Icon size={19} />
            {label}

            {label === 'Rooms' && (
              <span className="nav-count">{d.rooms ?? 0}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          {demoMode ? (
            <>
              <div className="owner-chip">
                <div className="avatar">D</div>
                <div>
                  <b>Demo visitor</b>
                  <small>Read-only access</small>
                </div>
                <span className="online-dot" />
              </div>

              <button
                className="nav-item"
                onClick={() => {
                  setShowLogin(true)
                  setIsRegister(false)
                  setError('')
                }}
              >
                <LockKeyhole size={18} />
                Owner sign in
              </button>
            </>
          ) : (
            <>
              <div className="owner-chip">
                <div className="avatar">O</div>
                <div>
                  <b>Hostel Owner</b>
                  <small>Administrator</small>
                </div>
                <span className="online-dot" />
              </div>

              <button
                className="nav-item logout"
                onClick={logout}
              >
                <LogOut size={18} />
                Log out
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <b>{page}</b>
          </div>

          <div className="top-right">
            <span className="status-dot" />
            <span>{demoMode ? 'Demo mode' : 'Owner access'}</span>
            <div className="avatar small-avatar">
              {demoMode ? 'D' : 'O'}
            </div>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <span className="eyebrow">HOSTEL OVERVIEW</span>

              <h1>
                {page === 'Dashboard'
                  ? 'Good evening, ' + (demoMode ? 'Visitor' : 'Owner')
                  : page}
              </h1>

              <p>
                {page === 'Dashboard'
                  ? 'Here’s what’s happening at your hostel today.'
                  : `Manage your ${page.toLowerCase()} in one place.`}
              </p>
            </div>

            {cfg && !demoMode && (
              <button
                className="primary"
                onClick={() => openForm(page)}
              >
                <Plus size={18} /> Add {cfg.label}
              </button>
            )}
          </div>

          {demoMode && (
            <div className="alert">
              You are viewing sample data in public demo mode.
              Sign in as the owner to manage real records.
              <button
                onClick={() => {
                  setShowLogin(true)
                  setIsRegister(false)
                }}
              >
                Owner sign in
              </button>
            </div>
          )}

          {error && (
            <div className="alert">
              {error}
              <button onClick={() => setError('')}>Dismiss</button>
            </div>
          )}

          {page === 'Dashboard' ? (
            <>
              <div className="stats-grid">
                <Stat
                  icon={BedDouble}
                  label="Total rooms"
                  value={d.rooms ?? 0}
                  hint={`${d.beds ?? 0} total beds`}
                  color="blue"
                />

                <Stat
                  icon={Users}
                  label="Registered tenants"
                  value={d.tenants ?? 0}
                  hint="Current records"
                  color="purple"
                />

                <Stat
                  icon={BedDouble}
                  label="Available beds"
                  value={d.availableBeds ?? 0}
                  hint={`${d.occupiedBeds ?? 0} beds occupied`}
                  color="green"
                />

                <Stat
                  icon={Wallet}
                  label="Rent recorded"
                  value={`₹${Number(
                    d.rentCollected || 0
                  ).toLocaleString('en-IN')}`}
                  hint={`${d.paymentsRecorded ?? 0} payments`}
                  color="orange"
                />
              </div>

              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Room occupancy</h3>
                      <p>Current bed availability</p>
                    </div>
                    <BedDouble size={20} />
                  </div>

                  <div className="occupancy-number">
                    {d.occupiedBeds ?? 0}
                    <span> / {d.beds ?? 0} beds occupied</span>
                  </div>

                  <div className="progress">
                    <span
                      style={{
                        width: `${
                          d.beds
                            ? Math.min(
                                100,
                                (d.occupiedBeds / d.beds) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="progress-labels">
                    <span>Occupancy</span>
                    <b>
                      {d.beds
                        ? Math.round(
                            (d.occupiedBeds / d.beds) * 100
                          )
                        : 0}
                      %
                    </b>
                  </div>

                  <div className="mini-stats">
                    <div>
                      <span className="legend blue-legend" />
                      Occupied <b>{d.occupiedBeds ?? 0}</b>
                    </div>
                    <div>
                      <span className="legend green-legend" />
                      Available <b>{d.availableBeds ?? 0}</b>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Quick actions</h3>
                      <p>Common management tasks</p>
                    </div>
                    <span className="quick-spark">✦</span>
                  </div>

                  {demoMode ? (
                    <p className="muted">
                      Sign in as the owner to add rooms, register
                      tenants, or record rent payments.
                    </p>
                  ) : (
                    <>
                      <Quick
                        icon={BedDouble}
                        title="Add a room"
                        desc="Create a room record"
                        click={() => openForm('Rooms')}
                      />

                      <Quick
                        icon={Users}
                        title="Register a tenant"
                        desc="Add a new resident"
                        click={() => openForm('Tenants')}
                      />

                      <Quick
                        icon={Wallet}
                        title="Record rent payment"
                        desc="Save a payment entry"
                        click={() => openForm('Payments')}
                      />
                    </>
                  )}
                </section>
              </div>

              <section className="panel recent-panel">
                <div className="panel-head">
                  <div>
                    <h3>Recently registered tenants</h3>
                    <p>
                      {demoMode
                        ? 'Example tenant records'
                        : 'Your latest tenant records'}
                    </p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => setPage('Tenants')}
                  >
                    View all →
                  </button>
                </div>

                <Table
                  rows={data.tenants.slice(-5).reverse()}
                  columns={[
                    ['fullName', 'Tenant'],
                    ['phone', 'Phone'],
                    ['roomNumber', 'Room'],
                    ['email', 'Email'],
                  ]}
                  empty="No tenants yet."
                />
              </section>
            </>
          ) : (
            <section className="panel list-panel">
              <div className="panel-head">
                <div>
                  <h3>All {page.toLowerCase()}</h3>
                  <p>
                    {list.length} record
                    {list.length === 1 ? '' : 's'} in this view
                  </p>
                </div>
              </div>

              <Table
                rows={[...list].reverse()}
                columns={
                  page === 'Rooms'
                    ? [
                        ['roomNumber', 'Room'],
                        ['beds', 'Total beds'],
                        ['occupiedBeds', 'Occupied'],
                        ['monthlyRent', 'Monthly rent'],
                      ]
                    : page === 'Tenants'
                      ? [
                          ['fullName', 'Tenant'],
                          ['phone', 'Phone'],
                          ['email', 'Email'],
                          ['roomNumber', 'Room'],
                        ]
                      : [
                          ['tenantName', 'Tenant'],
                          ['amount', 'Amount'],
                          ['paidOn', 'Paid on'],
                          ['monthLabel', 'For month'],
                        ]
                }
                actions={
                  !demoMode
                    ? (item) => (
                        <div className="row-actions">
                          {page !== 'Payments' && (
                            <button
                              title="Edit"
                              onClick={() => openForm(page, item)}
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          <button
                            title="Delete"
                            onClick={() => remove(page, item)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )
                    : undefined
                }
                empty={`No ${page.toLowerCase()} found.`}
              />
            </section>
          )}

          <footer className="footer">
            © {new Date().getFullYear()} SmartStay
            <span>Made for simpler hostel management</span>
          </footer>
        </div>
      </main>

      {modal && cfg && !demoMode && (
        <div
          className="modal-backdrop"
          onClick={() => setModal('')}
        >
          <form
            className="modal"
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-x"
              onClick={() => setModal('')}
            >
              ×
            </button>

            <span className="eyebrow">
              {editing ? 'UPDATE RECORD' : 'NEW RECORD'}
            </span>

            <h2>
              {editing ? 'Edit' : 'Add'} {cfg.label.toLowerCase()}
            </h2>

            <p className="muted">
              Enter the details below and save your changes.
            </p>

            {cfg.fields.map(([key, label, type]) => (
              <label key={key} className="field-label">
                {label}
                <input
                  type={type}
                  min={type === 'number' ? 0 : undefined}
                  required={!['email', 'roomNumber'].includes(key)}
                  value={form[key] ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
                />
              </label>
            ))}

            {error && <p className="error">{error}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal('')}
              >
                Cancel
              </button>

              <button className="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save record'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value, hint, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={21} />
      </div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  )
}

function Quick({ icon: Icon, title, desc, click }) {
  return (
    <button className="quick-action" onClick={click}>
      <span className="quick-icon">
        <Icon size={19} />
      </span>
      <span className="quick-copy">
        <b>{title}</b>
        <small>{desc}</small>
      </span>
      <span className="quick-arrow">↗</span>
    </button>
  )
}

function Table({ rows, columns, actions, empty }) {
  return (
    <div className="table-wrap">
      {rows.length === 0 ? (
        <div className="empty-state">
          <span>✦</span>
          <b>Nothing here yet</b>
          <p>{empty}</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map(([key]) => (
                  <td key={key}>
                    {key === 'monthlyRent' || key === 'amount'
                      ? `₹${Number(
                          row[key] || 0
                        ).toLocaleString('en-IN')}`
                      : row[key] || '—'}
                  </td>
                ))}

                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
