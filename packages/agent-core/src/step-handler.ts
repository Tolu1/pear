import { Image } from '@/memory/image';
import { AgentMemory } from '@/memory';
import { Observation } from '@/memory/observation';
import { ActionDefinition } from '@/actions';
import { MultiModelHarness } from '@/ai/multiModelHarness';
import type { Action } from '@/actions/types';
import type { ObservationPayload } from '@/transport/messages';

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

  // Record observation as 'web' connector outputs, matching BrowserConnector.collectObservations
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

  // Build context — mirrors Agent._buildContext, with no connector-contributed instructions
  // (BrowserConnector.getInstructions returns undefined upstream).
  const observationContent = await memory.render();
  const context = {
    instructions: memory.instructions,
    observationContent,
    connectorInstructions: [],
  };

  const { reasoning, actions } = await models.partialAct(context, task, [], actionVocabulary);

  memory.recordThought(reasoning);

  return { reasoning, actions };
}
