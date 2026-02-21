import { supabase } from '../lib/supabase';
import { logger } from './logger';

/**
 * Insert an audit log entry. Call after each create/update/delete mutation.
 * Best-effort: logs errors but does not throw to avoid disrupting main flow.
 *
 * @param {object} params
 * @param {'deduction'|'invoice'} params.entityType - Entity type
 * @param {string} params.entityId - UUID of the entity
 * @param {'create'|'update'|'delete'} params.action - Action performed
 * @param {object|null} params.oldData - Previous state (for update/delete)
 * @param {object|null} params.newData - New state (for create/update)
 * @param {string|null} params.userId - UUID of the user (fetched from auth if not provided)
 * @param {string} params.organizationId - UUID of the organization
 */
export async function insertAuditLog({
  entityType,
  entityId,
  action,
  oldData = null,
  newData = null,
  userId = null,
  organizationId,
}) {
  if (!organizationId || !entityType || !entityId || !action) {
    logger.warn('Audit log skipped: missing required fields', { entityType, entityId, action, organizationId });
    return;
  }
  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      resolvedUserId = user?.id ?? null;
    }
    const { error } = await supabase.from('audit_log').insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      old_data: oldData ? sanitizeForJsonb(oldData) : null,
      new_data: newData ? sanitizeForJsonb(newData) : null,
      user_id: resolvedUserId,
      organization_id: organizationId,
    });
    if (error) {
      logger.error('Audit log insert failed', error);
    }
  } catch (err) {
    logger.error('Audit log insert error', err);
  }
}

/**
 * Sanitize object for JSONB: remove undefined, convert to plain object.
 */
function sanitizeForJsonb(obj) {
  if (obj == null) return null;
  try {
    const str = JSON.stringify(obj);
    return JSON.parse(str);
  } catch {
    return { _raw: String(obj) };
  }
}
