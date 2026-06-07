import { ActionDefinition } from '@/actions';
import { Observation } from '@/memory/observation';

export interface AgentConnector {
    id: string;
    onStart?(): Promise<void>;
    onStop?(): Promise<void>;
    getActionSpace?(): ActionDefinition<any>[];
    collectObservations?(): Promise<Observation[]>;
    getInstructions?(): Promise<void | string>;
}
