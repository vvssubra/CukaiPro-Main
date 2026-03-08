import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

function pageDisplay(url) {
  if (!url) return '—';
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

export default function BugReportsAdminPage() {
  const { user } = useAuth();
  const [isSupportAdmin, setIsSupportAdmin] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalReport, setModalReport] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'screenshot' | 'chat'
  const [updatingId, setUpdatingId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const checkSupportAdmin = useCallback(async () => {
    if (!user?.id) {
      setIsSupportAdmin(false);
      return;
    }
    const { data, error } = await supabase
      .from('support_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsSupportAdmin(!error && !!data);
  }, [user?.id]);

  const loadReports = useCallback(async () => {
    if (!isSupportAdmin) return;
    setLoading(true);
    let query = supabase
      .from('bug_reports')
      .select('*, bug_report_messages(role, content, created_at)')
      .order('created_at', { ascending: false });
    if (!showResolved) {
      query = query.in('status', ['open', 'in_progress']);
    }
    const { data, error } = await query;
    setLoading(false);
    if (error) {
      console.error('bug_reports load', error);
      setReports([]);
      return;
    }
    setReports(data ?? []);
    setLastRefresh(new Date());
  }, [isSupportAdmin, showResolved]);

  useEffect(() => {
    checkSupportAdmin();
  }, [checkSupportAdmin]);

  useEffect(() => {
    if (isSupportAdmin) loadReports();
  }, [isSupportAdmin, loadReports]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('bug_reports')
      .update({ status: newStatus })
      .eq('id', id);
    setUpdatingId(null);
    if (error) {
      console.error('update status', error);
      return;
    }
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterPriority && r.priority !== filterPriority) return false;
    if (
      filterSearch &&
      !(r.message || '').toLowerCase().includes(filterSearch.toLowerCase())
    )
      return false;
    return true;
  });

  if (isSupportAdmin === false) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Access denied
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            You do not have permission to view Bug Reports. Only support admins
            can access this page.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-primary hover:underline font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isSupportAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-custom dark:text-white">
            Bug Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Support chat logs and issue tracker
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updated{' '}
              {lastRefresh.toLocaleTimeString('en-MY', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadReports()}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setFilterStatus('')}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-left shadow-sm hover:shadow"
        >
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {reports.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total Reports
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('open')}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-left shadow-sm hover:shadow"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {reports.filter((r) => r.status === 'open').length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Open
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterStatus('');
            setFilterPriority('high');
          }}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-left shadow-sm hover:shadow"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {
              reports.filter(
                (r) => r.priority === 'high' || r.priority === 'critical'
              ).length
            }
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            High Priority
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('resolved')}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-left shadow-sm hover:shadow"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {reports.filter((r) => r.status === 'resolved').length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resolved
          </div>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Search messages..."
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm min-w-[180px]"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          Show resolved/closed
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filteredReports.length === reports.length
            ? `${reports.length} reports`
            : `${filteredReports.length} of ${reports.length} reports`}
        </span>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            Loading reports...
          </div>
        ) : !filteredReports.length ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            No reports found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Page
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Screenshot
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Chat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredReports.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      r.status === 'resolved' || r.status === 'closed'
                        ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/30'
                        : ''
                    }
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {r.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <div
                        className="truncate text-slate-700 dark:text-slate-300"
                        title={r.message}
                      >
                        {r.message}
                      </div>
                      {r.user_email && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          ✉ {r.user_email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleUpdateStatus(r.id, e.target.value)
                        }
                        disabled={updatingId === r.id}
                        className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          r.priority === 'critical'
                            ? 'bg-red-900/20 text-red-700 dark:text-red-300'
                            : r.priority === 'high'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : r.priority === 'medium'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                      {pageDisplay(r.page_url)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('en-MY', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {r.screenshot_base64 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setModalReport(r);
                            setModalMode('screenshot');
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setModalReport(r);
                          setModalMode('chat');
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        {(r.bug_report_messages || []).length}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalReport && modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalReport(null);
              setModalMode(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={modalMode === 'screenshot' ? 'Screenshot' : 'Chat thread'}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-[90vw] max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {modalMode === 'screenshot'
                  ? `Screenshot – ${modalReport.id.slice(0, 8)}`
                  : `Chat thread – ${modalReport.id.slice(0, 8)}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalReport(null);
                  setModalMode(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {modalMode === 'screenshot' && (
              <>
                {modalReport.page_url && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {modalReport.page_url}
                  </p>
                )}
                <img
                  src={modalReport.screenshot_base64}
                  alt="Screenshot"
                  className="max-w-full rounded-lg"
                />
              </>
            )}
            {modalMode === 'chat' && (
              <div className="space-y-2 min-w-[340px] max-w-[520px]">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Status:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {modalReport.status}
                  </span>{' '}
                  Priority:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {modalReport.priority}
                  </span>
                </p>
                {(modalReport.bug_report_messages || []).length ? (
                  (modalReport.bug_report_messages || []).map((m, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-sm ${
                        m.role === 'user'
                          ? 'bg-primary text-white ml-auto max-w-[85%]'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 max-w-[85%]'
                      }`}
                    >
                      <span>{m.content}</span>
                      <small className="block text-xs opacity-80 mt-1">
                        {new Date(m.created_at).toLocaleTimeString('en-MY', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No messages yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
