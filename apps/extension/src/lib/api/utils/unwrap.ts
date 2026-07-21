type ApiResult<T> = { data?: T; error?: unknown };

export async function unwrap<T>(result: Promise<ApiResult<T>>): Promise<T> {
  const { data, error } = await result;

  if (error) throw error;
  if (data === undefined) throw new Error("API returned no data");

  return data;
}
