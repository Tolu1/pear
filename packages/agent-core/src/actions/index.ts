import { z, Schema, ZodTypeAny } from "zod"
import type { WebHarnessLike } from "@/web/harness.interface";

export interface ActionDefinition<T> {
    name: string;
    description?: string;
    schema: Schema<T>;
    resolver?: (args: { input: T; harness: WebHarnessLike }) => Promise<void>;
    render: (action: T) => string
}

export function createAction<S extends ZodTypeAny>(
    action: {
        name: string;
        description?: string;
        schema?: S;
        resolver?: (args: { input: z.infer<S>; harness: WebHarnessLike }) => Promise<void>;
        render?: (action: z.infer<S>) => string
    }
): ActionDefinition<z.infer<S>> {
    return {
        name: action.name,
        description: action.description,
        schema: action.schema ?? z.object({}),
        resolver: action.resolver,
        render: action.render ?? ((action) => JSON.stringify(action))
    };
}

export type ActionPayload<A extends ActionDefinition<any>> = { name: A['name'] } & z.infer<A['schema']>;
