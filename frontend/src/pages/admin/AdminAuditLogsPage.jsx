import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  FileSearch,
  ShieldCheck,
  RefreshCw,
  Lock,
  Search,
  Filter,
  Clock,
  UserCheck,
  Globe,
  AlertTriangle,
} from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const { addToast } = useAppStore();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAuditLogs({
        action: actionFilter === 'All' ? undefined : actionFilter,
        limit: 100,
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.userEmail?.toLowerCase().includes(query) ||
      log.ipAddress?.toLowerCase().includes(query) ||
      JSON.stringify(log.details || {})
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-health-600" />
            <span>FR-16 Security Audit Trail & DPDP Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            System Security Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Immutable event log capturing authentication attempts, prescription issuances, health
            vault accesses, DPDP data exports, and account modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2.5 bg-surface border border-surface-border hover:bg-surface-muted text-ink-main font-bold rounded-2xl text-xs shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs font-medium">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by action, email, or IP address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs font-bold text-ink-main focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
          >
            <option value="All">All Security Events</option>
            <option value="AUTH_LOGIN">User Logins (AUTH_LOGIN)</option>
            <option value="AUTH_REGISTER">User Registrations (AUTH_REGISTER)</option>
            <option value="APPOINTMENT_BOOK">Bookings (APPOINTMENT_BOOK)</option>
            <option value="APPOINTMENT_STATUS_UPDATE">
              Status Changes (APPOINTMENT_STATUS_UPDATE)
            </option>
            <option value="PRESCRIPTION_ISSUE">Prescriptions (PRESCRIPTION_ISSUE)</option>
            <option value="HEALTH_RECORD_CREATE">
              Health Vault Uploads (HEALTH_RECORD_CREATE)
            </option>
            <option value="DPDP_DATA_EXPORT">DPDP Exports (DPDP_DATA_EXPORT)</option>
            <option value="USER_ACCOUNT_DELETE">Account Deletions (USER_ACCOUNT_DELETE)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted">Reading immutable audit records...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-surface-muted border-b border-surface-border text-ink-muted font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-3.5 px-4">Timestamp (IST)</th>
                  <th className="py-3.5 px-4">Event Action</th>
                  <th className="py-3.5 px-4">Actor Email & Role</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono text-[11px]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-muted/40">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-sans ${
                          log.action.includes('LOGIN') || log.action.includes('REGISTER')
                            ? 'bg-sky-100 text-sky-800'
                            : log.action.includes('PRESCRIPTION')
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action.includes('DELETE')
                                ? 'bg-red-100 text-red-800'
                                : log.action.includes('EXPORT')
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <div className="font-bold font-sans">{log.userEmail || 'System'}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {log.userRole || 'Guest'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
