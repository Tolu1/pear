import {
  webActions,
  taskActions,
  type ActionWireForm,
} from "@repo/agent-core/client";

const definitions = new Map(
  [...webActions, ...taskActions].map((action) => [action.name, action]),
);

export function renderAction(action: ActionWireForm): string {
  const definition = definitions.get(action.variant);
  if (!definition) return action.variant;

  const { variant, ...input } = action;
  void variant;
  try {
    return definition.render(input);
  } catch {
    return action.variant;
  }
}
