export type FailureDescriptor = BugDetectedFailure | MisalignmentFailure | NetworkFailure | BrowserFailure | RateLimitFailure | ApiKeyFailure | UnknownFailure | CancelledFailure;

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface BugDetectedFailure {
    variant: 'bug'
    title: string
    expectedResult: string
    actualResult: string
    severity: BugSeverity
}

export interface MisalignmentFailure {
    variant: 'misalignment',
    message: string
}

export interface NetworkFailure {
    variant: 'network'
    message: string
}

export interface BrowserFailure {
    variant: 'browser'
    message: string
}

export interface RateLimitFailure {
    variant: 'rate_limit',
    message: string
}

export interface ApiKeyFailure {
    variant: 'api_key'
    message: string
}

export interface UnknownFailure {
    variant: 'unknown'
    message: string
}

export interface CancelledFailure {
    variant: 'cancelled'
}
