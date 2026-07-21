import type { paths } from "@/lib/api/openapi";

export type { paths };

export type QueryParams<Path extends keyof paths> =
  paths[Path]["get"] extends { parameters: { query?: infer Q } } ? Q : never;

export type PathParams<
  Path extends keyof paths,
  Method extends keyof paths[Path] = "get",
> = paths[Path][Method] extends { parameters: { path?: infer P } }
  ? P
  : never;

export type BodyParams<
  Path extends keyof paths,
  Method extends "post" | "put" | "patch" = "post",
> = paths[Path][Method] extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

export type MultipartBodyParams<
  Path extends keyof paths,
  Method extends "post" | "put" | "patch" = "post",
> = paths[Path][Method] extends {
  requestBody: { content: { "multipart/form-data": infer B } };
}
  ? B
  : never;
