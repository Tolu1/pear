import { Image } from '@/memory/image';
import { AgentMemory } from '@/memory';
import { Observation } from '@/memory/observation';
import { ActionDefinition } from '@/actions';
import { MultiModelHarness } from '@/ai/multiModelHarness';
import type { Action } from '@/actions/types';
import type { ObservationPayload } from '@/transport/messages';
import { retryOnError } from '@/common/util';

const DEFAULT_MIN_RETAINED_SCREENSHOTS = 2;

export interface RunStepInput {
  memory: AgentMemory;
  task: string;
  observation: ObservationPayload;
  actionVocabulary: ActionDefinition<any>[];
  models: MultiModelHarness;
  minScreenshots?: number;
}

export interface RunStepOutput {
  reasoning: string;
  actions: Action[];
}

export async function runStep(input: RunStepInput): Promise<RunStepOutput> {
  const { memory, task, observation, actionVocabulary, models } = input;
  const screenshotLimit = input.minScreenshots ?? DEFAULT_MIN_RETAINED_SCREENSHOTS;

  if (observation.lastBatchResults) {
    for (const r of observation.lastBatchResults) {
      const content = r.result === 'failed'
        ? { result: 'failed' as const, error: r.error ?? 'unknown error' }
        : { result: 'ok' as const };
      memory.recordObservation(
        Observation.fromActionResult(r.actionId, content),
      );
    }
  }

  const screenshot = Image.fromBase64(observation.screenshot.base64);
  memory.recordObservation(
    Observation.fromConnector('web', screenshot, {
      type: 'screenshot',
      limit: screenshotLimit,
      dedupe: true,
    }),
  );

  const tabInfo = `Open Tabs:\n[ACTIVE] ${observation.title ?? ''} (${observation.url})`;
  memory.recordObservation(
    Observation.fromConnector('web', tabInfo, {
      type: 'tabinfo',
      limit: 1,
    }),
  );

  const observationContent = await memory.render();
  const context = {
    instructions: memory.instructions,
    observationContent,
    connectorInstructions: [],
  };

  let reasoning = '';
  let actions: Action[] = [];

  await retryOnError(
    async () => {
      const result = await models.partialAct(context, task, [], actionVocabulary);
      reasoning = result.reasoning;
      actions = result.actions;
      if (actions.length === 0) {
        throw new Error('No actions generated');
      }
    },
    {
      mode: 'retry_on_partial_message',
      errorSubstrings: ['HTTP body is not JSON', '401 Unauthorized', 'No actions generated'],
      retryLimit: 3,
      delayMs: 1000,
      showWarnOnRetry: true,
    },
  );

  memory.recordThought(reasoning);

  for (const action of actions) {
    memory.recordObservation(
      Observation.fromActionTaken(action.variant, JSON.stringify(action)),
    );
  }

  return { reasoning, actions };
}
