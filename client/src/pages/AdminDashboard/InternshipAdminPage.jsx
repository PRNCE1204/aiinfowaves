import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Briefcase, GraduationCap, Users, Mail,
  CalendarCheck, Search, ExternalLink, RefreshCw, Shield,
  ChevronDown, Clock, CheckCircle, XCircle, AlertCircle,
  Globe, Lock, Phone, ChevronRight, Activity
} from 'lucide-react';
import s from './InternshipAdminPage.module.css';
import { API_BASE_URL } from '../../config';

// ── API endpoints ───────────────────────────────────────────────────────────
const API = {
  overview:     `${API_BASE_URL}/api/admin/overview`,
  users:        `${API_BASE_URL}/api/admin/users`,
  internships:  `${API_BASE_URL}/api/internships`,
  jobs:         `${API_BASE_URL}/api/jobs`,
  bookings:     `${API_BASE_URL}/api/bookings`,
  contact:      `${API_BASE_URL}/api/contact`,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const initials = (name = '') => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';

function StatusBadge({ status }) {
  const map = {
    'Pending': s.badgePending,
    'Shortlisted': s.badgeShortlisted,
    'Interview Scheduled': s.badgeInterview,
    'Rejected': s.badgeRejected,
  };
  return <span className={`${s.badge} ${map[status] || s.badgePending}`}>{status}</span>;
}

function StatusSelect({ value, onChange }) {
  return (
    <div className={s.selectWrap}>
      <select className={s.statusSelect} value={value} onChange={onChange}>
        <option value="Pending">Pending</option>
        <option value="Shortlisted">Shortlisted</option>
        <option value="Interview Scheduled">Interview</option>
        <option value="Rejected">Rejected</option>
      </select>
      <ChevronDown size={12} className={s.selectArrow} />
    </div>
  );
}

// ── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',    label: 'Overview',           icon: LayoutDashboard },
  { id: 'jobs',        label: 'Job Applications',   icon: Briefcase },
  { id: 'internships', label: 'Internship Apps',    icon: GraduationCap },
  { id: 'users',       label: 'User Login History', icon: Users },
  { id: 'contact',     label: 'Contact Messages',   icon: Mail },
  { id: 'bookings',    label: 'Consultations',      icon: CalendarCheck },
];

// ══════════════════════════════════════════════════════════════════
//  OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════
function OverviewTab({ overview, loading }) {
  if (loading) return <div className={s.loader}><div className={s.spinner} /></div>;
  if (!overview) return <p className={s.empty}>Failed to load overview data.</p>;

  const { stats, recentActivity } = overview;

  const cards = [
    { label: 'Registered Users', value: stats.totalUsers,       icon: Users,        accent: '#6366f1', sub: null },
    { label: 'Job Applications', value: stats.totalJobs,        icon: Briefcase,    accent: '#8b5cf6', sub: stats.pendingJobs > 0 ? `${stats.pendingJobs} pending` : null },
    { label: 'Internship Apps',  value: stats.totalInternships, icon: GraduationCap,accent: '#a78bfa', sub: stats.pendingInternships > 0 ? `${stats.pendingInternships} pending` : null },
    { label: 'Consultations',    value: stats.totalBookings,    icon: CalendarCheck, accent: '#10b981', sub: null },
    { label: 'Contact Messages', value: stats.totalContacts,    icon: Mail,         accent: '#f59e0b', sub: null },
  ];

  const activitySections = [
    { title: 'Recent Job Applications', items: recentActivity.jobs, renderSub: (i) => i.jobTitle },
    { title: 'Recent Internship Apps',  items: recentActivity.internships, renderSub: (i) => i.internshipRole },
    { title: 'Recent Bookings',         items: recentActivity.bookings, renderSub: (i) => i.service },
    { title: 'Recent Contact Messages', items: recentActivity.contacts, renderSub: (i) => i.subject },
  ];

  return (
    <div className={s.section}>
      <div className={s.statsGrid}>
        {cards.map((c) => (
          <div key={c.label} className={s.statCard} style={{ '--accent': c.accent }}>
            <div className={s.statIcon} style={{ '--accent': c.accent }}>
              <c.icon size={20} />
            </div>
            <div className={s.statBody}>
              <span className={s.statValue}>{c.value}</span>
              <span className={s.statLabel}>{c.label}</span>
              {c.sub && <span className={s.statSub}>{c.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className={s.activityGrid}>
        {activitySections.map((sec) => (
          <div key={sec.title} className={s.activityCard}>
            <div className={s.activityTitle}>
              <Activity size={13} />
              {sec.title}
            </div>
            {!sec.items || sec.items.length === 0 ? (
              <p className={s.empty}>No recent activity.</p>
            ) : (
              sec.items.map((item) => (
                <div key={item._id} className={s.activityRow}>
                  <div className={s.activityMeta}>
                    <span className={s.activityName}>{item.fullName || item.name}</span>
                    <span className={s.activitySub}>{sec.renderSub(item)}</span>
                  </div>
                  <div className={s.activityRight}>
                    <span className={s.activityDate}>{fmtDate(item.appliedAt || item.createdAt)}</span>
                    {item.applicationStatus && <StatusBadge status={item.applicationStatus} />}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  JOB APPLICATIONS TAB
// ══════════════════════════════════════════════════════════════════
function JobsTab() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API.jobs, { params: { search, status: statusFilter } });
      setApps(data);
    } catch { toast.error('Failed to load job applications.'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API.jobs}/${id}/status`, { status });
      toast.success('Status updated!');
      fetch();
    } catch { toast.error('Failed to update status.'); }
  };

  return (
    <div className={s.section}>
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={15} className={s.searchIcon} />
          <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={s.filters}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <span className={s.countBadge}>{apps.length} records</span>
      </div>

      {loading ? (
        <div className={s.loader}><div className={s.spinner} /></div>
      ) : apps.length === 0 ? (
        <div className={s.emptyState}>
          <Briefcase size={40} />
          <p>No job applications found.</p>
        </div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Department</th>
                <th>LinkedIn</th>
                <th>Resume</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app._id}>
                  <td>
                    <div className={s.candidateCell}>
                      <div className={s.avatar}>{initials(app.fullName)}</div>
                      <div>
                        <div className={s.candidateName}>{app.fullName}</div>
                        <div className={s.candidateEmail}>{app.email}</div>
                        <div className={s.candidatePhone}><Phone size={9} />{app.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={s.roleTag}>{app.jobTitle}</span></td>
                  <td><span className={s.mutedCell}>{app.department}</span></td>
                  <td>
                    {app.linkedin
                      ? <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className={s.linkBtn}><Globe size={12} />View</a>
                      : <span className={s.na}>—</span>}
                  </td>
                  <td>
                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className={s.linkBtn}>
                      <ExternalLink size={12} />Resume
                    </a>
                  </td>
                  <td><span className={s.mutedCell}>{fmtDate(app.appliedAt)}</span></td>
                  <td><StatusBadge status={app.applicationStatus} /></td>
                  <td>
                    <StatusSelect
                      value={app.applicationStatus}
                      onChange={e => updateStatus(app._id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  INTERNSHIP APPLICATIONS TAB
// ══════════════════════════════════════════════════════════════════
function InternshipsTab() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API.internships, { params: { search, role: roleFilter, status: statusFilter } });
      setApps(data);
    } catch { toast.error('Failed to load internship applications.'); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API.internships}/${id}/status`, { status });
      toast.success('Status updated!');
      fetch();
    } catch { toast.error('Failed to update status.'); }
  };

  return (
    <div className={s.section}>
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={15} className={s.searchIcon} />
          <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={s.filters}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="MERN Stack Developer">MERN Stack Developer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="AI/ML Intern">AI/ML Intern</option>
            <option value="Data Analyst">Data Analyst</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <span className={s.countBadge}>{apps.length} records</span>
      </div>

      {loading ? (
        <div className={s.loader}><div className={s.spinner} /></div>
      ) : apps.length === 0 ? (
        <div className={s.emptyState}>
          <GraduationCap size={40} />
          <p>No internship applications found.</p>
        </div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>College / Year</th>
                <th>Skills</th>
                <th>Portfolio</th>
                <th>Resume</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app._id}>
                  <td>
                    <div className={s.candidateCell}>
                      <div className={s.avatar}>{initials(app.fullName)}</div>
                      <div>
                        <div className={s.candidateName}>{app.fullName}</div>
                        <div className={s.candidateEmail}>{app.email}</div>
                        <div className={s.candidatePhone}><Phone size={9} />{app.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={s.roleTag}>{app.internshipRole}</span></td>
                  <td>
                    <div className={s.candidateName}>{app.college}</div>
                    <div className={s.candidateEmail}>{app.currentYear}</div>
                  </td>
                  <td><span className={s.skillsCell}>{app.skills}</span></td>
                  <td>
                    {app.portfolio
                      ? <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className={s.linkBtn}><Globe size={12} />View</a>
                      : <span className={s.na}>—</span>}
                  </td>
                  <td>
                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className={s.linkBtn}>
                      <ExternalLink size={12} />Resume
                    </a>
                  </td>
                  <td><span className={s.mutedCell}>{fmtDate(app.appliedAt)}</span></td>
                  <td><StatusBadge status={app.applicationStatus} /></td>
                  <td>
                    <StatusSelect
                      value={app.applicationStatus}
                      onChange={e => updateStatus(app._id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  USER LOGIN HISTORY TAB
// ══════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API.users, { params: { search } });
      setUsers(data.users || []);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className={s.section}>
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={15} className={s.searchIcon} />
          <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className={s.countBadge}>{users.length} users</span>
      </div>

      {loading ? (
        <div className={s.loader}><div className={s.spinner} /></div>
      ) : users.length === 0 ? (
        <div className={s.emptyState}>
          <Users size={40} />
          <p>No registered users found.</p>
        </div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Auth Provider</th>
                <th>Email Verified</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className={s.candidateCell}>
                      <div className={s.avatar} style={{ background: u.authProvider === 'google' ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div className={s.candidateName}>{u.name}</div>
                        <div className={s.candidateEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={s.mutedCell}>{u.phone || '—'}</span></td>
                  <td>
                    {u.authProvider === 'google'
                      ? <span className={s.authGoogle}><Globe size={11} />Google</span>
                      : <span className={s.authLocal}><Lock size={11} />Local</span>}
                  </td>
                  <td>
                    {u.isEmailVerified
                      ? <span className={s.verifiedBadge}><CheckCircle size={11} />Verified</span>
                      : <span className={s.unverifiedBadge}><XCircle size={11} />Unverified</span>}
                  </td>
                  <td><span className={s.mutedCell}>{fmtDateTime(u.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CONTACT MESSAGES TAB
// ══════════════════════════════════════════════════════════════════
function ContactTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API.contact)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => toast.error('Failed to load contact messages.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={s.section}>
      <div className={s.toolbar}>
        <span className={s.countBadge}>{messages.length} messages</span>
      </div>

      {loading ? (
        <div className={s.loader}><div className={s.spinner} /></div>
      ) : messages.length === 0 ? (
        <div className={s.emptyState}>
          <Mail size={40} />
          <p>No contact messages yet.</p>
        </div>
      ) : (
        <div className={s.contactGrid}>
          {messages.map(m => (
            <div key={m._id} className={s.contactCard}>
              <div className={s.contactCardHeader}>
                <div className={s.candidateCell} style={{ gap: 8 }}>
                  <div className={s.avatar} style={{ width: 32, height: 32, fontSize: 12, borderRadius: 8, background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                    {initials(m.name)}
                  </div>
                  <div>
                    <div className={s.candidateName}>{m.name}</div>
                    <div className={s.candidateEmail}>{m.email}</div>
                  </div>
                </div>
                <span className={s.contactDate}>{fmtDate(m.createdAt)}</span>
              </div>
              <div className={s.contactSubject}>{m.subject}</div>
              <p className={s.contactMessage}>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CONSULTATION BOOKINGS TAB
// ══════════════════════════════════════════════════════════════════
function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(API.bookings)
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    !search ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase()) ||
    b.service?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.section}>
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={15} className={s.searchIcon} />
          <input placeholder="Search name, email or service…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className={s.countBadge}>{filtered.length} bookings</span>
      </div>

      {loading ? (
        <div className={s.loader}><div className={s.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={s.emptyState}>
          <CalendarCheck size={40} />
          <p>No consultation bookings yet.</p>
        </div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Details</th>
                <th>Booked On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td>
                    <div className={s.candidateCell}>
                      <div className={s.avatar} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                        {initials(b.name)}
                      </div>
                      <div>
                        <div className={s.candidateName}>{b.name}</div>
                        <div className={s.candidateEmail}>{b.email}</div>
                        <div className={s.candidatePhone}><Phone size={9} />{b.phone || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={s.roleTag}>{b.service}</span></td>
                  <td>
                    <span className={s.dateChip}><CalendarCheck size={11} />{b.date}</span>
                  </td>
                  <td>
                    {b.timeSlot
                      ? <span className={s.mutedCell}><Clock size={11} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />{b.timeSlot}</span>
                      : <span className={s.na}>—</span>}
                  </td>
                  <td><span className={s.detailsCell}>{b.details || '—'}</span></td>
                  <td><span className={s.mutedCell}>{fmtDate(b.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const { data } = await axios.get(API.overview);
      setOverview(data);
      setLastRefresh(new Date());
    } catch { toast.error('Failed to load overview.'); }
    finally { setOverviewLoading(false); }
  }, []);

  useEffect(() => {
    fetchOverview();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOverview, 30_000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const activeNav = NAV.find(n => n.id === activeTab);

  return (
    <div className={s.dashboard}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a3e', color: '#e2e2f0', border: '1px solid rgba(99,102,241,0.3)' }
      }} />

      {/* ── SIDEBAR ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarBrand}>
          <Shield size={22} className={s.brandIcon} />
          <span>AI InfoWave Admin</span>
        </div>
        <nav className={s.sidebarNav}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${s.navItem} ${activeTab === id ? s.navActive : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <span className={s.navIcon}><Icon size={17} /></span>
              <span className={s.navLabel}>{label}</span>
              {activeTab === id && <span className={s.navIndicator} />}
            </button>
          ))}
        </nav>
        <div className={s.sidebarFooter}>
          <Activity size={12} />
          <span>v2.0 · Admin</span>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={s.main}>
        {/* Top Bar */}
        <div className={s.topBar}>
          <div className={s.topBarLeft}>
            <div className={s.pageTitle}>
              {activeNav && <activeNav.icon size={22} />}
              {activeNav?.label}
            </div>
            <span className={s.refreshTime}>
              <Clock size={11} />
              {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button className={s.refreshBtn} onClick={fetchOverview}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Content */}
        <div className={s.content}>
          {activeTab === 'overview'    && <OverviewTab overview={overview} loading={overviewLoading} />}
          {activeTab === 'jobs'        && <JobsTab />}
          {activeTab === 'internships' && <InternshipsTab />}
          {activeTab === 'users'       && <UsersTab />}
          {activeTab === 'contact'     && <ContactTab />}
          {activeTab === 'bookings'    && <BookingsTab />}
        </div>
      </main>
    </div>
  );
}
