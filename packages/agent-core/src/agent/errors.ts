export interface AgentErrorOptions {
    variant?: string,
    adaptable?: boolean
}

export class AgentError extends Error {
    public readonly options: Required<AgentErrorOptions>;

    constructor(message: string, options: AgentErrorOptions = {}) {
        super(message);
        this.options = {
            variant: options.variant ?? 'unknown',
            adaptable: options.adaptable ?? false,
        };
    }
}
