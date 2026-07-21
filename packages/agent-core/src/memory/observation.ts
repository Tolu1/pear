import { fnv1a32Hex } from '@/util';
import { Image } from './image';
import { MultiMediaJson, observableDataToJson } from './serde';
import { MultiMediaMessage } from '@/ai/baml_client';
import { type MultiMediaContentPart, renderContentParts } from './rendering';

export type ObservableDataPrimitive = Image | string | number | boolean | null | undefined;

export type ObservableDataArray = Array<RenderableContent>;

export type ObservableDataObject = {
    [key: string]: RenderableContent;
};

export type RenderableContent = ObservableDataPrimitive | ObservableDataArray | ObservableDataObject;

export type ObservationRole = 'user' | 'assistant';

export interface ObservationRetentionOptions {
    type: string;
    limit?: number;
    dedupe?: boolean;
}

export type ObservationSource = `connector:${string}` | `action:taken:${string}` | `action:result:${string}` | `thought`;

export class Observation {
    public readonly source: ObservationSource;
    public readonly role: ObservationRole;
    public readonly timestamp: number;
    public readonly content: RenderableContent;
    public readonly retention?: ObservationRetentionOptions;

    constructor(source: ObservationSource, role: ObservationRole, content: RenderableContent, retention?: ObservationRetentionOptions, timestamp?: number) {
        this.source = source;
        this.role = role;
        this.content = content;
        this.timestamp = timestamp ?? Date.now();
        this.retention = retention;
    }

    static fromConnector(connectorId: string, content: RenderableContent, options?: ObservationRetentionOptions): Observation {
        return new Observation(`connector:${connectorId}`, 'user', content, options);
    }

    static fromActionTaken(actionId: string, content: RenderableContent, options?: ObservationRetentionOptions): Observation {
        return new Observation(`action:taken:${actionId}`, 'user', content, options);
    }

    static fromActionResult(actionId: string, content: RenderableContent, options?: ObservationRetentionOptions): Observation {
        return new Observation(`action:result:${actionId}`, 'user', content, options);
    }

    static fromThought(content: RenderableContent, options?: ObservationRetentionOptions): Observation {
        return new Observation(`thought`, 'user', content, options);
    }

    toString() {
        return JSON.stringify(this.content);
    }

    async toJson(): Promise<MultiMediaJson> {
        return await observableDataToJson(this.content);
    }

    async render(options?: { prefix?: MultiMediaContentPart[], postfix?: MultiMediaContentPart[], cacheControl?: boolean }): Promise<MultiMediaMessage> {
        return {
            role: this.role,
            cacheControl: options?.cacheControl ?? false,
            content: [ ...(options?.prefix ?? []), ...(await renderContentParts(this.content, { mode: 'json', indent: 2 })), ...(options?.postfix ?? [])]
        };
    }

    async hash(): Promise<string> {
        const stringifiedContent = JSON.stringify(await this.toJson());
        return fnv1a32Hex(stringifiedContent);
    }

    async equals(obs: Observation): Promise<boolean> {
        return (await this.hash()) == (await obs.hash());
    }
}
