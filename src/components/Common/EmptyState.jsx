import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Consistent empty state: icon, title, description, primary CTA, optional secondary link.
 */
function EmptyState({ icon = 'inbox', title, description, primaryAction, secondaryAction }) {
  return (
    <div className="card rounded-2xl p-10 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 mb-6">
        <span className="material-icons text-5xl">{icon}</span>
      </div>
      <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-base text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {primaryAction && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          >
            {primaryAction.icon && <span className="material-icons text-lg">{primaryAction.icon}</span>}
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button type="button" variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
};

export default EmptyState;
