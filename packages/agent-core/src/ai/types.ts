export type BrowserAgentRole = 'act' | 'extract' | 'query';
export const allBrowserAgentRoles: BrowserAgentRole[] = ['act', 'extract', 'query'] as const;

export type LLMClient = (AnthropicClient | ClaudeCodeClient | BedrockClient | GoogleAIClient | GoogleVertexClient | OpenAIClient | OpenAIGenericClient | AzureOpenAIClient) &
    { roles?: BrowserAgentRole[] };

export interface AnthropicClient {
    provider: 'anthropic',
    options: {
        model: string,
        apiKey?: string,
        temperature?: number,
        promptCaching?: boolean,
    }
}

export interface ClaudeCodeClient {
    provider: 'claude-code',
    options: {
        model: string,
        temperature?: number,
        promptCaching?: boolean,
    }
}

export interface BedrockClient {
    provider: 'aws-bedrock',
    options: {
        model: string,
        temperature?: number
    }
}

export interface GoogleAIClient {
    provider: 'google-ai',
    options: {
        model: string,
        apiKey?: string,
        temperature?: number,
        baseUrl?: string
    }
}

export interface GoogleVertexClient {
    provider: 'vertex-ai',
    options: {
        model: string,
        location?: string,
        baseUrl?: string,
        projectId?: string,
        credentials?: string | object,
        anthropicVersion?: string,
        temperature?: number,
    }
}

export interface OpenAIClient {
    provider: 'openai',
    options: {
        model: string,
        apiKey?: string,
        temperature?: number
    }
}

export interface AzureOpenAIClient {
    provider: 'azure-openai',
    options: {
        resourceName: string,
        deploymentId: string,
        apiVersion: string,
        apiKey: string
    }
}

export interface OpenAIGenericClient {
    provider: 'openai-generic'
    options: {
        model: string,
        baseUrl: string,
        apiKey?: string,
        temperature?: number,
        headers?: Record<string, string>
    }
}

export interface LLMClientIdentifier {
    provider: string,
    model: string,
}

export interface ModelUsage {
    llm: LLMClientIdentifier,
    inputTokens: number,
    outputTokens: number,
    cacheWriteInputTokens?: number,
    cacheReadInputTokens?: number,
    inputCost?: number,
    outputCost?: number,
}
