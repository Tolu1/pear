import { initTRPC } from '@trpc/server';
import { randomUUID } from 'crypto';
import { AgentMemory } from './memory';
import { MultiModelHarness } from './ai/multiModelHarness';
import type { LLMClient } from './ai/types';
import { runStep } from './step-handler';
import { webActions } from './actions/webActions';
import { taskActions } from './actions/taskActions';
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
}

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
}

export class AgentServer {
    public readonly router: ReturnType<AgentServer['buildRouter']>;

    private models: MultiModelHarness;
    private sessionStore: SessionStore;
    private actionVocabulary = [...webActions, ...taskActions];

    constructor(options: AgentServerOptions) {
        const clients = Array.isArray(options.llm) ? options.llm : [options.llm];
        this.models = new MultiModelHarness(clients);
        this.sessionStore = options.sessionStore ?? new InMemorySessionStore();
        this.router = this.buildRouter();
    }

    async setup(): Promise<void> {
        await this.models.setup();
    }

    async start(input: StartInput): Promise<StartResponse> {
        const sessionId = randomUUID();
        await this.sessionStore.set(sessionId, {
            goal: input.goal,
            memory: new AgentMemory(),
            createdAt: Date.now(),
        });
        return { sessionId };
    }

    async step(input: StepInput): Promise<StepResponse> {
        const session = await this.sessionStore.get(input.sessionId);
        if (!session) {
            throw new Error(`Unknown session: ${input.sessionId}`);
        }

        const { reasoning, actions } = await runStep({
            memory: session.memory,
            task: session.goal,
            observation: input.observation,
            actionVocabulary: this.actionVocabulary,
            models: this.models,
        });

        const isComplete = actions.some(
            (a) => a.variant === 'task:done' || a.variant === 'task:fail',
        );

        return { reasoning, actions, isComplete };
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
