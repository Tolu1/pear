import { convertToBamlClientOptions } from "./util";
import { b, AgentContext } from "@/ai/baml_client";
import { Image as BamlImage, Collector, ClientRegistry } from "@boundaryml/baml";
import { Action } from "@/actions/types";
import { BamlAsyncClient } from "./baml_client/async_client";
import logger from "@/logger";
import { Logger } from 'pino';
import { LLMClient, ModelUsage } from "@/ai/types";
import { ActionDefinition } from "@/actions";
import TypeBuilder from "./baml_client/type_builder";
import { Schema, z } from 'zod';
import { convertActionDefinitionsToBaml, convertZodToBaml } from "@/actions/util";
import { Image } from '@/memory/image';
import EventEmitter from "eventemitter3";
import { MultiMediaContentPart } from "@/memory/rendering";

interface ModelHarnessOptions {
    llm: LLMClient;
}

export interface ModelHarnessEvents {
    'tokensUsed': (usage: ModelUsage) => {}
}

export class ModelHarness {
    public readonly events: EventEmitter<ModelHarnessEvents> = new EventEmitter();
    private options: Required<ModelHarnessOptions>;
    private collector!: Collector;
    private cr!: ClientRegistry;
    private baml!: BamlAsyncClient;
    private logger: Logger;
    private prevTotalInputTokens: number = 0;
    private prevTotalOutputTokens: number = 0;

    constructor(options: ModelHarnessOptions) {
        this.options = {
            llm: options.llm,
        };

        this.logger = logger.child({ name: 'llm' });
    }

    async setup() {
        this.collector = new Collector("macro");
        this.cr = new ClientRegistry();
        let bamlClientOptions = await convertToBamlClientOptions(this.options.llm);
        this.cr.addLlmClient(
            'Agent',
            this.options.llm.provider === 'claude-code' ? 'anthropic' : this.options.llm.provider,
            bamlClientOptions,
            'DefaultRetryPolicy'
        );
        this.cr.setPrimary('Agent');

        this.baml = b.withOptions({ collector: this.collector, clientRegistry: this.cr });
    }

    describeModel(): string {
        return `${this.options.llm.provider}:${'model' in this.options.llm.options ? this.options.llm.options.model : 'unknown'}`;
    }

    private _reportUsage(): void {
        let inputTokens: number = 0;
        let outputTokens: number = 0;
        let cacheWriteInputTokens: number = 0;
        let cacheReadInputTokens: number = 0;

        if (this.options.llm.provider === 'anthropic' || this.options.llm.provider === 'claude-code') {
            type AnthropicUsage = { input_tokens: number, cache_creation_input_tokens: number, cache_read_input_tokens: number, output_tokens: number, service_tier: string };
            const usage = this.collector.last?.calls.at(-1)?.httpResponse?.body.json().usage as AnthropicUsage;
            if (!usage) {
                logger.warn("No usage returned from Anthropic provider, cached cost may be inaccurate");
                inputTokens = (this.collector.usage.inputTokens ?? 0) - this.prevTotalInputTokens;
                outputTokens = (this.collector.usage.outputTokens ?? 0) - this.prevTotalOutputTokens;
            } else {
                inputTokens = usage.input_tokens;
                outputTokens = usage.output_tokens;
                cacheWriteInputTokens = usage.cache_creation_input_tokens;
                cacheReadInputTokens = usage.cache_read_input_tokens;
            }

        } else {
            inputTokens = (this.collector.usage.inputTokens ?? 0) - this.prevTotalInputTokens;
            outputTokens = (this.collector.usage.outputTokens ?? 0) - this.prevTotalOutputTokens;
        }

        const model = (this.options.llm.options as any).model ?? 'unknown';

        const knownCostMap: Record<string, { inputTokens: number, outputTokens: number, cacheWriteInputTokens?: number, cacheReadInputTokens?: number }> = {
            'gemini-2.5-pro': { inputTokens: 1.25, outputTokens: 10.0 },
            'gemini-2.5-flash': { inputTokens: 0.30, outputTokens: 2.50 },
            'gemini-2.5-flash-lite': { inputTokens: 0.10, outputTokens: 0.40 },
            'claude-3.5-sonnet': { inputTokens: 3.00, outputTokens: 15.00, cacheWriteInputTokens: 3.75, cacheReadInputTokens: 0.30 },
            'claude-3.7-sonnet': { inputTokens: 3.00, outputTokens: 15.00, cacheWriteInputTokens: 3.75, cacheReadInputTokens: 0.30 },
            'claude-sonnet-4': { inputTokens: 3.00, outputTokens: 15.00, cacheWriteInputTokens: 3.75, cacheReadInputTokens: 0.30 },
            'claude-haiku-4-5': { inputTokens: 1.00, outputTokens: 5.00, cacheWriteInputTokens: 1.25, cacheReadInputTokens: 0.10 },
            'claude-opus-4': { inputTokens: 15.00, outputTokens: 75.00, cacheWriteInputTokens: 18.75, cacheReadInputTokens: 1.50 },
            'gpt-4.1': { inputTokens: 2.00, outputTokens: 8.00 },
            'gpt-4.1-mini': { inputTokens: 0.40, outputTokens: 1.60 },
            'gpt-4.1-nano': { inputTokens: 0.10, outputTokens: 0.40 },
            'gpt-4o': { inputTokens: 3.75, outputTokens: 15.00 },
            'qwen2.5-vl-72b': { inputTokens: 0.25, outputTokens: 0.75 }
        };

        let inputTokenCost: number | undefined;
        let outputTokenCost: number | undefined;
        let cacheWriteInputTokenCost: number | undefined;
        let cacheReadInputTokenCost: number | undefined;

        for (const [name, costs] of Object.entries(knownCostMap)) {
            if (model.includes(name)) {
                inputTokenCost = costs.inputTokens / 1_000_000;
                outputTokenCost = costs.outputTokens / 1_000_000;
                cacheReadInputTokenCost = costs.cacheReadInputTokens ? costs.cacheReadInputTokens / 1_000_000 : undefined;
                cacheWriteInputTokenCost = costs.cacheWriteInputTokens ? costs.cacheWriteInputTokens / 1_000_000 : undefined;
            }
        }

        const usage: ModelUsage = {
            llm: {
                provider: this.options.llm.provider,
                model: model
            },
            inputTokens: inputTokens,
            outputTokens: outputTokens,
            ...(cacheWriteInputTokens ? { cacheWriteInputTokens } : {}),
            ...(cacheReadInputTokens ? { cacheReadInputTokens } : {}),
            ...(inputTokenCost ? {
                inputCost: inputTokens * inputTokenCost +
                    (cacheWriteInputTokenCost ? cacheWriteInputTokenCost * cacheWriteInputTokens : 0.0) +
                    (cacheReadInputTokenCost ? cacheReadInputTokenCost * cacheReadInputTokens : 0.0)
            } : {}),
            ...(outputTokenCost ? { outputCost: outputTokens * outputTokenCost } : {}),
        };

        this.events.emit('tokensUsed', usage);

        this.prevTotalInputTokens += inputTokens;
        this.prevTotalOutputTokens += outputTokens;
    }

    async partialAct<T>(
        context: AgentContext,
        task: string,
        data: MultiMediaContentPart[],
        actionVocabulary: ActionDefinition<T>[]
    ): Promise<{ reasoning: string, actions: Action[] }> {
        const tb = new TypeBuilder();

        tb.PartialRecipe.addProperty('actions', tb.list(convertActionDefinitionsToBaml(tb, actionVocabulary))).description('Always provide at least one action');

        const start = Date.now();
        const response = await this.baml.CreatePartialRecipe(
            context,
            task,
            data,
            this.options.llm.provider === 'claude-code',
            { tb }
        );
        this.logger.trace(`createPartialRecipe took ${Date.now() - start}ms`);
        this._reportUsage();
        return {
            reasoning: response.reasoning,
            actions: response.actions
        }
    }

    async extract<T extends Schema>(instructions: string, schema: T, screenshot: Image, domContent: string): Promise<z.infer<T>> {
        const tb = new TypeBuilder();

        if (schema instanceof z.ZodObject) {
            for (const [key, fieldSchema] of Object.entries(schema.shape)) {
                tb.ExtractedData.addProperty(key, convertZodToBaml(tb, fieldSchema as any));
            }
        } else {
            tb.ExtractedData.addProperty('data', convertZodToBaml(tb, schema));
        }

        const resp = await this.baml.ExtractData(
            instructions,
            await screenshot.toBaml(),
            domContent,
            this.options.llm.provider === 'claude-code',
            { tb }
        );
        this._reportUsage();

        if (schema instanceof z.ZodObject) {
            return resp;
        } else {
            return resp.data;
        }
    }

    async query<T extends Schema>(context: AgentContext, query: string, schema: T): Promise<z.infer<T>> {
        const tb = new TypeBuilder();

        if (schema instanceof z.ZodObject) {
            for (const [key, fieldSchema] of Object.entries(schema.shape)) {
                tb.QueryResponse.addProperty(key, convertZodToBaml(tb, fieldSchema as any));
            }
        } else {
            tb.QueryResponse.addProperty('data', convertZodToBaml(tb, schema));
        }

        const resp = await this.baml.QueryMemory(
            context,
            query,
            this.options.llm.provider === 'claude-code',
            { tb }
        );
        this._reportUsage();

        if (schema instanceof z.ZodObject) {
            return resp;
        } else {
            return resp.data;
        }
    }
}
