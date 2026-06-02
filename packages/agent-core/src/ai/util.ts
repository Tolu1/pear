// @ts-nocheck — vendored, runtime-trusted (see docs/internal/lineage.md)
import { type LLMClient } from '@/ai/types';

function cleanNestedObject(obj: object): object {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => [
                key,
                typeof value === 'object' ? cleanNestedObject(value) : value
            ])
    );
}

export async function convertToBamlClientOptions(client: LLMClient): Promise<Record<string, any>> {
    const temp = 'temperature' in client.options ?
        (client.options.temperature ?? 0.0) : 0.0;

    let options: object;
    if (client.provider === 'anthropic') {
        options = {
            api_key: client.options.apiKey,
            model: client.options.model,
            temperature: temp,
            ...(client.options.promptCaching ? {
                allowed_role_metadata: "all",
                headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' }
            } : {}),
        };
    } else if (client.provider === 'aws-bedrock') {
        options = {
            model_id: client.options.model,
            inference_configuration: {
                temperature: temp,
            }
        };
    } else if (client.provider === 'google-ai') {
        options = {
            base_url: client.options.baseUrl,
            model: client.options.model,
            api_key: client.options.apiKey,
            generationConfig: {
                temperature: temp,
            }
        };
    } else if (client.provider === 'vertex-ai') {
        options = {
            location: client.options.location,
            base_url: client.options.baseUrl,
            project_id: client.options.projectId,
            credentials: client.options.credentials,
            anthropic_version: client.options.anthropicVersion,
            model: client.options.model,
        };
    } else if (client.provider === 'openai') {
        options = {
            api_key: client.options.apiKey,
            model: client.options.model,
            temperature: temp,
        };
    } else if (client.provider === 'openai-generic') {
        options = {
            base_url: client.options.baseUrl,
            api_key: client.options.apiKey,
            model: client.options.model,
            temperature: temp,
            headers: {
                "HTTP-Referer": "https://pearextension.com",
                "X-Title": "Pear Agent",
                ...client.options.headers
            }
        };
    } else if (client.provider === 'azure-openai') {
        options = {
            resource_name: client.options.resourceName,
            deployment_id: client.options.deploymentId,
            api_version: client.options.apiVersion,
            api_key: client.options.apiKey
        };
    } else {
        throw new Error(`Invalid provider: ${(client as any).provider}`)
    }
    return cleanNestedObject(options);
}
