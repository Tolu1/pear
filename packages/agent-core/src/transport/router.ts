import { initTRPC } from '@trpc/server';
import {
  CancelInputSchema,
  CancelResponseSchema,
  StartInputSchema,
  StartResponseSchema,
  StepInputSchema,
  StepResponseSchema,
  type CancelResponse,
  type StartResponse,
  type StepResponse,
} from './messages';

export interface AgentTransportContext {
  startSession(input: {
    goal: string;
    targetUrl?: string;
    agentOptions?: unknown;
  }): Promise<StartResponse>;

  stepSession(input: {
    sessionId: string;
    seq: number;
    observation: unknown;
  }): Promise<StepResponse>;

  cancelSession(input: { sessionId: string }): Promise<CancelResponse>;
}

const t = initTRPC.context<AgentTransportContext>().create();

export const agentRouter = t.router({
  start: t.procedure
    .input(StartInputSchema)
    .output(StartResponseSchema)
    .mutation(({ ctx, input }) => ctx.startSession(input)),

  step: t.procedure
    .input(StepInputSchema)
    .output(StepResponseSchema)
    .mutation(({ ctx, input }) => ctx.stepSession(input)),

  cancel: t.procedure
    .input(CancelInputSchema)
    .output(CancelResponseSchema)
    .mutation(({ ctx, input }) => ctx.cancelSession(input)),
});

export type AgentRouter = typeof agentRouter;
