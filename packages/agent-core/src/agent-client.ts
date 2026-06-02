import { createTRPCClient, httpLink } from '@trpc/client';
import type { AgentRouter } from './agent-server';
import type { WebHarnessLike } from './web/harness.interface';
import type { ObservationPayload, ActionWireForm, ActionResult } from './transport/messages';
import type { ActionDefinition } from './actions';
import { webActions } from './actions/webActions';
import { taskActions } from './actions/taskActions';

export interface AgentClientOptions {
    serverUrl: string;
    harness: WebHarnessLike;
    fetch?: typeof fetch;
}

export interface AgentRunOptions {
    goal: string;
    targetUrl?: string;
    onAction?: (action: ActionWireForm) => void | Promise<void>;
    onStep?: (info: {
        reasoning: string;
        actions: ActionWireForm[];
        isComplete: boolean;
    }) => void | Promise<void>;
}

export class AgentClient {
    private trpc: ReturnType<typeof createTRPCClient<AgentRouter>>;
    private harness: WebHarnessLike;
    private actionMap: Map<string, ActionDefinition<any>>;

    constructor(options: AgentClientOptions) {
        this.harness = options.harness;
        this.trpc = createTRPCClient<AgentRouter>({
            links: [httpLink({ url: options.serverUrl, fetch: options.fetch })],
        });
        this.actionMap = new Map(
            [...webActions, ...taskActions].map((a) => [a.name, a]),
        );
    }

    async run(options: AgentRunOptions): Promise<void> {
        const { sessionId } = await this.trpc.start.mutate({
            goal: options.goal,
            targetUrl: options.targetUrl,
        });

        let seq = 0;
        let lastBatchResults: ActionResult[] | undefined;

        try {
            while (true) {
                const observation = await this.captureObservation(lastBatchResults);

                const { reasoning, actions, isComplete } = await this.trpc.step.mutate({
                    sessionId,
                    seq: seq++,
                    observation,
                });

                await options.onStep?.({ reasoning, actions, isComplete });

                const batchResults: ActionResult[] = [];
                for (const action of actions) {
                    await options.onAction?.(action);
                    try {
                        await this.dispatch(action);
                        batchResults.push({ actionId: action.variant, result: 'ok' });
                    } catch (err) {
                        batchResults.push({
                            actionId: action.variant,
                            result: 'failed',
                            error: err instanceof Error ? err.message : String(err),
                        });
                        break;
                    }
                }
                lastBatchResults = batchResults.length > 0 ? batchResults : undefined;

                if (isComplete) break;
            }
        } finally {
            await this.trpc.cancel.mutate({ sessionId });
        }
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
