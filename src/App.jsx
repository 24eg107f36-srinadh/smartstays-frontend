
import { useState } from 'react'
import {
  BedDouble,
  Users,
  Wallet,
  LayoutDashboard,
  Plus,
  Trash2,
  Pencil,
  Home,
  Menu,
  X,
} from 'lucide-react'

const today = new Date().toISOString().slice(0, 10)

const initialRooms = [
  { id: 1, roomNumber: '101', beds: 4, occupiedBeds: 3, monthlyRent: 5000 },
  { id: 2, roomNumber: '102', beds: 3, occupiedBeds: 2, monthlyRent: 4500 },
  { id: 3, roomNumber: '103', beds: 2, occupiedBeds: 1, monthlyRent: 4000 },
]

const initialTenants = [
  { id: 1, fullName: 'Rahul Kumar', phone: '9876543210', email: 'rahul@example.com', roomNumber: '101' },
  { id: 2, fullName: 'Arjun Reddy', phone: '9876543211', email: 'arjun@example.com', roomNumber: '102' },
  { id: 3, fullName: 'Priya Sharma', phone: '9876543212', email: 'priya@example.com', roomNumber: '103' },
]

const initialPayments = [
  { id: 1, tenantName: 'Rahul Kumar', amount: 5000, paidOn: today, monthLabel: 'Current month' },
  { id: 2, tenantName: 'Arjun Reddy', amount: 4500, paidOn: today, monthLabel: 'Current month' },
]

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
  paidOn: today,
  monthLabel: '',
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
      ['roomNumber', 'Room number', 'text'],
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
  const [page, setPage] = useState('Dashboard')
  const [data, setData] = useState({
    rooms: initialRooms,
    tenants: initialTenants,
    payments: initialPayments,
  })
  const [modal, setModal] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [mobileNav, setMobileNav] = useState(false)

  const nav = [
    ['Dashboard', LayoutDashboard],
    ['Rooms', BedDouble],
    ['Tenants', Users],
    ['Payments', Wallet],
  ]

  const rooms = data.rooms
  const tenants = data.tenants
  const payments = data.payments

  const totalBeds = rooms.reduce((sum, room) => sum + Number(room.beds || 0), 0)
  const occupiedBeds = rooms.reduce(
    (sum, room) => sum + Number(room.occupiedBeds || 0),
    0
  )
  const availableBeds = Math.max(0, totalBeds - occupiedBeds)
  const rentCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  )

  const d = {
    rooms: rooms.length,
    beds: totalBeds,
    tenants: tenants.length,
    occupiedBeds,
    availableBeds,
    rentCollected,
    paymentsRecorded: payments.length,
  }

  const list =
    page === 'Rooms'
      ? rooms
      : page === 'Tenants'
        ? tenants
        : payments

  const cfg = configs[page]

  function openForm(section, item = null) {
    setPage(section)
    setEditing(item)
    setForm(item ? { ...item } : { ...configs[section].empty })
    setModal(section)
  }

  function save(e) {
    e.preventDefault()

    const config = configs[modal]
    if (!config) return

    const payload = { ...form }

    for (const [key, , type] of config.fields) {
      if (type === 'number') {
        payload[key] = Number(payload[key] || 0)
      }
    }

    if (modal === 'Rooms') {
      if (payload.occupiedBeds > payload.beds) {
        window.alert('Occupied beds cannot exceed total beds.')
        return
      }

      const duplicate = rooms.some(
        room =>
          room.roomNumber.trim().toLowerCase() ===
            String(payload.roomNumber).trim().toLowerCase() &&
          room.id !== editing?.id
      )

      if (duplicate) {
        window.alert('This room number already exists.')
        return
      }
    }

    if (editing) {
      setData(previous => ({
        ...previous,
        [config.key]: previous[config.key].map(item =>
          item.id === editing.id ? { ...payload, id: editing.id } : item
        ),
      }))
    } else {
      const newItem = {
        ...payload,
        id: Date.now(),
      }

      setData(previous => ({
        ...previous,
        [config.key]: [...previous[config.key], newItem],
      }))
    }

    setModal('')
    setEditing(null)
    setForm({})
  }

  function remove(section, item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${configs[section].label.toLowerCase()}?`
    )

    if (!confirmed) return

    const key = configs[section].key

    setData(previous => ({
      ...previous,
      [key]: previous[key].filter(record => record.id !== item.id),
    }))
  }

  function closeModal() {
    setModal('')
    setEditing(null)
    setForm({})
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
            <small>HOSTEL MANAGEMENT</small>
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
            }}
            className={`nav-item ${page === label ? 'active' : ''}`}
          >
            <Icon size={19} />
            {label}

            {label === 'Rooms' && (
              <span className="nav-count">{rooms.length}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="owner-chip">
            <div className="avatar">S</div>
            <div>
              <b>SmartStay</b>
              <small>Dashboard</small>
            </div>
            <span className="online-dot" />
          </div>
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
            <span>Dashboard</span>
            <div className="avatar small-avatar">S</div>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <span className="eyebrow">HOSTEL OVERVIEW</span>

              <h1>
                {page === 'Dashboard' ? 'Welcome to SmartStay' : page}
              </h1>

              <p>
                {page === 'Dashboard'
                  ? 'Here is an overview of your hostel.'
                  : `Manage your ${page.toLowerCase()} in one place.`}
              </p>
            </div>

            {cfg && (
              <button
                className="primary"
                onClick={() => openForm(page)}
              >
                <Plus size={18} /> Add {cfg.label}
              </button>
            )}
          </div>

          {page === 'Dashboard' ? (
            <>
              <div className="stats-grid">
                <Stat
                  icon={BedDouble}
                  label="Total rooms"
                  value={d.rooms}
                  hint={`${d.beds} total beds`}
                  color="blue"
                />

                <Stat
                  icon={Users}
                  label="Registered tenants"
                  value={d.tenants}
                  hint="Current tenant records"
                  color="purple"
                />

                <Stat
                  icon={BedDouble}
                  label="Available beds"
                  value={d.availableBeds}
                  hint={`${d.occupiedBeds} beds occupied`}
                  color="green"
                />

                <Stat
                  icon={Wallet}
                  label="Rent recorded"
                  value={`₹${d.rentCollected.toLocaleString('en-IN')}`}
                  hint={`${d.paymentsRecorded} payments`}
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
                    {d.occupiedBeds}
                    <span> / {d.beds} beds occupied</span>
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
                        ? Math.round((d.occupiedBeds / d.beds) * 100)
                        : 0}
                      %
                    </b>
                  </div>

                  <div className="mini-stats">
                    <div>
                      <span className="legend blue-legend" />
                      Occupied <b>{d.occupiedBeds}</b>
                    </div>
                    <div>
                      <span className="legend green-legend" />
                      Available <b>{d.availableBeds}</b>
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
                </section>
              </div>

              <section className="panel recent-panel">
                <div className="panel-head">
                  <div>
                    <h3>Recently registered tenants</h3>
                    <p>Your tenant records</p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => setPage('Tenants')}
                  >
                    View all →
                  </button>
                </div>

                <Table
                  rows={[...tenants].reverse().slice(0, 5)}
                  columns={[
                    ['fullName', 'Tenant'],
                    ['phone', 'Phone'],
                    ['roomNumber', 'Room'],
                    ['email', 'Email'],
                  ]}
                  empty="No tenants yet. Add a tenant to get started."
                />
              </section>
            </>
          ) : (
            <section className="panel list-panel">
              <div className="panel-head">
                <div>
                  <h3>All {page.toLowerCase()}</h3>
                  <p>
                    {list.length} record{list.length === 1 ? '' : 's'}
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
                actions={item => (
                  <div className="row-actions">
                    <button
                      title="Edit"
                      onClick={() => openForm(page, item)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      title="Delete"
                      onClick={() => remove(page, item)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                empty={`No ${page.toLowerCase()} found. Add a record to get started.`}
              />
            </section>
          )}

          <footer className="footer">
            © {new Date().getFullYear()} SmartStay
            <span>Hostel Management System</span>
          </footer>
        </div>
      </main>

      {modal && cfg && (
        <div className="modal-backdrop" onClick={closeModal}>
          <form
            className="modal"
            onSubmit={save}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-x"
              onClick={closeModal}
              aria-label="Close"
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
                  required={
                    !(
                      modal === 'Tenants' &&
                      ['email', 'roomNumber'].includes(key)
                    )
                  }
                  value={form[key] ?? ''}
                  onChange={e =>
                    setForm(previous => ({
                      ...previous,
                      [key]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}

            {modal === 'Payments' && (
              <label className="field-label">
                Select tenant
                <select
                  value={form.tenantName ?? ''}
                  onChange={e =>
                    setForm(previous => ({
                      ...previous,
                      tenantName: e.target.value,
                    }))
                  }
                >
                  <option value="">Choose a tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.fullName}>
                      {tenant.fullName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button className="primary" type="submit">
                Save record
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
            {rows.map(row => (
              <tr key={row.id}>
                {columns.map(([key]) => (
                  <td key={key}>
                    {key === 'monthlyRent' || key === 'amount'
                      ? `₹${Number(row[key] || 0).toLocaleString('en-IN')}`
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
