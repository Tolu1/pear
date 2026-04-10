import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/lib/api/types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const body = await response
        .clone()
        .json()
        .catch(() => ({}));
      throw new Error(
        typeof body?.message === "string" ? body.message : "Request failed",
      );
    }
    return response;
  },
};

const client = createClient<paths>({ baseUrl });
client.use(errorMiddleware);

export const api = client;
