import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://ems-backend-ti0r.onrender.com/employees';

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatSalary(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '₹0';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount}`;
}

const NAV = [
  { label: 'Employees', icon: '👥', group: 'workspace' },
  { label: 'Analytics', icon: '📊', group: 'workspace' },
  { label: 'Attendance', icon: '📅', group: 'workspace' },
  { label: 'Payroll', icon: '💰', group: 'workspace' },
  { label: 'Configuration', icon: '⚙️', group: 'settings' },
];

const DEPT_COLORS = {
  IT: 'it',
  HR: 'hr',
  Hr: 'hr',
  Finance: 'finance',
  Ops: 'ops',
  Legal: 'legal',
  SOET: 'soet',
  Marketing: 'marketing',
};

const AVATAR_PALETTE = ['purple', 'teal', 'amber', 'rose', 'sky'];

function EditModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState({ name: employee.name, department: employee.department, salary: employee.salary });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(employee.id, form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Employee</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange} required />
          </label>
          <label>
            Salary
            <input type="number" name="salary" value={form.salary} onChange={handleChange} required />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-add">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeesPage({ employees, loading, filtered, onDelete, onEdit, stats, filterData, onSearch, onFilter, formData, onFormChange, onAdd }) {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Employees</h1>
          <p>Manage your workforce in one place</p>
        </div>
        <div className="topbar-right">👥 {employees.length} Total</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>Total Employees</div>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <div>Departments</div>
          <strong>{stats.departments}</strong>
        </div>
        <div className="stat-card">
          <div>Avg Salary</div>
          <strong>{formatSalary(stats.avgSalary)}</strong>
        </div>
        <div className="stat-card">
          <div>Total Payroll</div>
          <strong>{formatSalary(stats.totalPayroll)}</strong>
        </div>
      </div>

      <form className="add-employee-bar" onSubmit={onAdd}>
        <input name="name" value={formData.name} placeholder="Name" onChange={onFormChange} />
        <input name="department" value={formData.department} placeholder="Department" onChange={onFormChange} />
        <input name="salary" type="number" value={formData.salary} placeholder="Salary" onChange={onFormChange} />
        <button type="submit" className="btn-add">
          Add Employee
        </button>
      </form>

      <div className="search-filter-bar">
        <input placeholder="Search" value={filterData.search} onChange={(e) => onSearch(e.target.value)} />
        <select value={filterData.department} onChange={(e) => onFilter(e.target.value)}>
          <option value="All">All</option>
          {filterData.depts.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="employee-grid">
        {loading && <div className="empty-state">Loading...</div>}
        {!loading && filtered.length === 0 && <div className="empty-state">No employees found.</div>}
        {filtered.map((emp, i) => (
          <div key={emp.id} className="employee-card">
            <div className="card-header">
              <div className={`avatar ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]}`}>{getInitials(emp.name)}</div>
              <div>
                <div>{emp.name}</div>
                <small>{emp.department}</small>
              </div>
            </div>
            <div className="card-body">
              <div>Salary: {formatSalary(emp.salary)}</div>
              <div>ID: {emp.id}</div>
            </div>
            <div className="card-actions">
              <button onClick={() => onEdit(emp)}>Edit</button>
              <button className="btn-danger" onClick={() => onDelete(emp.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalyticsPage({ employees }) {
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1>Analytics</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div>Departments</div>
          <strong>{Object.keys(deptCounts).length}</strong>
        </div>
        <div className="stat-card">
          <div>Employees</div>
          <strong>{employees.length}</strong>
        </div>
      </div>
      <div className="analytics-card">
        {Object.entries(deptCounts).map(([dept, count]) => (
          <div key={dept} className="dept-row">
            <span>{dept}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({ search: '', department: 'All', depts: [] });
  const [formData, setFormData] = useState({ name: '', department: '', salary: '' });
  const [activeNav, setActiveNav] = useState('Employees');
  const [editingEmployee, setEditingEmployee] = useState(null);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const normalized = data.map((emp) => ({ ...emp, id: emp.id || emp._id }));
      setEmployees(normalized);
      setFilterData((prev) => ({ ...prev, depts: Array.from(new Set(normalized.map((emp) => emp.department))).filter(Boolean) }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filtered = employees.filter((emp) => {
    const search = filterData.search.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(search) || emp.department.toLowerCase().includes(search);
    const matchesDept = filterData.department === 'All' || emp.department === filterData.department;
    return matchesSearch && matchesDept;
  });

  const stats = {
    total: employees.length,
    departments: filterData.depts.length,
    totalPayroll: employees.reduce((sum, emp) => sum + Number(emp.salary), 0),
    avgSalary: employees.length ? Math.round(employees.reduce((sum, emp) => sum + Number(emp.salary), 0) / employees.length) : 0,
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.department || !formData.salary) return;
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ name: '', department: '', salary: '' });
    loadEmployees();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadEmployees();
  };

  const handleSave = async (id, data) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingEmployee(null);
    loadEmployees();
  };

  const handleSearch = (value) => setFilterData((prev) => ({ ...prev, search: value }));
  const handleFilter = (value) => setFilterData((prev) => ({ ...prev, department: value }));

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div>🏢</div>
          <div>
            <div>EMS</div>
            <div>Admin</div>
          </div>
        </div>
        <nav>
          {NAV.map((item) => (
            <button key={item.label} className={activeNav === item.label ? 'active' : ''} onClick={() => setActiveNav(item.label)}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        {editingEmployee && <EditModal employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={handleSave} />}
        {activeNav === 'Employees' && (
          <EmployeesPage
            employees={employees}
            loading={loading}
            filtered={filtered}
            onDelete={handleDelete}
            onEdit={setEditingEmployee}
            stats={stats}
            filterData={filterData}
            onSearch={handleSearch}
            onFilter={handleFilter}
            formData={formData}
            onFormChange={handleFormChange}
            onAdd={handleAdd}
          />
        )}
        {activeNav === 'Analytics' && <AnalyticsPage employees={employees} />}
        {activeNav !== 'Employees' && activeNav !== 'Analytics' && <div className="empty-state">Coming soon</div>}
      </main>
    </div>
  );
}

export default App;
