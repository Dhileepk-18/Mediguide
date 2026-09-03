import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Search, Trash2 } from 'lucide-react';
export const AdminUsersPage = () => {
  const { addToast } = useAppStore();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchQuery]);
  const loadUsers = async () => {
    try {
      const res = await api.getAdminUsers(roleFilter, 'all', searchQuery);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };
  const handleToggleStatus = async user => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.updateAdminUser(user.id, { status: newStatus });
      if (res.success) {
        addToast({
          type: 'info',
          title: `Account ${newStatus}`,
          message: `${user.name}'s account is now ${newStatus}.`,
        });
        loadUsers();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Status update failed',
        message: 'Could not update user status.',
      });
    }
  };
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user ${name} permanently?`)) return;
    try {
      const res = await api.deleteAdminUser(id);
      if (res.success) {
        addToast({
          type: 'info',
          title: 'User Deleted',
          message: `${name} has been removed.`,
        });
        loadUsers();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not delete user.',
      });
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
          Registered Users Management
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted">
          Manage patient, doctor, and administrator credentials and access statuses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-surface rounded-3xl border border-surface-border shadow-soft flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'patient', 'doctor', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                roleFilter === role
                  ? 'bg-health-500 text-white border-health-600 shadow-sm'
                  : 'bg-surface text-ink-muted border-surface-border hover:bg-surface-muted'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-3xl border border-surface-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/60 border-b border-surface-border text-ink-muted font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                        }
                        alt={u.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-health-100"
                      />
                      <div>
                        <div className="font-bold text-ink-main">{u.name}</div>
                        <div className="text-[11px] text-ink-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        u.role === 'patient'
                          ? 'bg-health-100 text-health-800'
                          : u.role === 'doctor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        u.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-ink-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors ${
                          u.status === 'active'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-xl text-ink-muted hover:text-status-danger hover:bg-red-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
