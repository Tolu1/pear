import { z } from 'zod';

export const ScreenshotPayloadSchema = z.object({
  base64: z.string(),
  dpr: z.number().min(0.1).max(8),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type ScreenshotPayload = z.infer<typeof ScreenshotPayloadSchema>;

export const ActionResultSchema = z.object({
  actionId: z.string(),
  result: z.enum(['ok', 'failed']),
  error: z.string().optional(),
});
export type ActionResult = z.infer<typeof ActionResultSchema>;

export const ObservationPayloadSchema = z.object({
  screenshot: ScreenshotPayloadSchema,
  url: z.string(),
  title: z.string().optional(),
  lastBatchResults: z.array(ActionResultSchema).optional(),
});
export type ObservationPayload = z.infer<typeof ObservationPayloadSchema>;

export const ActionWireFormSchema = z.object({
  variant: z.string(),
}).passthrough();
export type ActionWireForm = z.infer<typeof ActionWireFormSchema>;

export const StartInputSchema = z.object({
  goal: z.string().min(1),
  targetUrl: z.string().optional(),
  context: z.string().optional(),
  agentOptions: z
    .object({
      maxSteps: z.number().int().positive().optional(),
      virtualScreenDimensions: z
        .object({
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        })
        .optional(),
    })
    .optional(),
});
export type StartInput = z.infer<typeof StartInputSchema>;

export const StartResponseSchema = z.object({
  sessionId: z.string(),
});
export type StartResponse = z.infer<typeof StartResponseSchema>;

export const StepInputSchema = z.object({
  sessionId: z.string(),
  seq: z.number().int().nonnegative(),
  observation: ObservationPayloadSchema,
  includeUsage: z.boolean().optional(),
});
export type StepInput = z.infer<typeof StepInputSchema>;

export const UsagePayloadSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  inputCost: z.number().optional(),
  outputCost: z.number().optional(),
});
export type UsagePayload = z.infer<typeof UsagePayloadSchema>;

export const StepResponseSchema = z.object({
  reasoning: z.string(),
  actions: z.array(ActionWireFormSchema),
  usage: UsagePayloadSchema.optional(),
});
export type StepResponse = z.infer<typeof StepResponseSchema>;

export const CancelInputSchema = z.object({
  sessionId: z.string(),
});
export type CancelInput = z.infer<typeof CancelInputSchema>;

export const CancelResponseSchema = z.object({
  ok: z.literal(true),
});
export type CancelResponse = z.infer<typeof CancelResponseSchema>;
