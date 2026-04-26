const BASE_URL = import.meta.env.VITE_AI_API_URL;

async function request<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 529) {
        throw new Error(
          "Our servers are currently overloaded. Please try again shortly.",
        );
      }
      throw new Error(`Something went wrong (Error ${response.status}).`);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const ai = {
  post: request,
};
