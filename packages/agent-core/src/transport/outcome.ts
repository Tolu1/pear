import type { ActionWireForm } from './messages';

export type Outcome =
    | { status: 'done'; evidence: string }
    | { status: 'fail'; reason: string };

/** Reads the terminal task:done/task:fail action out of a step's actions, if present. */
export function findOutcome(actions: ActionWireForm[]): Outcome | null {
    const action = actions.find(
        (a) => a.variant === 'task:done' || a.variant === 'task:fail',
    ) as (ActionWireForm & { evidence?: string; reason?: string }) | undefined;
    if (!action) return null;
    return action.variant === 'task:done'
        ? { status: 'done', evidence: action.evidence ?? '' }
        : { status: 'fail', reason: action.reason ?? '' };
}
