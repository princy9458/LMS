export type JsonLikeResponse<T = any> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
};

export async function readJsonResponse<T = JsonLikeResponse>(response: Response): Promise<T | null> {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${(error as Error).message}`);
  }
}

export function unwrapApiData<T = any>(payload: any): T | null {
  if (!payload) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data as T;
  }

  return payload as T;
}
