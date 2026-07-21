import { initTRPC } from '@trpc/server';
import { randomUUID } from 'crypto';
import EventEmitter from 'eventemitter3';
import { AgentMemory } from './memory';
import { MultiModelHarness } from './ai/multiModelHarness';
import type { LLMClient, ModelUsage } from './ai/types';
import { runStep } from './step-handler';
import { webActions } from './actions/webActions';
import { taskActions } from './actions/taskActions';
import { findOutcome } from './transport/outcome';
import {
    CancelInputSchema,
    CancelResponseSchema,
    StartInputSchema,
    StartResponseSchema,
    StepInputSchema,
    StepResponseSchema,
    type CancelInput,
    type CancelResponse,
    type StartInput,
    type StartResponse,
    type StepInput,
    type StepResponse,
} from './transport/messages';

export interface Session {
    goal: string;
    memory: AgentMemory;
    createdAt: number;
    onDone?: (evidence: string) => Promise<void> | void;
    onFail?: (reason: string) => Promise<void> | void;
}

export type StartOptions = StartInput & {
    onDone?: (evidence: string) => Promise<void> | void;
    onFail?: (reason: string) => Promise<void> | void;
};

export interface SessionStore {
    get(sessionId: string): Promise<Session | undefined>;
    set(sessionId: string, session: Session): Promise<void>;
    delete(sessionId: string): Promise<void>;
}

class InMemorySessionStore implements SessionStore {
    private sessions = new Map<string, Session>();
    async get(sessionId: string) { return this.sessions.get(sessionId); }
    async set(sessionId: string, session: Session) { this.sessions.set(sessionId, session); }
    async delete(sessionId: string) { this.sessions.delete(sessionId); }
}

export interface AgentServerOptions {
    llm: LLMClient | LLMClient[];
    sessionStore?: SessionStore;
    prompt?: string;
}

export interface AgentServerEvents {
    'start': () => void;
    'thought': (info: { sessionId: string; thought: string }) => void;
    'tokensUsed': (usage: ModelUsage) => void;
}

export class AgentServer extends EventEmitter<AgentServerEvents> {
    public readonly router: ReturnType<AgentServer['buildRouter']>;

    private models: MultiModelHarness;
    private sessionStore: SessionStore;
    private actionVocabulary = [...webActions, ...taskActions];
    private prompt?: string;

    constructor(options: AgentServerOptions) {
        super();
        const clients = Array.isArray(options.llm) ? options.llm : [options.llm];
        this.models = new MultiModelHarness(clients);
        this.sessionStore = options.sessionStore ?? new InMemorySessionStore();
        this.prompt = options.prompt;
        this.models.events.on('tokensUsed', (usage) => this.emit('tokensUsed', usage), this);
        this.router = this.buildRouter();
    }

    async init(): Promise<void> {
        await this.models.setup();
        this.emit('start');
    }

    async start(options: StartOptions): Promise<StartResponse> {
        const sessionId = randomUUID();
        const instructionParts = [this.prompt, options.context].filter(Boolean);
        const instructions = instructionParts.length ? instructionParts.join('\n\n') : null;
        await this.sessionStore.set(sessionId, {
            goal: options.goal,
            memory: new AgentMemory({ instructions }),
            createdAt: Date.now(),
            onDone: options.onDone,
            onFail: options.onFail,
        });
        return { sessionId };
    }

    async step(input: StepInput): Promise<StepResponse> {
        const session = await this.sessionStore.get(input.sessionId);
        if (!session) {
            throw new Error(`Unknown session: ${input.sessionId}`);
        }

        let usage: ModelUsage | undefined;
        const grabUsage = (u: ModelUsage) => { usage = u; };
        if (input.includeUsage) this.models.events.on('tokensUsed', grabUsage);

        const { reasoning, actions } = await runStep({
            memory: session.memory,
            task: session.goal,
            observation: input.observation,
            actionVocabulary: this.actionVocabulary,
            models: this.models,
        });

        if (input.includeUsage) this.models.events.off('tokensUsed', grabUsage);

        this.emit('thought', { sessionId: input.sessionId, thought: reasoning });

        const outcome = findOutcome(actions);
        if (outcome?.status === 'done') await session.onDone?.(outcome.evidence);
        if (outcome?.status === 'fail') await session.onFail?.(outcome.reason);

        return {
            reasoning,
            actions,
            ...(usage && {
                usage: {
                    inputTokens: usage.inputTokens,
                    outputTokens: usage.outputTokens,
                    inputCost: usage.inputCost,
                    outputCost: usage.outputCost,
                },
            }),
        };
    }

    async cancel(input: CancelInput): Promise<CancelResponse> {
        await this.sessionStore.delete(input.sessionId);
        return { ok: true };
    }

    private buildRouter() {
        const t = initTRPC.create();
        return t.router({
            start: t.procedure
                .input(StartInputSchema)
                .output(StartResponseSchema)
                .mutation(({ input }) => this.start(input)),
            step: t.procedure
                .input(StepInputSchema)
                .output(StepResponseSchema)
                .mutation(({ input }) => this.step(input)),
            cancel: t.procedure
                .input(CancelInputSchema)
                .output(CancelResponseSchema)
                .mutation(({ input }) => this.cancel(input)),
        });
    }
}

export type AgentRouter = AgentServer['router'];
