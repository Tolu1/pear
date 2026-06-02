import logger from "@/logger";

export type RetryMode = {
    mode: 'retry_on_partial_message',
    errorSubstrings: string[],
} | {
    mode: 'retry_all',
};

export type RetryParams = {
    retryLimit: number,
    delayMs: number,
    showWarnOnRetry: boolean,
}

export type RetryOptions = RetryMode & RetryParams;

export async function retryOnErrorIsSuccess<T>(
    fnToRetry: () => Promise<T>,
    retryOptions: RetryMode & Partial<RetryParams>
): Promise<boolean> {
    try {
        await retryOnError(fnToRetry, retryOptions);
        return true;
    } catch (error) {
        return false;
    }
}

export async function retryOnError<T>(
    fnToRetry: () => Promise<T>,
    retryOptions: RetryMode & Partial<RetryParams>
): Promise<T> {
    let lastError: any;

    const options: RetryOptions = {
        ...retryOptions,
        retryLimit: retryOptions.retryLimit ?? 3,
        delayMs: retryOptions.delayMs ?? 200,
        showWarnOnRetry: retryOptions.showWarnOnRetry ?? false,
    } as RetryOptions;

    if (options.retryLimit < 0) {
        options.retryLimit = 0;
    }

    for (let attempt = 0; attempt <= options.retryLimit; attempt++) {
        try {
            return await fnToRetry();
        } catch (error: any) {
            lastError = error;

            const errorMessage = String(error?.message ?? error);

            if (options.mode === 'retry_all') {
                if (options.showWarnOnRetry) {
                    logger.warn(`Retrying on: ${errorMessage}`);
                }
            } else if (options.mode === 'retry_on_partial_message') {
                const includesSubstring = options.errorSubstrings.some((substring) => errorMessage.includes(substring));

                if (includesSubstring) {
                    if (options.showWarnOnRetry) {
                        logger.warn(`Retrying on: ${errorMessage}`);
                    }
                } else {
                    throw lastError;
                }
            }
        }
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }

    throw lastError;
}

export function deepEquals(a: any, b: any, cache = new WeakMap<object, WeakSet<object>>()): boolean {
    if (a === b) {
        return true;
    }

    if (a == null || typeof a !== 'object' || b == null || typeof b !== 'object') {
        return false;
    }

    if (cache.has(a) && cache.get(a)!.has(b)) {
        return true;
    }
    if (!cache.has(a)) {
        cache.set(a, new WeakSet());
    }
    cache.get(a)!.add(b);

    if (!cache.has(b)) {
        cache.set(b, new WeakSet());
    }
    cache.get(b)!.add(a);

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
        return a.source === b.source && a.flags === b.flags;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!deepEquals(a[i], b[i], cache)) {
                return false;
            }
        }
        return true;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) {
            return false;
        }
        if (!deepEquals(a[key], b[key], cache)) {
            return false;
        }
    }

    return true;
}
