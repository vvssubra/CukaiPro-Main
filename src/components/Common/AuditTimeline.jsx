import PropTypes from 'prop-types';
import Loading from './Loading';

/**
 * Displays audit log entries as a timeline. Used in deduction/invoice modals.
 */
function AuditTimeline({ entries, loading, error, emptyMessage = 'No history yet.' }) {
  if (loading) return <Loading size="sm" text="Loading history..." />;
  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }
  if (!entries?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
    );
  }

  const getActionLabel = (action) => {
    const labels = { create: 'Created', update: 'Updated', delete: 'Deleted' };
    return labels[action] || action;
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-0">
      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="relative">
            <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-primary dark:bg-emerald-500" aria-hidden="true" />
            <div className="text-sm">
              <span className="font-medium text-slate-900 dark:text-white">
                {getActionLabel(entry.action)}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">
                {formatTimestamp(entry.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

AuditTimeline.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      action: PropTypes.string,
      created_at: PropTypes.string,
      old_data: PropTypes.object,
      new_data: PropTypes.object,
    })
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default AuditTimeline;
