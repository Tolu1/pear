client<llm> ClaudeSonnet {
    provider anthropic
    // retry_policy Exponential
    options {
        model "claude-sonnet-4-6"
        api_key env.ANTHROPIC_API_KEY
        temperature 0.0
        allowed_role_metadata ["cache_control"]
        headers {
            "anthropic-beta" "prompt-caching-2024-07-31"
            "anthropic-dangerous-direct-browser-access" "true"
        }
    }
}

retry_policy Exponential {
    max_retries 5
    strategy {
        type exponential_backoff
        delay_ms 500
        multiplier 2.0
        max_delay_ms 10000
    }
}