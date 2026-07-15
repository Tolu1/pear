import { createTRPCClient, httpLink } from '@trpc/client';
import EventEmitter from 'eventemitter3';
import type { AgentRouter } from './agent-server';
import type { WebHarnessLike } from './web/harness.interface';
import type { ObservationPayload, ActionWireForm, ActionResult, UsagePayload } from './transport/messages';
import { findOutcome, type Outcome } from './transport/outcome';
import type { ActionDefinition } from './actions';
import { webActions } from './actions/webActions';
import { taskActions } from './actions/taskActions';

export interface AgentClientOptions {
    serverUrl: string;
    harness: WebHarnessLike;
    fetch?: typeof fetch;
    includeUsage?: boolean;
    headers?: () => Record<string, string>;
}

export interface AgentStartOptions {
    goal: string;
    targetUrl?: string;
    context?: string;
}

export interface AgentClientEvents {
    'start': () => void;
    'thought': (thought: string, usage?: UsagePayload) => void;
    'actionStarted': (action: ActionWireForm) => void;
    'actionDone': (action: ActionWireForm) => void;
    'pause': () => void;
    'resume': () => void;
    'stop': () => void;
}

export class AgentClient extends EventEmitter<AgentClientEvents> {
    private trpc: ReturnType<typeof createTRPCClient<AgentRouter>>;
    private harness: WebHarnessLike;
    private actionMap: Map<string, ActionDefinition<any>>;
    private includeUsage: boolean;
    private _paused: boolean = false;
    private _pauseResolve: (() => void) | null = null;

    constructor(options: AgentClientOptions) {
        super();
        this.harness = options.harness;
        this.includeUsage = options.includeUsage ?? false;
        this.trpc = createTRPCClient<AgentRouter>({
            links: [
                httpLink({
                    url: options.serverUrl,
                    fetch: options.fetch,
                    headers: options.headers,
                }),
            ],
        });
        this.actionMap = new Map(
            [...webActions, ...taskActions].map((a) => [a.name, a]),
        );
    }

    async start(options: AgentStartOptions): Promise<string> {
        const { sessionId } = await this.trpc.start.mutate({
            goal: options.goal,
            targetUrl: options.targetUrl,
            context: options.context,
        });
        return sessionId;
    }

    async run(sessionId: string): Promise<Outcome> {
        this.emit('start');
        await this.harness.start();

        let seq = 0;
        let lastBatchResults: ActionResult[] | undefined;

        try {
            while (true) {
                const observation = await this.captureObservation(lastBatchResults);

                const { reasoning, actions, usage } = await this.trpc.step.mutate({
                    sessionId,
                    seq: seq++,
                    observation,
                    ...(this.includeUsage ? { includeUsage: true } : {}),
                });

                this.emit('thought', reasoning, usage);

                const batchResults: ActionResult[] = [];
                for (const action of actions) {
                    await this._waitIfPaused();
                    this.emit('actionStarted', action);
                    try {
                        await this.dispatch(action);
                        this.emit('actionDone', action);
                        batchResults.push({ actionId: action.variant, result: 'ok' });
                    } catch (err) {
                        this.emit('actionDone', action);
                        batchResults.push({
                            actionId: action.variant,
                            result: 'failed',
                            error: err instanceof Error ? err.message : String(err),
                        });
                        break;
                    }
                }
                lastBatchResults = batchResults.length > 0 ? batchResults : undefined;

                const outcome = findOutcome(actions);
                if (outcome) return outcome;

                await this._waitIfPaused();
            }
        } finally {
            await this.trpc.cancel.mutate({ sessionId });
            await this.harness.stop();
            this.emit('stop');
        }
    }

    private async _waitIfPaused(): Promise<void> {
        if (!this._paused) return;
        this.emit('pause');
        await new Promise<void>((resolve) => {
            this._pauseResolve = resolve;
        });
    }

    pause(): void {
        this._paused = true;
    }

    resume(): void {
        this._paused = false;
        if (this._pauseResolve) {
            this._pauseResolve();
            this._pauseResolve = null;
        }
        this.emit('resume');
    }

    get paused(): boolean {
        return this._paused;
    }

    private async captureObservation(
        lastBatchResults: ActionResult[] | undefined,
    ): Promise<ObservationPayload> {
        const image = await this.harness.screenshot();
        const base64 = await image.toBase64();
        const { width, height } = await image.getDimensions();

        const tabState = await this.harness.retrieveTabState();
        const activeTab = tabState.tabs[tabState.activeTab];

        return {
            screenshot: { base64, dpr: 1, width, height },
            url: activeTab?.url ?? '',
            title: activeTab?.title,
            ...(lastBatchResults ? { lastBatchResults } : {}),
        };
    }

    private async dispatch(action: ActionWireForm): Promise<void> {
        if (action.variant === 'task:done' || action.variant === 'task:fail') return;

        const def = this.actionMap.get(action.variant);
        if (!def) {
            throw new Error(`Unknown action variant: ${action.variant}`);
        }

        const { variant, ...input } = action;
        const parsed = def.schema.safeParse(input);
        if (!parsed.success) {
            throw new Error(`Invalid input for action '${variant}': ${parsed.error.message}`);
        }

        if (!def.resolver) {
            throw new Error(`No resolver defined for action: ${action.variant}`);
        }

        await def.resolver({ input: parsed.data, harness: this.harness });
    }
}
