import { Draft } from '@/types';

export interface VerificationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that a draft is strictly approved for the exact version
 * before any send operation can proceed.
 */
export function verifyDraftApproval(
  draft: Draft | undefined,
  expectedVersion: number
): VerificationResult {
  if (!draft) {
    return { valid: false, reason: 'No draft exists for this conversation' };
  }

  if (draft.version !== expectedVersion) {
    return {
      valid: false,
      reason: `Draft version mismatch: expected v${expectedVersion}, current is v${draft.version}. Any edits require re-approval.`,
    };
  }

  if (!draft.is_approved) {
    return {
      valid: false,
      reason: 'Draft has not received explicit human approval.',
    };
  }

  if (!draft.approved_at) {
    return {
      valid: false,
      reason: 'Draft approval timestamp is missing.',
    };
  }

  return { valid: true };
}

/**
 * Invalidates draft approval whenever the content is modified or regenerated.
 */
export function invalidateDraftOnEdit(
  draft: Draft,
  newContent: string
): Draft {
  const contentChanged = draft.content.trim() !== newContent.trim();
  return {
    ...draft,
    content: newContent,
    version: contentChanged ? draft.version + 1 : draft.version,
    is_approved: false,
    approved_at: undefined,
    approved_by: undefined,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Approves a specific draft version.
 */
export function approveDraftVersion(
  draft: Draft,
  approvedBy: string = 'Support Specialist'
): Draft {
  return {
    ...draft,
    is_approved: true,
    approved_at: new Date().toISOString(),
    approved_by: approvedBy,
    updated_at: new Date().toISOString(),
  };
}
