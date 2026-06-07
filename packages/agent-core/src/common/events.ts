import { Action } from "@/actions/types";
import { ModelUsage } from "@/ai/types";

export interface AgentEvents {
    'start': () => void;
    'stop': () => void;

    'thought': (thought: string) => void;

    'actStarted': (task: string, options: unknown) => void;
    'actDone': (task: string, options: unknown) => void;

    'actionStarted': (action: Action) => void;
    'actionDone': (action: Action) => void;

    'pause': () => void;
    'resume': () => void;

    'tokensUsed': (usage: ModelUsage) => void;
}
