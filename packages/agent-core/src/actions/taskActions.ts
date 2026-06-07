import { createAction } from ".";
import { z } from "zod";

export const doneAction = createAction({
    name: 'task:done',
    description: "ONLY once you have seen sufficient evidence of the task's completion, mark it as done",
    schema: z.object({
        evidence: z.string().describe(`Specific observed evidence that verifies the task's completion. Do NOT predict this evidence.`)
    }),
    render: () => `✓ done`
});

export const failAction = createAction({
    name: 'task:fail',
    description: 'Use if task was attempted but does not seem possible. Use common sense',
    schema: z.object({}),
    render: () => `✕ fail`
});

export const taskActions = [
    doneAction,
    failAction
] as const;
